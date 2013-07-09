require(rcloud.support)

## This script will be loaded when Rserve starts
## and before any client connect.
## Use it to pre-load packages and any data you want
## as well as define any global variables you want all
## scripts to see

## Today, pretty much everyone speaks UTF-8, it makes the life easier
Sys.setlocale(,"en_US.UTF-8")

configure.rcloud()

## WS authentication (experimental as the name suggests...)
test_function <- function(v)
{
  cat("WS-login: ", paste(v, collapse=', '), "\n")
  ## the following should really go into rcloud.support, obviously ...
  if (!is.null(rcloud.support:::.rc.conf$exec.auth)) {
    exec.usr <- check.token(v[[2]], rcloud.support:::.rc.conf$exec.auth, "rcloud.exec")
    cat(" - exec required, matched user: ", exec.usr, "\n")
    if (exec.usr == FALSE) return(FALSE)
    if (identical(rcloud.support:::.rc.conf$exec.match.user, "login")) {
      iotools:::set.user(exec.usr)
      cat(" - setuid/gid, now running as", exec.usr, "\n")
    }
  }
  check.token(v[[1]]) != FALSE
}
