#!/bin/bash

rm -f pids.txt

R --vanilla --slave -e 'library(Rserve); .Call("run_WSS",8080)'&
RPID=$!
echo "R $RPID" > pids.txt

python -m SimpleHTTPServer 8000&
PYTHONPID=$!
echo "Python $PYTHONPID" >> pids.txt
