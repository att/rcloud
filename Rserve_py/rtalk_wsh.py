import socket
import scipy
from parse import *
from client import RClient

client = RClient()

##############################################################################

_GOODBYE_MESSAGE = u'bye'

class SocketWrapper:
    def __init__(self, req):
        self._request = req
    def sendall(self, msg):
        self._request.ws_stream.send_message(msg, binary=True)

def web_socket_do_extra_handshake(request):
    global client
    # This example handler accepts any request. See origin_check_wsh.py for how
    # to reject access from untrusted scripts based on origin value.
    if client.connected:
        client.done()
        client = RClient()
    client.connect('localhost', 6311)

def web_socket_transfer_data(request):
    while True:
        line = request.ws_stream.receive_message()
        if line is None or line == _GOODBYE_MESSAGE:
            return
        client.remote_eval_raw_response(line, SocketWrapper(request))
