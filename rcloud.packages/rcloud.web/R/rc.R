rcw.result <- function(run, body, ...) {
  l <- list(...)
  if (length(l) > 0L && is.null(l)) stop("all arguments to rc.result() must be named")
  if (!missing(body)) l$body <- body
  if (!missing(run)) l$run <- function(args, ...) do.call(run, args)
  n <- names(l)
  for (i in seq.int(l)) if (is.function(l[[i]])) l[[i]] <- Rserve:::ocap(l[[i]], n[i])
  invisible(list(ok=TRUE, content=l))
}
