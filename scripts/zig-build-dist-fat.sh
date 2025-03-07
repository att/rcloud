#!/usr/bin/env bash
#
# This script runs the steps required to build an rcloud fat source
# distribution after a successful build of all dependencies.
#
# Run this from the rcloud source root directory

set -euo pipefail

# Download the latest development snapshot of Zig 0.14.0 (pre-release
# as of March 2025).
zig/download.sh 0.14.0

# Build all Zig and R dependencies, placing zig package dependencies
# in zig/cache/p
zig/zig build --global-cache-dir zig/cache

# Build a source tarball which includes all the R package
# dependencies' source tarballs (which are placed in zig-out/assets by
# default during the previous step).
zig/zig build dist-fat -Dassets=zig-out/assets
