## RCS (RCloud Storage) methods

rcs.key <- function(...) paste(..., sep='/')

usr.key <- function(..., user=.session$username, notebook=.session$notebook) paste(user, notebook, ..., sep='/')

rcs.get <- function(key, list=FALSE, engine=.session$rcs.engine) UseMethod("rcs.get", engine)

rcs.set <- function(key, value, engine=.session$rcs.engine) UseMethod("rcs.set", engine)

rcs.rm <- function(key, engine=.session$rcs.engine) UseMethod("rcs.rm", engine)

rcs.incr <- function(key, engine=.session$rcs.engine) UseMethod("rcs.incr", engine)

rcs.decr <- function(key, engine=.session$rcs.engine) UseMethod("rcs.decr", engine)

rcs.list <- function(pattern=NULL, engine=.session$rcs.engine) UseMethod("rcs.list", engine)

