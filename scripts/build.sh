#!/bin/sh

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

R CMD build rcloud.client && RCS_SILENCE_LOADCHECK=TRUE R CMD INSTALL rcloud.client_`sed -n 's/Version: *//p' rcloud.client/DESCRIPTION`.tar.gz || exit 1
R CMD build rcloud.support && RCS_SILENCE_LOADCHECK=TRUE R CMD INSTALL rcloud.support_`sed -n 's/Version: *//p' rcloud.support/DESCRIPTION`.tar.gz || exit 1

# build internal packages (not in git)
if [ -e internal ]; then
    for pkg in `ls internal/*/DESCRIPTION 2>/dev/null | sed -e 's:internal/::' -e 's:/DESCRIPTION::'`; do
	(cd internal && R CMD build $pkg && R CMD INSTALL `sed -n 's/Package: *//p' $pkg/DESCRIPTION`_`sed -n 's/Version: *//p' $pkg/DESCRIPTION`.tar.gz)
    done
fi

if [ -e ".git" ]; then
# update branch/revision info
    REV=`( git rev-list --abbrev-commit -n 1 HEAD )`
    BRANCH=`( git status | sed -n 's:.*On branch ::p' | sed 's:/:-:g' )`
    
    if [ -n "$REV" ]; then
	echo "$BRANCH" > REVISION
	echo "$REV" >> REVISION
    fi
fi
