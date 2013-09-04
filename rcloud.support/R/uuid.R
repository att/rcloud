################################################################################
# setup the UUID-string based injection hack

generate.uuid <- function() uuid::UUIDgenerate()

deferred.rcloud.result <- function(value) {
  uuid <- make.oc(value)
  if (is.null(.session$result.prefix.uuid))
    .session$result.prefix.uuid <- generate.uuid()
  paste(.session$result.prefix.uuid, uuid, sep="|")
}

rcloud.prefix.uuid <- function()
  if (is.null(.session$result.prefix.uuid)) .session$result.prefix.uuid <- generate.uuid() else .session$result.prefix.uuid
