## configuration environment -- loaded from the config file in configure.rcloud()
.rc.conf <- new.env(parent=emptyenv())

## --- the following are utility functions used inside rcloud.support, not exported --
nzConf <- function(name) isTRUE(nzchar(.rc.conf[[name]]))
getConf <- function(name) .rc.conf[[name]]
setConf <- function(name, value) {
  .rc.conf[[name]] <- value
  if (rcloud.debug.level()) cat("CONFIG: '",name,"'='",value,"'\n",sep='')
  value
}
hasConf <- function(name) !is.null(.rc.conf[[name]])
validFileConf <- function(name) nzConf(name) && file.exists(getConf(name))
absPath <- function(path, anchor = getConf("root")) {
  if (!is.character(anchor)) anchor <- getwd()
  ## FIXME: this ignores Windows x:/ notation !
  if (!isTRUE(grepl("^/", path))) file.path(anchor, path) else path
}
pathConf <- function(name, ..., anchor = FALSE) {
  path <- file.path(.rc.conf[[name]], ...)
  if (is.logical(anchor) && isTRUE(!anchor)) path else absPath(path, anchor)
}

## --- this one is exported for use outside of rcloud.support ---
rcloud.config <- function(name) .rc.conf[[name]]
