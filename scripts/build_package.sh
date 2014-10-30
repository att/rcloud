#!/bin/sh
set +x

dir=`echo $1 | sed -e 's:/.*::'`
pkg=`echo $1 | sed -e 's:.*/::'`
if [ "$1" = "$dir" ]; then
    dir=.
fi
echo dir $dir
pwd
(cd $dir; R CMD build $pkg && R CMD INSTALL `sed -n 's/Package: *//p' $pkg/DESCRIPTION`_`sed -n 's/Version: *//p' $pkg/DESCRIPTION`.tar.gz)

