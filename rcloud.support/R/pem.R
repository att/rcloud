rcloud.read.pem <- function(file) {
  if (!inherits(file, "connection")) {
    file <- file(file, "r")
    on.exit(close(file))
  }
  if (summary(file)$opened != "opened") {
    open(file, "r")
    on.exit(close(file))
  }
  while (length(r <- readLines(file, 1)))
    if (length(grep("^-----BEGIN RCLOUD CONTENT-----", r))) break

  if (!length(r))
    stop("File did not contain PEM-encoded RCloud content")

  meta <- list()
  while (length(r <- readLines(file, 1))) {
    if (r == "") break
    if (length(grep("^-----END RCLOUD CONTENT-----", r))) {
      r <- character()
      break
    }
    val <- gsub("^[^:]+:[ \\t]+", "", r)
    key <- gsub("-", ".", tolower(gsub(":.*", "", r)), fixed=TRUE)
    if (nchar(key) > 5 && substr(key, 1, 5) == "meta.")
      meta[[substr(key, 6, 128)]] <- val
  }
  if (!length(r))
    stop("The file is truncated, unexpected end of file")

  ## FIXME: this will be quite inefficient, but reading ahead
  ## wouldn't allow for reading multiple entities
  l <- list()
  while (length(r <- readLines(file, 1))) {
    if (length(grep("^-----END RCLOUD CONTENT-----", r))) {
      r	<- character()
      break
    }
    l <- c(l, r)
  }
  dec <- base64decode(unlist(l))
  if (length(meta)) attr(dec, "metadata") <- meta
  dec
}

rcloud.write.pem <- function(x, file, append=FALSE) {
  if (!is.raw(x))
    stop("Input must be in binary form")
  meta <- attr(x, "metadata")
  if (!inherits(file, "connection")) {
    file <- file(file, if (append) "a" else "w")
    on.exit(close(file))
  }
  if (summary(file)$opened != "opened") {
    open(file, "w")
    on.exit(close(file))
  }
  writeLines("-----BEGIN RCLOUD CONTENT-----", file)
  if (is.null(meta))
    writeLines(c("Content-type: application/octet-stream",""), file)
  else {
    tm <- unlist(lapply(meta, function(o) paste(o, collapse=", ")))
    writeLines(c("Content-Type: application/rcloud-encrypted",
                 "Content-Transfer-Encoding: base64"), file)
    writeLines(paste0("Meta-", gsub(".", "-", names(tm), fixed=TRUE), ": ", tm), file)
    writeLines("", file)
  }
  writeLines(base64encode(x, 64), file)
  writeLines("-----END RCLOUD CONTENT-----", file)
  invisible(TRUE)
}
