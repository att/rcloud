.download.file <- NULL
rcloud.download.file <- function(filename, content, mimetype) {
  if (is.null(.download.file)) {
    code <- paste(readLines(system.file("javascript", "download.js", package="rcloud.support")), collapse='\n')
    .download.file <- rcloud.install.js.module("rcloud.message.dialog", code)
  }
  .download.file(filename, content, mimetype)
}
