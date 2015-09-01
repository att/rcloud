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
    flush.console()
    .rc.oobSend("html.out", x <- paste(..., sep=sep, collapse="\n"))
    invisible(x)
}
