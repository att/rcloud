################################################################################
# setup the UUID-string based injection hack

.result.hash <- new.env(hash=TRUE, parent=emptyenv())

# FIXME should use libuuid directly
generate.uuid <- function() system("uuidgen", intern=TRUE);

stash.result <- function(value) {
    new.hash <- generate.uuid()
    .result.hash[[new.hash]] <- value
    new.hash
}

deferred.rcloud.result <- function(value) {
    uuid <- stash.result(value)
    if (is.null(.session$result.prefix.uuid))
        .session$result.prefix.uuid <- generate.uuid()
    paste(.session$result.prefix.uuid, uuid, sep="|")
}

rcloud.fetch.deferred.result <- function(key) {
    v <- .result.hash[[key]]
    rm(key, envir=.result.hash)
    v
}

rcloud.prefix.uuid <- function()
  if (is.null(.session$result.prefix.uuid)) .session$result.prefix.uuid <- generate.uuid() else .session$result.prefix.uuid
