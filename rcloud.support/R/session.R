.session <- new.env(parent=emptyenv())

### NOTE: it's unclear if we still use this!
### I suspect it's only used by the non-knitr versions

### create a new device constructor
WSdev <- function(width, height, ...) {
  if (missing(width)) width <- .session$WSdev.width
  if (missing(height)) height <- .session$WSdev.height
   dev <- Cairo(width, height, type='raster', bg='white', ...)
   Cairo.onSave(dev, onSave)
   ## FIXME: if user code messes with devices, we may need to track more than one
   .session$old.sn <- Cairo.serial()
   self.oobSend(list("dev.new", as.integer(dev)))
   dev
}

## notify client that a plot has been finalized
onSave <- function(dev, page, cmd="img.url.final") {
    fn <- paste(tmpfile, page, "png", sep='.')
    writePNG(Cairo.capture(dev), fn)
    self.oobSend(list(cmd , sprintf("http://%s/cgi-bin/R/ws.tmp?mime=image/png&cc=%.8f&file=%s", .host, runif(1), fn, sep='')))
    if (dev != dev.cur()) self.oobSend(list("dev.close", as.integer(dev))) else .session$old.sn <- Cairo.serial()
    TRUE
}

## evaluation round (so we actually use it in the new version?!?)
session.eval <- function(x, command_id, silent) {
  val <- try(x, silent=TRUE)
  if (!inherits(val, "try-error") && !silent) print(val)
  if (.Device == "Cairo") {
    sn <- Cairo.serial()
    if (sn != .session$old.sn) {
      .session$old.sn <- sn
      onSave(dev.cur(), 0L, "img.url.update")
    }
  }
  if (missing(command_id)) {
    list("eval", val)
  } else {
    list("eval", val, command_id)
  }
}

## evaluation tound - new version (?)
session.markdown.eval <- function(x, command_id, silent) {
  val <- try(x, silent=TRUE)
  if (!inherits(val, "try-error") && !silent) print(val)
  if (.Device == "Cairo") {
    sn <- Cairo.serial()
    if (sn != .session$old.sn) {
      .session$old.sn <- sn
      onSave(dev.cur(), 0L, "img.url.update")
    }
  }
  if (missing(command_id)) {
    list("markdown.eval", val)
  } else {
    list("markdown.eval", val, command_id)
  }
}

## old version?
session.log <- function(user, v) {
  vs <- strsplit(v, "\n")
  for (i in 1:length(vs[[1]])) {
    cat(paste(paste(Sys.time(), user, vs[[1]][i], sep="|"),"\n"),
        file=paste(.rc.conf$data.root, "history", "main_log.txt",sep='/'), append=TRUE)
  }
}


## WS init
session.init <- function(...) {
  set.seed(Sys.getpid()) # we want different seeds so we get different file names
  .GlobalEnv$tmpfile <- paste('tmp-',paste(sprintf('%x',as.integer(runif(4)*65536)),collapse=''),'.tmp',sep='')
  start.rcloud(...)
  paste(R.version.string, " --- welcome, ", .session$username, sep='')
}

