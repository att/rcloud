#!/bin/bash

set -e

if [ ! -e rcloud.support/DESCRIPTION ]; then
    echo '' 2>&1
    echo ' ERROR: cannot find rcloud.support. Please make sure you are' 2>&1
    echo '        running this script from the RCloud root directory!' 2>&1
    echo '' 2>&1
    exit 1
fi

if [ ! -e zig/zig ]; then
    echo "INFO: Downloading zig ..."
    sh zig/download.sh 0.14.0
fi

VER=$(cat VERSION)

echo ''
echo "=== Building RCloud release $VER ==="
echo ''

export MAKEFLAGS=-j12

if [ x"$1" = x--clean ]; then
    echo '--- Cleaning'
    rm -rf .zig-cache zig-out
else
    if [ -e .zig-cache ]; then
        echo "NOTE: .zig-cache present and thus will be used, consider using --clean for a clean build"
    fi
fi

echo ''
echo '--- Full build including fetching all dependencies ---'
echo ''
zig/zig build

echo ''
echo '--- Creating distribution assets ---'
echo ''
zig/zig build dist-fat -Dassets=zig-out/assets

if [ ! -e zig-out/rcloud-full-$VER.tar.gz ]; then
    echo "ERROR: cannot find zig-out/rcloud-full-$VER.tar.gz" >&2
    exit 1
fi

SRC=$(pwd)
if [ -z "$WORK" ]; then
    ## BSD and GNU are a mess here - this is the best we can do to appease both
    WORK=$(mktemp -d -t rcloud-mkdist.XXXXXX) || exit 1
fi
tar fxz zig-out/rcloud-full-$VER.tar.gz -C "$WORK"
RCDIR="$WORK/rcloud-full-$VER"
## FIXME: zig-out packaging seems off
rsync -a "$SRC/zig-out/htdocs/" "$RCDIR/htdocs/"

## copy most critical scripts
if [ ! -e "$RCDIR/bin" ]; then mkdir -p "$RCDIR/bin"; fi
for scr in rlib.sh start.sh shutdown.sh; do
    cp "$SRC/scripts/$scr" "$RCDIR/bin/$scr"
    chmod a+x "$RCDIR/bin/$scr"
done
## copy minimal config
cp "$SRC/conf/rcloud.conf.dist" "$RCDIR/conf/rcloud.conf"

## shuffle READMEs (FIXME: temporary until we merge the fork)
sed 's:README[.].md:README-zig.md:g' < "$SRC/README-release.md" | sed "s:%VER%:$VER:g" | sed "s:2[.]5[.]0:$VER:g" > "$RCDIR/README.md"
cp "$SRC/README.md" "$RCDIR//README-zig.md"

echo '--- Create vendored source package repository ---'
(cd "$RCDIR" && "$RCDIR/bin/rlib.sh" --mkdist )

rm -rf "$RCDIR/zig-out"

echo "--- Create rcloud-full-$VER.tar.xz ---"
(cd "$WORK" && tar c rcloud-full-$VER | xz -T8 -c9 > "$SRC/rcloud-full-$VER.tar.xz" )

echo '--- Cleanup ---'
rm -rf "$WORK"

ls -l rcloud-full-$VER.tar.xz
