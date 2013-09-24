#!/bin/sh

## Migrates old file-based store to new RDS flat-file structure
##
## This scripts reads *.json files from data/userfiles and
## stores them in the expected locations for RDS flat files,
## the new default RCS engine

if [ ! -e "data/userfiles" ]; then
    echo '' >&2
    echo " $0 must be run from the RCloud root" >&2
    echo '' >&2
    exit 1
fi

for f in data/userfiles/*.json; do
    u=`echo $f | sed 's:data/userfiles/\(.*\)\.json:\\1:'`
    mkdir -p data/rcs/$u/system
    echo "saveRDS(readLines('$f'), 'data/rcs/$u/system/config.json')" | R --vanilla --slave
done
