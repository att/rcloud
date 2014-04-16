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
  self.oobSend(list("console.out", paste0(paste(as.character(rval), collapse="\n"), terminate)))
  invisible(v$value)
}
