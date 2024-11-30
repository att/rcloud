#!/bin/sh
# script to start Rserve with the configuration conf/rserve.conf
# add -d if you want to start the debugging version
#
# honored environment variables:
# ROOT     - root of the RCloud installation (mandatory, although there is a feeble
#            fallback attempt with the current directory as last resort)
# RBIN     - path to R binary to be run (optional, default is "R")

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

: ${RBIN=R}

if [ "$1" = -h ]; then
   echo ''
   echo " Usage: $0 [-d]"
   echo ''
   echo ' You may need to set ROOT and optionally RBIN accordingly'
   echo ''
   exit 0
fi

if [ "$1" = -d ]; then
   export DEBUG=1
fi

if [ -z "$LANG" ]; then
    echo 'NOTE: no LANG set, but RCloud must be run in UTF-8 locale'
    echo '      setting LANG=C.UTF-8'
    export LANG=C.UTF-8
fi

set -e

## see if we are running the official release version with library/X.Y
RVER=$(echo 'cat(paste0(R.version$major,".",gsub("[.].*","",R.version$minor),"\n"))' | $RBIN --slave --vanilla)

if [ -e "$ROOT/library/$RVER" ]; then
    if [ -z "${R_LIBS}" ]; then
        R_LIBS="$ROOT/library/$RVER"
    else
        R_LIBS="${R_LIBS}:$ROOT/library/$RVER"
    fi
fi

## Rlib was used in RCloud < 2.5.0
if [ -e "$ROOT/Rlib" ]; then
    if [ -z "${R_LIBS}" ]; then
        R_LIBS="$ROOT/Rlib"
    else
        R_LIBS="${R_LIBS}:$ROOT/Rlib"
    fi
fi

export R_LIBS

## create run directory for the PID file if it doesn't exist
if [ ! -d "$ROOT/run" ]; then
    mkdir "$ROOT/run"
fi
## we also need tmp
if [ ! -d "$ROOT/tmp" ]; then
    mkdir "$ROOT/tmp"
fi

sudo_cmd=''
## check if user switching is enabled - in that case we have to sudo
if grep -i ^exec.match.user conf/rcloud.conf >/dev/null 2>&1; then
    if [ `id -u` != 0 ]; then
	echo "NOTE: user switching is enabled, using sudo"
	sudo_cmd=sudo
    fi
fi

RS=`echo 'cat(system.file("libs","Rserve",package="Rserve"))' | "$RBIN" --vanilla --slave`
if grep -i '^rserve.socket:' "$ROOT/conf/rcloud.conf" >/dev/null 2>&1; then
    echo "NOTE: starting proxified version of RCloud"
    ${sudo_cmd} ROOT="$ROOT" R_LIBS="$R_LIBS" "$RBIN" --slave --no-restore --vanilla --file="$ROOT/conf/run_rcloud.R" --args "$ROOT/conf/rserve-proxified.conf"
    ${sudo_cmd} ROOT="$ROOT" R_LIBS="$R_LIBS"  "$RBIN" CMD "$RS" --RS-conf "$ROOT/conf/scripts.conf" --no-save
    forward=`echo 'cat(system.file("libs","forward",package="Rserve"))'|"$RBIN" --vanilla --slave`
    if [ -z "$forward" ]; then echo 'ERROR: cannot find proxy binary - maybe you need to install Rserve?' >&2; exit 1; fi
    ${sudo_cmd} "$forward" -p 8080 -s "$ROOT/run/qap" -r "$ROOT/htdocs" -R "$ROOT/run/Rscripts" -u "$ROOT/run/ulog.proxy" &
else
    ${sudo_cmd} ROOT="$ROOT" R_LIBS="$R_LIBS" "$RBIN" --slave --no-restore --vanilla --file="$ROOT/conf/run_rcloud.R" --args "$ROOT/conf/rserve.conf"
fi
