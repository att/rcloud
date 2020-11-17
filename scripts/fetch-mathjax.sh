#!/bin/sh

WD=`pwd`
MATHJAX_URL=https://github.com/mathjax/MathJax/archive/2.7.7.tar.gz

if [ ! -e "$WD/rcloud.support/DESCRIPTION" ]; then
    echo ' ERROR: you must run this script from the RCloud root directory!' 1>&2
    exit 1
fi

# Create a local copy of mathjax library in htdocs
MATHJAX_INSTALL_DIR="dist/rcloud/htdocs/mathjax"
if [ ! -e $MATHJAX_INSTALL_DIR ]; then
    mkdir -p $MATHJAX_INSTALL_DIR
    echo 'Downloading MathJax'
    curl -L $MATHJAX_URL | tar -xz -C $MATHJAX_INSTALL_DIR --strip-components=1
fi

