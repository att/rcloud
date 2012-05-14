Sys.setlocale(,"en_US.UTF-8")

root = Sys.getenv("ROOT")
if (is.null(root) || nchar(root) == 0) root = "/Users/cscheid/code/rwebsockets_test"
setwd(paste(root,"conf","mbp-cscheid","tmp",sep='/'))

pkgs <- c("XML", "Cairo", "Rserve", "Matrix", "snippets", "FastRWeb", "RMySQL")

host <- tolower(system("hostname -s", TRUE))
cat("Starting Rserve on", host,"\n")

.host <- "mbp-cscheid.local"

cat("Loading packages...\n")
for (pkg in pkgs) cat(pkg, ": ",require(pkg, quietly=TRUE, character.only=TRUE),"\n",sep='')

# fix font mappings
if (exists("CairoFonts")) CairoFonts("Arial:style=Regular","Arial:style=Bold","Arial:style=Italic","Helvetica","Symbol")

cat("Loading data...\n")
dfiles <- Sys.glob(paste(root, "/data/*.RData", sep=''))
if (length(dfiles)) for (fn in dfiles) { cat(" -",fn,"\n"); load(fn) }


## this is called by the WS client as the first thing
.session.init <- function() {
    set.seed(Sys.getpid()) # we want different seeds so we get different file names
    tmpfile <<- paste('tmp-',paste(sprintf('%x',as.integer(runif(4)*65536)),collapse=''),'.tmp',sep='')
    x <- paste(root,"/web.R/common.R",sep='')
    source(x)$value
}
