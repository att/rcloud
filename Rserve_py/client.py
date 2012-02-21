import socket
from parse import *

class RClient:

    def __init__(self):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.connected = False

    def connect(self, host, port):
        self.sock.connect((host, port))
        self.server_id_string = self.sock.recv(32)
        self.connected = True

    def remote_eval(self, v):
        dhead = 4 + ((1+len(v)) << 8)
        total_length = 5 + len(v)
        self.sock.sendall(struct.pack('iiii', 3, total_length, 0, 0))
        self.sock.sendall(struct.pack('i', dhead))
        self.sock.sendall(v)
        self.sock.sendall('\0')

        resp, l, o, l2 = struct.unpack('iiii', self.sock.recv(16))

        if resp == RESP_OK:
            return parse(self.sock)[0]
        elif resp == RESP_ERR:
            print "ERROR!"

    def remote_eval_raw_response(self, v, other_sock):
        dhead = 4 + ((1+len(v)) << 8)
        total_length = 5 + len(v)
        self.sock.sendall(struct.pack('iiii', 3, total_length, 0, 0))
        self.sock.sendall(struct.pack('i', dhead))
        self.sock.sendall(v)
        self.sock.sendall('\0')

        s = self.sock.recv(16)
        resp, l, o, l2 = struct.unpack('iiii', s)

        if resp == RESP_OK:
            other_sock.sendall(s + self.sock.recv(l))
        else:
            other_sock.sendall(s)

    def done(self):
        self.sock.close()
        self.connected = False
