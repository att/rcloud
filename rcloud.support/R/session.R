.session <- new.env(parent=emptyenv())

################################################################################
## evaluation of R code

session.markdown.eval <- function(command, silent) {
  opts_chunk$set(dev="CairoSVG", tidy=FALSE)
  val <- try(markdownToHTML(text=paste(knit(text=command, envir=.session$knitr.env), collapse="\n"),
                            fragment=TRUE), silent=TRUE)
  if (!inherits(val, "try-error") && !silent && rcloud.debug.level()) print(val)
  if (inherits(val, "try-error")) {
    # FIXME better error handling
    paste("<pre>", val[1], "</pre>", sep="")
  } else {
    val
  }
}

## FIXME: won't work, global file!
session.log <- function(user, v) {
  vs <- strsplit(v, "\n")
  for (i in 1:length(vs[[1]])) {
    cat(paste(paste(Sys.time(), user, vs[[1]][i], sep="|"),"\n"),
        file=pathConf("data.root", "history", "main_log.txt"), append=TRUE)
  }
}

## WS init
session.init <- function(...) {
  set.seed(Sys.getpid()) # we want different seeds so we get different file names
  .GlobalEnv$tmpfile <- paste('tmp-',paste(sprintf('%x',as.integer(runif(4)*65536)),collapse=''),'.tmp',sep='')
  start.rcloud(...)
  reset.session()
  paste(R.version.string, " --- welcome, ", .session$username, sep='')
}

reset.session <- function() {
  ## use the global workspace as the parent to avoid long lookups across irrelevant namespaces
  .session$knitr.env <- new.env(parent=.GlobalEnv)
  ## FIXME: we should reset the knitr graphics state which lingers as well as the current device which is dirty at this point
  NULL
}
