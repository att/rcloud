#!/bin/sh

WD=`pwd`

if [ ! -e "$WD/rcloud.support/DESCRIPTION" ]; then
    echo ' ERROR: you must run this script from the RCloud root directory!' 1>&2
    exit 1
fi

# Create a local copy of mathjax library in htdocs
MATHJAX_INSTALL_DIR=mathjax
if [ ! -e "htdocs/$MATHJAX_INSTALL_DIR" ]; then
    mkdir -p "htdocs/$MATHJAX_INSTALL_DIR"
    echo 'Downloading MathJax'
    curl -L https://codeload.github.com/mathjax/MathJax/legacy.tar.gz/master | tar -xz -C "htdocs/$MATHJAX_INSTALL_DIR" --strip-components=1
fi

