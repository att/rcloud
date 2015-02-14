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
    ## this is a horribe, horrible hack - we try to detect
    ## if "knit" is anywhere on the call stack to detect
    ## knitr processing where we cannot use OOB but have to
    ## use a string result
    if (any(sapply(sys.calls(), function(o) identical(o[[1]], quote(knit))))) return(cat(unclass(x), "\n", sep=''))
    flush.console(); self.oobSend(list("html.out",unclass(x)))
}
