require(rcloud.support)

## This script will be loaded when Rserve starts
## and before any client connect.
## Use it to pre-load packages and any data you want
## as well as define any global variables you want all
## scripts to see

## Today, pretty much everyone speaks UTF-8, it makes the life easier
Sys.setlocale(,"en_US.UTF-8")

configure.rcloud()

rcloud.auth.path <- "/tmp/rcloud.auth"

# FIXME must be something other than /tmp/.
# I wanted to say paste(.rc.conf$configuration.root, "/rcloud.auth", sep="")),
# but I don't have access to .rc.conf on login.R, which needs to mutate the file.

test_function <- function(v)
{
  print(v)
  uuid <- v[[1]]
  tryCatch(d <- readRDS(rcloud.auth.path),
           error=function(e) {
             d <<- new.env(parent=emptyenv())
             d$uuid_to_user <<- new.env(parent=emptyenv())
             d$user_to_uuid <<- new.env(parent=emptyenv())
           })
  result <- !is.null(d$uuid_to_user[[uuid]])
  result
}
