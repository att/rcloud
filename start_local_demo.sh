#!/bin/bash

kill -9 `cat pids.txt`
rm -f pids.txt

# R --vanilla --slave -e 'library(Rserve); .Call("run_WSS",8080)'&
# R --vanilla --slave -e 'library(Rserve); run.Rserve(websockets.port=8080)'&
python -m SimpleHTTPServer 8001&
PYTHONPID=$!
echo "$PYTHONPID" >> pids.txt

/Library/Frameworks/R.framework/Resources/bin/R CMD Rserve --RS-conf conf/mbp-cscheid/Rserve.conf --no-save --vanilla

# /Library/Frameworks/R.framework/Resources/bin/R CMD Rserve.dbg --RS-conf conf/mbp-cscheid/Rserve.conf --no-save --vanilla

# RPID=$!
# echo "$RPID" > pids.txt

