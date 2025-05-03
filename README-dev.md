# RCloud

See [upstream's README](README-upstream.md).

# About this fork

This fork of [rcloud](https://github.com/att/rcloud) provides an
updated and reproducible build system targeted to Debian 12 Bookworm
with tools to make it easier to develop and test enhancements to
rcloud as well as to deploy it.

# Quick start: Zig build

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

NOTE: this step can be skipped if you use the [Docker Compose](#quick-start-docker-compose) build
instead.

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

# Quick start: Docker compose

A multi-container version of RCloud incorporating all the key
components can be built and run using docker compose. This is
currently the preferred way to test RCloud.

Build the images:

```sh
docker compose build
```

Run the images:

```sh
docker compose up
```

To stop the containers, send a Control-C. To edit code and see the
effects, save the edits, then perform `docker compose build` and
`docker compose up` again. To clean up images (but not data), perform
`docker compose down`.

Data is persisted between sessions within Docker volumes. The docker
compose configuration can be examined at [compose.yaml](./compose.yaml).



# Maintainer concerns

## Preparing an offline build

To prepare a source distribution that can be built entirely offline
(with no network access), we need to include all third-party
dependencies in the distribution, including those required by the
build system itself. To do so, we need to tell the Zig package manager
where to download our Zig build dependencies, and include those in the
distribution file. In Zig terms, this is known as the "global cache
directory". And we need to perform a full build, which will download
all R package dependencies.

1. Download Zig executable if you haven't already:
```sh
zig/download.sh 0.14.0
```
1. Complete a `zig build` using the path `zig/cache` as the
   `global-cache-dir`:
```sh
zig/zig build --global-cache-dir zig/cache
```
   This will place all external zig build dependencies in the
   directory `zig/cache/p`, which will be included in the distribution
   tarball.
   Building will also add an `assets` directory to `zig-out`,
   which contains the third-party R package dependency sources.

2. Run `zig/zig build --global-cache-dir zig/cache dist-fat
   -Dassets=zig-out/assets`, referring to the cache directory and the
   assets directory. This will generate a tarball
   `rcloud-full-{version}.tar.gz` in `zig-out`.
1. Transfer the file to another machine and extract it there.
1. From the root of the source directory, if necessary, run
   `zig/download.sh 0.14.0` on the target machine to fetch the `zig`
   binary for the target platform.
1. Run `zig/zig build --global-cache-dir zig/cache
   -Dassets=zig-out/assets` to build without a network.

Note that you will need Zig (as well as all system requirements) on
the offline machine since you are still building from source. Simply
packing the `zig/` directory and unpacking it on the other machine is
sufficient to have a working Zig installation. Note that if you follow
the above steps, the contents of the `zig/cache` directory will be in the
`rcloud-full` tarball, so you can exclude it if you are copying the
`zig/` directory in order to install Zig on the offline machine.

## Preparing a source distribution (thin)

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

## Providing alternate R package assets

During development, we have sometimes observed `fetch-assets` to fail
due to network or package repository problems. In these situations, it
may be useful to provide alternate tarballs for third-party R package
dependencies, bypassing the build system's logic to download
 **and verify** tarballs. (Warning: see [Security
Implications](#security-implications).)

Ordinarily, the build system needs to know where to download a
package, the name of the tarball (which normally has a version number
as part of the filename), and a cryptographic hash to verify that the
tarball does not have different contents than the initial
verification.

The URL and the hash are in the file
[config.json](./build-aux/config.json). The name of the tarballs are
in the generated build code in
[generated/build.zig](./build-aux/generated/build.zig). One can search
that file for a given package name to find strings embedded in the
generated code which specify the file name expected.

Normally, the build system uses an external tool called `fetch-assets`
to download the file at the URL specified, and verifies the hash
immediately after download. The downloaded file is placed in the Zig
cache in a directory tree that is opaque to maintainers. It is also
copied to the `zig-out/assets` directory. See [a following
section](#interactions-with-zig-build-cache) for further details on
the interaction with the Zig build cache.

If this `fetch-assets` step fails due to network or other problems, we
can instruct the build system to find its required assets without
using the network and **without verification**: Using the `-Dassets`
option to `zig build` will instruct the system to bypass the use of
`fetch-assets` and the Zig cache entirely. (Warning: see [Security
Implications](#security-implications).) For example, developers might
acquire the required tarballs via alternate means and place them in
the `zig-out/assets` folder, or another location.


```sh
zig build -Dassets=zig-out/assets
```

**NOTE:** due to the Zig [build
cache](#interactions-with-zig-build-cache), any subsequent build
without the `-Dassets` option will overwrite the contents of
`zig-out/assets`. Thus it might make more sense to use a different
directory if developers wish to completely override the set of
tarballs used.

### Security implications

**WARNING:** this workflow *bypasses* the build system's cryptographic
verification of third-party source code. We recommend avoiding this
workflow in production.

### Interactions with Zig build cache

An advantage of using the Zig build system during development is its
aggressive caching. Normally, project specific artefacts are cached in
the `.zig-cache` directory. There is also a user-level cache typically
in the home directory at a location like `~/.cache/zig`. The cache
dramatically speeds up iterative build workflows.

However, it can cause confusion if developers need to deviate from the
typical workflow. For example, the `zig-out/assets` directory contains
downloaded tarballs of third-party R package dependencies. One might
think that simply deleting the directory would force the build system
to re-download the files. This is not the case. The downloaded files,
which the build system considers as artefacts generated by the tool
`fetch-assets`, are cached in the `.zig-cache` directory. During a
subsequent build, if any files are missing from the `zig-out/assets`
directory, they are simply copied from the cache. This is because we
have told the build system that the downloaded tarballs are only
dependent on the [config.json](./build-aux/config.json) file. If the
file hasn't changed, the build system assumes the tarballs will not
have changed, and therefore the `fetch-assets` tool need not be run.

When all else fails, it can be useful to delete the `.zig-cache`
directory. And if non-project-specific caching is suspected as a cause
of undesired behaviour, deleting the `~/.cache/zig` (or equivalent)
directory as well will effectively reset Zig to its factory settings.


<!--
LocalWords:  RCloud md rcloud Zig zig Ziglang dist Dassets gz npm
LocalWords:  aux RCloud's Vendored rcloud's json debian Podman
LocalWords:  Dockerfile devcontainer rserve conf
-->
