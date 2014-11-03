#!/bin/bash
 
function checkRVersion {
     ok=`echo 'if(R.version$major>=3)cat("OK\n")' | R --slave --vanilla`
    if [ "x$ok" != "xOK" ]; then
        echo '' 2>&1
        echo ' ERROR: R is not available in the correct version.' 2>&1
        echo '' 2>&1
        exit 1
    fi
}

#-------------------------------Check if Script is called from the RCloud base directory-------------------#
function checkWD {
    if [ ! -e rcloud.support/DESCRIPTION ]; then
        echo '' 2>&1
        echo ' ERROR: cannot find rcloud.support. Please make sure you are' 2>&1
        echo '        running this script from the RCloud root directory!' 2>&1
        echo '' 2>&1
        exit 1
    else
        WD=`pwd`
    fi
}

#-------------------------------Build From An Extracted R Cloud Distribution Tarball-----------------------#
#-------Usage buildFromPkgRepos <directory containing pkg.repos>-------------------------------------------#
#-------Example buildFromPkgRepos /data/pkg.repos----------------------------------------------------------#
function buildFromPackages {
     WD=checkWD
     ok = checkRVersion
    if [ "x$ok" == "xOK" ]; then
        export RCS_SILENCE_LOADCHECK=TRUE
        echo "install.packages(unique(gsub('_.*','',basename(Sys.glob('$WD/packages/src/contrib/*.tar.gz')))),repos=c('file://$WD/packages','http://r.research.att.com','http://rforge.net'),type='source')" | R --vanilla --slave --no-save
    fi
}

function verifyInstallation {
     verify = `echo 'library(rcloud.support);
    library(rcloud.client);library(Cairo);library(rjson);cat("OK\n")' | R --slave --vanilla`
    if [ "$verify" != "OK" ]; then
        echo '' 2>&1
        echo ' ERROR: one or more packages could not be installed.' 2>&1
        echo ' Please check that you have all necessary dependencies installed' 2>&1
        echo '' 2>&1
        exit 1
    else
        displaySuccessMessage
    fi
}
    
function bootstrapFromCRANRForge {
    WD = checkWD
    if [ ! -e rcloud.support/DESCRIPTION ]; then
        mkdir -p "$WD/packages/src/contrib" 2>/dev/null
    fi
    echo " -- building RCloud packages repository" 2>&1
    ( cd "$WD/packages/src/contrib"; for src in `ls $WD/rcloud.*/DESCRIPTION $WD/rcloud.packages/*/DESCRIPTION $WD/packages/*/DESCRIPTION 2>/dev/null`; do R CMD build `dirname "$src"`; done )
    echo "tools:::write_PACKAGES('$WD/packages/src/contrib');" | R --vanilla --slave --no-save
}

function displaySuccessMessage {
    echo ''
    echo '============================================================================'
    echo ''
    echo ' IMPORTANT: please edit conf/rcloud.conf to setup your GitHub application'
    echo ' (see instructions on https://github.com/att/rcloud for the procedure)'
    echo ''
    echo ' After doing so, you can then use conf/start to start up the RCloud server'
    echo ''
    echo ' NOTE: If you use force or upgrade in check.installation() it will upgrade'
    echo '       to the latest development version of RCloud which may or may not be'
    echo '       what you want. Re-run this script if you get into trouble and want'
    echo '       back to the released version.'
    echo ''
}

function computeDependency {
    checkRVersion
    checkWD
    bootstrapFromCRANRForge
}

function installDependency {
    checkRVersion
    checkWD
    if [ ! -e packages/src/contrib ]; then
        bootstrapFromCRANRForge
        buildFromPackages
        verifyInstallation
    else
        buildFromPackages
        verifyInstallation
    fi

}

function mkDistributionTarBall {
     WD = checkWD
    # Calling bootstrapFromCRANRForge without the 'install' flag
    computeDependency
    dist_files="conf \
    doc \
    htdocs \
    rcloud.client \
    rcloud.packages \
    rcloud.support \
    packages \
    scripts \
    services \
    INSTALL \
    LICENSE \
    NEWS.md \
    README.md \
    VERSION"

    REV=`( cd "$WD" && git rev-list --abbrev-commit -n 1 HEAD )`
    BRANCH=`( cd "$WD" && git status | sed -n 's:.*On branch ::p' | sed 's:/:-:g' )`

    MATHJAX_INSTALL_DIR=mathjax
    if [ ! -e "$WD/rcloud/htdocs/mathjax" ]; then
        mkdir -p "$WDrcloud/htdocs/mathjax"
        echo 'Downloading MathJax'
        curl -L https://codeload.github.com/mathjax/MathJax/legacy.tar.gz/master | tar -xz -C "$WD/htdocs/mathjax" --strip-components=1
    fi

    ## include SKS to simplify deployment
    git clone "https://github.com/s-u/SessionKeyServer.git" "$WD/services/SessionKeyServer"
    rm -rf "$WD/services/SessionKeyServer/.git"

    ## include SOLR only if requested
    if [ -n "$INCLUDE_SOLR" ]; then
    ## download SOLR - this duplicates conf/solrsetup.sh but makes
    ## it self-contained in the release
    mkdir -p "$WD/services/solr"
    VER=4.5.1
    curl -L "http://archive.apache.org/dist/lucene/solr/$VER/solr-$VER.tgz" | tar fxz - -C "$WD/services/"
    mv "$WD/services/solr-4.5.1" "$DST/rcloud/services/solr"
    ## setup solr config
    cp -R "$WD/services/solr/example/solr/collection1/" "$WD/services/solr/example/solr/rcloudnotebooks"
    mkdir "$WD/services/solr/example/solr/rcloudnotebooks/data"
    rm "$WD/services/solr/example/solr/rcloudnotebooks/core.properties"
    cp "$WD/conf/solr/schema.xml" "$WD/services/solr/example/solr/rcloudnotebooks/conf/"
    cp "$WD/conf/solr/solrconfig.xml" "$WD/services/solr/example/solr/rcloudnotebooks/conf/"
    fi

    ( tar fcz rcloud-$BRANCH-$REV.tar.gz rcloud )

    echo "=== done ===" && echo ''

    ls -l "$WD/rcloud-$BRANCH-$REV.tar.gz"

}


function helpScreen {
    echo "---------RCloud Bootstrap Utility----------------"
    echo $"Usage: $0 {mkdist|bootstrap}"
    echo "mkdist    - Create Distribution Tar Ball Packing all dependencies"
    echo "bootstrap - Resolve R Package dependencies for RCloud"
}
#-------------------------------------Workflow ---------------------------------------------#

WD=`pwd`
case "$1" in
    mkdist )
        mkDistributionTarBall;;
    bootstrap )
        installDependency;;
    *)

    helpScreen;;
esac



