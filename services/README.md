## RCloud services

This directory is typically used by optional services supporting RCloud.

### SOLR

SOLR is needed to support the full-text search in RCloud. If you
installed RCloud from a distribution tar ball then SOLR will already
be installed in this directory.

If you install from sources or git repository then you will need to
install SOLR. Assuming you have checked out RCloud in `/data/rcloud`
then you would run

    cd /data/rcloud/conf/solr
    sh solrsetup.sh /data/rcloud/services

It will also start a SOLR instance. You can also start it later using
`/data/rcloud/services/rcloud-solr`. See below for automated ways to
start RCloud services on startup.


### SessionKeyServer

If you use RCloud in a multi-user envornment, we strongly suggest
using the SessionKeyServer. Again, assuming `/data/rcloud` as the
RCloud home, you would run

    cd /data/rcloud/services
    git clone https://github.com/s-u/SessionKeyServer.git
    cd SessionKeyServer
    make

To start the server, run `/data/rcloud/services/rcloud-sks`.

If you run RCloud from a different directory, you can use the ROOT
environment variable to point to it. For example, you can switch to
the root directory and run

    ROOT=`pwd` services/rcloud-sks &


### Automatic startup

The RCloud sources include `init.d` scripts for Ubuntu in
`services/ubuntu/init.d`. You can copy those in `/etc/init.d` and
create the corresponding symlinks in `/etc/rc?.d` -- the easiest way
is probably to use (as root):

    update-rc.d rcloud-sks defaults
    update-rc.d rcloud-solr defaults


### Security considerations

Although it is usual to run each service as its own user, both SOLR
and the SessionKeyServer can be run as the same user, but that user
should be distinct from your RCloud users. In particular the
SessionKeyServer should be run such that no regular user has read
permissions, since it will store authentication tokens in its
database.
