#!/usr/bin/env python

import socket
import scipy
from parse import *
from client import RClient

client = RClient()
client.connect('localhost', 6311)

##############################################################################

class Dumper:

    def sendall(self, v):
        result = ' '.join([('00' + hex(ord(i))[2:])[-2:] for i in v])
        print result

while True:
    c = raw_input('> ')
    if c == 'exit':
        break
    print client.remote_eval_raw_response(c, Dumper())
client.done()
