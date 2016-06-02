#! /bin/bash

cd /data/rcloud

## In case it is already running
sh scripts/shutdown.sh
killall Rserve

## Write the current GitHub app id and secret into the
## rcloud config.

# Copy the config file from your host
cp vagrant/rcloud.conf.vagrant conf/rcloud.conf

if [[ -z "$GITHUB_CLIENT_ID" ]]; then
    echo GITHUB_CLIENT_ID environment variable must be set
    exit 1
fi

if [[ -z "$GITHUB_CLIENT_SECRET" ]]; then
    echo GITHUB_CLIENT_SECRET environment variable must be set
    exit 2
fi

sed -i bak \
    -e 's/^github.client.id: .*$/github.client.id: '$GITHUB_CLIENT_ID'/' \
    -e 's/^github.client.secret: .*$/github.client.secret: '$GITHUB_CLIENT_SECRET'/' \
    /data/rcloud/conf/rcloud.conf

# Bring RCloud up
sh scripts/fresh_start.sh
