# Getting it to work

## Installation requirements

### Packages

You'll need a recent version of Rserve. From R, type:

    > install.packages("Rserve",,"http://rforge.net")

You'll need the following packages from CRAN:

* Cairo
* FastRWeb
* png
* knitr
* markdown
* base64enc
* rjson

You'll need the following packages from github (Installing via devtools is the easiest):

	> library(devtools) # or install.packages("devtools")
	> install_github("hadley", "httr")
	> install_github("cscheid", "github")

### Github authentication

Rcloud uses [gists](http://gist.github.com) for storage and Github
accounts for authentication.

You'll need to create a
[github application](https://github.com/settings/applications). This
github application will need to point to the location you will deploy
rcloud (let's assume you're only testing it for now, so 127.0.0.1
works). In that case, your application's URL will most likely be
`http://127.0.0.1:8080`, and your Callback URL *must* be
`http://127.0.0.1:8080/login_successful.R`. (the host and port needs
to match the URL, and the path must be `login_successful.R`).

Then, you need to create a file under your configuration root
(typically that's `/conf`) called github_info.txt. This file will
contain the information necessary to connect to the github website and
API. If you're using github.com, then your file will look like this:

    your.20.character.client.id
    your.40.character.client.secret
    https://github.com/
    https://api.github.com/

The third and fourth lines are the base URL of the github website and
the entry point for the github API (these might differ in
[Enterprise Github](http://enterprise.github.com) deployments).

### Will you be hacking on the code? Read on

If you're just running rcloud, skip this session. If you're going to
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
