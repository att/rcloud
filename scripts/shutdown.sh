#!/bin/sh
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
if grep -i ^exec.match.user conf/rcloud.conf >/dev/null 2>&1; then
    if [ `id -u` != 0 ]; then
        echo "NOTE: user switching is enabled, using sudo"
        sudo_cmd=sudo
    fi
fi

pid=`$sudo_cmd cat dist/run/rserve.pid 2>/dev/null`
if [ -n "$pid" ]; then
    ## FIXME: should we check that it's the right process?
    echo " - shutdown RCloud server $pid"
    ${sudo_cmd} kill -INT "$pid"
fi

if [ $KILL -gt 0 ]; then
    ## FIXME: this is probably OSX - specific
    sudo killall RsrvCHx; sudo killall RsrvSRV
fi
