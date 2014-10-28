#!/bin/sh

SRC=`pwd`
DST="$SRC/dist"

## list of packages that are to be fetched from RForge instead of CRAN
## - Rserve and FastRWeb are on CRAN by typically as older versions
## - others are not on CRAN
RFORGE_PKG=Rserve,github,unixtools,rediscc,FastRWeb,guitar

## distribution list 
dist_files="conf \
doc \
htdocs \
rcloud.client \
rcloud.packages \
rcloud.support \
packages \
scripts \
INSTALL \
LICENSE \
NEWS.md \
README.md \
VERSION"


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


if [ ! -e "$DST/tmp" ]; then
    rm -rf "$DST/tmp"
fi

## need abs path
ADST=`cd "$DST"; pwd`
mkdir -p "$DST/R-Package-Repository/src/contrib"
mkdir "$DST/tmp"

REV=`( cd "$SRC" && git rev-list --abbrev-commit -n 1 HEAD )`
BRANCH=`( cd "$SRC" && git status | sed -n 's:.*On branch ::p' | sed 's:/:-:g' )`

echo '' && echo "=== building rcloud.support ===" && echo ''

(cd "$DST/tmp"; cp -pR "$SRC/rcloud.support" "$DST/tmp/rcloud.support"; R CMD build rcloud.support)
(cd "$DST/tmp"; cp -pR "$SRC/rcloud.client" "$DST/tmp/rcloud.client"; R CMD build rcloud.client)

# build internal packages (not in git) but in rcloud.packages and packages
for dir in "$SRC/rcloud.packages" "$SRC/packages"; do
        echo $dir
        for pkg in `ls -d $dir/*/`; do
            cp -pR "$pkg" "$DST/tmp/"
            cd "$DST/tmp"
            R CMD build "$pkg"
            mv `sed -n 's/Package: *//p' $pkg/DESCRIPTION`_`sed -n 's/Version: *//p' $pkg/DESCRIPTION`.tar.gz "$DST/R-Package-Repository/src/contrib"
        done
    done

rcs=`ls "$DST/tmp/rcloud.support_"*.tar.gz 2>/dev/null`
rcc=`ls "$DST/tmp/rcloud.client_"*.tar.gz 2>/dev/null`

if [ -z "$rcs" ]; then
    echo "ERROR: unable to build rcloud.support package"
    exit 1
fi
if [ -z "$rcc" ]; then
    echo "ERROR: unable to build rcloud.client package"
    exit 1
fi

mv "$rcs" "$DST/R-Package-Repository/src/contrib"
mv "$rcc" "$DST/R-Package-Repository/src/contrib"

echo "tools:::write_PACKAGES('$DST/R-Package-Repository/src/contrib')" | R --vanilla --slave

echo '' && echo "=== downloading dependencies ===" && echo ''

echo "options(warn=2);cran=available.packages(contrib.url('http://r.research.att.com/',type='source'),type='source');rf=available.packages(contrib.url('http://rforge.net/',type='source'),type='source');local=available.packages(contrib.url('file://$DST/R-Package-Repository',type='source'),type='source');rf.pkg=strsplit('$RFORGE_PKG',',',T)[[1]];stage1=unique(unlist(tools:::package_dependencies('rcloud.support',local)));print(stage1);stage2=unique(c(stage1,unlist(tools:::package_dependencies(stage1,rbind(cran,rf,local),,TRUE))));rec=rownames(installed.packages(,'high'));stage2=stage2[!(stage2 %in% rec)];print(stage2);download.packages(rf.pkg,'$DST/R-Package-Repository/src/contrib',,'http://rforge.net',type='source');cran.pkg=stage2[!(stage2 %in% c('rcloud.support',rf.pkg))];download.packages(cran.pkg,'$DST/R-Package-Repository/src/contrib',,'http://r.research.att.com',type='source');writeLines(stage2,'$DST/R-Package-Repository/pkg.list')" | R --vanilla --slave

## explicit overrides:
## * evaluate >0.5.1 has a fatal bug concerning plots so we have to fall back to 0.5.1
#rm -f "$DST/R-Package-Repository/src/contrib/"evaluate_*.tar.gz
#echo "download.file('http://cran.r-project.org/src/contrib/00Archive/evaluate/evaluate_0.5.1.tar.gz','$DST/R-Package-Repository/src/contrib/evaluate_0.5.1.tar.gz')" | R --vanilla --slave

## Removing gitgist and guitar only because guitar has dependency on libgit2 and boost. Boost is tricky to get
## Will have to discuss the best way to fix this later in the next 1.3 release
rm -rf "$DST/R-Package-Repository/src/contrib/"gitgist*.tar.gz
rm -rf "$DST/R-Package-Repository/src/contrib/"guitar*.tar.gz
echo "tools:::write_PACKAGES('$DST/R-Package-Repository/src/contrib')" | R --vanilla --slave

if [ ! -e "$DST/R-Package-Repository/pkg.list" ]; then
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

## Pull mathjax to htdocs
MATHJAX_INSTALL_DIR=mathjax
if [ ! -e "$DST/rcloud/htdocs/mathjax" ]; then
    mkdir -p "$DST/rcloud/htdocs/mathjax"
    echo 'Downloading MathJax'
    curl -L https://codeload.github.com/mathjax/MathJax/legacy.tar.gz/master | tar -xz -C "$DST/rcloud/htdocs/mathjax" --strip-components=1
fi

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

( cd "$DST"; mv R-Package-Repository rcloud; tar fcz rcloud-$BRANCH-$REV.tar.gz rcloud )

echo '' && echo "=== done ===" && echo ''

ls -l "$DST/rcloud-$BRANCH-$REV.tar.gz"


