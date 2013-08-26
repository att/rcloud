## check that RCloud is properly installed
##installed <- gsub(".*/([^/]+)/DESCRIPTION$","\\1",Sys.glob(paste0(.libPaths(),"/*/DESCRIPTION")))
installed <- gsub(".*/([^/]+)/DESCRIPTION$","\\1",Sys.glob(paste0(.libPaths(),"/rcloud.support/DESCRIPTION")))

if ("rcloud.support" %in% installed && is.function(try(rcloud.support:::check.installation, silent=TRUE))) rcloud.support:::check.installation() else {
  cat("\n***** RCloud is not properly installed, attempting to install ... *****\n\n")
  install.packages("rcloud.support",,c("http://rforge.net","http://r.research.att.com"),type='source')
  rcloud.support:::check.installation()
}

args <- commandArgs(trailingOnly=TRUE)

debug <- isTRUE(nzchar(Sys.getenv("DEBUG")))
Rserve::Rserve(debug, args=c("--RS-conf", args[1], "--vanilla", "--no-save"))
