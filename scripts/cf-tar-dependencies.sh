#!/bin/bash

set -ex

DIR="$( cd "$( dirname $0 )" && pwd )"
BUILD_DIR=$DIR

if [ "$DIR" != "/app" ]
then
    echo "Must be in the /app directory"
    exit 1
fi

if [[ `lsb_release -a` != *lucid* ]]
then
    echo "Must be run in same env as the Cloud Foundry Warden Container which is Ubuntu Lucid"
    exit 1
fi

function install_from_source() {
    echo -e "\n\nInstalling $1\n\n"

    source=$1
    shift
    source_dir=$BUILD_DIR/source/$source
    vendor_dir=$BUILD_DIR/vendor/$source

    mkdir -p $source_dir
    mkdir -p $vendor_dir
    cd $source_dir
    apt-get source $source
    cd `ls -d */`

    if [ -e "freetype-2.3.11.tar.bz2" ]
    then
        tar -xf freetype-2.3.11.tar.bz2
        cd freetype-2.3.11
    fi

    if [[ -e "autogen.sh" && "$source" != "libcairo2-dev" ]]
    then
        chmod +x autogen.sh
        ./autogen.sh --prefix=${vendor_dir} "$@"
    fi

    ./configure --prefix=${vendor_dir} "$@"
    make
    make install
    export PKG_CONFIG_PATH=$PKG_CONFIG_PATH:$vendor_dir/lib/pkgconfig/
}

#########################################
echo -e "\n\nInstalling Make dependencies\n\n"

apt-get install -y build-essential xutils-dev autoconf libtool gperf xsltproc

#########################################
echo -e "\n\nInstalling lib boost headers\n\n"

(
    source_dir=$BUILD_DIR/source/boost_1_57_0
    vendor_dir=$BUILD_DIR/vendor

    mkdir -p $source_dir
    mkdir -p $vendor_dir
    cd $source_dir
    wget http://sourceforge.net/projects/boost/files/boost/1.57.0/boost_1_57_0.tar.gz/download -O boost_1_57_0.tar.gz
    tar -xf boost_1_57_0.tar.gz -C /app/vendor/ boost_1_57_0/boost
)

#########################################
echo -e "\n\nInstalling libs from source\n\n"

install_from_source x11proto-core-dev
install_from_source libpthread-stubs0-dev
install_from_source libxau-dev
install_from_source xcb-proto
install_from_source libxcb1-dev # Cairo on Lucid had a warning that XCB was still experimental
install_from_source libxcb-render0-dev
install_from_source libxcb-render-util0-dev

install_from_source libpng12-dev
export png_REQUIRES=libpng
export LIBPNG_CFLAGS="$(pkg-config --cflags libpng)"
export LIBPNG_LDFLAGS="$(pkg-config --libs libpng)"

install_from_source libfreetype6-dev
install_from_source libfontconfig1-dev --enable-libxml2
install_from_source libpixman-1-dev
install_from_source libcairo2-dev --enable-xlib=no --enable-xcb

#########################################
echo -e "\n\nTar-ing the libs\n\n"

cd $BUILD_DIR
tar czf cf-ubuntu-lucid-deps.tar.gz vendor/*
