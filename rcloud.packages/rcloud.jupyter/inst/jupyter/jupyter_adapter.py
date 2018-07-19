"""Class for executing code using Jupyter backend"""

import nbformat
import traceback
from nbconvert.preprocessors import ExecutePreprocessor
from time import sleep
import sys
import os
import logging
from RCloud_ansi2html import ansi2html # MIT license from github:Kronuz/ansi2html (Oct 2014) + rename/our changes
from xml.sax.saxutils import escape as html_escape # based on reco from moin/EscapingHtml
import re
from nbformat.notebooknode import NotebookNode
from jupyter_client import KernelManager
from jupyter_core import paths
from jupyter_client.kernelspec import KernelSpecManager
from jupyter_client import MultiKernelManager
from nbformat.v4 import output_from_msg
from traitlets import (
    Dict, List, Unicode, Any
)

import tempfile
debugFD, debugFile = "", ""

_debugging = False
if _debugging:
    debugFD, debugFile = tempfile.mkstemp(suffix=".log", prefix="ipy_log")
    logging.basicConfig(filename=debugFile, level=logging.DEBUG)
    
class NotebookError(Exception):
    pass
  
  
class CellOutputCollector(object):
    """
    Component that consumes messages produced by kernel and populates cell 'outputs'.
    """
    error_msg = None
    
    def __init__(self, cell = None, cell_index = 0, _display_id_map = Dict()):
      self.cell = cell
      self.outs = cell.outputs = []
      self.cell_index = cell_index
      self._display_id_map = _display_id_map;
    
    def collect(self, msg):
      msg_type = msg['msg_type']
      logging.debug("output: %s", msg_type)

      content = msg['content']
      # set the prompt number for the input and the output
      if 'execution_count' in content:
          self.cell['execution_count'] = content['execution_count']

      if msg_type == 'status':
        if content['execution_state'] == 'idle':
            return
        else:
            return
      elif msg_type == 'execute_input':
        return
      elif msg_type == 'clear_output':
        self.outs[:] = []
        # clear display_id mapping for this cell
        for display_id, cell_map in self._display_id_map.items():
            if self.cell_index in cell_map:
                cell_map[self.cell_index] = []
        return
      elif msg_type.startswith('comm'):
        return
            
      display_id = None
      if msg_type in {'execute_result', 'display_data', 'update_display_data'}:
        display_id = msg['content'].get('transient', {}).get('display_id', None)
        if display_id:
            self._update_display_id(display_id, msg)
        if msg_type == 'update_display_data':
            # update_display_data doesn't get recorded
            return

      try:
        out = output_from_msg(msg)
      except ValueError:
        logging.error("unhandled iopub msg: " + msg_type)
        return
      if display_id:
        # record output index in:
        #   _display_id_map[display_id][cell_idx]
        cell_map = self._display_id_map.setdefault(display_id, {})
        output_idx_list = cell_map.setdefault(self.cell_index, [])
        output_idx_list.append(len(self.outs))
      
      self.outs.append(out)
        
    def _update_display_id(self, display_id, msg):
        """Update outputs with a given display_id"""
        if display_id not in self._display_id_map:
            logging.debug("display id %r not in %s", display_id, self._display_id_map)
            return

        if msg['header']['msg_type'] == 'update_display_data':
            msg['header']['msg_type'] = 'display_data'

        try:
            out = output_from_msg(msg)
        except ValueError:
            logging.error("unhandled iopub msg: " + msg['msg_type'])
            return
        
        for cell_idx, output_indices in self._display_id_map[display_id].items():
            cell = self.nb['cells'][cell_idx]
            outputs = cell['outputs']
            for output_idx in output_indices:
                outputs[output_idx]['data'] = out['data']
                outputs[output_idx]['metadata'] = out['metadata']

_textFormatStr = u'<span style="font-family:Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace;">{}</span>'

def RClansiconv(inputtext, escape=True):
    """ Uses Krounz/ansi2html (MIT) renamed to produce a reasonably minimal html."""
    if _debugging: logging.debug('Received ' + inputtext)
    txt = html_escape(inputtext) if escape else inputtext
    txt = re.sub("\n", "<br>\n", txt)
    txt = re.sub(" ", r"&nbsp;", txt)
    if _debugging: logging.debug('html_escape: ' + txt)
    try:
        rettxt = unicode(txt, 'utf-8') # we get unicode characters from IPython sometimes
    except:
        rettxt = txt # if it is already unicode
        
    if _debugging: logging.debug('Unicode: ' + rettxt)
    htmlFragment = ansi2html(rettxt).encode('ascii', 'xmlcharrefreplace')
    output = _textFormatStr.format(htmlFragment.decode("utf-8"))
    if _debugging: logging.debug('Generated html fragment: ' + output)
    return output
    
