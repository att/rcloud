#!/bin/bash
cd htdocs/js; make; cd ../..
R CMD INSTALL rcloud.support
killall -9 Rserve.dbg
./code/start -d
