"""
A "runner" for python cells in RCloud -- this serves as an intermediate proxy
Code base adopted from an older version of code from
https://github.com/minrk and https://github.com/paulgb/runipy 
Modified for running python code in RCloud with this piece as an intermediate
proxy... Also, some of the formatting required to use it in RCloud is handled here.
"""

try:
    # python 2
    from Queue import Empty
except:
    # python 3
    from queue import Empty

import platform
from time import sleep
import logging
import ansi2html  # GPLV3 
from xml.sax.saxutils import escape as html_escape # based on reco from moin/EscapingHtml

_textFormatStr = """<pre style="font-family:Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace;">{}</pre>"""
def RClTextFormat(s, escape=True):
    newtext = html_escape(s) if escape else s
    return _textFormatStr.format(newtext)

ansiconverter = ansi2html.Ansi2HTMLConverter(inline=True, dark_bg=False)
def RClansiconv(ansitext, full=False):
    """ Uses ansi2html (GPL V3) to produce a reasonably minimal html 
    Seems that there is no need to escape this text...
    """
    htmlFragment = ansiconverter.convert(ansitext, full=full)
    return _textFormatStr.format(htmlFragment, escape=False) # we already escaped the text

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

import tempfile
debugFD, debugFile = "", ""

_debugging = True
if _debugging:
    debugFD, debugFile = tempfile.mkstemp(suffix=".log", prefix="ipy_log")
    logging.basicConfig(filename=debugFile, level=logging.DEBUG)

class NotebookError(Exception):
    pass

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
        self.km = KernelManager()
        self.km.kernel_cmd = make_ipkernel_cmd('import sys; sys.path.extend("%s".split(":")); from rcloud_kernel import main; main()' % kw["rcloud_python_lib_path"], **kw)
        del kw["rcloud_python_lib_path"]
        self.km.client_factory = MyClient
        self.km.start_kernel(**kw)

        if platform.system() == 'Darwin':
            # There is sometimes a race condition where the first
            # execute command hits the kernel before it's ready.
            # It appears to happen only on Darwin (Mac OS) and an
            # easy (but clumsy) way to mitigate it is to sleep
            # for a second.
            sleep(1)

        self.kc = self.km.client()
        self.kc.start_channels()

        self.shell = self.kc.shell_channel
        self.iopub = self.kc.iopub_channel

    def __del__(self):
        self.kc.stop_channels()
        self.km.shutdown_kernel(now=True)

    def shutdown(self):
        self.kc.stop_channels()
        self.km.shutdown_kernel(now=True)

    def run_cmd(self, cmd):
        d = {}
        class Cell(object):
            def __init__(self):
                self.input = cmd
            def __setitem__(self, k, v):
                d[k] = v
        self.run_cell(Cell())
        return d['outputs']

    def run_magic(self, magic_line):
        self.shell.magic(magic_line)

    def wait_for_msg(self):
        outs = list()
        reply = self.shell.get_msg()
        status = reply['content']['status']
        if status == 'error':
            logging.info('Cell raised uncaught exception: \n%s', '\n'.join(reply['content']['traceback']))
        else:
            logging.debug('Cell returned')

        while True:
            try:
                msg = self.iopub.get_msg(timeout=1)
                if msg['msg_type'] == 'status':
                    if msg['content']['execution_state'] == 'idle':
                        break
            except Empty:
                # execution state should return to idle before the queue becomes empty,
                # if it doesn't, something bad has happened
                raise

            outs.append(msg)
        return outs

    def run_cell(self, cell):
        '''
        Run a notebook cell and update the output of that cell in-place.
        '''
        logging.debug('Running cell:\n%s\n', cell.input)
        self.shell.execute(cell.input)
        reply = self.shell.get_msg()
        status = reply['content']['status']
        if status == 'error':
            logging.info('Cell raised uncaught exception: \n%s', '\n'.join(reply['content']['traceback']))
        else:
            logging.debug('Cell returned')

        outs = list()
        while True:
            try:
                msg = self.iopub.get_msg(timeout=1)
                if msg['msg_type'] == 'status':
                    if msg['content']['execution_state'] == 'idle':
                        break
            except Empty:
                # execution state should return to idle before the queue becomes empty,
                # if it doesn't, something bad has happened
                logging.warn('Execution state did not return to idle')
                raise

            content = msg['content']
            msg_type = msg['msg_type']

            out = NotebookNode(output_type=msg_type)

            if 'execution_count' in content:
                cell['prompt_number'] = content['execution_count']
                out.prompt_number = content['execution_count']

            if msg_type in ['status', 'pyin']:
                continue
            elif msg_type == 'stream':
                out.stream = content['name']
                out.html = RClTextFormat(content['data'])
            elif msg_type in ('display_data', 'pyout'):
                for mime, data in content['data'].items():
                    try:
                        attr = self.MIME_MAP[mime]
                    except KeyError:
                        logging.warning('unhandled mime type: %s' % mime)
                        raise NotImplementedError('unhandled mime type: %s' % mime)
                    setattr(out, attr, data)
            elif msg_type == 'pyerr':
                logging.info('Received an exception: ' + content['ename'])
                out.ename = content['ename']
                out.evalue = content['evalue']
                out.traceback = content['traceback']
                out.html = RClansiconv('\n'.join(out.traceback))
            else:
                raise NotImplementedError('unhandled iopub message: %s' % msg_type)
            outs.append(out)
        cell['outputs'] = outs

    def iter_code_cells(self, nb):
        '''
        Iterate over the notebook cells containing code.
        '''
        nb = read(open(nb), 'json')
        for ws in nb.worksheets:
            for cell in ws.cells:
                if cell.cell_type == 'code':
                    yield cell


    def run_notebook(self, nb, skip_exceptions=False):
        '''
        Run all the cells of a notebook in order and update
        the outputs in-place.

        If ``skip_exceptions`` is set, then if exceptions occur in a cell, the
        subsequent cells are run (by default, the notebook execution stops).
        '''
        for cell in self.iter_code_cells(nb):
            try:
                self.run_cell(cell)
                print cell.outputs
            except NotebookError:
                if not skip_exceptions:
                    raise

    def save_notebook(self, nb_out):
        logging.info('Saving to %s', nb_out)
        write(self.nb, open(nb_out, 'w'), 'json')