class RCloudExecutePreprocessor(ExecutePreprocessor):
    """
    ExecutePreprocessor that manages a pool of reusable kernels.
    """
    
    _kernels = Dict()
    _clients = Dict()
    mkm = None
    _init_scripts = Dict()
    console_in = None
    connection_dir = '/tmp'
    
    def remove_kernel(self, kernel_name):
      if kernel_name in self._kernels:
        kernel_id = self._kernels.pop(kernel_name)
        if kernel_id in self._clients:
          self._clients.pop(kernel_id)
      
    def init_kernel(self, startup_timeout=60, kernel_name=None, **kwargs):
      self.get_kernel(startup_timeout=60, kernel_name=kernel_name, **kwargs)
      
    def start_kernel(self, kernel_name, startup_timeout=60, **kwargs):
      if _debugging: logging.debug('Creating new kernel for name: ' + kernel_name)
      kernel_id = self.mkm.start_kernel(kernel_name = kernel_name, **kwargs)
      self._kernels[kernel_name] = kernel_id
      km = self.mkm.get_kernel(self._kernels[kernel_name]);
      kc = km.client()
      kc.start_channels()
      if _debugging: logging.debug('Created new kernel with name {} and id {}'.format(kernel_name, kernel_id))
      try:
        if _debugging: logging.debug('Waiting for kernel {} for {} seconds...'.format(kernel_id, startup_timeout))
        kc.wait_for_ready(timeout=startup_timeout)
        kc.allow_stdin = True
        self._clients[kernel_id] = kc
        if _debugging: logging.debug('Kernel with name {} and id {} started successfully!'.format(kernel_name, kernel_id))
        if kernel_name in self._init_scripts:
           kc.execute(self._init_scripts[kernel_name], reply = True)
        return kc
      except RuntimeError:
        kc.stop_channels()
        km.shutdown_kernel()
        self.remove_kernel(kernel_name)
        raise
    
    def get_kernel(self, startup_timeout=60, kernel_name=None, **kwargs):
       if self.mkm is None:
         self.mkm = self.kernel_manager_class()
         self.mkm.connection_dir = os.path.join(self.connection_dir)
       
       if _debugging: logging.debug('Kernel connection files are stored in {} '.format(self.mkm.connection_dir))
       
       if kernel_name is None:
         kernel_name = self.kernel_name

       if kernel_name in self._kernels and not self.mkm.is_alive(self._kernels[kernel_name]):
         self.remove_kernel(kernel_name)
      
       if not kernel_name in self._kernels:
         return self.start_kernel(kernel_name, startup_timeout = startup_timeout, **kwargs)
      
       kernel_id = self._kernels[kernel_name]
       if _debugging: logging.debug('Reusing existing kernel with id {} for name {} '.format(kernel_id, kernel_name))
       kc = self._clients[kernel_id]
       return kc

    def run_cell(self, cell, cell_index=0):
        cell_output_collector = CellOutputCollector(cell, cell_index, self._display_id_map)
        self.kc.execute_interactive(cell.source, allow_stdin = True, stdin_hook = self.stdin_hook, output_hook = cell_output_collector.collect)
        return cell_output_collector.error_msg, cell_output_collector.outs

    def preprocess(self, nb, resources):
        """
        Preprocess notebook executing each code cell.

        The input argument `nb` is modified in-place.

        Parameters
        ----------
        nb : NotebookNode
            Notebook being executed.
        resources : dictionary
            Additional resources used in the conversion process. For example,
            passing ``{'metadata': {'path': run_path}}`` sets the
            execution path to ``run_path``.

        Returns
        -------
        nb : NotebookNode
            The executed notebook.
        resources : dictionary
            Additional resources used in the conversion process.
        """
        path = resources.get('metadata', {}).get('path', '')
        if path == '':
            path = None
        
        # clear display_id map
        self._display_id_map = {}

        kernel_name = nb.metadata.get('kernelspec', {}).get('name', self.kernel_name)
        
        self.log.info("Executing notebook with kernel: %s" % kernel_name)
        self.kc = self.get_kernel(
          startup_timeout=self.startup_timeout,
          kernel_name=kernel_name,
          extra_arguments=self.extra_arguments,
          cwd=path)
        
        self.nb = nb

        nb, resources = super(ExecutePreprocessor, self).preprocess(nb, resources)

        delattr(self, 'nb')
        delattr(self, 'kc')

        return nb, resources

    def shutdown(self):
      if _debugging: logging.info('Shutting down kernels.')
      if self.mkm is not None:
          self.mkm.shutdown_all(now = self.shutdown_kernel == 'immediate')

    def stdin_hook(self, msg):
        """Handle an input request"""
        content = msg['content']
        prompt = self.console_in

        try:
            raw_data = prompt(content["prompt"])
        except EOFError:
            # turn EOFError into EOF character
            raw_data = '\x04'
        except KeyboardInterrupt:
         #   sys.stdout.write('\n')
            return

        # only send stdin reply if there *was not* another request
        # or execution finished while we were reading.
        if not (self.kc.stdin_channel.msg_ready() or self.kc.shell_channel.msg_ready()):
            self.kc.input(raw_data)
    
    def complete(self, text, kernel_name = None, pos = None):
      kc = self.get_kernel(self.startup_timeout, kernel_name, extra_arguments=self.extra_arguments)
      try:
        res = kc.complete(text, int(pos) if pos is not None else None, reply=True, timeout = 5)
        if res is None or res['content']['status'] not in ('ok'):
          return None
        if _debugging: logging.info('Completions: ' + ','.join(res['content']['matches']))
        return res['content']
      except:
        if _debugging: logging.info('Could not fetch completion suggestions: ' + traceback.format_exc())
        return None

