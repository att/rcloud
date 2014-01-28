# RCloud, an HTML5 frontend for collaborative data analysis in R

RCloud is an environment for collaboratively creating and sharing data
analysis scripts in R. Much like [Sage](http://www.sagemath.org/),
[iPython notebooks](http://ipython.org/ipython-doc/stable/interactive/notebook.html)
and [Mathematica](http://www.wolfram.com/mathematica/), RCloud
provides a notebook interface that lets you easily record a session
and annotate it with text, equations, and supporting images.

Unlike these other systems, RCloud:

* lets you easily browse other users's notebooks, comment on
  notebooks, fork notebooks, star notebooks, and use them as function
  calls in your own notebooks.

* provides an environment in which R packages can create rich HTML
  content (using, for example, [d3](http://d3js.org) and
  [dc.js](http://dc-js.github.io/dc.js/)).

* provides a transparent, integrated version control system. In
  essence, RCloud never forgets what you did. If you need low-level
  access to RCloud notebooks, you can simply clone the associated git
  repository. This is because RCloud notebooks are
  [Github gists](https://gist.github.com)

Interested? Read on.

# Setting up RCloud

### Checking out the code

You will need to do

    $ git clone --recursive https://github.com/cscheid/rcloud.git

to get RCloud and all of its dependencies.

Or, if you already have an RCloud source tree, run

    $ git submodule init
    $ git submodule update

to just get the dependencies.

## Installation requirements

Please use R 3.0.0 or later. It'll make your life easier, we promise.

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

Alternatively, you can set `Host:` instead with the same effect
(Host is used in other places not just the cookie domain).

Also if things are failing, try to run

    rcloud.support:::check.installation(force.all=TRUE)

which will re-fetch and install all packages.
