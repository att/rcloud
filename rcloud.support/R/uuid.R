################################################################################
# setup the UUID-string based injection hack

generate.uuid <- function() uuid::UUIDgenerate()

deferred.rcloud.result <- function(value) {
  uuid <- make.oc(value)
  if (is.null(.session$result.prefix.uuid))
    .session$result.prefix.uuid <- generate.uuid()
  structure(paste(.session$result.prefix.uuid, uuid, sep="|"), class="deferred_result")
}

rcloud.prefix.uuid <- function()
  if (is.null(.session$result.prefix.uuid)) .session$result.prefix.uuid <- generate.uuid() else .session$result.prefix.uuid

print.deferred_result <- function(x, ...) {
  ## this is a horrible, horrible hack - we try to detect
  ## if "knit" is anywhere on the call stack to detect
  ## knitr processing where we cannot use OOB but have to
  ## use a string result
  if (any(sapply(sys.calls(), function(o) identical(o[[1]], quote(knit))))) {
    # Pandoc apparently thinks anything with `@` is an email address
    # so temporarily replace with `+` (and replace back on client before invoking)
    x <- gsub('@', '+', unclass(x), fixed = TRUE)
    return(cat(x, "\n", sep=''))
  }
  flush.console()
  .rc.oobSend("deferred.result",unclass(x))
}