class JupyterAdapter(object):
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
        'application/json': 'json'
    }
    
    
    def __init__(self, kernel_startup_timeout, cell_exec_timeout, connection_dir, console_in = None, 
                kernel_name='python',
                **kw):
        """Initializes the Jupyter Adapter"""

        self.executePreprocessor = RCloudExecutePreprocessor(startup_timeout = kernel_startup_timeout, timeout = cell_exec_timeout, 
                                                            kernel_name = kernel_name,  kernel_manager_class=MultiKernelManager, 
                                                            console_in = console_in, connection_dir = connection_dir, shutdown_kernel = 'immediate')

    def add_init_script(self, kernel_name, init_script):
        self.executePreprocessor._init_scripts[kernel_name] = init_script

    def get_kernel_specs(self):
        return KernelSpecManager().get_all_specs()
        
    def get_jupyter_path(self, path):
        return paths.jupyter_path(path)

    def __del__(self):
        self.executePreprocessor.shutdown()

    def shutdown(self):
        self.executePreprocessor.shutdown()

    def complete(self, text, kernel_name = None, pos = None):
        return self.executePreprocessor.complete(kernel_name, text, pos)

    def run_cmd(self, cmd, kernel_name = None):
        """
        Runs python command string.
        """
        
        if _debugging: logging.info('Running command: ' + cmd + ' using kernel: ' + kernel_name)
        notebook = nbformat.v4.new_notebook()
        my_cell = nbformat.v4.new_code_cell(source=cmd)
        notebook.cells = [my_cell]
        if kernel_name:
          notebook.metadata['kernelspec'] = {'name' : kernel_name}
          
        try:
          self.executePreprocessor.preprocess(notebook, {'metadata': {'path': '.' }})
          if _debugging: logging.info('Result notebook: ' + nbformat.v4.writes_json(notebook))
          if len(notebook.cells) < 1 or len(notebook.cells[0].outputs) < 1:
            return None
          return self.postprocess_output(notebook.cells[0].outputs)
        except:
          exc_type, exc_obj, exc_tb = sys.exc_info()
          
          msg = None
          if _debugging: 
            msg = '\n'.join(traceback.format_exception_only(exc_type, exc_obj) + traceback.format_tb(exc_tb))
          else:
            msg = '\n'.join(traceback.format_exception_only(exc_type, exc_obj))
          
          out = NotebookNode(output_type = 'error', html = RClansiconv(msg + '\n'))
          return [out]
          
    def postprocess_output(self, outputs):
        """
        Postprocesses output and maps mime types to ones accepted by R.
        """
        res = []
        for output in outputs:
          msg_type = output.output_type
          content = output
          out = NotebookNode(output_type = msg_type)
          if msg_type in ('display_data', 'execute_result'):
            for mime, data in content['data'].items():
                try:
                    attr = self.MIME_MAP[mime]
                    if attr == 'text':
                      tmpval =  RClansiconv(data) 
                    else:
                      tmpval = data
                    setattr(out, attr, tmpval)
                except KeyError:
                    raise NotImplementedError('unhandled mime type: %s' % mime)
          elif msg_type == 'stream':
              setattr(out, 'text', RClansiconv(content['text']))
          elif msg_type == 'error':
              setattr(out, 'html', RClansiconv('\n'.join(content['traceback']) + '\n'))
          else:
              if _debugging: logging.info('Unsupported: ' + msg_type)
              raise NotImplementedError('unhandled result: %s' % msg_type)
          if _debugging: logging.info('Sending: msg_type: [{}]; HTML: [{}]; TEXT: [{}]'.format(msg_type, out.get('html', ''), out.get('text', '') ))
          res.append(out)
        return res # upstream process will handle it [e.g. send as an oob message]

