#!/usr/bin/env bash
set -euo pipefail               # sane options for bash scripts

: ${MKDIR_P:="mkdir -p"}
: ${R_EXE:="R"}

: ${RCLOUD_SRC:="."}
: ${RCLOUD_OUT:="./zig-out"}
: ${RCLOUD_RUN:="$RCLOUD_OUT/run"}
: ${RCLOUD_LIB:="$RCLOUD_OUT/lib"}


if [ ! -d "$RCLOUD_RUN" ]; then $MKDIR_P "$RCLOUD_RUN"; fi

echo "Copying $RCLOUD_SRC/conf to $RCLOUD_OUT/"
cp -r "$RCLOUD_SRC/conf" "$RCLOUD_OUT"

if [ ! -f $RCLOUD_OUT/conf/rcloud.conf ]; then
    echo "WARNING: conf/rcloud.conf not found, using rcloud.conf.docker";
    cp "$RCLOUD_SRC/conf/rcloud.conf.docker" "$RCLOUD_OUT/conf/rcloud.conf";
fi

echo "Copying $RCLOUD_SRC/VERSION to $RCLOUD_OUT/"
cp "$RCLOUD_SRC/VERSION" "$RCLOUD_OUT/"

echo "Starting redis-server if it is not running."
if ! redis-cli ping; then redis-server & fi

# FIXME: these should not refer to RCLOUD_SRC
ROOT=$(realpath $RCLOUD_OUT) R_LIBS=$(realpath $RCLOUD_LIB) R_LIBS_USER=$(realpath $RCLOUD_LIB) \
    $R_EXE --slave --no-restore --vanilla \
    --file="$(realpath $RCLOUD_SRC)/conf/run_rcloud.R" \
    --args "$(realpath $RCLOUD_SRC)/conf/rserve.conf.docker"
