#github.install <- function(user, repo, base, branch="master") {
#  https://github.research.att.com/_nodeload/kshirley/LDAtool/tar.gz/master
#}

check.installation <- function(install=TRUE, force.all=FALSE, update=FALSE) {
  ## packages that we have to pull from github
  on.github      <- c("httr",   "github")
  on.github.repo <- c("httr",   "rgithub")
  on.github.user <- c("hadley", "cscheid")

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
      pwd <- getwd()
      repos <- c("http://rforge.net", "http://r.research.att.com")
      needed <- pl[!ok]
      ## check if any of the dependencies are from github
      github.pkg <- on.github[on.github %in% needed]
      github.user <- on.github.user[on.github %in% needed]
      github.repo <- on.github.repo[on.github %in% needed]
      if (length(github.pkg)) { ## have to create the github repo
         github.tmp <- file.path(tempdir(), "rc.git.repo")
   	 dir.create(dst <- paste0(github.tmp, "/src/contrib"), recursive=TRUE)
	 for (i in seq.int(github.pkg)) {
	    pkg <- github.pkg[i]
	    rep <- github.repo[i]
	    usr <- github.user[i]
	    download.file(paste0("https://codeload.github.com/", usr, "/", rep, "/zip/master"),
	    zip <- paste0(github.tmp, "/src/contrib/", pkg, ".zip"), method=dl.method)
            unzip(zip, exdir = dst)
	    setwd(dst)
	    file.rename(paste0(rep, "-master"), pkg)
	    system(paste(RBIN <- shQuote(file.path(R.home(), "bin", "R")), "CMD", "build", pkg))
	    src <- Sys.glob(paste0(dst, "/", pkg, "_*.tar.gz"))
	    if (!length(src))
	      stop(paste0("**** ERROR: could not create source tar ball for ", usr, "/", pkg, "!"))
	 }
	 tools::write_PACKAGES(dst,, "source")
         repos <- c(paste0("file:///", github.tmp), repos)
      }
      setwd(pwd)
      if (update) update.packages(, repos, type='source', ask=FALSE) else install.packages(needed,, repos, type='source')
      ## re-fetch installed
      installed <- gsub(".*/([^/]+)/DESCRIPTION$","\\1",Sys.glob(paste0(.libPaths(),"/*/DESCRIPTION")))
      ok <- pl %in% installed
      if (!all(ok)) stop("**** FATAL: one or more dependencied sould not be installed")
    }
  }
  TRUE
}
