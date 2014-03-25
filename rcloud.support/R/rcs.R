## RCS (RCloud Storage) methods

rcs.key <- function(...) paste(..., sep='/')

usr.key <- function(..., user=.session$username, notebook=.session$notebook) paste(user, notebook, ..., sep='/')

rcs.get <- function(key, list=FALSE, engine=.session$rcs.engine) UseMethod("rcs.get", engine)

## FIXME: we need the counter flag becasue counters may need special treatment
##        e.g., in redis they have to be passed unserialized
rcs.set <- function(key, value, counter=FALSE, engine=.session$rcs.engine) UseMethod("rcs.set", engine)

rcs.rm <- function(key, engine=.session$rcs.engine) UseMethod("rcs.rm", engine)

rcs.incr <- function(key, engine=.session$rcs.engine) UseMethod("rcs.incr", engine)

rcs.decr <- function(key, engine=.session$rcs.engine) UseMethod("rcs.decr", engine)

rcs.zero <- function(key, engine=.session$rcs.engine) UseMethod("rcs.zero", engine)

rcs.list <- function(pattern=NULL, engine=.session$rcs.engine) UseMethod("rcs.list", engine)

## default methods which make implementations optional
rcs.zero.default <- function(key, engine) rcs.set(key, 0L, engine)
