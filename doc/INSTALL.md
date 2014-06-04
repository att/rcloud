# Setting up RCloud

## Installing from a distribution tar ball

This is a quick-start guide for installing RCloud from a distribution
tar ball. For full instructions using the repository, read from next
section on.

Make sure R 3.1.0 or higher is installed. Download the distribution tar
ball, change to the directory where you want to install it,
e.g. `/data` and run

    $ tar fxz rcloud-1.0.tar.gz
    $ cd rcloud
    $ sh scripts/bootstrapR.sh

It will install the packages included in the release tar ball. Copy
`conf/rcloud.conf.samp` to `conf/rcloud.conf` and edit it to match
your GitHub setup. Then start RCloud via

    $ sh scripts/fresh_start.sh

The same script can be used to re-start RCloud later.


## Installing RCloud from GitHub

### Checking out the code

You will need to do

    $ git clone https://github.com/att/rcloud.git

to get RCloud

### Upgrading to RCloud 1.0

If you are moving from RCloud 0.9 to 1.0, you'll need to run the upgrade script to move your
RCS data (notebook lists and configuration data).  In your RCloud root, run:

    $ ROOT=`pwd` R -f scripts/upgradeRCS1_0.R

This script is designed to run incrementally, so you can run both RCloud 0.9 and RCloud 1.0
on the same RCS back-end, and run this script repeatedly to keep updating the 1.0 installation
from the 0.9 installation.

## Installation requirements

Please use R 3.0.0 or later. Search functionality requires R 3.1.0 or later.

You will need several headers and libraries to compile dependent
R packages (as well as R) -- on Debian/Ubuntu, you can use

    $ sudo apt-get install libxt-dev libcurl4-openssl-dev libcairo2-dev libreadline-dev git

to install the dependencies.
If you are using other Linux systems, the names may vary.
On Mac OS X all packages should be available in binary form so no dependencies should be needed
(other than Xcode Command Line tools).

### Packages

RCloud provides the `rcloud.support` package which contains supporting
code but also automated installation.  In R type:

    install.packages("rcloud.support", repos=c("http://RForge.net",
                     "http://R.research.att.com"), type="source")

From there on you can safely use the `rcloud.support` package in RCloud
sources, but the above makes the bootstraping of dependencies
easier. All remaining dependencies will be installed during the first
start of RCloud. You can also install them by hand by running

     rcloud.support:::check.installation()

Add `force.all=TRUE` argument to reinstall all packages - always try
that when you encounter issues. It is useful for keeping up with the
development on the `develop` branch as we don't always bump the
versions.

### Github authentication

