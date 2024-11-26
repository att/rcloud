#!/bin/sh

if [ -z "$ROOT" ]; then ## some auto-detection if ROOT is not set...
    for c in /data/rcloud /opt/rcloud /var/rcloud /usr/lib/rcloud "`pwd`"; do
        if [ -e "$c/conf/rserve.conf" ]; then
            ROOT="$c"
            break
        fi
    done
    echo "Note: ROOT not set, auto-detect decided ROOT=$ROOT"
fi

if [ -z "$ROOT" ]; then
    echo '' >&2
    echo ' ERROR: cannot determine ROOT - please set accordingly' >&2
    echo '' >&2
    exit 1
fi
export ROOT

KILL=0
while [ "$1" != "" ]; do
    case $1 in
        --kill) KILL=1 ;;
        --help) cat <<EOF

 Usage: $0 [{--kill}]

 Shuts down the server, nicely by default.

 --kill : with extreme prejudice

EOF
        exit 0 ;;
        *) echo "unknown option" $1 && exit 1 ;;
    esac
    shift
done

sudo_cmd=''
## check if user switching is enabled - in that case we have to sudo            
if grep -i ^exec.match.user "$ROOT/conf/rcloud.conf" >/dev/null 2>&1; then
    if [ `id -u` != 0 ]; then
        echo "NOTE: user switching is enabled, using sudo"
        sudo_cmd=sudo
    fi
fi

pid=`$sudo_cmd cat "$ROOT/run/rserve.pid" 2>/dev/null`
if [ -n "$pid" ]; then
    ## FIXME: should we check that it's the right process?
    echo " - shutdown RCloud server $pid"
    ${sudo_cmd} kill -INT "$pid"
fi

if [ $KILL -gt 0 ]; then
    ## OSX - specific
    ${sudo_cmd} killall RsrvCHx
    ${sudo_cmd} killall RsrvSRV
    ## Linux doesn't respect in-process changes
    ${sudo_cmd} killall Rserve
fi
