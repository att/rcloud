## supported paths:
## [<user>/]<package>/<path>   -> www inside <package>
## _htmlwidgets/[<user>/]<pkg>/<path>  -> htmlwidgets inside <package>
run <- function(url, query, body, headers) {
  if (is.null(path.info)) stop("missing path in the URL")
  pex <- strsplit(path.info, "/+")[[1]]
  pkg <- pex[1]
  pex <- pex[-1]
  if (any(pex == "..")) stop("invalid component in the path URL")

  ## NOTE: we only support a single option here, but may want to support more in the future
  candidate.dirs <- c("www", "lib")

  ## _htmlwidgets is a special hack to get at the "htmlwidgets" directory
  ## _htmlwidgets/[<user>/]<pkg>/<path>
  if (pkg %in% c("_htmlwidgets")) {
      candidate.dirs <- "htmlwidgets"
      pkg <- pex[1]
      pex <- pex[-1]
  }

  fn <- "" ## default = not found
  base <- file.path(candidate.dirs, paste(pex, collapse="/"))
  ## check if the file exists in pkg
  if (!nzchar(fn <- system.file(base, package=pkg)[1L]) && length(pex) > 1) {
      ## if not, try to interpret as <user>/<pkg> by looking in user's library
      usr <- pkg
      pkg <- pex[1]
      base <- file.path(candidate.dirs, paste(pex[-1], collapse="/"))
      lib <- rcloud.home("library", user=usr)
      fn <- file.path(lib, pkg, base)
      fn <- fn[file.exists(fn)]
      fn <- if (!length(fn)) "" else fn[1L]
  }
  if (!nzchar(fn))
    return(list(paste0("ERROR: item '", path.info, "' [", base, "] not found"), "text/plain", character(), 404L))
  tryCatch({
      s <- file.info(fn)$size
      f <- file(fn, "rb")
      r <- readBin(f, raw(), s)
      close(f)
  }, error=function(e) return(list(paste0("ERROR: unable to read '", path.info, "' [", base, "]: ", as.character(e)), "text/plain", character(), 404L)))
  list(r, mime::guess_type(base), "Cache-Control: max-age=3600")
}
