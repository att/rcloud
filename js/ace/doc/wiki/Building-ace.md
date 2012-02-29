## Prerequisites

You do not generally have to build ACE.  The '/src/build/' directory usually contains the latest build and you should try to use that.  Builds are regularly pushed to Git.  Only if you develop significant new features and want to try them in a product you've developed to make sure they work before submitting a Pull request, then would you need to build ACE.

ACE uses 'make', 'Node.js' ([[http://nodejs.org/]]), and Node Package Manager or 'npm' ([[http://npmjs.org/]]) to perform builds.  Builds currently require a *NIX OS with standard build tools installed (make).  Windows builds are unsupported and probably won't ever work (try VMWare Workstation/Player + Ubuntu).

If you are running an OS with a package manager, installing Node.js is pretty straightforward:  [[https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager]].

Then install 'npm' by executing (assumes 'curl' is installed):

    curl http://npmjs.org/install.sh | sh

## Build ACE

Once all the prerequisites have been met, fire up a terminal and execute (assumes 'git' is installed):

    cd ~
    git clone git://github.com/ajaxorg/ace.git
    cd ace
    git submodule update --init --recursive
    make clean
    make build

## Troubleshooting

If you get errors, first make sure that you executed the 'git submodule' line above.  There are currently three submodules that are used during the build process:  'dryice', 'pilot', and 'cockpit'.

If you get an error message with a stack trace such as "Error: Cannot find module 'uglify-js'", run 'npm install missingmodulename'.  npm will go out and attempt to install the missing package.  Then re-run the 'make clean' and 'make build' commands.

'npm list' will list missing dependencies but depends on the main 'package.json' file being up-to-date, which doesn't always happen.