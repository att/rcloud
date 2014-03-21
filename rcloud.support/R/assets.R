rcloud.get.asset <- function(name, notebook=.session$current.notebook, version=NULL,
                             cached=TRUE, quiet=FALSE, as.file=FALSE) {
  if (!cached && is.list(notebook))
    notebook <- notebook$content$id
  if (cached && !is.list(notebook)) cached <- FALSE
  if (!cached) {
    if (!is.character(notebook) || length(notebook) < 1)
      stop("invalid notebook specification")
    res <- rcloud.get.notebook(id, version)
    if (!isTRUE(res$ok)) stop("cannot get notebook `",notebook[1],"'")
    notebook <- res
  }
  asset <- notebook$content$files[[name]]$content
  if (is.null(asset)) {
    if (!quiet)
      stop("cannot find asset `",name,"'")
    return(NULL)
  }
  fn <- name
  ## FIXME: make .b64 support somehow formal ...
  if (length(grep("\\.b64$", name))) {
    asset <- base64decode(asset)
    fn <- gsub("\\.b64$", "", name)
  }
  if (as.file) {
    ad <- tempfile(paste0(notebook$content$id, '-assets'))
    dir.create(ad, FALSE, FALSE, "0700")
    ad <- file.path(ad, fn)
    if (is.raw(asset))
      writeBin(asset, ad)
    else
      writeLines(asset, ad)
    ad
  } else asset
}

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
