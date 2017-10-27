## RCloud search

RCloud can optionally index all notebooks and provide a search
capability. It currently requires Apache Solr.

The script `solrsetup.sh` can be used to help with the setup
of a Solr instance. Example use:

    sh solrsetup.sh /data/rcloud/services/solr

Remove any previous solr simlink in the directory first!

It will fetch and install Solr and configure it to contain the
schema suitable for RCloud use. It is enabled in rcloud by using
the `solr.url` directive that points to the Solr API - see the
output of the above script.

This also requires the extension package [rcloud.solr](https://github.com/att/rcloud.solr) to be installed.
