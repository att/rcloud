# See peer directories dev, stage and prod for Docker Compose
# configurations and additional documentation.

ARG BUILD_JOBS=8

#
# base: this stage is a minimal debian installation with an rcloud user created
#
# pinned to:
# https://hub.docker.com/layers/library/debian/bookworm-20241016/images/sha256-bfee693abf500131d9c2aea2e9780a4797dc3641644bac1660b5eb9e1f1e3306?context=explore
FROM debian@sha256:e11072c1614c08bf88b543fcfe09d75a0426d90896408e926454e88078274fcb AS base

#
# environment variables
#
# these default values may be overridden by docker compose.yaml files
#
# runtime configuration files: relative to rcloud root, e.g.
# /data/rcloud, which is also by default where the docker build context
# root is copied to (see WORKDIR directives below).
#
# NOTE: several places in RCloud operations scripts (e.g. `start`)
# expect to find configuration files in the conf/ directory, so this
# Dockerfile will copy the paths in these environment variables to
# that location.
#
# ARG sets the environment variable during the build, but it is not
# persisted in the image.
ARG RCLOUD_CONF=docker/stage/rcloud.conf
ARG RCLOUD_SCRIPTS_CONF=docker/stage/scripts.conf
ARG RCLOUD_RSERVE_PROXIFIED_CONF=docker/stage/rserve-proxified.conf

