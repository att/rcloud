#!/bin/sh

SRC=`pwd`
DST="$SRC/dist"

## list of packages that are to be fetched from RForge instead of CRAN
## - Rserve and FastRWeb are on CRAN by typically as older versions
## - others are not on CRAN
RFORGE_PKG=Rserve,github,unixtools,rediscc,FastRWeb

## distribution list 
dist_files="LICENSE \
NEWS.md \
README.md \
conf \
dcchart.md \
doc \
htdocs \
rcloud.support \
scripts"


if [ "x$1" = "x-h" ]; then
    echo ''
    echo " Usage: $0"
    echo ''
    echo ' Configuration environment variables:'
    echo ' SRC [.]          RCloud source root'
    echo ' DST [$SRC/dist]  distribution destination'
    echo ''
    exit 0
fi

if [ ! -e "$SRC/rcloud.support/DESCRIPTION" ]; then
    echo "ERROR: cannot find $SRC/rcloud.support/DESCRIPTION"
    echo ''
    echo "This script must be run from the RCloud sources root"
    echo "or SRC must be set to such"
    exit 1
fi

if [ -e "$DST" ]; then rm -rf "$DST"; fi
mkdir "$DST"
if [ ! -d "$DST" ]; then echo "ERROR: cannot create $DST"; exit 1; fi
## need abs path
ADST=`cd "$DST"; pwd`
mkdir -p "$DST/pkg.repos/src/contrib"
mkdir "$DST/tmp"

REV=`( cd "$SRC" && git rev-list --abbrev-commit -n 1 HEAD )`
BRANCH=`( cd "$SRC" && git status | sed -n 's:.*On branch ::p' | sed 's:/:-:g' )`

echo '' && echo "=== building rcloud.support ===" && echo ''

(cd "$DST/tmp"; cp -pR "$SRC/rcloud.support" "rcloud.support"; R CMD build rcloud.support)
rcs=`ls "$DST/tmp/rcloud.support_"*.tar.gz 2>/dev/null`
if [ -z "$rcs" ]; then
    echo "ERROR: unable to build rcloud.support package"
    exit 1
fi
mv "$rcs" "$DST/pkg.repos/src/contrib"
echo "tools:::write_PACKAGES('$DST/pkg.repos/src/contrib')" | R --vanilla --slave

echo '' && echo "=== downloading dependencies ===" && echo ''

echo "options(warn=2);cran=available.packages(contrib.url('http://r.research.att.com/',type='source'),type='source');rf=available.packages(contrib.url('http://rforge.net/',type='source'),type='source');local=available.packages(contrib.url('file://$DST/pkg.repos',type='source'),type='source');rf.pkg=strsplit('$RFORGE_PKG',',',T)[[1]];stage1=unique(unlist(tools:::package_dependencies('rcloud.support',local,'all')));print(stage1);stage2=unique(c(stage1,unlist(tools:::package_dependencies(stage1,rbind(cran,rf,local),,TRUE))));rec=rownames(installed.packages(,'high'));stage2=stage2[!(stage2 %in% rec)];print(stage2);download.packages(rf.pkg,'$DST/pkg.repos/src/contrib',,'http://rforge.net',type='source');cran.pkg=stage2[!(stage2 %in% c('rcloud.support',rf.pkg))];download.packages(cran.pkg,'$DST/pkg.repos/src/contrib',,'http://r.research.att.com',type='source');writeLines(stage2,'$DST/pkg.repos/pkg.list')" | R --vanilla --slave

## explicit overrides:
## * evaluate >0.5.1 has a fatal bug concerning plots so we have to fall back to 0.5.1
rm -f "$DST/pkg.repos/src/contrib/"evaluate_*.tar.gz
echo "download.file('http://cran.r-project.org/src/contrib/00Archive/evaluate/evaluate_0.5.1.tar.gz','$DST/pkg.repos/src/contrib/evaluate_0.5.1.tar.gz')" | R --vanilla --slave

echo "tools:::write_PACKAGES('$DST/pkg.repos/src/contrib')" | R --vanilla --slave

if [ ! -e "$DST/pkg.repos/pkg.list" ]; then
    echo "ERROR: download failed"
    exit 1
fi

echo '' && echo "=== copying distributed files ===" && echo ''

mkdir "$DST/rcloud"
for i in $dist_files; do
    cp -pR "$SRC/$i" "$DST/rcloud/$i"
done

echo $BRANCH > "$DST/rcloud/REVISION"
echo $REV >> "$DST/rcloud/REVISION"

## include SKS to simplify deployment
mkdir -p "$DST/rcloud/services"
git clone "https://github.com/s-u/SessionKeyServer.git" "$DST/rcloud/services/SessionKeyServer"
rm -rf "$DST/rcloud/services/SessionKeyServer/.git"

## include SOLR only if requested
if [ -n "$INCLUDE_SOLR" ]; then
## download SOLR - this duplicates conf/solrsetup.sh but makes
## it self-contained in the release
mkdir -p "$DST/rcloud/services/solr"
VER=4.5.1
curl -L "http://archive.apache.org/dist/lucene/solr/$VER/solr-$VER.tgz" | tar fxz - -C "$DST/rcloud/services/"
mv "$DST/rcloud/services/solr-4.5.1" "$DST/rcloud/services/solr"
## setup solr config
cp -R "$DST/rcloud/services/solr/example/solr/collection1/" "$DST/rcloud/services/solr/example/solr/rcloudnotebooks"
mkdir "$DST/rcloud/services/solr/example/solr/rcloudnotebooks/data"
rm "$DST/rcloud/services/solr/example/solr/rcloudnotebooks/core.properties"
cp "$DST/rcloud/conf/solr/schema.xml" "$DST/rcloud/services/solr/example/solr/rcloudnotebooks/conf/"
cp "$DST/rcloud/conf/solr/solrconfig.xml" "$DST/rcloud/services/solr/example/solr/rcloudnotebooks/conf/"
fi

rm -rf "$DST/tmp"

( cd "$DST"; tar fcz rcloud-$BRANCH-$REV.tar.gz rcloud pkg.repos )

echo '' && echo "=== done ===" && echo ''

ls -l "$DST/rcloud-$BRANCH-$REV.tar.gz"
