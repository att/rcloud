#!/bin/bash
cd htdocs/js; make; cd ../..
R CMD build rcloud.support && R CMD INSTALL rcloud.support_`sed -n 's/Version: *//p' rcloud.support/DESCRIPTION`.tar.gz
killall -9 Rserve.dbg
rm -f code/rcloud.auth
./code/start -d
