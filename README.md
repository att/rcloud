# Introduction

RCloud is currently under heavy development. If you are having trouble setting up rcloud, please raise an issue [here](https://github.com/cscheid/rcloud/issues/new).
## Installation requirements
The setup instructions below are for a two different set of users. If you simply wish to run rcloud, please have a look at the Users section. However, if you want to hack around the code, please see the section for Developers. The steps below are specific to Ubuntu, but equivalent commands are available for other linux distributions. 

### Users

This section applies only to users. Some of these steps would be applicable to developers as well. If you are a developer, please jump to the Developers section.
#### 1. System Dependencies

RCloud requires R packages Cairo, httr which depend on the following system dependencies
    
* libxt-dev
* libcurl4-gnutls-dev
* libcairo2-dev

If you are using other Linux systems, the names for the development headers might vary. Please lookup the corresponding names and install them. On Ubuntu, you can simply do
    
    $ sudo apt-get install libxt-dev libcurl4-openssl-dev libcairo2-dev
    
to install all system dependencies.

#### 2. Install R

Upgrade to R 3.0, if you already have it. It'll make your life easier, we promise. If you haven't already, please see below
    
    $ sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E084DAB9
    $ sudo echo 'deb http://cran.rstudio.com/bin/linux/ubuntu precise/' >> /etc/apt/sources.list
    $ sudo apt-get update
    $ sudo apt-get install -y r-base-dev

#### 3. Install unzip

 You would need unzip to extract files from the archive when they are downloaded to your system.

    $ sudo apt-get install -y unzip

#### 4. Downloading the source code

The source code available in the github repository, and you can dowload it, extract it, and change folder using
    
    $ wget https://github.com/cscheid/rcloud/archive/master.zip; unzip master.zip; cd rcloud-master

#### 5. Setting up a github application

Let's define `RCLOUD_BASE_URL` as the url where you plan to host RCloud. Also, for the sake of simplicity, let's assume that you are hosting at `127.0.0.1`, which is localhost. 

Rcloud uses [gists](http://gist.github.com) for storage and Github accounts for authentication. Please create a [github](http://www.github.com) login if you don't have one, or, a [Enterprise Github](http://enterprise.github.com) account if your organization uses Enterprise Github. 

You'll need to create a [github application](https://github.com/settings/applications). Go ahead, open the link and click on "Register New Application" on the top right corner. 

Please provide the follwing details in the application registration form 

    Application Name: RCloud
    Homepage URL: http://127.0.0.1:8080/login.html
    Callback URL: http://127.0.0.1:8080/login_successful.R
        

This github application will need to point to the location you will deploy rcloud (`RCLOUD_BASE_URL`, or in this case `127.0.0.1`). 

#### 6. Adding configuration files

Rcloud uses cookies for 
You would need to modify/create two configuration files. `conf/rcloud.conf` is a general configuration file for rcloud. The file `conf/github_info.txt` is used to specify the connection details for the github API. 

##### a. Setting up conf/rcloud.conf
If you would be running the server on localhost(127.0.0.1), this is what you need to do. 

    $ echo -e 'Cookie.Domain: 127.0.0.1' > ./conf/rcloud.conf
    
If you have trouble with authentication, make sure your hostname is FQDN (fully qualified domain name) and it matches your external name. You can use `hostname -f` to check that. The reason is that the cookie domain defaults to the hostname if not otherwise specified. If either of the above is not true, then create `conf/rcloud.conf` file with

    Cookie.Domain: myserver.mydomain

Alternatively, you can set `Host:` instead with the same effect.

##### b. Setting up conf/github_info.txt

We provide a sample file in the distribution. To create a file, please do
    
    $ mv conf/github_info.txt.sample conf/github_info.txt
    
Remember the new application you created on github? Well, now it's time for rcloud to know about the github application. Please edit the file `conf/github_info.txt` and modify the contents. If you're using github.com, then your file will look like this: 

    your.20.character.client.id
    your.40.character.client.secret
    https://github.com/
    https://api.github.com/

The third and fourth lines are the base URL of the github website and
the entry point for the github API (these might differ in
[Enterprise Github](http://enterprise.github.com) deployments).

#### 7. Starting the RCloud server

If you are still in the folder `rcloud-master`, just do

    $ ./scripts/fresh_start.sh
This will reinstall the `rcloud.support` package, recompile the javascript files (if you have node.js and the necessary dependencies installed), kill any old instances of Rcloud running, deauthorize all login tokens, and start a new version of Rcloud.


#### 8. Authorizing the github app

Then go to `http://127.0.0.1:8080/login.html`, click login, and authorize
access to your account through github.


### Developers

Please follow steps 1 & 2 from the Users section. Once the dependencies and R is installed, please follow these additional steps. 

#### 3. Installing git and npm
    
Most developers use git nowadays, but just in case you don't have that on your system, please install it using

    $ sudo apt-get install git

The npm version on debian systems is typically older by , so you should try installing a later version
    
    $ sudo apt-get install build-essential libssl-dev
    $ wget http://nodejs.org/dist/v0.10.15/node-v0.10.15.tar.gz; tar xpf node-v0.10.15.tar.gz; cd node-v0.10.15/
    $ ./configure
    $ make && make install
    
    
#### 4. Checking out the code

The RCloud github repo contains of rcloud source code and two submodules, [lux](https://github.com/cscheid/lux) and [rserve-js](https://github.com/cscheid/rserve-js). However, you dont have to worry about them. Simply doing 

    $ git clone --recursive https://github.com/cscheid/rcloud.git

will download the main source code as well as the submodules. 

We have added `package.json` in multiple locations to compile the javascript dependencies. This will install all the node.js dependencies necessary to create the
minified javascript files used in Rcloud.

    $ npm install htdocs/js
    $ npm install htdocs/lib/js/lux
    $ npm install htdocs/lib/js/rserve-js
    $ npm install htdocs/lib
    
After step 4, please continue steps 5,6,7 & 8 as described in the Users section.

#### 9. Starting rcloud

The safest way to install rcloud currently is to simply run the
`scripts/fresh_start.sh` script. This will reinstall the
`rcloud.support` package, recompile the javascript files (if you have
node.js and the necessary dependencies installed), kill any old
instances of Rcloud running, deauthorize all login tokens, and start a
new version of Rcloud.

FIXME: Currently `fresh_start.sh` actually kills all Rserve instances
via killall. Yes, this is blunt and stupid.

#### When things go wrong

If for some reason, you are facing a weird error message OR have a copy of the older code with a known issue - it's best to switch to the latest copy of everything (source code, R packages)

##### a. Update your copy of the source code
    
    $ git pull --recurse-submodules
    
--recurse-submodules in git-pull currently has a known bug. Please see the BUGS section in the git-pull [man-pages](https://www.kernel.org/pub/software/scm/git/docs/git-pull.html#_bugs) for more details. 
###### Fixing this issue

This should probably help

    $ git submodule init
    $ git submodule update

to just get the dependencies, and then update your copy of the source code again.

##### b. Force update the packages

The `rcloud.support` package, well, supports R operations in the rcloud server. It is installed automatically when you do a `scripts/fresh_install.sh`. It has a built in function to check the installation for missing R packages, and for installing missing packages automatically. 

In R,

    library(rcloud.support)
    rcloud.support:::check.installation()
    
will return a `TRUE` if all packages are installed.    

It can also force update all packages to their latest version. Most of the packages don't change much, but off late we have updated the package [github](https://github.com/cscheid/rgithub) and [Rserve](http://www.rforge.net/Rserve/) a few times to resolve issues, so it's best to force update them periodically. 

In R,

    library(rcloud.support)
    rcloud.support:::check.installation(force.all=T)

Will force update the required packages.    
##### c. Hacking with submodules

Typically, you wouldn't need to. We would always try to commit a working version of the submodule to the main repo. However, if you still need to hack around with the submodules  within a version of rcloud, you can try to work with `git submodule`

See the current version of the submodule

    $git submodule status
    
The latest changes
    
    $git submodule summary
    
And last but not the least, recursively update all submodules to master
    
    $git submodule foreach git pull origin master



    

    
