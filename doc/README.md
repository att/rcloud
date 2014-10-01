# Building

Please see the top-level README for installations instructions.

# Directory structure

- conf: Rserve and RCloud configuration, R source files used server-side.

- doc: documentation

- htdocs: static content served by RServe's HTTP server.

- data: this is where all user-generated content may be stored
  depending on the back-end configuration

- data/rcs: if flat-file RCS back-end is used (default) then this
  directory will hold the RCS database

- run: optional run-time directory that will hold information
  pertinent to the running RCloud instance such as the PID file or
  ulog socket (if enabled in the configuration file).

- tmp: temporary directory

- scripts: various scripts that help with the administartion of RCloud
  such as migration, updates etc.

# Advanced configuration

The top-level README contains instructions to setup a basic RCloud
instance which is running as a single execution user on a single
machine. In this section we will cover more advanced setup of RCloud,
including a multi-user environment.

## Redis for RCS
RCloud Storage (RCS) is a key/value store that stores the metadata in
an RCloud instance. The notebooks are stored on GitHub, but RCS
contains information such as the list of interests, stars etc. In the
default configuration the RCS is backed by simple files. That has its
issues in multi-user setup for several reasons: permissions may not
allow multiple users to read/write the same file and operations may
not be atomic if multiple users try to modify the same file. RCloud
provides an alternative back-end which is highly recommended over the
default, but requires [Redis](http://redis.io/) server. To enable it,
install Redis on the RCloud machine
(`sudo apt-get install redis-server` in Debian/Ubuntu) and add

    rcs.engine: redis

to `rcloud.conf`. Finally, you have to install `rediscc` package in R:

    install.packages("rediscc",,"http://rforge.net")

If you are converting an existing instance, There is a migration
script `scripts/migrate2redis.sh` which migrates from flat file RCS to
Redis-based RCS if needed.


## Multi-user setup

In the default configuration RCloud is run in the context of the user
that starts it. This is fine for single-user machines or for shared
instanced with flat user permissions, but in multi-user settings where
users should have separate and possibly different permissions, it is
necessary to add an additional authentication governing the execution
of code. RCloud supports this by maintaining two tokens - one for
notebook access (essentially GitHub permissions) and one for execution
(unix permissions). When enabled, RCloud can switch the execution
environment according to the permissions granted by the execution
authorization. There are three main directives in `rcloud.conf` that
govern this functionality:

- Exec.auth: defines the authentication method for the execution
  environment. The currently the only implemented method is `pam`
  (pluggable authentication module) - supported by most unix systems.

- Exec.match.user: instructs RCloud to match the execution user in
  accordance to the soruce. Currently the only valid value is `login`
  which matches the user according to the execution authentication
  login.

- Exec.anon.user: defines the fall-back user account to use for
  anonymous access. If not set, anonymous execution is denied.

The actual execution authentication is performed by a service provided
by the SessionServer, so the `Exec.auth` value is passed to the
server. For PAM authentication to work, the session server must be
running and the `Session.server:` directive set in `rcloud.conf`,
typically

    Session.server: http://127.0.0.1:4301

for default local session server.

When RCloud has to change privileges according to login, it has to be
run via Rserve as root. This means that other services such as HTTP
may also have to change to the appropriate user account. This can be
done using the `HTTP.user` directive, so on Debian/Ubuntu one would
use

    HTTP.user: www-data

## Secure connections

When transmitting login information it is qutie imperative to enable
TLS/SSL secure transport so it doesn't get send in clear text. The
`rserve.conf` has a commented-out section that shows how to set it
up. It requires key and certificate files - in this example
`server.key` and `server.crt` stored in the `conf` directory:

    websockets.tls.port 8083
    tls.key ${ROOT}/conf/server.key
    tls.cert ${ROOT}/conf/server.crt

## Logging

RCloud supports several logs depending on the kind of operation
desired. In regular mode, an optional logging can be enabled to a
syslog-comaptible logging service which will record every call into
the R instance. This is done using the `ulog` directive of
`rserve.conf`, typically

    ulog ${ROOT}/run/ulog

Make sure you create the `run` directory if not present. If the `ulog`
socket doesn't exist, logging will be simply ignored, i.e., the log
daemon can be started at any point.

For debugging purposes RCloud can be started in debug mode if
`DEBUG=1` environment variable is set at start time. In that case,
both RCloud and Rserve will produce a lot of extra output. In addition,
every packet between client and server can be recorded if

    log.io enable

is added to `rserve.conf`. This directive is effective only in debug
mode; it is ignored in regular mode. Each process will create a
separate file `/tmp/Rserve-io-*` which will record all I/O between
Rserve and the client before the packet is interpreted (i.e., without
any encapsulating layers such as WebSockets or SSL).

SessionServer produces output for some token operations which is useful
for tracking authentications and logouts.

