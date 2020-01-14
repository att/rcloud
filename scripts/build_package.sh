#!/bin/sh
#
# Usage: build_package.sh <pkg-directory> [<repo>]
#
set +x

if [ -z "$1" ]; then
    echo "ERROR: missing package directory" >&2
    exit 1
fi

if [ ! -e "$1/DESCRIPTION" ]; then
    echo "ERROR: $1 is not a package (missing DESCRIPTION)" >&2
    exit 1
fi

src=`(cd $1; pwd)`
dir=`dirname $src`
pkg=`basename $src`

name=`(cd $dir; sed -n 's/Package: *//p' $pkg/DESCRIPTION)`
ver=`(cd $dir; sed -n 's/Version: *//p' $pkg/DESCRIPTION)`
if [ -z "$name" -o -z "$ver" ]; then
    echo "ERROR: cannot determine package/version" >&2
    exit 1
fi
fn="${name}_${ver}.tar.gz"

echo "=== Building $pkg (in $dir) -> $fn"

if (cd $dir; R CMD build $pkg); then
    if [ -n "$2" ]; then
        cp -p $dir/$fn "$2/"
    fi
    if (cd $dir; R CMD INSTALL `sed -n 's/Package: *//p' $pkg/DESCRIPTION`_`sed -n 's/Version: *//p' $pkg/DESCRIPTION`.tar.gz); then
        echo "=== OK: $pkg installed"
    else
        echo "ERROR: failed to build $pkg (in $dir)" >&2
        exit 1
    fi        
else 
    echo "ERROR: failed to build $pkg (in $dir)" >&2
    exit 1
fi
