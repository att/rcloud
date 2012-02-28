#!/bin/bash

R --vanilla --slave -e 'library(Rserve); .Call("run_WSS",8080)'&
python -m SimpleHTTPServer 8000&
