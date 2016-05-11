#!/bin/bash

## This mostly follows
## https://github.com/att/rcloud/blob/develop/doc/INSTALL.md
## with extra parts noted

## Ubuntu 14.04
apt-get update
apt-get -y install gcc g++ gfortran libcairo-dev libreadline-dev \
        libxt-dev libjpeg-dev libicu-dev libssl-dev libcurl4-openssl-dev \
        subversion git automake make libtool libtiff-dev gettext \
        redis-server rsync

## to install R from the CRAN PPA (Note: stock R in the distro is too old!)
apt-get -y install software-properties
add-apt-repository -y ppa:marutter/rrutter
apt-get update
apt-get -y install r-base-dev

## Install pandoc (EXTRA)
wget -q https://github.com/jgm/pandoc/releases/download/1.13.2/pandoc-1.13.2-1-amd64.deb
apt-get -y -q install gdebi-core
gdebi -n pandoc-1.13.2-1-amd64.deb
rm pandoc-1.13.2-1-amd64.deb

## The rest is run from /data/rcloud
cd /data/rcloud

## install all dependent R packages
sh scripts/bootstrapR.sh
