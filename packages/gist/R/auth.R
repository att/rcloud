auth.url <- function(redirect, ctx = current.gist.context())
  UseMethod("auth.url", ctx)
