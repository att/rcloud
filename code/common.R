library(knitr)
library(markdown)

.session <- new.env(parent=emptyenv())
.session$WSdev.width <- 300
.session$WSdev.height <- 300

# create a new device constructor
WSdev <- function(width, height, ...) {
  if (missing(width)) width <- .session$WSdev.width
  if (missing(height)) height <- .session$WSdev.height
   dev <- Cairo(width, height, type='raster', bg='white', ...)
   Cairo.onSave(dev, onSave)
   old.sn <<- Cairo.serial()
   self.oobSend(list("dev.new",as.integer(dev)))
   dev
}

onSave <- function(dev, page, cmd="img.url.final") {
    fn <- paste(tmpfile, page, "png", sep='.')
    writePNG(Cairo.capture(dev), fn)
    self.oobSend(list(cmd , sprintf("http://%s/cgi-bin/R/ws.tmp?mime=image/png&cc=%.8f&file=%s",.host,runif(1),fn,sep='')))
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

.session.markdown.eval <- function(x, command_id, silent) {
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
    list("markdown.eval", val)
  } else {
    list("markdown.eval", val, command_id)
  }
}

.session.log <- function(user, v) {
  vs <- strsplit(v, "\n")
  for (i in 1:length(vs[[1]])) {
    cat(paste(paste(Sys.time(), user, vs[[1]][i], sep="|"),"\n"),
        file=paste(data.root,"history","main_log.txt",sep='/'), append=TRUE)
  }
}

wplot <- function(x, y, ...) {
  opts <- list(...)
  if (missing(y)) {
    y <- x
    x <- seq.int(y)
  }
  if (is.null(opts$width)) {
    width <- 300
  } else {
    width <- opts$width
  }
  if (is.null(opts$height)) {
    height <- width
  } else {
    height <- opts$height
  }

  if (is.null(opts$group)) {
    if (is.null(.session$group)) {
      .session$group <- 1L
      .session$group.len <- length(x)
    } else {
      if (.session$group.len != length(x)) {
        .session$group <- .session$group + 1L
        .session$group.len <- length(x)
      }
    }
    opts$group <- .session$group
  }
  if (!is.null(opts$kind)) {
    invisible(self.oobSend(list("scatterplot",x,y,opts$kind,c(width,height),opts$group)))
  } else {
    invisible(self.oobSend(list("scatterplot",x,y,c(width,height),opts$group)))
  }
}

select <- function(what, group) {
  if (missing(group)) group <- .session$group
  if (is.numeric(what)) what <- seq.int(.session$group.len) %in% what 
  invisible(self.oobSend(list("select", as.integer(group), as.integer(what))))
}

fplot <- function()
{
  invisible(self.oobSend(list("iframe", "http://cscheid.github.com/facet/demos/osm/osm.html", c(960, 600))))
}

wgeoplot <- function(lats, lons, col=1L)
{
  if (is.null(dim(col))) col <- col2rgb(col) / 255
  #col <- rep(col, length.out = 3 * length(lats))
  col <- as.double(col)
  invisible(self.oobSend(list("facet_osm_plot", lats, lons, col, c(960, 600))))
}

wtour <- function(...)
{
  opts <- list(...)
  invisible(self.oobSend(list("facet_tour_plot", opts)))
}

################################################################################
# rcloud_status stuff goes here

rcloud.exec.user.file <- function(user, filename)
{
  .session.eval(eval(parse(text=readLines(rcloud.user.file.name(user, filename)))),
                silent=TRUE)
}

rcloud.user.file.name <- function(user, filename) {
  paste(data.root,"userfiles",user,filename,sep='/')
}

rcloud.list.all.initial.filenames <- function() {
  users <- list.files(path=paste(data.root, "userfiles", sep='/'));
  lapply(users, function(user) {
    list(user, list.files(path=paste(data.root, "userfiles", user, sep='/')))
  });
}

rcloud.list.initial.filenames <- function(user) {
  list.files(path=paste(data.root, "userfiles", user, sep='/'))
}

rcloud.load.user.file <- function(user, filename) {
  readLines(rcloud.user.file.name(user, filename))
}

rcloud.save.to.user.file <- function(user, filename, content) {
  filename <- rcloud.user.file.name(user, filename)
  invisible(write(content, filename))
}

rcloud.create.user.file <- function(user, filename) {
  internal_filename <- rcloud.user.file.name(user, filename)
  if (!file.exists(internal_filename)) {
    if (!file.exists(dir <- dirname(internal_filename)))
      dir.create(dir, F, T, "0770")
    file.create(internal_filename);
    TRUE
  } else
    FALSE
}

rcloud.search <- function(search.string) {
  if (nchar(search.string) == 0) {
    list(NULL, NULL);
  } else {
    cmd <- paste("find ../userfiles -type f -exec grep -iHn ",
                 search.string,
                 " {} \\; | sed 's/^..\\/userfiles//'");
    source.results <- system(cmd, intern=TRUE);

    cmd <- paste("grep -in ", search.string, " ../history/main_log.txt");
    history.results <- rev(system(cmd, intern=TRUE));
    list(source.results, history.results);
  }
}

################################################################################
# setup the r-side environment

options(device=WSdev)
setwd(paste(root,"/tmp",sep=''))
# as the last thing, return the R version
R.version.string
