.fatal.error <- NULL
rcloud.fatal.error <- function(message, label) {
  if (is.null(.fatal.error)) {
    code <- paste(readLines(system.file("javascript", "fatal.error.js", package="rcloud.support")), collapse='\n')
    .fatal.error <- rcloud.install.js.module("rcloud.fatal.error", code)
  }
  .fatal.error(message, label)
}
