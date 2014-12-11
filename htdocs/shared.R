run <- function(url, query, body, headers) {
  if (is.null(path.info)) stop("missing path in the URL")
  splitPath <- strsplit(path.info, "&")[[1]]

  pex <- strsplit(splitPath[1], "/+")[[1]]

  if(!is.na(splitPath[2])){
    getVal <- strsplit(splitPath[2], "=")[[1]][2]
    search.path <- strsplit(getVal, ",")[[1]]
  }
  else{
    search.path <- c("rcloud.support", "shiny")
  }

  if (all(pex != "shared")) {
      pex <- pex[2:length(pex)]
  }

  if (any(pex == "..")) stop("invalid component in the path URL")
  base <- paste(c("www", pex), collapse="/")

  for (pkg in search.path) if(nzchar(fn <- system.file(base, package=pkg))) break
  if (!nzchar(fn) || !file.exists(fn))
    return(list(paste0("ERROR: item '", path.info, "' [", base, "] not found"), "text/html", character(), 404L))
  s <- file.info(fn)$size
  f <- file(fn, "rb")
  r <- readBin(f, raw(), s)
  close(f)
  list(r, mime::guess_type(base))
}
