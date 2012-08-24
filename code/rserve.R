## This script will be loaded when Rserve starts
## and before any client connect.
## Use it to pre-load packages and any data you want
## as well as define any global variables you want all
## scripts to see

## this is NO LONGER USED -- it is present for compatibiliy only and will go away
.host <- "localhost"

## Today, pretty much everyone speaks UTF-8, it makes the life easier
Sys.setlocale(,"en_US.UTF-8")

## it is useful to have access to the root of your
## installation from R scripts -- for RCloud this is *mandatory*
root <- Sys.getenv("ROOT")
if (is.null(root) || nchar(root) == 0) root <- "/var/FastRWeb"
cat("Using ROOT =", root, "\n")

# CONFROOT/DATAROOT are purely optional
# Whom are we kidding? Although it may be nice to abstract out all paths
# this is far from complete (what about htdocs?) and not very practical
# and this likely to go away (it's gone from the start script already)
# until replaced by something more sensible (if at all)
configuration.root <- Sys.getenv("CONFROOT")
if (!nzchar(configuration.root)) configuration.root <- paste(root, "code", sep='/')
cat("Using CONFROOT =", configuration.root, "\n")

data.root <- Sys.getenv("DATAROOT")
if (!nzchar(data.root)) data.root <- paste(root, "data", sep='/')
cat("Using DATAROOT =", data.root, "\n")

## load any local configuration (optional)
local.conf <- paste(configuration.root, "local.R", sep='/')
if (file.exists(local.conf)) source(local.conf)

## run the server in the "tmp" directory of the root in
## case some files need to be created
tmp.dir <- paste(root,"tmp",sep='/')
if (!file.exists(tmp.dir)) dir.create(tmp.dir)
setwd(tmp.dir)

## if you have multiple servers it's good to know which machine this is
host <- tolower(system("hostname -s", TRUE))
cat("Starting Rserve on", host,"\n")

## This is jsut a friendly way to load package and report success/failure
## You will definiteily need FastRWeb, others are optional
pkgs <- c("Cairo", "FastRWeb", "Rserve", "png", "knitr", "markdown")
cat("Loading packages...\n")
for (pkg in pkgs) cat(pkg, ": ",require(pkg, quietly=TRUE, character.only=TRUE),"\n",sep='')

## we actually need knitr ...
opts_knit$set(global.device=TRUE)

## fix font mappings in Cairo -- some machines require this
if (exists("CairoFonts")) CairoFonts("Arial:style=Regular","Arial:style=Bold","Arial:style=Italic","Helvetica","Symbol")

## Load any data you want
data.fn <- paste(root, "code", "data.RData", sep='/')
if (isTRUE(file.exists(data.fn))) {
  cat("Loading data...\n")
  load(data.fn)
}

## --- RCloud part folows ---

## WS init
.session.init <- function() {
    set.seed(Sys.getpid()) # we want different seeds so we get different file names
    tmpfile <<- paste('tmp-',paste(sprintf('%x',as.integer(runif(4)*65536)),collapse=''),'.tmp',sep='')
    x <- paste(configuration.root,"/common.R",sep='')
    if (file.exists(x))
      source(x)$value
    else {
      self.oobSend(list("boot.failure"))
      NULL
      ## "ERROR: Could not open common.R!" # R.version.string
    }
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
  fn <- paste(root, "htdocs", url, sep='/')
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

## This is a bit of a hack (errr.. I mean a serious hack)
## we fake out R to think that Rhttpd is running and hijack the browser
## to pass all requests into the client
local({
  env <- environment(tools:::startDynamicHelp)
  unlockBinding("httpdPort", env)
  assign("httpdPort", 1L, env)
  lockBinding("httpdPort", env)
})
options(help_type="html")
options(browser = function(url, ...) if(grepl("^http://127.0.0.1:", url)) self.oobSend(list("browsePath", gsub("^http://[^/]+", "", url))) else self.oobSend(list("browseURL", url)))

## while at it, pass other requests as OOB, too
options(pager = function(...) self.oobSend(list("pager", ...)))
options(editor = function(...) self.oobSend(list("editor", ...)))

## and some options that may be of interest
options(demo.ask = FALSE)
options(example.ask = FALSE)
options(menu.graphics = FALSE)
