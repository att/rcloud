#!/bin/sh
set +x

if [ ! -e rcloud.support/DESCRIPTION ]; then
    if [ -n "$ROOT" ]; then
	echo "NOTE: changing to '$ROOT' according to ROOT"
	cd "$ROOT"
    fi
fi

if [ ! -e rcloud.support/DESCRIPTION ]; then
    echo '' 2>&1
    echo ' ERROR: cannot find rcloud.support. Please make sure you are' 2>&1
    echo '        running this script from the RCloud root directory!' 2>&1
    echo '' 2>&1
    exit 1
fi

# build JS (if available)
for dir in htdocs/js  htdocs/lib; do
    if [ -d $dir/node_modules ]; then
	echo " - checking JS code in $dir"
	make -C $dir || exit 1
    else
	echo "   no node.js modules, skipping"
    fi
done

# Create a local copy of mathjax library in htdocs
MATHJAX_INSTALL_DIR=mathjax
if [ ! -e "htdocs/$MATHJAX_INSTALL_DIR" ]; then
    mkdir -p "htdocs/$MATHJAX_INSTALL_DIR"
    echo 'Downloading MathJax'
    curl -L https://codeload.github.com/mathjax/MathJax/legacy.tar.gz/master | tar -xz -C "htdocs/$MATHJAX_INSTALL_DIR" --strip-components=1
fi

export RCS_SILENCE_LOADCHECK=TRUE

build_package()
{
    R CMD build $1 && R CMD INSTALL `sed -n 's/Package: *//p' $1/DESCRIPTION`_`sed -n 's/Version: *//p' $1/DESCRIPTION`.tar.gz
}

# build internal packages (not in git) & rcloud.packages
for dir in internal rcloud.packages packages; do
    if [ -e $dir ]; then
        for pkg in `ls $dir/*/DESCRIPTION 2>/dev/null | sed -e s:$dir/:: -e 's:/DESCRIPTION::'`; do
            echo $pkg
	    (cd $dir && build_package $pkg) || (echo;echo;echo; echo package $pkg FAILED to build!;echo;echo)
        done
    fi
done

build_package rcloud.client || exit 1
build_package rcloud.support || exit 1

if [ -e ".git" ]; then
# update branch/revision info
    REV=`( git rev-list --abbrev-commit -n 1 HEAD )`
    BRANCH=`( git status | sed -n 's:.*On branch ::p' | sed 's:/:-:g' )`

    if [ -n "$REV" ]; then
	echo "$BRANCH" > REVISION
	echo "$REV" >> REVISION
    fi
fi
