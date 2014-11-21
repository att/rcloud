#!/bin/sh

if [ x"$1" = 'x-h' ]; then
    echo ''
    echo " Usage: $0 [--mk-dist]"
    echo ''
    echo ' This script must be run from the RCloud root directory and it'
    echo ' installs R packages needed by RCloud in the R installation'
    echo ''
    echo ' Optional environment variables:'
    echo ' RBIN        - location of the R executable [R]'
    echo ' RCREPO      - repository of RCloud packages [<RCloud>/packages]'
    echo ' DISTREP     - distribution repository [<RCloud>/dist-repos]'
    echo ''
    echo ' If DISTREP exists, it will be used to bootstrap R without using'
    echo " remote repositories. If it doesn't exist, packages from RCREPO"
    echo ' are used along with dependencies from remote repositories.'
    echo " If RCREPO doesn't exist, it is created from the source tree."
    echo ''
    echo ' DISTREP can be created using --mk-dist in which case it'
    echo ' is built from sources and remote repositories'
    echo ''
    exit 0
fi

WD=`pwd`

if [ ! -e "$WD/rcloud.support/DESCRIPTION" ]; then
    echo ' ERROR: you must run this script from the RCloud root directory!' 1>&2
    exit 1
fi

: ${RCREPO="$WD/packages"}
: ${DISTREP="$WD/dist-repos"}
: ${RBIN=R}

ok=`echo 'if(R.version$major>=3)cat("OK\n")' | "$RBIN" --slave --vanilla`
if [ "x$ok" != "xOK" ]; then
    echo '' 1>&2
    echo ' ERROR: R is not available in the correct version.' 1>&2
    echo '' 1>&2
    exit 1
fi

export RCS_SILENCE_LOADCHECK=TRUE

mkdist=''
if [ x"$1" = "x--mk-dist" ]; then
    mkdist=yes
fi
if [ -n "$mkdist" -o x"$1" = "x--clean" ]; then
    echo " --- Cleaning existing repositories"
    rm -rf "$DISTREP/src/contrib" "$RCREPO/src/contrib"
fi

if [ ! -e "$DISTREP/src/contrib/PACKAGES" -o -n "$mkdist" ]; then
    ## we need RCREPO populated in any case
    if [ ! -e "$RCREPO/src/contrib/PACKAGES" -o -n "$mkdist" ]; then
        echo " --- Creating RCloud repository $RCREPO"
        echo '' 1>&2
        if ! mkdir -p "$RCREPO/src/contrib"; then
            echo "ERROR: cannot create src/contrib in $RCREPO, please set RCREPO if other location is desired" 1>&2
            exit 1
        fi
        echo " Builds RCloud packages"
        ( cd "$RCREPO/src/contrib"; for src in `ls $WD/rcloud.*/DESCRIPTION $WD/rcloud.packages/*/DESCRIPTION $WD/packages/*/DESCRIPTION 2>/dev/null`; do "$RBIN" CMD build `dirname "$src"`; done )
        echo "tools:::write_PACKAGES('$RCREPO/src/contrib')" | "$RBIN" --vanilla --slave --no-save || exit 1
    fi

    if [ -z "$mkdist" ]; then
        ## regular boostrap from clean sources - install deps
        echo " --- Installing RCloud packages and dependencies in R"
        echo "install.packages(unique(gsub('_.*','',basename(Sys.glob('$RCREPO/src/contrib/*.tar.gz')))),repos=c('file://$RCREPO','http://r.research.att.com','http://rforge.net'),type='source')" | "$RBIN" --vanilla --slave --no-save || exit 1
    else
        ## mkdist
        if ! mkdir -p "$DISTREP/src/contrib"; then
            echo " ERROR: cannot create src/contrib in $DISTREP. please set DISTREP if other location is desired" 1>&2
            exit 1
        fi
        cp -p "$RCREPO/src/contrib/"*.tar.gz "$DISTREP/src/contrib/"
        echo "options(warn=2);pkg<-unique(gsub('_.*','',basename(Sys.glob('$RCREPO/src/contrib/*.tar.gz'))));cran=available.packages(contrib.url(c('http://r.research.att.com/','http://rforge.net'),type='source'),type='source');local=available.packages(contrib.url('file://$RCREPO',type='source'),type='source');stage1=unique(unlist(tools:::package_dependencies(pkg,local,'all')));print(stage1);stage2=unique(c(stage1,unlist(tools:::package_dependencies(stage1,rbind(cran,local),,TRUE))));rec=rownames(installed.packages(,'high'));stage2=stage2[!(stage2 %in% rec)];print(stage2);download.packages(stage2,'$DISTREP/src/contrib',,c('http://rforge.net','http://r.research.att.com','file://$RCREPO'),type='source');tools:::write_PACKAGES('$DISTREP/src/contrib')" | "$RBIN" --vanilla --slave || exit 1
        echo ''
        echo " Distributon packages created in $DISTREP"
        exit 0
    fi

    # Create a local copy of mathjax library in htdocs
    MATHJAX_INSTALL_DIR=mathjax
    if [ ! -e "${WD}/htdocs/$MATHJAX_INSTALL_DIR" ]; then
        mkdir -p "${WD}/htdocs/$MATHJAX_INSTALL_DIR"
        echo 'Downloading MathJax'
        curl -L https://codeload.github.com/mathjax/MathJax/legacy.tar.gz/master | tar -xz -C "${WD}/htdocs/$MATHJAX_INSTALL_DIR" --strip-components=1
    fi
else
    ## Installation from a distribution
    echo 'cat(sprintf("\n Using %s, installing packages...\n", R.version.string)); url="file://'"$DISTREP/"'"; a=rownames(available.packages(paste0(url,"/src/contrib"))); install.packages(a,,url,type="source")' | "$RBIN" --slave --vanilla
fi

ok=`echo 'library(rcloud.support);library(rcloud.client);library(Cairo);library(rjson);cat("OK\n")' | "$RBIN" --slave --vanilla`
if [ "x$ok" != "xOK" ]; then
    echo '' 1>&2
    echo ' ERROR: one or more packages could not be installed.' 1>&2
    echo ' Please check that you have all necessary dependencies installed' 1>&2
    echo '' 1>&2
    exit 1
fi

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
