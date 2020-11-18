run.rcloud <- function() {
  debug <- FALSE
  rsconf <- system.file('conf/rserve.conf', package='rcloud')
  root <- system.file('', package='rcloud')
  Sys.setenv(ROOT=root)
  Rserve::Rserve(debug, args=c("--RS-conf", rsconf, "--vanilla", "--no-save"))
}
