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

VER=5.5.1
#curl -L -O http://archive.apache.org/dist/lucene/solr/$VER/solr-$VER.tgz
## Apache servers are *extremely* slow (<3Mbit!), so use our server instead
curl -L -O http://r.research.att.com/solr/solr-$VER.tgz

tar fxz solr-$VER.tgz
if [ ! -e "solr-$VER" ]; then
    echo "ERROR: failed to extract solr-$VER"
    exit 1
fi
ln -s solr-$VER solr
cp -R solr/example/solr/collection1/ solr/example/solr/rcloudnotebooks 
mkdir solr/example/solr/rcloudnotebooks/data 
rm solr/example/solr/rcloudnotebooks/core.properties 
cp "$WD/schema.xml" solr/example/solr/rcloudnotebooks/conf/
cp "$WD/solrconfig.xml" solr/example/solr/rcloudnotebooks/conf/
cp "$WD/word-delim-types.txt" solr/example/solr/rcloudnotebooks/conf/
cd solr/example/

# Start apache Solr on default port
echo "starting Apache Solr or default port - 8983 ... "  
nohup java -jar start.jar > solr.out 2>&1 & 
# wait for Solr to boot up 
sleep 14

# Create a collection for the RCloud Notebooks 
INSTANCEDIR="$DEST/solr/example/solr/rcloudnotebooks"
DATADIR="${INSTANCEDIR}/data" 
QUERY="http://localhost:8983/solr/admin/cores?action=CREATE&name=rcloudnotebooks&instanceDir=$INSTANCEDIR&config=solrconfig.xml&schema=schema.xml&dataDir=$DATADIR"
curl "$QUERY"

#RCloud Conf
HOST=`hostname -f`
echo "#############################################################\n"
echo "add the below line to the rcloud conf\n"
echo "#------------------------------------------------------------\n"
echo "solr.url: http://$HOST:8983/solr/rcloudnotebooks\n"
echo "#------------------------------------------------------------\n"
