# RCloud: Collaborative Visualisation and Analytics Platform

[RCloud](http://rcloud.social/) is an open-source environment for collaboratively creating
and sharing data analyses. RCloud lets you mix analytics code in R, Python, shell, Markdown,
HTML and other languages and systems. Its focus is on collaboration, discoverability and scalability.
It also provides flexible platform for visualisations and dashboards.
It is highly modular, ranging from a single container to full-scale enterprise deployment on
large clusters.

# Installation

The easiest way to get started is to use our [release "full" tar balls](https://github.com/s-u/rcloud/releases)
which include all artifacts and dependencies - see `README.md` in the release or
[README-release.md](README-release.md) for the most recent one.

# Development

This version of [RCloud](https://github.com/att/rcloud) provides an
updated and reproducible build system to make it easier to develop and test enhancements to
RCloud as well as to deploy it.

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

Several other configurations are currently under development. All
configurations are in individual subdirectories of the `docker`
directory.

For example, to test the `stage` configuration:

```sh
cd docker/stage
docker compose build
docker compose up
```

To stop the containers, send a Control-C. To edit code and see the
effects, save the edits, then perform `docker compose build` and
`docker compose up` again. To clean up images (but not data), perform
`docker compose down`.

Data is persisted between sessions within Docker volumes.


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
