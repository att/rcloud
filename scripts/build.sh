#!/bin/sh

if [ ! -e rcloud.support/DESCRIPTION ]; then
    echo '' 2>&1
    echo ' ERROR: cannot find rcloud.support. Please make sure you are' 2>&1
    echo '        runnign this script form the RCloud root directory!' 2>&1
    echo '' 2>&1
    exit 1
fi

# build JS and rcloud.support
make -C htdocs/js && R CMD build rcloud.support && RCS_SILENCE_LOADCHECK=TRUE R CMD INSTALL rcloud.support_`sed -n 's/Version: *//p' rcloud.support/DESCRIPTION`.tar.gz

# build internal packages (not in git)
if [ -e internal ]; then
    for pkg in `ls internal/*/DESCRIPTION | sed -e 's:internal/::' -e 's:/DESCRIPTION::'`; do
	(cd internal && R CMD build $pkg && R CMD INSTALL `sed -n 's/Package: *//p' $pkg/DESCRIPTION`_`sed -n 's/Version: *//p' $pkg/DESCRIPTION`.tar.gz)
    done
fi

# update branch/revision info
REV=`( git rev-list --abbrev-commit -n 1 HEAD )`
BRANCH=`( git status | sed -n 's:.*On branch ::p' | sed 's:/:-:g' )`

if [ -n "$REV" ]; then
    echo "$BRANCH" > REVISION
    echo "$REV" >> REVISION
fi
