#!/bin/sh
set +x

PACKAGE_DIRS="internal rcloud.packages"
BREAK=1

while [ "$1" != "" ]; do
    case $1 in
        --minimal) PACKAGE_DIRS="" ;;
        --base) PACKAGE_DIRS="internal" ;;
        --core) PACKAGE_DIRS="internal rcloud.packages" ;; # the default
        --all) PACKAGE_DIRS="internal rcloud.packages packages" ;;
        --cont) BREAK=0 ;;
        --no-js) SKIP_JS=1 ;;
        --help) cat <<EOF

 Usage: $0 [{--base | --core | --all}] [--cont]

 Base is the smallest set, 'core' (the default) includes
 rcloud.packages and 'all' includes all other packages.

 The default is to stop if any package fails to build,
 --cont can be used to ignore failures and continue.

EOF
        exit 0 ;;
        *) echo "unknown option" $1 && exit 1 ;;
    esac
    shift
done

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

if [ -z "$SKIP_JS" ]; then
    # build JS (if available)
    if [ \( -d ./node_modules \) -a \( -f node_modules/grunt-cli/bin/grunt \) ]; then
        node_modules/grunt-cli/bin/grunt
    else
        echo "WARNING: JavaScript and CSS targets won't be built."
        echo " run `npm install` from the RCloud root directory to enable these targets."
    fi
fi

# check if we need to worry about mathjax
sh scripts/fetch-mathjax.sh

export RCS_SILENCE_LOADCHECK=TRUE

# build internal packages (not in git) & rcloud.packages
for dir in $PACKAGE_DIRS; do
    if [ -e $dir ]; then
        for pkg in `ls $dir/*/DESCRIPTION 2>/dev/null | sed -e 's:/DESCRIPTION::'`; do
            echo $pkg
	    if ! scripts/build_package.sh $pkg; then
                echo;echo;echo; echo package $pkg FAILED to build!;echo;echo
                if [ $BREAK -gt 0 ]; then
                    exit 1
                fi
            fi
        done
    fi
done

scripts/build_package.sh rcloud.client || exit 1
scripts/build_package.sh rcloud.support || exit 1

if [ -e ".git" ]; then
# update branch/revision info
    REV=`( git rev-list --abbrev-commit -n 1 HEAD )`
    BRANCH=`( git status | sed -n 's:.*On branch ::p' | sed 's:/:-:g' )`

    if [ -n "$REV" ]; then
	echo "$BRANCH" > REVISION
	echo "$REV" >> REVISION
    fi
fi
