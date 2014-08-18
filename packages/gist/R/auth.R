auth.url <- function(redirect, ctx = current.gist.context())
  UseMethod("auth.url", ctx)

access.token <- function(query, ctx = current.gist.context())
  UseMethod("access.token", ctx)

context.info <- function(ctx)
  UseMethod("context.info", ctx)
