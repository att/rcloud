rcloud.out <- function(expr, terminate="\n") {
  expr <- substitute(expr)
  rval <- NULL
  file <- textConnection("rval", "w", local = TRUE)
  sink(file)
  on.exit({ sink(); close(file) })
  v <- withVisible(eval(expr, parent.frame()))
  if (v$visible) print(v$value)
  on.exit()
  sink()
  .rc.oobSend("console.out", paste0(paste(as.character(rval), collapse="\n"), terminate))
  invisible(v$value)
}

rcloud.html.out <- function(..., sep="") {
    rcloud.flush.plot()
    .rc.oobSend("html.out", x <- paste(..., sep=sep, collapse="\n"))
    invisible(x)
}

# returns an ID which should be passed to Rserve.context
rcloud.output.context <- function(selector) {
  if (is.null(.session$.output.context.cap))
    .session$.output.context.cap <- rcloud.install.js.module("rcloud.output.context",
                                                             paste(readLines(system.file("javascript", "create_output_context.js", package="rcloud.support")), collapse='\n'))
  .session$.output.context.cap$create_context(selector)
}

rcloud.close.context <- function(context.id) {
  if (is.null(.session$.output.context.cap))
    .session$.output.context.cap <- rcloud.install.js.module("rcloud.output.context",
                                                             paste(readLines(system.file("javascript", "create_output_context.js", package="rcloud.support")), collapse='\n'))
  # todo: if(Rserve.context()==context.id) ???
  .session$.output.context.cap$close_context(context.id)
}