# This is the RServe conf file for the single container runtime-simple
# stage, used by the dev/ docker compose configuration. It is set in
# docker/dev/compose.yaml.
ARG RCLOUD_RSERVE_CONF=

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked      \
    --mount=type=cache,target=/var/lib/apt,sharing=locked        \
    apt-get update && apt-get install --no-install-recommends -y \
    curl                                                         \
    git                                                          \
    locales                                                      \
    wget                                                         \
    && rm -rf /var/lib/apt/lists/*

# Make rcloud user
RUN useradd -m rcloud

#
# build-dep: this stage includes all debian system requirements
# required to build rcloud and its dependencies from source.
#
FROM base AS build-dep

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked      \
    --mount=type=cache,target=/var/lib/apt,sharing=locked        \
    apt-get update && apt-get install --no-install-recommends -y \
    automake                                                     \
    build-essential                                              \
    libcairo2-dev                                                \
    libcurl4-openssl-dev                                         \
    libicu-dev                                                   \
    libssl-dev                                                   \
    pkg-config                                                   \
    r-base                                                       \
                                                                 \
    nodejs                                                       \
    npm                                                          \
    && rm -rf /var/lib/apt/lists/*

#
# build-dep-java: this stage includes build dependencies for java, for
# use with session key server
#
FROM base AS build-dep-java

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked      \
    --mount=type=cache,target=/var/lib/apt,sharing=locked        \
    apt-get update && apt-get install --no-install-recommends -y \
    build-essential                                              \
    default-jdk                                                  \
    && rm -rf /var/lib/apt/lists/*

FROM build-dep-java AS dev-sks
WORKDIR /data

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked      \
    --mount=type=cache,target=/var/lib/apt,sharing=locked        \
    apt-get update && apt-get install --no-install-recommends -y \
    libpam0g-dev                                                 \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 https://github.com/s-u/SessionKeyServer.git && cd SessionKeyServer \
    && make -j${BUILD_JOBS}                                                                \
    && make -j${BUILD_JOBS} pam

#
# SessionKeyServer runtime
#
# FIXME: this container does NOT persist keys, so any encrypted notebooks will be lost on re-start
FROM dev-sks AS runtime-sks

WORKDIR /data/SessionKeyServer
EXPOSE 4301

# FIXME: Assign dummy password to rcloud user to test auth.
RUN echo "rcloud:rcloud" | chpasswd

RUN mkdir -p key.db && chmod 0700 key.db

ENTRYPOINT ["/bin/bash", "-c", "java -Xmx256m -Djava.library.path=. -cp SessionKeyServer.jar com.att.research.RCloud.SessionKeyServer -l 0.0.0.0 -p 4301 -d key.db"]

#
# a development environment target
#
FROM build-dep AS dev

ARG UID=1001
ARG GID=1001
ARG USER=dev

# Set locale: needed because rcloud won't run in C locale
RUN echo "en_NZ.UTF-8 UTF-8" >> /etc/locale.gen && locale-gen
ENV LANG en_NZ.UTF-8
ENV ROOT /data/rcloud

# install runtime system dependencies for testing
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked   \
    apt-get update && apt-get install -y                    \
    procps                                                  \
    redis-server


# add group, exiting successfully if it already exists
RUN groupadd -f -g $GID $USER && useradd -m -u $UID -g $GID $USER && mkdir /data && chown $USER:$GID /data
USER $USER
WORKDIR /home/$USER

#
# build: builds all dependencies and RCloud sources
#
FROM build-dep AS build
WORKDIR /data/rcloud
RUN chown -R rcloud:rcloud /data/rcloud

#
# Download Zig 0.14.0
#
COPY zig/download.sh zig/download.sh
RUN zig/download.sh 0.14.0

# Add zig executable to path
ENV PATH=/data/rcloud/zig:$PATH

# Copy sources to build context
COPY build.zig .
COPY build.zig.zon .
COPY VERSION .
COPY build-aux       build-aux
COPY conf            conf
COPY docker          docker
COPY doc             doc
COPY htdocs          htdocs
COPY packages        packages
COPY rcloud.client   rcloud.client
COPY rcloud.packages rcloud.packages
COPY rcloud.support  rcloud.support
COPY scripts         scripts
COPY services        services
COPY Gruntfile.js    .
COPY LICENSE         .
COPY package-lock.json .
COPY package.json    .

# Fetch MathJax
RUN /bin/sh scripts/fetch-mathjax.sh

# build
RUN --mount=type=cache,target=/zig/global,sharing=locked \
    --mount=type=cache,target=/zig/local,sharing=locked \
    zig build --cache-dir /zig/local --global-cache-dir /zig/global --summary new


#
# dist: generate a source distribution
#
FROM build AS dist
WORKDIR /data/rcloud

# Copy additional files not needed for build but included in source distribution
COPY flake.nix    .
COPY flake.lock   .
COPY Gruntfile.js .
COPY LICENSE      .
COPY README.md    .
COPY NEWS.md      .
COPY VERSION      .

RUN --mount=type=cache,target=/zig/global,sharing=locked \
    --mount=type=cache,target=/zig/local,sharing=locked \
    zig build dist --cache-dir /zig/local --global-cache-dir /zig/global --summary new

FROM dist AS dist-fat
WORKDIR /data/rcloud
RUN --mount=type=cache,target=/zig/global,sharing=locked \
    --mount=type=cache,target=/zig/local,sharing=locked \
    zig build dist-fat -Dassets=zig-out/assets --cache-dir /zig/local --global-cache-dir /zig/global --summary new



#
# runtime: this is the final stage which brings everything from the
# prior stages together. It also pulls in the remaining debian
# packages needed for runtime.
#
FROM base AS runtime
USER root
WORKDIR /data/rcloud
RUN chown -f rcloud:rcloud /data/rcloud

RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y \
    dumb-init \
    redis-server \
    \
    jupyter \
    python3-ipython \
    python3-ipykernel \
    python3-nbconvert \
    python3-nbformat \
    python3-jupyter-client \
    python3-jupyter-core \
    \
    r-base \
    && rm -rf /var/lib/apt/lists/*

# Set locale: needed because rcloud won't run in C locale
RUN echo "en_NZ.UTF-8 UTF-8" >> /etc/locale.gen && locale-gen
ENV LANG=en_NZ.UTF-8

# Copy build artifacts (zig-out)
COPY --from=build --chown=rcloud:rcloud /data/rcloud/zig-out /data/rcloud/

# Copy configuration files from build context.
# FIXME: Currently the Zig build creates a conf directory in zig-out
# (copied in the directive immediately above) with configuration files
# for the "stage" type of deployment, using rserve-proxified.conf. So
# we must overwrite that directory by copying the original conf/
# directory from the build context.
RUN  rm -rf conf
COPY conf   conf
COPY docker docker

# Set RCloud root directory
ENV ROOT=/data/rcloud

# Set R libs directories
ENV R_LIBS=/data/rcloud/lib

#
# runtime-simple: the single-user local RCloud installation

FROM runtime AS runtime-simple
WORKDIR /data/rcloud

# Create mount points for shared volumes with correct permissions
RUN mkdir -p /rcloud-run && chown -Rf rcloud:rcloud /rcloud-run && ln -sfn /rcloud-run /data/rcloud/run
RUN mkdir -p /rcloud-data && chown -Rf rcloud:rcloud /rcloud-data && ln -sfn /rcloud-data /data/rcloud/data

# TODO: this directory is needed by rcloud.support/credentials.R:::.save.token.list and must be writable
RUN chown -Rf rcloud:rcloud /data/rcloud/conf

# Install require configuration files
RUN [ -f "$RCLOUD_CONF" ] && cp "$RCLOUD_CONF" conf/
RUN [ -f "$RCLOUD_SCRIPTS_CONF" ] && cp "$RCLOUD_SCRIPTS_CONF" conf/
RUN [ -f "$RCLOUD_RSERVE_CONF" ] && cp "$RCLOUD_RSERVE_CONF" conf/

EXPOSE 8080
USER rcloud

## WARNING: there is a potential race condition where redis may not be available before RCloud tests it -
## this is really just a toy setup
ENTRYPOINT ["/bin/bash", "-c", "sleep 2 && /bin/bash conf/start2 & mkdir -p /rcloud-data/rcs-simple && exec redis-server --protected-mode no --dir /rcloud-data/rcs-simple"]

#
# runtime-redis
#
FROM runtime AS runtime-redis
EXPOSE 6379
RUN mkdir -p /rcloud-data && chown -Rf rcloud:rcloud /rcloud-data

ENTRYPOINT ["/bin/bash", "-c", "mkdir -p /rcloud-data/rcs && exec redis-server --protected-mode no --dir /rcloud-data/rcs"]

#
# runtime-scripts
#
FROM runtime AS runtime-scripts
WORKDIR /data/rcloud

# Create mount points for shared volumes with correct permissions
RUN mkdir -p /rcloud-run && chown -Rf rcloud:rcloud /rcloud-run && ln -sfn /rcloud-run /data/rcloud/run
RUN mkdir -p /rcloud-data && chown -Rf rcloud:rcloud /rcloud-data && ln -sfn /rcloud-data /data/rcloud/data

# Install require configuration files
RUN [ -f "$RCLOUD_CONF" ] && cp "$RCLOUD_CONF" conf/
RUN [ -f "$RCLOUD_SCRIPTS_CONF" ] && cp "$RCLOUD_SCRIPTS_CONF" conf/

ENTRYPOINT ["/usr/bin/dumb-init", "--" ]
CMD        ["R", "CMD",                            \
    "lib/Rserve/libs/Rserve",                      \
    "--RS-conf", "/data/rcloud/conf/scripts.conf", \
    "--RS-set", "daemon=no",                       \
    "--no-save"                                    \
    ]

#
# runtime-forward
#
FROM runtime AS runtime-forward
WORKDIR /data/rcloud
EXPOSE 8080

# Create mount points for shared volumes with correct permissions
# NB: forward doesn't requrie any storage, this is only used for local sockets
RUN mkdir -p /rcloud-run && chown -Rf rcloud:rcloud /rcloud-run && ln -sfn /rcloud-run /data/rcloud/run

ENTRYPOINT ["/usr/bin/dumb-init", "--" ]
CMD        [ "lib/Rserve/libs/forward",  \
    "-p", "8080",                        \
    "-s", "/data/rcloud/run/qap",        \
    "-r", "/data/rcloud/htdocs",         \
    "-R", "/data/rcloud/run/Rscripts",   \
    "-u", "/data/rcloud/run/ulog.proxy"  \
    ]

#
# runtime-rserve-proxified
#
FROM runtime AS runtime-rserve-proxified
WORKDIR /data/rcloud

# Create mount points for shared volumes with correct permissions
RUN mkdir -p /rcloud-run && chown -Rf rcloud:rcloud /rcloud-run && ln -sfn /rcloud-run /data/rcloud/run
RUN mkdir -p /rcloud-data && chown -Rf rcloud:rcloud /rcloud-data && ln -sfn /rcloud-data /data/rcloud/data

# Install required configuration files
RUN [ -f "$RCLOUD_CONF" ] && cp "$RCLOUD_CONF" conf/
RUN [ -f "$RCLOUD_RSERVE_PROXIFIED_CONF" ] && cp "$RCLOUD_RSERVE_PROXIFIED_CONF" conf/

ENTRYPOINT ["/usr/bin/dumb-init", "--" ]
CMD        ["R", "--slave", "--no-restore", "--vanilla",     \
    "--file=/data/rcloud/conf/run_rcloud.R",                 \
    "--args", "/data/rcloud/conf/rserve-proxified.conf"      \
    ]