RCloud uses [gists](http://gist.github.com) for storage and Github
accounts for authentication.

You'll need to create a
[github application](https://github.com/settings/applications). This
github application will need to point to the location you will deploy
RCloud (let's assume you're only testing it for now, so 127.0.0.1
works). In that case, your application's URL will most likely be
`http://127.0.0.1:8080`, and your Callback URL *must* be
`http://127.0.0.1:8080/login_successful.R`. (the host and port need
to match the application URL, and the path must be `login_successful.R`).

Then, you need to create a file under your configuration root
(typically that's `/conf`) called `rcloud.conf` (see `rcloud.conf.samp`
in the distribution of an example starting point and
[the rcloud.conf WiKi page for full details](https://github.com/cscheid/rcloud/wiki/rcloud.conf)).
If you're using github.com, then your file will look like this:

    github.client.id: your.20.character.client.id
    github.client.secret: your.40.character.client.secret
    github.base.url: https://github.com/
    github.api.url: https://api.github.com/
    github.gist.url: https://gist.github.com/

The last three lines are the base URL of the github website,
the entry point for the github API and the entry point for gists.

#### Enterprise Github deployment

If you have an enterprise github deployment where the gists URL
ends with `/gist` instead of beginning with `gist.`, you
may need to omit `github.gist.url`.

If you'd like to control which Github users are allowed to log in to
your RCloud deployment, you can add a whitelist to your configuration:

    github.user.whitelist: user1,user2,user3,etc

#### hostnames

If your computer doesn't resolve its hostname to what you will be using,
(let's say `127.0.0.1`) you may also want to add:

    host: 127.0.0.1

Then go to `http://127.0.0.1:8080/login.html`, click login, and authorize
access to your account through github.

### Will you be hacking on the code? Read on

If you're just running RCloud, skip this session. If you're going to
be hacking the code, you'll need to install a recent version of
[node.js](http://nodejs.org). Then, in your shell:

    $ cd rcloud/htdocs/js
	$ npm install

This will install the node.js dependencies necessary to create the
minified javascript files used in Rcloud.

### Starting rcloud

The safest way to install rcloud currently is to simply run the
`scripts/fresh_start.sh` script. This will reinstall the
`rcloud.support` package, recompile the javascript files (if you have
node.js and the necessary dependencies installed), kill any old
instances of RCloud running, deauthorize all login tokens (only if
SessionServer is not used), and start a new version of RCloud.

### Pitfalls

If you have trouble with authentication, make sure your hostname is
FQDN (fully qualified domain name) and it matches your external name.
You can use `hostname -f` to check that. The reason is that the cookie
domain defaults to the hostname if not otherwise specified. If either
of the above is not true, then create `conf/rcloud.conf` file with

    Cookie.Domain: myserver.mydomain

Alternatively, you can set `Host:` instead with the same effect
(Host is used in other places not just the cookie domain).

Also if things are failing, try to run

    rcloud.support:::check.installation(force.all=TRUE)

which will re-fetch and install all packages.

### Optional functionality

#### Redis

It is strongly recommended to use Redis as the back-end for key/value
storage in RCloud. Install Redis server (in Debian/Ubuntu
`sudo apt-get install redis-server`) and add `rcs.engine: redis` to
the `rcloud.conf` configuration file.

Note: the default up until RCloud 1.0 is file-based RCS back-end which
is limited and deprecated and thus the default may become Redis in
future releases.

#### Search

RCloud 1.0 uses Apache Solr to index gists and provide search
functionality if desired. See `conf/solr/README.md` for
details. Quick start: install Java JDK (Debian/Ubuntu
`sudo apt-get install openjdk-7-jdk`) and run

    cd $ROOT/conf/solr
    sh solrsetup.sh $ROOT/services/solr

assuming `$ROOT` is set to your RCloud root directory. It will
download Solr, setup the configuration, start Solr and create a
collection used by RCloud. Then add

    solr.url: http://127.0.0.1:8983/solr/rcloudnotebooks

to `rcloud.conf`.


#### SessionKeyServer

For enhanced security RCloud can be configured to use a session key
server instead of flat files. To install the reference server (it
requires Java so e.g. `sudo apt-get install openjdk-7-jdk`), use

    cd $ROOT
    mkdir services
    cd services
    git clone https://github.com/s-u/SessionKeyServer.git
    cd SessionKeyServer
    make
    sh run &

Then add `Session.server: http://127.0.0.1:4301` to `rcloud.conf`.

#### PAM authentication

This is the most advanced setup so use only if you know how this
works. If you want to use user switching and PAM authentication, you
can compile PAM support in the session server - make sure you have
setup the session server (see above) and PAM is available
(e.g. `sudo apt-get install libpam-dev` on Ubuntu/Debian), then

    cd $ROOT/services/SessionKeyServer
    make pam

You may need to edit the `Makefile` if you're not on Ubuntu/Debian
since it assumes `java-7-openjdk-amd64`to find the Java
components. Common configuration in that case:

    Exec.auth: pam
    Exec.match.user: login
    Exec.anon.user: nobody
    HTTP.user: www-data

This setup allows RCloud to switch the execution environment according
to the user than has authenticated. For this to work, RCloud must be
started as root, e.g., `sudo conf/start`. Again, use only if you know
what you're doing since misconfiguring RCloud run as root can have
grave security implications.
