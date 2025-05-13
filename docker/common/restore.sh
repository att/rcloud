#!/usr/bin/env bash

set -eo pipefail

fname=rcloud-data.tar.gz
volume=rcloud_rcloud-data

if [ ! -e "$fname" ]; then
    echo "$fname not found. Exiting."
    exit 1
fi

nodryrun=''
if [ x"$1" = "x--no-dry-run" ]; then
    nodryrun=yes
fi

if [ -z "$nodryrun" ]; then
    echo
    echo "WARNING: this operation removes all data in the /rcloud-data volume."
    echo "Pass --no-dry-run to perform the restore."
    echo
    echo "Listing all existing Docker volumes..."
    echo
    docker volume ls
    echo
    echo "Restore NOT PERFORMED. Exiting."
    exit 1
fi


# Shut down and remove containers.
docker compose down

# Create fresh containers (and volumes if necessary).
docker compose create

# Unpack tarball into volume mounted at /rcloud-data
if [ -n "$nodryrun" ]; then
    docker run --rm --mount "source=$volume,target=/rcloud-data" -v $(pwd):/backup busybox sh -c "cd /rcloud-data && rm -rf * && tar xvf /backup/$fname --strip 1"
fi

# Remove containers
docker compose down
