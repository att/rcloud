.session <- new.env(parent=emptyenv())
.session$device.pixel.ratio <- 1

################################################################################
## evaluation of R code

rcloud.get.gist.part <- function(partname) {
  .session$current.notebook$content$files[[partname]]$content
}

rcloud.unauthenticated.session.cell.eval <- function(context.id, partname, language, silent) {
  notebook.id <- .session$current.notebook$content$id
  if (rcloud.is.notebook.published(notebook.id))
    rcloud.session.cell.eval(context.id, partname, language, silent)
  else
    stop("Notebook does not exist or is not published.")
}

rcloud.session.cell.eval <- function(context.id, partname, language, silent) {
  ulog("RCloud rcloud.session.cell.eval(", partname, ",", language,")")
  command <- rcloud.get.gist.part(partname)
  rcloud.authenticated.cell.eval(context.id, command, language, silent)
}

rcloud.authenticated.cell.eval <- function(context.id, command, language, silent) {
  self.oobSend(list("start.cell.output", context.id))
  if (!is.null(.session$languages[[language]]))
    .session$languages[[language]]$run.cell(command, silent, .session)
  else if (language == "Markdown") {
    session.markdown.eval(command, language, FALSE)
  } else if (language == "Text") {
    command
  }
  self.oobSend(list("end.cell.output", context.id))
}

rcloud.set.device.pixel.ratio <- function(ratio) {
  .session$device.pixel.ratio <- ratio
}

session.markdown.eval <- function(command, language, silent) {
  if (!is.null(.session$device.pixel.ratio))
    opts_chunk$set(dpi=72*.session$device.pixel.ratio)
  if (!is.null(.session$disable.warnings))
    opts_chunk$set(warning=FALSE)
  else
    opts_chunk$set(warning=TRUE)
  if (!is.null(.session$disable.echo))
    opts_chunk$set(echo=FALSE)
  else
    opts_chunk$set(echo=TRUE)
  # opts_chunk$set(prompt=TRUE)
  opts_chunk$set(dev="CairoPNG", tidy=FALSE)

  if (command == "") command <- " "
  val <- try(markdownToHTML(text=paste(knit(text=command, envir=.GlobalEnv), collapse="\n"),
                            fragment=TRUE), silent=TRUE)
  if (inherits(val, "try-error")) {
    # FIXME better error handling
    val <- paste("<pre>", val[1], "</pre>", sep="")
  }
  self.oobSend(list("html.out", val))
}

## WS init
rcloud.session.init <- function(...) {
  set.seed(Sys.getpid()) # we want different seeds so we get different file names
  .GlobalEnv$tmpfile <- paste('tmp-',paste(sprintf('%x',as.integer(runif(4)*65536)),collapse=''),'.tmp',sep='')
  start.rcloud(...)
  rcloud.reset.session()

  ## set default mirror if not specified to avoid interactive selection
  if (isTRUE("@CRAN@" %in% getOption("repos")))
      options(repos=c(CRAN = if(nzConf("cran.mirror")) getConf("cran.mirror") else "http://cran.r-project.org"))

  ver <- paste0('RCloud ', rcloud.info("version.string"), ' ')
  if (nzchar(rcloud.info("revision"))) ver <- paste0(ver, "(", rcloud.info("branch"), "/", rcloud.info("revision"), "), ")
  paste0(ver, R.version.string, "<br>Welcome, ", .session$username)
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
  ## load all-user and per-user rcloud add-ons
  all.addons <- rcloud.config.get.alluser.option("addons")
  user.addons <- rcloud.config.get.user.option("addons")
  lapply(c(all.addons,user.addons), function(x) { suppressWarnings(suppressMessages(require(x, character.only=TRUE))) })

  ## close all devices
  while (dev.cur() > 1L) dev.off()

  ## make sure teh default device is back to the RCloudDevice
  options(device="RCloudDevice")
  
  NULL
}
