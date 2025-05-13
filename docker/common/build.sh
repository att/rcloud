#!/usr/bin/env bash

#
# Initialises Dockerfile ARG RCLOUD_APT_INSTALL for additional system
# packages to install in runtime images.
#
docker compose build --build-arg RCLOUD_APT_INSTALL="$(cat apt-install.txt)"
