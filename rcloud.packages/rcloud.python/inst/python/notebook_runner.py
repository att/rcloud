"""
A "runner" for python cells in RCloud -- this serves as an intermediate proxy
Code base adopted from an older version of code from
https://github.com/minrk and https://github.com/paulgb/runipy 
Modified for running python code in RCloud with this piece as an intermediate
proxy... Also, some of the formatting required to use it in RCloud is handled here.

This will be replaced with an IPython client code
"""

try:
    from Queue import Empty  # python 2
except:
    from queue import Empty  # python 3

import platform
from time import sleep
import logging
from RCloud_ansi2html import ansi2html # MIT license from github:Kronuz/ansi2html (Oct 2014) + rename/our changes
from xml.sax.saxutils import escape as html_escape # based on reco from moin/EscapingHtml
import re

import tempfile
debugFD, debugFile = "", ""

_debugging = False
if _debugging:
    debugFD, debugFile = tempfile.mkstemp(suffix=".log", prefix="ipy_log")
    logging.basicConfig(filename=debugFile, level=logging.DEBUG)

class NotebookError(Exception):
    pass

_textFormatStr = u'<span style="font-family:Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace;">{}</span>'

def RClansiconv(inputtext, escape=True):
    """ Uses Krounz/ansi2html (MIT) renamed to produce a reasonably minimal html."""
    if _debugging: logging.debug('Received ' + inputtext)
    txt = html_escape(inputtext) if escape else inputtext
    txt = re.sub("\n", "<br>\n", txt)
    txt = re.sub(" ", r"&nbsp;", txt)
    try:
        rettxt = unicode(txt, 'utf-8') # we get unicode characters from IPython sometimes
    except:
        rettxt = txt # if it is already unicode
    htmlFragment = ansi2html(rettxt).encode('ascii', 'xmlcharrefreplace')
    return _textFormatStr.format(htmlFragment)

from IPython import get_ipython
from IPython.core import completer
from IPython.nbformat.current import read, write, NotebookNode
from IPython.kernel import KernelManager
from IPython.kernel.blocking.channels import BlockingShellChannel
from IPython.kernel.blocking import BlockingKernelClient
from IPython.utils.traitlets import (
    Any, Instance, Type,
)
from IPython.kernel import (
    make_ipkernel_cmd,
    launch_kernel,
)
import json

class MagicBlockingShellChannel(BlockingShellChannel):
    proxy_methods = [
        'execute',
        'complete',
        'object_info',
        'history',
        'kernel_info',
        'shutdown',
        'magic', # this is the new proxy_method for the channel.
    ]
        
    def magic(self, magic_str):
        """Run a magic in the kernel."""
        # Create class for content/msg creation. Related to, but possibly
        # not in Session.
        content = dict(magic=magic_str)
        msg = self.session.msg('magic_request', content)
        self._queue_send(msg)
        return msg['header']['msg_id']

class MyClient(BlockingKernelClient):
    shell_channel_class = Type(MagicBlockingShellChannel)

