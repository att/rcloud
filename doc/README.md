# Building

The javascript files required by RCloud are now bundled together to
reduce bugs (``I forgot to add the new .js file again'') and to reduce
the number of HTTP requests. 

This means that you will have to recompile the bundles every time the
javascript has changed. Currently the HTML sources are using the
un-minified javascript, so all that is needed is to go into js/ and
type make.

# Running

The following sets up and starts a pretty basic instance of RCloud serving on port 8080:

	$ R # or R64, depending on your flavor
	
	> install.packages("Rserve",,"http://rforge.net", type='source')

    > install.packages(c("FastRWeb", "knitr", "hash", "markdown"),,
	                   c("http://r.research.att.com"))
	> quit()
					   
    $ cd $RCLOUD_ROOT
	$ code/setup
    $ ROOT=`pwd` code/start

If the markdown package is not available for your R version in CRAN,
you can use devtools:

    $ R
    > install.packages("devtools")
	> library(devtools)
	> install_github("markdown", "rstudio")

# Directory structure

- code: Rserve configuration, and R source files used server-side.

- doc: documentation

- htdocs: static content served by RServe's HTTP server.

- data: this is where all user-generated content will be stored
  (right now only contains data/userfiles and data/history, as
  described below)

- data/userfiles: this is where the user's content is stored. Right now
  it's trivial file-system-backed storage, but could become more
  complicated as we dip our toes into versioning waters.

- data/history: currently holds history buffers for users, but this will go
  into userfiles in the future as user's interactions become more
  structured.

- tmp: temporary directory required by the runtime (used by rmarkdown
  to get data urls)

