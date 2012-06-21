# Building

The javascript files required by RCloud are now bundled together to
reduce bugs (``I forgot to add the new .js file again'') and to reduce
the number of HTTP requests. 

This means that you will have to recompile the bundles every time the
javascript has changed. Currently the HTML sources are using the
un-minified javascript, so all that is needed is to go into js/ and
type make.

# Running

The following starts a pretty basic instance of RCloud serving on port 8080:

    $ cd $RCLOUD_ROOT
    $ ROOT=`pwd`/htdocs DATAROOT=`pwd`/userdata CONFROOT=`pwd`/code code/start -d

# Directory structure

- Rserve_py: a bare-bones python Rserve client. Previously used for
  testing, now there mostly for archival. Will disappear soon.

- attic: junk. Will disappear soon.

- code: Rserve configuration, and R source files used server-side.

- conf: old configuration, will disappear soon.

- doc: documentation

- htdocs: static content served by RServe's HTTP server.

- userdata: this is where all user-generated content will be stored
  (right now only contains userdata/userfiles and userdata/history, as
  described below)

- userdata/userfiles: this is where the user's content is stored. Right now
  it's trivial file-system-backed storage, but could become more
  complicated as we dip our toes into versioning waters.

- userdata/history: currently holds history buffers for users, but this will go
  into userfiles in the future as user's interactions become more
  structured.

- tmp: temporary directory required by the runtime (used by rmarkdown
  to get data urls)

