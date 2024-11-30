# RCloud

See [upstream's README](README-upstream.md).

# About this fork

This fork of [rcloud](https://github.com/att/rcloud) provides an
updated and reproducible build system targeted to Debian 12 Bookworm
with tools to make it easier to develop and test enhancements to
rcloud as well as to deploy it.

# Quick start - Zig build

First, [install Zig version 0.14.0 or later](#install-zig) and all
system requirements needed to build.

Alternatively, if you have the Nix package manager installed:

```sh
nix develop
```

Then:

```sh
zig build
```

The build will complete in about 3 minutes. Then:

```sh
cd zig-out
conf/start2

# to stop the servers:
conf/stop
```

## Install Zig

The build system requires Zig version 0.14.0 or later. You can
download it from [Ziglang](https://ziglang.org/) or use the provided
download script which is used to build our Docker container.
The script must be run from the project root directory, because the
download script expects a zig/ subdirectory to already exist from
your current working directory:

```sh
zig/download.sh 0.14.0
```

This will download and extract the latest 0.14.0 pre-release build and
install it in the zig/ directory. You can add that directory to your
path, or simply run the zig executable by specifying its full path.
Zig will find its library based on the executable's location, not your
path.

# Quick start - Docker build

The same configuration can be built and run with Docker, which uses a
Debian base image. The file [Makefile](./Makefile)
includes targets and can be used as reference for the appropriate
docker commands. For example:

Build the image:

```sh
make build
```

Run the image:

```sh
make run
```

Other targets in the Makefile demonstrate other common Docker scenarios.

# Maintainer concerns

## Preparing an offline build

1. Complete a `zig build` as usual. This step will add an `assets`
   directory to `zig-out`.
1. Run `zig build dist-fat -Dassets=zig-out/assets`. This will
   generate a tarball `rcloud-full-{version}.tar.gz` in `zig-out`.
1. Transfer the file to another machine and extract it there.
1. Run `zig build -Dassets=zig-out/assets` to build without a network.

Note that you will need Zig (as well as all system requirements) on
the offline machine since you are still building from source. Simply
packing the zig/ directory and unpacking it on the other machine is
sufficient to have a working Zig installation.

## Preparing a source distribution

```sh
zig build dist
```

This will create `zig-out/rcloud-{version}.tar.gz`.

## Updating R dependencies

The build system automatically discovers new R package dependencies by
recursively walking the top-level package directories and examining
the DESCRIPTION files. It then queries the configured package
repositories for the latest versions available which satisfy any
version constraints expressed in the package definitions.

```sh
zig build update
```

will perform this process and rewrite `build-aux/config.json`. If any
package has been updated or added, its hash will initially be set to
the empty string. The first time `zig build` is run, a warning will be
echoed to the console to indicate that the hash is being updated.


<!--
LocalWords:  RCloud md rcloud Zig zig Ziglang dist Dassets gz npm
LocalWords:  aux RCloud's Vendored rcloud's json debian Podman
LocalWords:  Dockerfile devcontainer rserve conf
-->
