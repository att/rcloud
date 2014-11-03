#!/bin/sh

WD=`pwd`
if [ ! -e "$WD/R-Package-Repository/src/contrib/PACKAGES" ]; then
    echo '' 2>&1
    if [ -e "$WD/rcloud.support/DESCRIPTION" ]; then
	mkdir -p "$WD/packages/src/contrib" 2>/dev/null
	echo " -- building RCloud packages repository"
	( cd "$WD/packages/src/contrib"; for src in `ls $WD/rcloud.*/DESCRIPTION $WD/rcloud.packages/*/DESCRIPTION $WD/packages/*/DESCRIPTION 2>/dev/null`; do R CMD build `dirname "$src"`; done )
	echo "tools:::write_PACKAGES('$WD/packages/src/contrib'); install.packages(unique(gsub('_.*','',basename(Sys.glob('$WD/packages/src/contrib/*.tar.gz')))),repos=c('file://$WD/packages','http://r.research.att.com','http://rforge.net'),type='source')" | R --vanilla --slave --no-save
	exit 0
    else
	echo ' ERROR: you must run this script from the RCloud root directory!' 2>&1
    fi
    echo '' 2>&1
    exit 1
fi

ok=`echo 'if(R.version$major>=3)cat("OK\n")' | R --slave --vanilla`
if [ "x$ok" != "xOK" ]; then
    echo '' 2>&1
    echo ' ERROR: R is not available in the correct version.' 2>&1
    echo '' 2>&1
    exit 1
fi

export RCS_SILENCE_LOADCHECK=TRUE
echo 'cat(sprintf("\n Using %s, installing packages...\n", R.version.string)); url="file://'"$WD"'/R-Package-Repository/"; a=rownames(available.packages(paste0(url,"/src/contrib"))); install.packages(a,,url,type="source")' | R --slave --vanilla

ok=`echo 'library(rcloud.support);library(rcloud.client);library(Cairo);library(rjson);cat("OK\n")' | R --slave --vanilla`
if [ "x$ok" != "xOK" ]; then
    echo '' 2>&1
    echo ' ERROR: one or more packages could not be installed.' 2>&1
    echo ' Please check that you have all necessary dependencies installed' 2>&1
    echo '' 2>&1
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
