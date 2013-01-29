require(rcloud.support)

## This script will be loaded when Rserve starts
## and before any client connect.
## Use it to pre-load packages and any data you want
## as well as define any global variables you want all
## scripts to see

## Today, pretty much everyone speaks UTF-8, it makes the life easier
Sys.setlocale(,"en_US.UTF-8")

## --- RCloud part folows ---
## WS init
.session.init <- function() {
    set.seed(Sys.getpid()) # we want different seeds so we get different file names
    tmpfile <<- paste('tmp-',paste(sprintf('%x',as.integer(runif(4)*65536)),collapse=''),'.tmp',sep='')
    start.rcloud()
    ## x <- paste(configuration.root,"/common.R",sep='')
    ## if (file.exists(x))
    ##   source(x)$value
    ## else {
    ##   self.oobSend(list("boot.failure"))
    ##   NULL
    ##   ## "ERROR: Could not open common.R!" # R.version.string
    ## }
}

configure.rcloud()
