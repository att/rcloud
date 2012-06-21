## This script will be loaded when Rserve starts
## and before any client connect.
## Use it to pre-load packages and any data you want
## as well as define any global variables you want all
## scripts to see

.host <- "localhost"

## Today, pretty much everyone speaks UTF-8, it makes the life easier
Sys.setlocale(,"en_US.UTF-8")

## it is useful to have access to the root of your
## installation from R scripts
root <- Sys.getenv("ROOT")
if (is.null(root) || nchar(root) == 0) root <- "/var/FastRWeb"

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
pkgs <- c("Cairo", "FastRWeb", "Rserve", "png")
cat("Loading packages...\n")
for (pkg in pkgs) cat(pkg, ": ",require(pkg, quietly=TRUE, character.only=TRUE),"\n",sep='')

## fix font mappings in Cairo -- some machines require this
if (exists("CairoFonts")) CairoFonts("Arial:style=Regular","Arial:style=Bold","Arial:style=Italic","Helvetica","Symbol")

## Load any data you want
data.fn <- paste(root, "code", "data.RData", sep='/')
if (isTRUE(file.exists(data.fn))) {
  cat("Loading data...\n")
  load(data.fn)
}

## WS init
.session.init <- function() {
    set.seed(Sys.getpid()) # we want different seeds so we get different file names
    tmpfile <<- paste('tmp-',paste(sprintf('%x',as.integer(runif(4)*65536)),collapse=''),'.tmp',sep='')
    x <- paste(root,"/code/common.R",sep='')
    if (file.exists(x))
      source(x)$value
    else R.version.string
}

.http.request <- function(url, query, body, headers, ...) {
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
  fn <- paste(root, url, sep='/')
  if (!file.exists(fn))
    list(paste("ERROR: item '", fn, "' not found!", sep=''),"text/html", character(), 404L)
  else {
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
      if (length(grep(paste("\\",ctl[[i]],"$",sep=''), TRUE))) {
        ct <- names(ctl)[i]
        break
      }
    list(r, ct)
  }
}

  
