## supported paths:
## [<user>/]<package>/<path>   -> www inside <package>
## _htmlwidgets/[<user>/]<pkg>/<path>  -> htmlwidgets inside <package>
run <- function(url, query, body, headers) {
  if (is.null(path.info)) stop("missing path in the URL")
  pex <- strsplit(path.info, "/+")[[1]]
  pkg <- pex[1]
  pex <- pex[-1]
  if (any(pex == "..")) stop("invalid component in the path URL")

  candidate.dirs <- c("www","lib")

  ## _htmlwidgets is a special hack to get at the "htmlwidgets" directory
  ## _htmlwidgets/[<user>/]<pkg>/<path>
  if (pkg %in% c("_htmlwidgets")) {
      candidate.dirs <- "htmlwidgets"
      pkg <- pex[1]
      pex <- pex[-1]
  }

  fn <- "" ## default = not found
  tried <- c() ## for troubleshooting
  ## try paths within package
  for (candidate.dir in candidate.dirs) {
    base <- paste(c(candidate.dir, pex), collapse="/")
    tried <- c(tried, paste0(pkg, ':', base))
    ## check if the file exists in pkg
    if (nzchar(fn <- system.file(base, package=pkg)))
      break
  }
  ## if not, try to interpret as <user>/<pkg> by looking in user's library
  if (!nzchar(fn) && length(pex) > 1) {
    usr <- pkg
    pkg <- pex[1]
    base <- paste(c(candidate.dir, pex[-1]), collapse="/")
    lib <- rcloud.home("library", user=usr)
    fn <- file.path(lib, pkg, base)
    tried <- c(tried, fn)
    if (!file.exists(fn))
      fn <- ""
  }
  if (!nzchar(fn) || !file.exists(fn))
    return(list(paste0("ERROR: item '", path.info, "' not found, tried\n", paste0(tried,collapse='\n')), "text/plain", character(), 404L))
  s <- file.info(fn)$size
  f <- file(fn, "rb")
  r <- readBin(f, raw(), s)
  close(f)
  list(r, mime::guess_type(base), "Cache-Control: max-age=3600")
}
