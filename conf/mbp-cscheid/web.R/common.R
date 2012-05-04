# create a new device constructor
WSdev <- function(...) {
   dev <- Cairo(400, 400, type='raster', bg='white', ...)
   Cairo.onSave(dev, onSave)
   old.sn <<- Cairo.serial()
   self.oobSend(list("dev.new",as.integer(dev)))
   dev
}

onSave <- function(dev, page, cmd="img.url.final") {
    fn <- paste(tmpfile, page, "png", sep='.')
    writePNG(Cairo.capture(dev), fn)
    self.oobSend(list(cmd , sprintf("http://localhost/cgi-bin/R/ws.tmp?mime=image/png&cc=%.8f&file=%s",runif(1),fn,sep='')))
    if (dev != dev.cur()) self.oobSend(list("dev.close", as.integer(dev))) else old.sn <<- Cairo.serial()
    TRUE
}

.session.eval <- function(x, command_id, silent) {
  val <- try(x, silent=TRUE)
  if (!inherits(val, "try-error") && !silent) print(val)
  if (.Device == "Cairo") {
    sn <- Cairo.serial()
    if (sn != old.sn) {
      old.sn <<- sn
      onSave(dev.cur(), 0L, "img.url.update")
    }
  }
  if (missing(command_id)) {
    list("eval", val)
  } else {
    list("eval", val, command_id)
  }
}

wplot <- function(x, y, width=480, height, ...) {
  if (missing(y)) {
    y <- x
    x <- seq.int(y)
  }
  if (missing(height)) height <- width
  invisible(self.oobSend(list("scatterplot",x,y,c(width,height))))
}

################################################################################
# rcloud_status stuff goes here

rcloud.list.initial.filenames <- function(user) {
  list.files(path=paste("..","userfiles", user, sep='/'))
}

rcloud.load.user.file <- function(user, filename) {
  readLines(paste("..","userfiles",user,filename,sep='/'))
}

rcloud.save.to.user.file <- function(user, filename, content) {
  filename <- paste("..","userfiles",user,filename,sep='/');
  invisible(write(content, filename))
}

################################################################################
# setup the r-side environment

options(device=WSdev)
setwd(paste(root,"/tmp",sep=''))
# as the last thing, return the R version
R.version.string
