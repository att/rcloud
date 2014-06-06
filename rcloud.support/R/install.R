check.installation <- function(install=TRUE, force.all=FALSE, update=FALSE) {
  dl.method <- "internal"
  if (isTRUE(system("wget --version >/dev/null 2>&1") == 0L)) dl.method <- "wget" else if (isTRUE(system("curl --version >/dev/null 2>&1") == 0L)) dl.method <- "curl"

  installed <- gsub(".*/([^/]+)/DESCRIPTION$","\\1",Sys.glob(paste0(.libPaths(),"/*/DESCRIPTION")))
  ## let's read our own description file
  file <- system.file("Meta", "package.rds", package="rcloud.support")
  md <- readRDS(file)
  ## get all dependencies
  pl <- unique(unlist(lapply(c("Depends","Imports","Suggests"), function(i) names(md[[i]]))))
  ok <- pl %in% installed
  if (force.all || update) ok <- rep(FALSE, length(pl))
  if (any(!ok)) {
    cat("\n***** missing dependencies:", paste(pl[!ok], collapse=', '), "\n")
    if (install) {
      repos <- c("http://rforge.net", "http://r.research.att.com")
      needed <- pl[!ok]

      if (update) update.packages(, repos, type='source', ask=FALSE) else install.packages(needed,, repos, type='source')
      ## re-fetch installed
      installed <- gsub(".*/([^/]+)/DESCRIPTION$","\\1",Sys.glob(paste0(.libPaths(),"/*/DESCRIPTION")))
      ok <- pl %in% installed
      if (!all(ok)) stop("**** FATAL: one or more dependencied sould not be installed")
    }
  }
  TRUE
}
