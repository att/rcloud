#!/bin/sh

if [ "x$1" = "x--no-build" ]; then
    NOBUILD=1
else
    if [ `id -u` = 0 ]; then
        echo "WARNING: running as root, skipping build step!"
        echo ''
        NOBUILD=1
    fi
fi

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

if [ -z "$NOBUILD" ]; then
    sh scripts/build.sh $1 || exit 1
fi

sudo_cmd=''
## check if user switching is enabled - in that case we have to sudo
if grep -i ^exec.match.user conf/rcloud.conf >/dev/null 2>&1; then
    if [ `id -u` != 0 ]; then
	echo "NOTE: user switching is enabled, using sudo"
	sudo_cmd=sudo
    fi
fi

sh scripts/shutdown.sh

## FIXME: this should go - it's the wrong place anyway
rm -f conf/rcloud.auth

echo " - starting RCloud..."
${sudo_cmd} conf/start $*
