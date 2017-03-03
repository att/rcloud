#!/bin/bash
sudo su - rcloud -c "ROOT=/data/rcloud /data/rcloud/scripts/build.sh --core"
sudo su - rcloud -c "ROOT=/data/rcloud /data/rcloud/conf/start"
sudo su - rcloud -c "/data/rcloud/docker/ulogd/ulogd /data/rcloud/run/ulog"