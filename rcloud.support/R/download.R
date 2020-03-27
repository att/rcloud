.download.file <- NULL
rcloud.download.file <- function(filename, content, mimetype) {
  if (!is.character(filename) || length(filename) != 1) stop("filename must be a string")
  if (missing(content)) {
     filename <- path.expand(filename)
     sz <- file.info(filename)$size
     if (is.na(sz)) stop("file `", filename, "' cannot be accessed")
     content <- readBin(filename, raw(), sz)
     filename <- basename(filename)
  }

  if (missing(mimetype))
    mimetype <- mime::guess_type(filename)

  ## the JS side (#2721) doesn't append \n between elements, so we have to paste it into one string
  if (is.character(content) && length(content) > 1L)
     content <- paste(content, collapse="\n")

  if (is.null(.download.file)) {
    code <- paste(readLines(system.file("javascript", "download.js", package="rcloud.support")), collapse='\n')
    .download.file <- rcloud.install.js.module("rcloud.message.dialog", code)
  }
  .download.file(filename, content, mimetype)
}
