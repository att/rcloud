.session <- new.env(parent=emptyenv())
.session$device.pixel.ratio <- 1

################################################################################
## evaluation of R code

canonicalize.command <- function(command, language) {
  if (language == "R") {
    command <- paste("```{r}", command, "```\n", sep='\n')
  } else if (language == "Markdown") {
    command
  } else
    stop("Don't know language '" + language + "' - only Markdown or R supported.")
}

rcloud.get.gist.part <- function(partname) {
  .session$current.notebook$content$files[[partname]]$content
}

rcloud.unauthenticated.session.cell.eval <- function(partname, language, silent) {
  notebook.id <- .session$current.notebook$content$id
  if (rcloud.is.notebook.published(notebook.id))
    rcloud.session.cell.eval(partname, language, silent)
  else
    stop("Notebook does not exist or is not published.")
}

rcloud.session.cell.eval <- function(partname, language, silent) {
  command <- rcloud.get.gist.part(partname)
  session.markdown.eval(command, language, silent)
}

rcloud.set.device.pixel.ratio <- function(ratio) {
  .session$device.pixel.ratio <- ratio
}

session.markdown.eval <- function(command, language, silent) {
  command <- canonicalize.command(command, language)
  if (!is.null(.session$device.pixel.ratio))
    opts_chunk$set(dpi=72*.session$device.pixel.ratio)
  
  opts_chunk$set(dev="CairoPNG", tidy=FALSE)

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
rcloud.session.init <- function(...) {
  set.seed(Sys.getpid()) # we want different seeds so we get different file names
  .GlobalEnv$tmpfile <- paste('tmp-',paste(sprintf('%x',as.integer(runif(4)*65536)),collapse=''),'.tmp',sep='')
  start.rcloud(...)
  rcloud.reset.session()
  paste(R.version.string, " --- welcome, ", .session$username, sep='')
}

## WS init
rcloud.anonymous.session.init <- function(...) {
  set.seed(Sys.getpid()) # we want different seeds so we get different file names
  .GlobalEnv$tmpfile <- paste('tmp-',paste(sprintf('%x',as.integer(runif(4)*65536)),collapse=''),'.tmp',sep='')
  start.rcloud.anonymously(...)
  rcloud.reset.session()
  paste(R.version.string, " --- welcome, anonymous user", sep='')
}

rcloud.reset.session <- function() {
  ## use the global workspace as the parent to avoid long lookups across irrelevant namespaces
  .session$knitr.env <- new.env(parent=.GlobalEnv)
  ## FIXME: we should reset the knitr graphics state which lingers as well as the current device which is dirty at this point
  NULL
}
