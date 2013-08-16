#!/bin/sh

# build JS and rcloud.support
make -C ../htdocs/js && R CMD build rcloud.support && R CMD INSTALL rcloud.support_`sed -n 's/Version: *//p' rcloud.support/DESCRIPTION`.tar.gz

# build internal packages (not in git)
if [ -e internal ]; then
    for pkg in `ls internal/*/DESCRIPTION | sed -e 's:internal/::' -e 's:/DESCRIPTION::'`; do
	(cd internal && R CMD build $pkg && R CMD INSTALL `sed -n 's/Package: *//p' $pkg/DESCRIPTION`_`sed -n 's/Version: *//p' $pkg/DESCRIPTION`.tar.gz)
    done
fi
