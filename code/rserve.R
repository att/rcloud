require(rcloud.support)

## This script will be loaded when Rserve starts
## and before any client connect.
## Use it to pre-load packages and any data you want
## as well as define any global variables you want all
## scripts to see

## Today, pretty much everyone speaks UTF-8, it makes the life easier
Sys.setlocale(,"en_US.UTF-8")

## --- RCloud part folows ---
## WS init
.session.init <- function() {
    set.seed(Sys.getpid()) # we want different seeds so we get different file names
    tmpfile <<- paste('tmp-',paste(sprintf('%x',as.integer(runif(4)*65536)),collapse=''),'.tmp',sep='')
    start.rcloud()
    ## x <- paste(configuration.root,"/common.R",sep='')
    ## if (file.exists(x))
    ##   source(x)$value
    ## else {
    ##   self.oobSend(list("boot.failure"))
    ##   NULL
    ##   ## "ERROR: Could not open common.R!" # R.version.string
    ## }
}

## this serves Rserve's built-in HTTP server
.http.request <- function(url, query, body, headers, ...) {
  ## pass-thru requests for the built-in R help system
  if (grepl("^/library/|^/doc/", url)) return(tools:::httpd(url, query, body, headers, ...))
  ## process everything else
  port <- ""
  host <- if (length(headers)) {
    h <- strsplit(rawToChar(headers), "[\n\r]+")[[1]]
    l <- strsplit(h, "[\t ]*:[ \t]*")
    names(l) <- sapply(l, function(x) tolower(x[1]))
    if (length(l[["host"]]) > 2L) port <- paste(":", l[["host"]][3L], sep='')
    l[["host"]][2L]
  } else NULL
  if (is.null(host)) host <- "localhost"
  hosturl <- paste("http://", host, port, sep='')
  
  if (isTRUE(url == "") || isTRUE(url == "/")) url <- "/index.html"

  ## serve files from the htdocs directory
  fn <- paste(.rcloud.conf$root, "htdocs", url, sep='/')
  if (!file.exists(fn))
    list(paste("ERROR: item '", fn, "' not found!", sep=''),"text/html", character(), 404L)
  else {
    ## if the file is an R script, run it (via FastRWeb) instead of serving the content
    if (length(grep("\\.R$", fn))) {
      source(fn, TRUE)
      return(run(url, query, body, headers))
    }
    s <- file.info(fn)$size
    f <- file(fn, "rb")
    r <- readBin(f, raw(), s)
    close(f)
    ct <- "text/html"
    ctl <- list("text/javascript"=".js", "image/png"=".png",
                "image/jpeg"=".jpg", "image/jpeg"=".jpeg", "text/css"=".css")
    for (i in seq_along(ctl))
      if (length(grep(paste("\\",ctl[[i]],"$",sep=''), fn, TRUE))) {
        ct <- names(ctl)[i]
        break
      }
    list(r, ct)
  }
}

configure.rcloud()
