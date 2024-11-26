#!/bin/sh
# This scripts either creates R package repository with all R packages
# (incl. dependencies), or it installs all packages from that repositroy
#
# Author: Simon Urbanek <simon.urbanek@R-project.org>
# License: MIT

if [ x"$1" = 'x-h' ]; then
    echo ''
    echo " Usage: $0 [--mkdist]"
    echo ''
    echo ' This script must be run from the RCloud root directory and it'
    echo ' either creates a repository with all R packages needed for'
    echo ' the RCloud installation and/or installs packages from that'
    echo ' repository for use with current R as an RCloud instance.'
    echo ''
    echo ' Optional environment variables (defaults in []):'
    echo ' RBIN        - location of the R executable [R]'
    echo ' DISTREP     - distribution repository [<RCloud>]'
    echo ' RCLIB       - RCloud library [library/X.Y] where X.Y is the R version'
    echo ''
    echo ' This script assumes that zig-out/assets exist, i.e. that'
    echo '    zig build dist-fat -Dassets=zig-out/assets'
    echo ' was run, providing all non-RCloud dependencies.'
    echo ''
    exit 0
fi

WD=`pwd`

if [ ! -e "$WD/rcloud.support/DESCRIPTION" ]; then
    echo ' ERROR: you must run this script from the RCloud root directory!' 1>&2
    exit 1
fi

: ${DISTREP="$WD"}
: ${RBIN=R}

ok=`echo 'if(R.version$major>=3)cat("OK\n")' | "$RBIN" --slave --vanilla`
if [ "x$ok" != "xOK" ]; then
    echo '' 1>&2
    echo ' ERROR: R is not available in the correct version.' 1>&2
    echo '' 1>&2
    exit 1
fi

RVER=$(echo 'cat(paste0(R.version$major,".",gsub("[.].*","",R.version$minor),"\n"))' | $RBIN --slave --vanilla)

: ${RCLIB="$WD/library/$RVER"}

set -e

if [ ! -d "$RCLIB" ]; then mkdir -p "$RCLIB"; fi

mkdist=''
if [ x"$1" = "x--mk-dist" -o x"$1" = "x--mkdist" ]; then
    mkdist=yes
fi
if [ -n "$mkdist" -o x"$1" = "x--clean" ]; then
    echo " --- Cleaning existing repositories"
    rm -rf "$DISTREP/src/contrib"
fi

if [ ! -e "$DISTREP/src/contrib/PACKAGES" -o -n "$mkdist" ]; then
    ## check if we need to pull mathjax
    sh scripts/fetch-mathjax.sh

    if [ ! -e zig-out/assets ]; then
        echo "ERROR: zig-out/assets not present. Please run zig build and" >&2
        echo "          zig build dist-fat -Dassets=zig-out/assets" >&2
        echo "       or use rcloud-full-*.tar.gz release tar ball" >&2
        exit 1
    fi

    if ! mkdir -p "$DISTREP/src/contrib"; then
        echo "ERROR: cannot create $DISTREP/src/contrib" >&2
        exit 1
    fi
##-- always copy for now until we sort out the zig-out/htdocs discrepancy
#    if [ "$(cd zig-out/assets && pwd)" = "$(cd $DISTREP/src/contrib/../../zig-out/assets && pwd)" ]; then
#	echo " --- Linking to distributed assets"
#	(cd "$DISTREP/src/contrib/" && ln -s ../../zig-out/assets/* . )
#    else
	echo " --- Copying distributed assets"
	cp zig-out/assets/* "$DISTREP/src/contrib/"
#    fi
    echo " --- Creating RCloud source tar balls"
    ( cd "$DISTREP/src/contrib"; for src in `ls $WD/rcloud.*/DESCRIPTION $WD/rcloud.packages/*/DESCRIPTION $WD/packages/*/DESCRIPTION 2>/dev/null`; do "$RBIN" CMD build --no-build-vignettes `dirname "$src"`; done )
    echo " --- Creating repository index"
    echo "tools:::write_PACKAGES('$DISTREP/src/contrib')" | "$RBIN" --vanilla --slave --no-save
fi

if [ -n "$mkdist" ]; then
    echo ''
    echo "Distribution repository created in $DISTREP/src/contrib"
    echo ''
    exit 0
fi

if [ -z "$MAKEFLAGS" ]; then
    if [ -e /proc/cpuinfo ]; then
	MAKEFLAGS=-j$(grep ^proc /proc/cpuinfo | wc -l)
    else
	MAKEFLAGS=-j12
    fi
    echo "Note: MAKEFLAGS not set, using $MAKEFLAGS"
    export MAKEFLAGS
fi

if [ "`uname`" = Darwin ]; then
    echo ''
    echo "==== NOTE: this script does NOT use CRAN binaries, because the release intentionally"
    echo "====       fixes the package versions to guarantee reproducibility. However, compiling"
    echo "====       packages from source requires additional dependencies and may be non-trivial."
    echo "====       If you want to use lastest binaries from CRAN, please use the"
    echo "====       scripts/bootstrapR.sh from the development source repository instead."
    echo ''
fi

export RCS_SILENCE_LOADCHECK=TRUE

echo "-- Installing packages from $DISTREP/src/contrib to $RCLIB --"

## Installation from a distribution - install rcloud.support first for the correct order
## only then all remaining packages from the repository
echo 'cat(sprintf("\n Using %s, installing packages...\n", R.version.string)); url="file://'"$DISTREP/"'"; a=rownames(available.packages(paste0(url,"/src/contrib"))); install.packages("rcloud.support","'"$RCLIB"'",url,type="source",Ncpus=4); p2=rownames(installed.packages("'"$RCLIB"'")); install.packages(a[!a %in% p2],"'"$RCLIB"'",url,type="source",Ncpus=4);' | R_LIBS="$RCLIB" "$RBIN" --slave --vanilla

echo "-- Testing completeness of the installation ..."

ok=`echo 'library(rcloud.support);library(rcloud.client);library(Cairo);library(rjson);cat("OK\n")' | R_LIBS="$RCLIB" "$RBIN" --slave --vanilla`

if [ "x$ok" != "xOK" ]; then
    echo '' 1>&2
    echo ' ERROR: one or more packages could not be installed.' 1>&2
    echo ' Please check that you have all necessary dependencies installed' 1>&2
    echo '' 1>&2
    exit 1
fi

echo ''
echo '============================================================================'
echo ''
echo ' IMPORTANT: please review conf/rcloud.conf to setup RCloud, we copied'
echo '            the most minimal template with the least services which is only'
echo '            suitable for single-user tests, not for any real depolyment.'
echo ''
