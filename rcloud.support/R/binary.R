.b64.to.binary <- function(text) {
   # has header?
   attr <- NULL
   if (length(text) == 1L) text <- strsplit(text, "\n", TRUE)[[1]]
   if (length(text) && substr(text,1,3) == "## ") {
      q <- strsplit(gsub("^##[ \t]+","",text[1L]), "[ \t]*,[ \t]*")[[1]]
      valid <- grep(":", q, TRUE)
      if (length(valid)) {
	 val <- gsub("^[^:]*:[ \t]*", "", q)
	 names(val) <- gsub(":.*", "", q)
	 attr <- lapply(val, type.convert, as.is=TRUE)
      }
   }
   comm <- grep("^#", text)
   if (length(comm)) text <- text[-comm]
   bin <- base64decode(text)
   if (!is.null(attr)) attr(bin, "metadata") <- attr
   bin
}

.b64.to.binary.file <- function(fspec) {
    if (!is.null(fspec$content)) fspec$content <- .b64.to.binary(fspec$content)
    if (!is.null(fspec$filename)) fspec$filename <- gsub("\\.b64$", "", fspec$filename)
    fspec
}

.binary.to.b64 <- function(what, meta=attr(what, "metadata")) {
   mstr <- character(0)
   if (!is.null(meta) && !is.null(names(meta))) {
      .san <- function(x) gsub("%", "%25", gsub(":", "%3a", gsub(",", "%2c", x)))
      l <- unlist(lapply(meta, as.character))
      mstr <- paste0("## ", paste(.san(names(l)), .san(l), sep=":", collapse=", "))
   }
   b64 <- base64encode(what)
   if (length(mstr)) paste0(mstr, "\n", b64) else b64
}

.gist.binary.process.incoming <- function(content) {
    ulog(".gist.binary.process.incoming: ", paste(capture.output(str(content)),collapse='\n'))
    if (!length(content$files)) return(content)

    ## convert any binary contents stored in .b64 files
    fn <- names(content$files)
    bin <- grep("\\.b64$", fn)
    if (length(bin)) {
	nf <- content$files[-bin]
	for (i in bin) {
	   nn <- gsub("\\.b64$", "", fn[i])
	   ## only use binary if there is no text version
	   if (is.null(nf[[nn]])) nf[[nn]] <- .b64.to.binary.file(content$files[[i]])
	}
	content$files <- nf
    }
    content
}

.gist.binary.process.outgoing <- function(content) {
    via.json <- is.character(content)
    if (via.json) return(content) ## disable processing of JSON content for now
    if (via.json) content <- .Call(parseJSON, content)
    ## convert any binary assets into .b64 files
    if (length(content$files) && any(bin <- sapply(content$files, function(o) is.list(o) && is.raw(o$content)))) {
        bin.f <- content$files[bin]
        txt.f <- content$files[!bin]
        for (i in seq.int(length(bin.f))) {
            name <- names(bin.f)[i]
            if (!length(grep("\\.b64$", name))) name <- paste0(name, ".b64")
            txt.f[[name]] <- list(content=.binary.to.b64(bin.f[[i]]$content))
        }
        content$files <- txt.f
    }
    if (via.json) rjson::toJSON(content) else content
}
