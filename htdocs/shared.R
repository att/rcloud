#'  Try _htmlwidgets/pkg/ first, then _htmlwidgets/user/pkg
resolve.additional.url <- function(url.path.parts = list(), url.roots = c("_htmlwidgets")) {
  root <- url.path.parts[1]
  res <- list(success = FALSE, path = NULL)
  if (root %in% url.roots) {
    pkg <- url.path.parts[2]
    subdir.name <- substring(root, 2)
    path <- c(subdir.name, url.path.parts[-c(1,2)])
    fn <- system.file(package = pkg, do.call(file.path, as.list(path)))
    if(nzchar(fn)) {
      res$success = TRUE
      res$path = fn
    } else if(length(url.path.parts) > 3) {
      user <- url.path.parts[2]
      pkg <- url.path.parts[3]
      path <- c(subdir.name, url.path.parts[-c(1,2,3)])
      lib <- rcloud.home("library", user=user)
      fn <- file.path(lib, pkg, path)
      if (file.exists(fn)) {
        res$success = TRUE
        res$path = fn
      }
    }
  }
  invisible(res)
}

#' Try pkg/www, and the user library
resolve.url <- function(url.path.parts = list(), url.root = "www") {
  pkg <- url.path.parts[1]
  base <- paste(c(url.root, url.path.parts[-1]), collapse="/")
  res <- list(success = FALSE, path = NULL)
  fn <- system.file(base, package=pkg)
  if (nzchar(fn)) {
    res$success = TRUE
    res$path = fn
  } else if(length(url.path.parts) > 2) {
    ## try to interpret as user/pkg
    usr <- url.path.parts[1]
    pkg <- url.path.parts[2]
    base <- paste(c(url.root, url.path.parts[-c(1,2)]), collapse="/")
    lib <- rcloud.home("library", user=usr)
    fn <- file.path(lib, pkg, base)
    if (file.exists(fn)) {
      res$success = TRUE
      res$path = fn
    }
  }
  invisible(res)
}

run <- function(url, query, body, headers) {
  if (is.null(path.info)) stop("missing path in the URL")
  pex <- strsplit(path.info, "/+")[[1]]
  if (any(pex == "..")) stop("invalid component in the path URL")

  mapping.result <- resolve.additional.url(url.path.parts = pex)
  
  if(!mapping.result$success) {
    exported.folders <- list("www", "lib")
    exported.folders.mappings <- lapply(exported.folders, function(x) { resolve.url(url.path.parts = pex, url.root = x) })
    exported.folders.resolved <- Filter(function(x) {x$success}, exported.folders.mappings)
    if(length(exported.folders.resolved) > 0) {
      mapping.result <- exported.folders.resolved[[1]]
    } else {
      # So a path is displayed in the error message
      mapping.result <- exported.folders.mappings[[1]]
    }
  }
  
  if (!mapping.result$success || !file.exists(mapping.result$path))
    return(list(paste0("ERROR: item '", path.info, "' not found"), "text/plain", character(), 404L))
  fn <- mapping.result$path
  s <- file.info(fn)$size
  f <- file(fn, "rb")
  r <- readBin(f, raw(), s)
  close(f)
  list(r, mime::guess_type(fn), "Cache-Control: max-age=3600")
}
