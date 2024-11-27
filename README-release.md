# RCloud 2.5.0 Release

This tar ball includes RCloud 2.5.0 including all required R package dependencies
frozen at their respective versions at the time of the release, tested with
R 4.4.2. Therefore it is intended to use used with a clean R installation, or
as a container (see below).

For latest development and updates, please visit https://github.com/att/rcloud

## Quick start - Docker builds

This release can be used to build a Docker image with RCloud exposed at port 8080.
It is based on Debian image and the file [Makefile](./Makefile)
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

Once running, RCloud can be accessed at https://localhost:8080/login.R

A more complex setup with authentication and multi-user support can be built and
deployed using `docker compose`:

```sh
docker compose build
docker compose up
```

The sample user login is `rcloud` with password `rcloud` (see `runtime-sks` target to modify user management).

## Quick start - local build

On a Unix machine with R (tested with R 4.4.2) RCloud can be run locally.
Although RCloud can be run from any location (the `ROOT` environment variable just must
point to the root of the installation), for simplicity we assume this release
has been unpacked in `/data/rcloud`.

The necessary R package dependencies can be installed from the release with

```sh
bin/rlib.sh
```
(this does not require network access). Some packages require specific system libraries,
but most should be already installed if R was installed by the system package manager.

A most minimal configuration file is provided in `conf/rcloud.conf` and the instance can be started with

```sh
bin/start.sh
```

and shut down either with the `INT` signal or with

```sh
bin/shutdown.sh
```

## Configuration

RCloud is highly modular and has many optional features and services which extend its capabilities. The
configurations used in the Quick Start sections are very minimalistic to reduce complexity, intended only
for a quick test in single-user environments and not intended for any real deployment.

RCloud supports additional features such as secure connections, authentication, document search, distributed compute back-end,
scaling and load-balancing, multi-instance support, GitHub and gist-service back-ends, Shiny and htmlwidgets-support,
additional languages (Python and Jupyter kernels).
Some features rely on additonal services or software not included in the release tar ball, but avaiable on GitHub.

For forther reading please see the [documentation](https://github.com/att/rcloud/tree/develop/doc) directory,
[deployment WiKi page](https://github.com/att/rcloud/wiki/Deployment) 
and [rcloud.conf](https://github.com/att/rcloud/wiki/rcloud.conf) configuration file documentation.

## Development

This release is based on a new Zig-based system - see
[README](README.md) for deatils.

See also [upstream's README](README-upstream.md).
