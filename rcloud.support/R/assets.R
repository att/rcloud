# FIXME Overlaps with rcloud.get.notebook.asset
rcloud.get.asset <- function(name, notebook=.session$current.notebook, version=NULL,
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
    asset <- notebook$content$files[[paste0(name, ".b64")]]$content
    if (is.null(asset)) {
      if (!quiet)
        stop("cannot find asset `",name,"'")
      return(NULL)
    }
    asset <- base64decode(asset)
  } else if (length(grep("\\.b64$",name))) ## we got .b64 name explicitly so jsut decode it
    asset <- base64decode(asset)

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
rcloud.execute.asset <- function(name, ..., notebook=.session$current.notebook, version=NULL,
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
