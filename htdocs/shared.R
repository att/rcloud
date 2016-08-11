run <- function(url, query, body, headers) {
  if (is.null(path.info)) stop("missing path in the URL")
  pex <- strsplit(path.info, "/+")[[1]]
  pkg <- pex[1]
  pex <- pex[-1]
  if (any(pex == "..")) stop("invalid component in the path URL")

  ## Try _htmlwidgets/pkg/ first
  fn <- ""
  if (pkg %in% c("_htmlwidgets")) {
    path <- c(substring(pkg, 2), pex[-1])
    fn <- system.file(package = pex[1], do.call(file.path, as.list(path)))
  }

  ## Otherwise try pkg/www, and finally the user library
  base <- paste(c("www", pex), collapse="/")
  if (!nzchar(fn) &&
      !nzchar(fn <- system.file(base, package=pkg)) && length(pex) > 1) {
      ## try to interpret as user/pkg
      usr <- pkg
      pkg <- pex[1]
      base <- paste(c("www", pex[-1]), collapse="/")
      lib <- rcloud.home("library", user=usr)
      if (!file.exists(fn <- file.path(lib, pkg, base)))
          fn <- ""
  }
  if (!nzchar(fn) || !file.exists(fn))
    return(list(paste0("ERROR: item '", path.info, "' [", base, "] not found"), "text/plain", character(), 404L))
  s <- file.info(fn)$size
  f <- file(fn, "rb")
  r <- readBin(f, raw(), s)
  close(f)
  list(r, mime::guess_type(base), "Cache-Control: max-age=3600")
}