class NotebookRunner(object):
    # The kernel communicates with mime-types while the notebook
    # uses short labels for different cell types. We'll use this to
    # map from kernel types to notebook format types.

    MIME_MAP = {
        'image/jpeg': 'jpeg',
        'image/png': 'png',
        'text/plain': 'text',
        'text/html': 'html',
        'text/latex': 'latex',
        'application/javascript': 'html',
    }

    def __init__(self, **kw):
        """Initializes the notebook runner.
           Requires config rcloud_python_lib_path -- or raises exception"""
        self.km = KernelManager()
        self.km.kernel_cmd = make_ipkernel_cmd("""
import sys; 
import time; # to test for slow staring kernels, add a delay here
sys.path.extend("{RCPATH}".split(":")); 
from rcloud_kernel import main; 
main()""".format(RCPATH=kw["rcloud_python_lib_path"]), **kw)
        del kw["rcloud_python_lib_path"]
        self.km.client_factory = MyClient
        self.km.start_kernel(**kw) # This is a non-blocking call to launch the process
        self.completer = completer.Completer()
        self.completer.limit_to__all__ = True
        # There is a possible race condition if the system is slow to load
        # the modules for the kernel and we issue commands to the kernel rightaway.
        # We saw these on CentOS and OSX. So, issue an empty command to the kernel and wait for return
        self.kc = self.km.client()
        self.kc.start_channels()

        self.shell = self.kc.shell_channel
        self.shell.execute("")
        _ = self.shell.get_msgs()
        self.iopub = self.kc.iopub_channel

    def __del__(self):
        self.kc.stop_channels()
        self.km.shutdown_kernel(now=True)

    def shutdown(self):
        self.kc.stop_channels()
        self.km.shutdown_kernel(now=True)

    def complete(self, text, pos_fromR):
        """Completions for text at pos"""
        txtArr = text[:int(pos_fromR)].split('\n')
        # We are ignoring surrounding lines and full context; a poor-man's tab-complete for now
        _ = allres = self.shell.get_msgs()  # flush before execution
        self.shell.complete(txtArr[-1], line="", cursor_pos=len(txtArr[-1])-1)
        while True:
            resp = self.shell.get_msg()
            if _debugging: logging.debug(resp)
            if resp['msg_type'] == 'complete_reply':
                _ = self.shell.get_msgs() # flush
                return resp['content']['matches']

    def run_cmd(self, cmd):
        self.submit_cell(cmd)

    def run_magic(self, magic_line):
        self.shell.magic(magic_line)

    def submit_cell(self, cmd):
        """Submits the cell code to the kernel.
        Now that we have a continuous IO on rcloud, and the clients can send oob messages to
        RCloud [but only through R], we separate the pieces to submit and have a function
        for looping to get messages"""
        if _debugging: logging.debug('Running cell:\n%s\n', cmd)
        _ = self.iopub.flush()
        self.shell.execute(cmd)
        self._previous_status = 'START'

    def poll_for_msgs(self):
        """Polls for messages from the kernel.
        Used after submitting code for execution"""
        try:
            msg = self.iopub.get_msg(timeout=1)
            if msg['msg_type'] == 'status' and msg['content']['execution_state'] == 'idle':
                if _debugging: logging.info('Message -- {}:{}'.format(msg['msg_type'], msg['content']))
                self._previous_status = 'IDLE'
                return NotebookNode(output_type = 'IDLE')
        except Empty: # state should return to idle before queue becomes empty, but we ignore it now
            prevstat, self._previous_status = self._previous_status, 'EMPTY'
            retstat = 'END_CELL' if prevstat == 'IDLE' else 'EMPTY'
            # Assuming IDLE followed by EMPTY is the end-of-cell 
            return NotebookNode(output_type = retstat)

        self._previous_status = ''  # Not idle, that's all we are concerned about for now
        content, msg_type = msg['content'], msg['msg_type']

        if msg_type in ['status', 'pyin']: return NotebookNode(output_type = 'NoOp')

        out = NotebookNode(output_type = msg_type)
        if msg_type in ('display_data', 'pyout'):
            for mime, data in content['data'].items():
                try:
                    attr = self.MIME_MAP[mime]
                    tmpval =  RClansiconv(data) if attr == 'text' else data
                    setattr(out, attr, tmpval)
                except KeyError:
                    raise NotImplementedError('unhandled mime type: %s' % mime)
        elif msg_type == 'stream':
            setattr(out, 'text', RClansiconv(content['data']))
        elif msg_type == 'pyerr':
            setattr(out, 'html', RClansiconv('\n'.join(content['traceback']) + '\n'))
        else:
            if _debugging: logging.info('Unsupported: ' + msg_type)
            raise NotImplementedError('unhandled iopub message: %s' % msg_type)
        if _debugging: logging.info('Sending: msg_type: [{}]; HTML: [{}]; TEXT: [{}]'.format(msg_type, out.get('html', ''), out.get('text', '') ))
        return out # upstream process will handle it [e.g. send as an oob message]
