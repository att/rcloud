# Getting it to work

## Installation requirements

Forgive us for the current mess. This is temporary.

### R Version

Upgrade to R 3.0. It'll make your life easier, we promise.

### Checking out the code

You will need to do 

    $ git clone --recursive https://github.com/cscheid/rcloud.git

to get RCloud and all of its dependencies.

Or, if you already have an RCloud source tree, run

    $ git submodule init
    $ git submodule update

to just get the dependencies.


### Packages

RCloud provides the `rcloud.support` which contains supporting code but also authmated installation.
In R type:

    install.packages("rcloud.support", repos=c("http://RForge.net",
                     "http://R.research.att.com"), type="source")

From there on you can safely use the `rcloud.support` package in RCloud
sources, but the above makes the bootstraping of dependencies
easier. All remaining dependencies will be installed during the first
start of RCloud. You can also install them by hand by running

     rcloud.support:::check.installation()

Add `force.all=TRUE` argument to reinstall all packages - always try that
when you encounter issues. It is useful for keeping up with the development
as we don't always bump the versions.

### Github authentication

RCloud uses [gists](http://gist.github.com) for storage and Github
accounts for authentication.

You'll need to create a
[github application](https://github.com/settings/applications). This
github application will need to point to the location you will deploy
RCloud (let's assume you're only testing it for now, so 127.0.0.1
works). In that case, your application's URL will most likely be
`http://127.0.0.1:8080`, and your Callback URL *must* be
`http://127.0.0.1:8080/login_successful.R`. (the host and port needs
to match the application URL, and the path must be `login_successful.R`).

Then, you need to create a file under your configuration root
(typically that's `/conf`) called `rcloud.conf`. This file will
contain the information necessary to connect to the github website and
API. If you're using github.com, then your file will look like this:

    github.client.id: your.20.character.client.id
    github.client.secret: your.40.character.client.secret
    github.base.url: https://github.com/
    github.api.url: https://api.github.com/

The third and fourth lines are the base URL of the github website and
the entry point for the github API (these might differ in
[Enterprise Github](http://enterprise.github.com) deployments).

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
instances of Rcloud running, deauthorize all login tokens, and start a
new version of Rcloud.

FIXME: currently `fresh_start.sh` actually kills all Rserve instances
via killall. Yes, this is blunt and stupid.

### Pitfalls

If you have trouble with authentication, make sure your hostname is
FQDN (fully qualified domain name) and it matches your external name.
You can use `hostname -f` to check that. The reason is that the cookie
domain defaults to the hostname if not otherwise specified. If either
of the above is not true, then create `conf/rcloud.conf` file with

    Cookie.Domain: myserver.mydomain

Alternatively, you can set `Host:` instead with the same effect.
