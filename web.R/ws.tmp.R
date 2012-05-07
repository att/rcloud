run <- function(file, mime="text/html", ...)
  WebResult("tmpfile", gsub("/", ".", file, fixed=TRUE), mime)
