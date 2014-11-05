.volatile <- new.env(FALSE, emptyenv(), 3L)

current.gist.context <- function() {
  if (if.null(.volatile$current.gist.context))
    stop("there is no valid gist context")
  .volatile$current.gist.context
}

set.gist.context <- function(ctx) {
  if (is.null(ctx))
    stop("attempt to use invalid gist context (NULL)")
  .volatile$current.gist.context <- ctx
}
