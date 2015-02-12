#!/bin/sh

sudo_cmd=''
## check if user switching is enabled - in that case we have to sudo            
if grep -i ^exec.match.user conf/rcloud.conf >/dev/null 2>&1; then
    if [ `id -u` != 0 ]; then
        echo "NOTE: user switching is enabled, using sudo"
        sudo_cmd=sudo
    fi
fi

pid=`$sudo_cmd cat run/rserve.pid 2>/dev/null`
if [ -n "$pid" ]; then
    ## FIXME: should we check that it's the right process?
    echo " - shutdown RCloud server $pid"
    ${sudo_cmd} kill -INT "$pid"
fi
