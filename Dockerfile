# build with: docker buildx build -f Dockerfile --target runtime-simple -t rcloud .

ARG BUILD_JOBS=8

#
# base: this stage is a minimal debian installation with an rcloud user created
#
# pinned to:
# https://hub.docker.com/layers/library/debian/bookworm-20241016/images/sha256-bfee693abf500131d9c2aea2e9780a4797dc3641644bac1660b5eb9e1f1e3306?context=explore
FROM debian@sha256:e11072c1614c08bf88b543fcfe09d75a0426d90896408e926454e88078274fcb AS base

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
ENV LANG=en_NZ.UTF-8
ENV ROOT=/data/rcloud

# install runtime system dependencies for testing
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked   \
    apt-get update && apt-get install -y                    \
    procps                                                  \
    redis-server


# add group, exiting successfully if it already exists
RUN groupadd -f -g $GID $USER && useradd -m -u $UID -g $GID $USER
USER $USER
WORKDIR /home/$USER

#
# build: builds all dependencies and RCloud sources
#
FROM build-dep AS build
WORKDIR /data/rcloud
RUN chown -R rcloud:rcloud /data/rcloud

#
# Download a version of Zig 0.14.0
#
# NOTE: this is not reproducible, as the official ziglang.org site
# does not maintain older pre-release (master) builds. The download.sh
# script will download the latest master for version 0.14.0 available.
# When 0.14.0 is released (est. Jan 2025), this build will be
# reproducible.
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
COPY doc             doc
COPY htdocs          htdocs
COPY packages        packages
COPY rcloud.client   rcloud.client
COPY rcloud.packages rcloud.packages
COPY rcloud.support  rcloud.support
COPY scripts         scripts
COPY services        services
COPY vendor          vendor
COPY Gruntfile.js    .
COPY LICENSE         .
COPY package-lock.json    .
COPY package.json    .

# build
RUN --mount=type=cache,target=/zig/global,sharing=locked \
    --mount=type=cache,target=/zig/local,sharing=locked \
    zig build --cache-dir /zig/local --global-cache-dir /zig/global --summary new

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

# Set RCloud root directory
ENV ROOT=/data/rcloud

# Set R libs directories
ENV R_LIBS      /data/rcloud/lib

#
# runtime-simple: the single-user local RCloud installation

FROM runtime AS runtime-simple
WORKDIR /data/rcloud

# Create mount points for shared volumes with correct permissions
RUN mkdir -p /rcloud-run && chown -Rf rcloud:rcloud /rcloud-run && ln -sfn /rcloud-run /data/rcloud/run
RUN mkdir -p /rcloud-data && chown -Rf rcloud:rcloud /rcloud-data && ln -sfn /rcloud-data /data/rcloud/data

## note that currently the start script will choose rserve conf based
## on results of a grep of the rcloud.conf file.
RUN cp conf/docker-simple/* conf/

EXPOSE 8080
USER rcloud

## WARNING: there is a potential race condition where redis may not be available before RCloud tests it -
## this is really just a toy setup
ENTRYPOINT ["/bin/bash", "-c", "sh conf/start & mkdir -p /rcloud-data/rcs-simple && exec redis-server --protected-mode no --dir /rcloud-data/rcs-simple"]

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

# Install configuration file
RUN cp conf/docker-proxified/* conf/

ENTRYPOINT ["R", "CMD",                            \
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

ENTRYPOINT [ "lib/Rserve/libs/forward",  \
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

# Install configuration file
RUN cp conf/docker-proxified/* conf/

ENTRYPOINT ["R", "--slave", "--no-restore", "--vanilla",     \
    "--file=/data/rcloud/conf/run_rcloud.R",                 \
    "--args", "/data/rcloud/conf/rserve-proxified.conf"      \
    ]
