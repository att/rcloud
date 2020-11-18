run.rcloud <- function() {
  debug <- FALSE
  rsconf <- system.file('conf/rserve.conf', package='rcloud')
  Rserve::Rserve(debug, args=c("--RS-conf", rsconf, "--vanilla", "--no-save"))
}
