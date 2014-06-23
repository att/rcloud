#!/bin/sh

pid=`cat run/rserve.pid 2>/dev/null`
if [ -n "$pid" ]; then
    ## FIXME: should we check that it's the right process?
    echo " - shutdown RCloud server $pid"
    ${sudo_cmd} kill -INT "$pid"
fi
