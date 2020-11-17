run.rcloud <- function() {
  htdocs <- system.file('htdocs', package='rcloud')
  Rserve::Rserve(debug, args=c("--RS-conf", htdocs, "--vanilla", "--no-save"))
}
