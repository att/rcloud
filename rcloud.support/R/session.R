.session <- new.env(parent=emptyenv())
.session$device.pixel.ratio <- 1

rcloud.session.notebook.id <- function() {
    .session$current.notebook$content$id
}

rcloud.session.notebook <- function() {
    .session$current.notebook
}

rcloud.has.compute.separation <- function() {
  .session$separate.compute
}

################################################################################
## evaluation of R code

rcloud.get.gist.part <- function(partname, version) {
    nb <- rcloud.session.notebook()
    if (!is.null(version) && !isTRUE(version == nb$content$history[[1]]$version))
        nb <- rcloud.get.notebook(rcloud.session.notebook.id(), version)
    nb$content$files[[partname]]$content
}

rcloud.session.cell.eval <- function(context.id, partname, language, version, silent) {
  ulog("RCloud rcloud.session.cell.eval(", partname, ",", language,",",context.id,",",version,")")
  o <- Rserve.eval({
      ## track which running cell output should go to
      Rserve.context(context.id)
      command <- rcloud.get.gist.part(partname, version)
      res <- if (!is.null(.session$languages[[language]]))
          .session$languages[[language]]$run.cell(command, silent, .session, partname)
      else if (language == "Markdown") {
          session.markdown.eval(command, language, FALSE)
      } else if (language == "Text") {
          command
      }
      else warning("Language ", language, " is unknown; cell ", partname, " ignored.")
      res
  }, parent.frame(), last.value=TRUE, context=context.id)
  if (inherits(o, "Rserve-eval-error")) {
      class(o) <- "cell-eval-error"
      o$traceback <- unlist(o$traceback)
      ## ulog("CELL-EVAL-ERROR: ", paste(capture.output(str(o)), collapse='\n'))
      o
  } else o
}

rcloud.unauthenticated.session.cell.eval <- function(context.id, partname, language, version, silent) {
  notebook.id <- rcloud.session.notebook.id()
  if (rcloud.is.notebook.published(notebook.id))
    rcloud.session.cell.eval(context.id, partname, language, version, silent)
  else
    stop("Notebook does not exist or is not published.")
}

rcloud.authenticated.cell.eval <- rcloud.session.cell.eval

rcloud.set.device.pixel.ratio <- function(ratio) {
  .session$device.pixel.ratio <- ratio
}

session.markdown.eval <- function(command, language, silent) {
  if (!is.null(.session$device.pixel.ratio))
    opts_chunk$set(dpi=72*.session$device.pixel.ratio)
  opts_chunk$set(dev="CairoPNG", tidy=FALSE)

  if (is.null(command) || command == "") command <- " "
  val <- try(markdownToHTML(text=paste(knit(text=command, envir=.GlobalEnv), collapse="\n"),
                            fragment.only=TRUE), silent=TRUE)
  if (inherits(val, "try-error")) {
    # FIXME better error handling
    val <- paste("<pre>", val[1], "</pre>", sep="")
  }
  .rc.oobSend("html.out", val)
}

## we don't expose this because it can only be used by the control process
.signal.to.compute <- function(signal){
    signal <- as.integer(signal)[1L]
    ulog(paste0("CTRL: sending signal ", signal, " to compute process"))
    .Call(Rserve:::Rserve_kill_compute, signal)
}

## WS init
rcloud.compute.init <- function(...) {
    if (!is.null(.session$compute.init.result)) return(.session$compute.init.result)
    set.seed(Sys.getpid()) # we want different seeds so we get different file names
    .session$in.compute <- TRUE
    start.rcloud(...)
    rcloud.reset.session()

    ## set default mirror if not specified to avoid interactive selection
    if (isTRUE("@CRAN@" %in% getOption("repos")))
        options(repos=c(CRAN = if(nzConf("cran.mirror")) getConf("cran.mirror") else "http://cran.r-project.org"))

    ver <- paste0('RCloud ', rcloud.info("version.string"), ' ')
    if (nzchar(rcloud.info("revision"))) ver <- paste0(ver, "(", rcloud.info("branch"), "/", rcloud.info("revision"), "), ")
    ulog("INFO: version: ", ver)

    ## FIXME: we cannot actually store the welcome message because it would appear twice
    .session$compute.init.result <- ""
    host.info <- ""
    if (hasConf("welcome.info")) host.info <- system(paste("echo", getConf("welcome.info")), intern=TRUE)
    paste0(ver, R.version.string, " ", host.info, "<br>Welcome, ", .session$username)
}

