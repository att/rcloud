#!/usr/bin/env bash
#
# devcontainer.sh
#
# Version: 0.1
#
# A script to simplify the creation and execution of devcontainers.
#
# The container is transient (using docker run --rm) and a
# userid/groupid matching the current UID/GID is used.
#
# By default, a Dockerfile is expected in the same directory as this
# script, but this can be changed with the -f or --file option.
#
# A single random port is assigned and bound. Change this port with
# the -p or --port option.
#
# -h or --help for other relevant options.
#
# Changelog
#
# 0.1.1 - 2024-07-12
#     Fixed
#     - using -t option after run on command line
#
# 0.1 - 2024-07-11
#
#     Added
#     - more error handling and sanity checks
#     - run [tag] option added
#     - --root option
#
#     Changed
#     - expanded help
#

set -euo pipefail               # sane options for bash scripts

# Build root is same directory as this script by default. Change with
# --bind option.
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
BUILD_ROOT="$(realpath "$SCRIPT_DIR")"

# Bind mount current working directory by default. Change with --bind
# option.
BIND_ROOT="$(pwd)"

# Dockerfile found at root of build root by default. Change with
# --file option.
DOCKERFILE="$BUILD_ROOT/Dockerfile"

# Dockerfile stage target. Change with --target option.
DOCKER_TARGET="dev"

# Tag to assign to build image. Change with --tag option.
DOCKER_TAG="devcontainer-$(( $RANDOM % 900 + 100))"

# Port to bind to when running (same on host and container). Change
# with --port option.
DOCKER_PORT="$(( $RANDOM % 10000 + 50000 ))"

# Run as root (--root) option
OPT_ROOT=""

# Verbose output
OPT_VERBOSE=""

# Default Group ID. UID and USER are expected in the environment.
# These are not meant to be changed by this script. See also the
# --root option.
GID="$(id -g)"

if [[ -z "$UID" || -z "$USER" ]]; then
    echo "ERROR: UID ($UID) and USER ($USER) must be set by environment."
    exit 1
fi

usage()
{
    echo "Usage: $0 [options] build | run [tag]"
    echo
    echo "Common options:"
    echo "  -h, --help                Show this message and exit"
    echo "  -v, --verbose             More verbose output"
    echo
    echo "build options:"
    echo "  -b, --bind <root>         Set this directory as the build root"
    echo "  -f, --file <dockerfile>   Use this dockerfile"
    echo "  -t, --tag <tag>           Tag the docker image with <tag>"
    echo "  --target <target>         Dockerfile target to build"
    echo
    echo "run options:"
    echo "  -b, --bind <root>         Set this directory as the bind root"
    echo "  -p, --port                Bind to this port on both ends"
    echo "  -t, --tag <tag>           Run image tagged <tag>"
    echo "  --root                    Run this container as root."
}

build()
{
    echo "Building docker image for USER $USER ($UID:$GID) with tag $DOCKER_TAG..."
    log "BUILD_ROOT=$BUILD_ROOT"
    log "UID=$UID"
    log "GID=$GID"
    log "USER=$USER"
    log "DOCKERFILE=$DOCKERFILE"
    log "DOCKER_TARGET=$DOCKER_TARGET"
    log "DOCKER_TAG=$DOCKER_TAG"
    if docker buildx build              \
              --quiet                   \
              -f "$DOCKERFILE"          \
              --target "$DOCKER_TARGET" \
              -t "$DOCKER_TAG"          \
              --build-arg UID="$UID"    \
              --build-arg GID="$GID"    \
              --build-arg USER="$USER"  \
              "$BUILD_ROOT"
    then
        echo "Image built successfully."
    else
        echo "Error building image."
    fi
}

run()
{
    # exit if image does not exist
    if ! docker image inspect "$DOCKER_TAG" > /dev/null 2>&1; then
       echo "ERROR: Image tag $DOCKER_TAG does not exist."
       exit 1
    fi

    # running container as root?
    uid="$UID"
    gid="$GID"
    prompt="$ "
    if [[ -n "$OPT_ROOT" ]]; then uid=0; gid=0; prompt="# "; fi

    log "BIND_ROOT=$BIND_ROOT"
    log "UID=$uid"
    log "GID=$gid"
    log "USER=$USER"
    log "DOCKERFILE=$DOCKERFILE"
    log "DOCKER_TARGET=$DOCKER_TARGET"
    log "DOCKER_TAG=$DOCKER_TAG"
    log "DOCKER_PORT=$DOCKER_PORT"

    local temp=""
    temp=$(mktemp "$BIND_ROOT"/.devcontainerrc.XXXXXX)
    echo "PS1=\"devcontainer:\w${prompt}\"" > "$temp"
    echo "cd $BIND_ROOT" >> "$temp"

    # Remove rcfile a short time after launching container. Wish there
    # was a better way to change the default Debian bash prompt than
    # providing an rcfile, but this is the best I've come up with.
    sleep 3 && rm -f "$temp" &

    echo "Bound port $DOCKER_PORT:$DOCKER_PORT"

    docker run --rm --init -it \
           -p"$DOCKER_PORT:$DOCKER_PORT" \
           -u"$uid:$gid" \
           -v"$BIND_ROOT:$BIND_ROOT" \
           "$DOCKER_TAG" \
           bash --rcfile "$temp"
}

#
# parse: parse command line arguments
#
parse()
{
    while [[ $# -gt 0 ]]; do
        case $1 in
            -b | --bind )
                # build command uses BUILD_ROOT and run command used BIND_ROOT
                BIND_ROOT="$(cd $2 && pwd)"
                BUILD_ROOT="$BIND_ROOT"
                shift
                ;;

            -h | --help )
                usage
                exit 0
                ;;

            -f | --file )
                DOCKERFILE="$2"
                shift
                ;;

            -p | --port )
                DOCKER_PORT="$2"
                shift
                ;;

            --target )
                DOCKER_TARGET="$2"
                shift
                ;;

            --root )
                OPT_ROOT="yes"
                ;;

            -t | --tag )
                DOCKER_TAG="$2"
                shift
                ;;

            -v | --verbose )
                OPT_VERBOSE="yes"
                ;;

            -* )
                echo "Unknown option: $1"
                usage
                exit 1
                ;;

            * )
                # command word
                ;;
        esac
        shift
    done
}

log()
{
    if [[ -n $OPT_VERBOSE ]]; then echo "$1"; fi
}

# parse command line arguments
parse "$@"

while [[ $# -gt 0 ]]; do
    case "$1" in
        "build" )
            build
            exit $?
            ;;

        "run" )
            # check for command 'run <tag>' to override -t --tag option
            if [[ -n "$2" && "$2" != -* ]]; then DOCKER_TAG="$2"; fi
            run
            exit $?
            ;;

        -b | --bind | -f | --file | -p | --port | --target | -t | --tag )
            # skip option with argument
            shift
            ;;

        -* )
            # skip single options
            ;;

        * )
            echo "ERROR: unknown command: $1"
            usage ;;
    esac
    shift
done
