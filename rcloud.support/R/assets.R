# FIXME Overlaps with rcloud.get.notebook.asset
rcloud.get.asset <- function(name, notebook=rcloud.session.notebook(), version=NULL,
                             cached=TRUE, quiet=FALSE, as.file=FALSE) {
  if (!cached && is.list(notebook))
    notebook <- notebook$content$id
  if (cached && !is.list(notebook)) cached <- FALSE
  if (!cached) {
    if (!is.character(notebook) || length(notebook) < 1)
      stop("invalid notebook specification")
    res <- rcloud.get.notebook(notebook, version)
    if (!isTRUE(res$ok)) stop("cannot get notebook `",notebook[1],"'")
    notebook <- res
  }
  asset <- notebook$content$files[[name]]$content
  if (is.null(asset)) { ## re-try for binary assets with .b64 extension
    asset <- notebook$content$files[[paste0(name, ".b64")]]
    if (is.null(asset)) {
      if (!quiet)
        stop("cannot find asset `",name,"'")
      return(NULL)
    }
    asset <- .b64.to.binary.file(asset)$content
  } else if (length(grep("\\.b64$",name))) ## we got .b64 name explicitly so jsut decode it
    asset <- .b64.to.binary.file(asset)$content

  if (as.file) {
    ad <- tempfile(paste0(notebook$content$id, '-assets'))
    dir.create(ad, FALSE, FALSE, "0700")
    ad <- file.path(ad, name)
    if (is.raw(asset))
      writeBin(asset, ad)
    else
      writeLines(asset, ad)
    ad
  } else asset
}

# FIXME semantics are entirely different depending on the file extension
# this is a terrible idea.
rcloud.execute.asset <- function(name, ..., notebook=rcloud.session.notebook(), version=NULL,
                                 cached=TRUE, wait=TRUE) {
  asset <- rcloud.get.asset(name, notebook, version, cached, as.file=TRUE)
  ext <- if(length(grep(".", name, fixed=TRUE))) gsub(".*\\.","",name) else ""
  driver <- switch(ext,
         R = return(source(asset)),
         py = "python ",
         pl = "perl ",
         sh = "sh ",
         js = "node ",
         "")
  if (is.null(driver)) Sys.chmod(asset, "0700")
  l <- list(...)
  pars <- if (length(l)) paste(c('', sapply(l, shQuote)), collapse=" ") else ""
  system(paste(driver, shQuote(asset), pars), TRUE, wait=wait)
}

rcloud.upload.asset <- function(name, content, notebook=rcloud.session.notebook(), binary=is.raw(content), file) {
    if (!missing(content) && !missing(file)) stop("content and file are mutually exclusive")
    if (!missing(file)) {
        file <- path.expand(file)
        f <- file.info(file)
        if (is.na(f$size)) stop("file `", file, "' is not accessible")
        if (f$isdir) stop("cannot upload a directory")
        tryCatch(content <- readBin(file, raw(), f$size), warning=function(e) stop(e$message))
    }
    if (is.list(notebook))
        notebook <- notebook$content$id
    ## we need the raw version so we can tell if the stored version is binary or not
    nb <- .rcloud.get.notebook(notebook, raw=TRUE)
    if (!isTRUE(nb$ok)) stop("cannot get notebook `",notebook[1],"'")
    n64 <- paste0(name, ".b64")
    if (binary) {
        bc <- list(content=.binary.to.b64(content))
        if (!is.null(nb$content$files[[name]])) { ## have to delete the text version
            l <- list(NULL, bc)
            names(l) <- c(name, n64)
        } else {
            l <- list(bc)
            names(l) <- n64
        }
    } else {
        tc <- if (is.null(content)) NULL else list(content=content)
        if (!is.null(nb$content$files[[n64]])) { ## have to delete the b64 version
            l <- list(NULL, tc)
            names(l) <- c(n64, name)
            if (is.null(content) && is.null(nb$content$files[[name]])) ## request to delete text but already gone, so only keep b64 deletion
                l <- l[1]
        } else {
            if (is.null(content) && is.null(nb$content$files[[name]])) ## already gone, nothing to do
                return(rcloud.augment.notebook(nb)) ## since we fetched the raw notebook, augment it
            l <- list(tc)
            names(l) <- name
        }
    }
    invisible(rcloud.update.notebook(notebook, list(files=l)))
}

rcloud.delete.asset <- function(name, notebook=rcloud.session.notebook())
    rcloud.upload.asset(name, NULL, notebook)
