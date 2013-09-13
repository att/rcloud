#!/bin/sh

## Migrates old file-based store before RCS support into Redis
## Requires R and rredis package!!
##
## This scripts reads *.json files from data/userfiles and
## stores them in Redis under the keys expected by RCS
## You can the update RCloud and in conf/rcloud.conf add
## rcs.engine: redis

if [ ! -e "data/userfiles" ]; then
    echo '' >&2
    echo " $0 must be run from the RCloud root" >&2
    echo '' >&2
    exit 1
fi

echo 'library(rredis); redisConnect(timeout=100000000L); for (i in Sys.glob("data/userfiles/*.json")) { cat(" migrating", i,"\n"); x <- readLines(i); redisSet(gsub("^data/userfiles/(.*).json$","\\\\1/system/config.json",i), x) }' | R --vanilla --slave
