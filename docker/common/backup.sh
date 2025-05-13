#!/usr/bin/env bash

set -euo pipefail

fname=rcloud-data.tar.gz
volume=rcloud_rcloud-data

if [ -e "$fname" ]; then
    echo "$fname exists. Please move it out of the way."
    exit 1
fi

# Shut down and remove containers. Preserves docker volumes.
docker compose down

# Create fresh containers (and volumes if necessary).
docker compose create

# Create tarball of volume mounted at /rcloud-data
docker run --rm --mount "source=$volume,target=/rcloud-data" -v $(pwd):/backup busybox tar cvzf "/backup/$fname" /rcloud-data

# Remove containers
docker compose down
