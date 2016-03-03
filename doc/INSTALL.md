# Setting up RCloud

## Prerequisites

RCloud requires R 3.1.0 or higher and several R packages. If you want to compile R and all necessary packages from sources these are the necessary dependencies:

    ## Ubuntu 14.04
    sudo apt-get install gcc g++ gfortran libcairo-dev libreadline-dev libxt-dev libjpeg-dev \
    libicu-dev libssl-dev libcurl4-openssl-dev subversion git automake make libtool \
    libtiff-dev gettext redis-server rsync

    ## to install R from the CRAN PPA (Note: stock R in the distro is too old!)
    sudo add-apt-repository ppa:marutter/rrutter
    sudo apt-get update
    sudo apt-get install r-base-dev

    ## RedHat/CentOS 6+
    yum install gcc-gfortran gcc-c++ cairo-devel readline-devel libXt-devel libjpeg-devel \
    libicu-devel boost-devel openssl-devel libcurl-devel subversion git automake redis

If you have already R installed you may need only a subset of the above.

## Installing from GitHub

Check out the RCloud repository to a place that will be your RCloud root directory. For illustration purposes we will use `/data/rcloud` as the root, but it can be any other directory.

    cd /data

    ## check out RCloud from GitHub
    git clone https://github.com/att/rcloud.git
    cd rcloud

    ## install all dependent R packages
    sh scripts/bootstrapR.sh

Now is the time to edit the configuration

    ## copy configuration template and edit it
    cp conf/rcloud.conf.samp conf/rcloud.conf
    vi conf/rcloud.conf

You probably want to set the `Host:` configuration option and Github authentication - see the next section for details. Once you have done that, you can start RCloud

    sh scripts/fresh_start.sh

You can use the above also for re-starts. If you didn't touch any code and want to restart, you can add `--no-build` for a quick re-start without re-building any packages.

Once it is running, you can go to `http://your-host:8080/login.R` to login to your RCloud instance. We don't supply `index.html` as part of the sources so you can customize the user experience on your own.


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
[the rcloud.conf WiKi page for full details](https://github.com/att/rcloud/wiki/rcloud.conf)).
If you're using github.com, then your file will look like this:

    github.client.id: your.20.character.client.id
    github.client.secret: your.40.character.client.secret
    github.base.url: https://github.com/
    github.api.url: https://api.github.com/
    github.gist.url: https://gist.github.com/

The last three lines are the base URL of the github website,
the entry point for the github API and the entry point for gists.

### Enterprise Github deployment

If you have an enterprise github deployment where the gists URL
ends with `/gist` instead of beginning with `gist.`, you
may need to omit `github.gist.url`.

If you'd like to control which Github users are allowed to log in to
your RCloud deployment, you can add a whitelist to your configuration:

    github.user.whitelist: user1,user2,user3,etc

### Hostnames

If your computer doesn't resolve its hostname to what you will be using,
(let's say `127.0.0.1`) you may also want to add:

    host: 127.0.0.1

Then go to `http://127.0.0.1:8080/login.R` and authorize access to your
account through github.


## Installing from a distribution tar ball

If you don't have internat access on the target machine, it is possible to install RCloud from a distribution
tar ball which has all dependent packages included. The process is essentially identical to the above, only that you don't use `git` to check out the sources, but unpack the tar ball instead.

Make sure R 3.1.0 or higher is installed. Download the distribution tar
ball, change to the directory where you want to install it,
e.g. `/data` and run

    $ tar fxz rcloud-1.3.tar.gz
    $ cd rcloud
    $ sh scripts/bootstrapR.sh

It will install the packages included in the release tar ball. Copy
`conf/rcloud.conf.samp` to `conf/rcloud.conf` and edit it to match
your GitHub setup. Then start RCloud via

    $ sh scripts/fresh_start.sh


## Will you be hacking on the code? Read on

If you're just running RCloud, skip this session. If you're going to
be hacking the code, you'll need to install a recent version of
[node.js](http://nodejs.org). Then, in your shell:

	$ npm install

This will install the node.js dependencies necessary to concatenate and
minify the javascript files used in RCloud.

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

Also if things are failing, make sure you have the latest R packages installed. You can use `update.packages` including both CRAN and `http://rforge.net` as the repository. Also you can run

    sh scripts/build.sh --all

to re-build all packages in RCloud.


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