## WS init
rcloud.anonymous.compute.init <- function(...) {
    if (!is.null(.session$compute.init.result)) return(.session$compute.init.result)
    set.seed(Sys.getpid()) # we want different seeds so we get different file names
    start.rcloud.anonymously(...)
    rcloud.reset.session()
    ## FIXME: we cannot actually store the welcome message because it would appear twice
    .session$compute.init.result <- ""
    paste(R.version.string, " --- welcome, anonymous user", sep='')
}

rcloud.session.init <- function(...) {
    if (identical(.session$separate.compute, FALSE))
        rcloud.compute.init(...)
    else {
        .session$in.compute <- FALSE
        start.rcloud(...)
        "" ## return "" since the result is a dual promise for both resulting in an array
    }
}

rcloud.anonymous.session.init <- function(...) {
    if (identical(.session$separate.compute, FALSE))
        rcloud.anonymous.compute.init(...)
    else {
        .session$in.compute <- FALSE
        start.rcloud.anonymously(...)
        ""
    }
}

## -- maintain RCS keys associated with a session so it can be identified
.close.session <- function() {
    if (!is.null(.session$sessionID)) {
        key <- usr.key("session", .session$sessionID, "info", notebook="system")
        rcs.rm(key)
        ulog("INFO: RCloud.session: close (", .session$sessionID, "/", .session$info$uname, "/", .session$info$pid, ")")
    }
}

.open.session <- function() {
    .session$sessionID <- generate.uuid()
    url <- if (nzConf("r.script.url")) getConf("r.script.url") else paste0("http://", getConf("host"), ":8080/")
    ui <- unixtools::user.info()
    .session$info <- list(id=.session$sessionID, host=getConf("host"), script.url=url, pid=Sys.getpid(), uname=ui$name, uid=ui$uid, gid=ui$gid, user=.session$username, mode=.session$mode, start=Sys.time())
    key <- usr.key("session", .session$sessionID, "info", notebook="system")
    rcs.set(key, .session$info)
    ulog("INFO: RCloud.session: open (", .session$sessionID, "/", .session$info$uname, "/", .session$info$pid, ")")

    if (is.null(.GlobalEnv$.Rserve.done)) .GlobalEnv$.Rserve.done <- .session.on.exit
}

.session.on.exit <- function() {
    .close.session()
    ulog("INFO: RCloud.session: clean exit (", .session$sessionID, "/", .session$info$uname, "/", .session$info$pid, ")")
}

rcloud.session.info <- function(id=.session$sessionID, user=.session$username)
    rcs.get(usr.key("session", id, "info", notebook="system", user=user))

rcloud.reset.session <- function() {
  ## use the global workspace as the parent to avoid long lookups across irrelevant namespaces
  .session$knitr.env <- new.env(parent=.GlobalEnv)
  ## load all-user and per-user rcloud add-ons
  if (!(identical(.session$mode, "call") || identical(.session$mode, "client"))) {
    addons <- getConf("rcloud.alluser.addons")
    all.addons <- if(is.null(addons)) NULL else strsplit(addons, ' *, *')[[1]]
    user.addons <- rcloud.config.get.user.option("addons")
    user.skip.addons <- rcloud.config.get.user.option("skip-addons");
    addons <- setdiff(c(all.addons, user.addons), user.skip.addons)
    for (x in addons) suppressWarnings(suppressMessages(require(x, character.only=TRUE, quietly=TRUE, warn.conflicts=FALSE)))
  }

  ## close all devices
  while (dev.cur() > 1L) dev.off()

  ## make sure the default device is back to the RCloudDevice
  options(device="RCloudDevice")

  .close.session()
  .open.session()

  NULL
}
