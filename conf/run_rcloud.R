## check that RCloud is properly installed
##installed <- gsub(".*/([^/]+)/DESCRIPTION$","\\1",Sys.glob(paste0(.libPaths(),"/*/DESCRIPTION")))
installed <- gsub(".*/([^/]+)/DESCRIPTION$","\\1",Sys.glob(paste0(.libPaths(),"/rcloud.support/DESCRIPTION")))

## we will deliberatly load rcloud.support outside of Rserve just to get the installation support - so we can silence the load warning
options(rcs.silence.loadcheck=TRUE)

if (Sys.getlocale() == "C") {
  stop("RCloud does not work in the C locale")
}

if ("rcloud.support" %in% installed && is.function(try(rcloud.support:::check.installation, silent=TRUE))) rcloud.support:::check.installation() else {
  cat("\n***** RCloud is not properly installed, attempting to install ... *****\n\n")
  install.packages("rcloud.support",,c("http://rforge.net","http://r.research.att.com"),type='source')
  rcloud.support:::check.installation()
}

args <- commandArgs(trailingOnly=TRUE)

debug <- isTRUE(nzchar(Sys.getenv("DEBUG")))

Rserve::Rserve(debug, args=c("--RS-conf", args[1], "--vanilla", "--no-save"))
