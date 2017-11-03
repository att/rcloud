#!/bin/bash 

# Quick and easy way to setup Apache Solr for RCloud Search

DEST="$1"

if [ -z "$DEST" ]; then
    echo ""
    echo "ERROR: please specify destination directory"
    echo ""
    echo " Usage: $0 <destination>"
    echo ""
    exit 1
fi

if [ ! -e schema.xml ]; then
    echo ""
    echo "ERROR: this script must be run from the conf/solr directory"
    echo ""
    exit 1
fi

if [ ! -e "$DEST" ]; then
    mkdir -p "$DEST"
fi

WD="`pwd`"

echo " Installing in $DEST"
cd "$DEST"
# get the absolute path
DEST="`pwd`"

VER=7.1.0
curl -L  http://archive.apache.org/dist/lucene/solr/$VER/solr-$VER.tgz | tar xz
## Apache servers are *extremely* slow (<3Mbit!), so use our server instead
# curl -L -O http://r.research.att.com/solr/solr-$VER.tgz

if [ ! -e "solr-$VER" ]; then
    echo "ERROR: failed to extract solr-$VER"
    exit 1
fi
ln -s -f solr-$VER solr


# Start apache Solr on default port
echo "starting Apache Solr or default port - 8983 ... "
"$DEST"/solr/bin/solr start

SOLR_DEST="$DEST/solrdata"
INSTANCEDIR="$SOLR_DEST/solr/rcloudnotebooks"
DATADIR="${INSTANCEDIR}/data"
CONFDIR="${INSTANCEDIR}/conf"

#cp -R solr/example/solr/collection1/ solr/example/solr/rcloudnotebooks
mkdir -p $DATADIR
mkdir -p $CONFDIR
#rm solr/example/solr/rcloudnotebooks/core.properties
cp "$WD/schema.xml" ${CONFDIR}/
cp "$WD/solrconfig.xml" ${CONFDIR}/
cp "$WD/word-delim-types.txt" ${CONFDIR}/
cp "$WD/code-delim-types.txt" ${CONFDIR}/
cp  "$WD/synonyms.txt" ${CONFDIR}/
cp  "$WD/elevate.xml" ${CONFDIR}/
cp  "$WD/stopwords.txt" ${CONFDIR}/
cp -r "$WD/lang" ${CONFDIR}/
# Create a collection for the RCloud Notebooks

 
QUERY="http://localhost:8983/solr/admin/cores?action=CREATE&name=rcloudnotebooks&instanceDir=$INSTANCEDIR&config=solrconfig.xml&schema=schema.xml&dataDir=$DATADIR"
curl "$QUERY"

#RCloud Conf
HOST=`hostname -f`
echo "#############################################################\n"
echo "add the below line to the rcloud conf\n"
echo "#------------------------------------------------------------\n"
echo "solr.url: http://$HOST:8983/solr/rcloudnotebooks\n"
echo "#------------------------------------------------------------\n"
