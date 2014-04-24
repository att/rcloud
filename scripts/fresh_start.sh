#!/bin/bash
cd htdocs/js;
if [ -d node_modules ]; then
    make || exit;
else
    echo Skipping javascript build because node.js modules are not installed. Refer to Readme.md for details.
fi
cd ../lib;
if [ -d node_modules ]; then
    make || exit;
else
    echo Skipping javascript build because node.js modules are not installed. Refer to Readme.md for details.
fi
cd ../..
R CMD build rcloud.support && R CMD INSTALL rcloud.support_`sed -n 's/Version: *//p' rcloud.support/DESCRIPTION`.tar.gz || exit
killall -9 RsrvSRV
rm -f conf/rcloud.auth
./conf/start $*
