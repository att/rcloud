require(knitr)
require(markdown)
require(hash)

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

session.eval <- function(x, command_id, silent) {
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

session.markdown.eval <- function(x, command_id, silent) {
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

session.log <- function(user, v) {
  vs <- strsplit(v, "\n")
  for (i in 1:length(vs[[1]])) {
    cat(paste(paste(Sys.time(), user, vs[[1]][i], sep="|"),"\n"),
        file=paste(.rcloud.conf$data.root,"history","main_log.txt",sep='/'), append=TRUE)
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
    deferred.rcloud.result(list("scatterplot",x,y,opts$kind,c(width,height),opts$group))
  } else {
    deferred.rcloud.result(list("scatterplot",x,y,c(width,height),opts$group))
  }
}

select <- function(what, group) {
  if (missing(group)) group <- .session$group
  if (is.numeric(what)) what <- seq.int(.session$group.len) %in% what 
  invisible(self.oobSend(list("select", as.integer(group), as.integer(what))))
}

fplot <- function()
{
  deferred.rcloud.result(list("iframe", "http://cscheid.github.com/facet/demos/osm/osm.html", c(960, 600)))
}

wgeoplot <- function(lats, lons, col=1L)
{
  if (is.null(dim(col))) col <- col2rgb(col) / 255
  #col <- rep(col, length.out = 3 * length(lats))
  col <- as.double(col)
  deferred.rcloud.result(list("facet_osm_plot", lats, lons, col, c(960, 600)))
}

wtour <- function(...)
{
  opts <- list(...)
  deferred.rcloud.result((list("facet_tour_plot", opts)))
}

################################################################################
# rcloud_status stuff goes here

rcloud.exec.user.file <- function(user, filename)
{
  session.eval(eval(parse(text=readLines(rcloud.user.file.name(user, filename)))),
               silent=TRUE)
}

rcloud.user.file.name <- function(user, filename) {
  paste(.rcloud.conf$data.root,"userfiles",user,filename,sep='/')
}

rcloud.list.all.initial.filenames <- function() {
    users <- list.files(path = paste(.rcloud.conf$data.root, "userfiles", sep = "/"))
    lapply(users, function(user) {
        filenames <- list.files(path = paste(.rcloud.conf$data.root, "userfiles", user, sep = "/"))
        list(user, lapply(filenames, function(filename) {
            list(filename, format(file.info(paste(.rcloud.conf$data.root, "userfiles", user, filename, 
                sep = "/"))$mtime))
        }))
    })
}

rcloud.list.initial.filenames <- function(user) {
  list.files(path=paste(.rcloud.conf$data.root, "userfiles", user, sep='/'))
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
    write("[]\n", internal_filename);
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

rcloud.record.cell.execution <- function(user, json.string) {
  cat(paste(paste(Sys.time(), user, json.string, sep="|"), "\n"),
      file=paste(.rcloud.conf$data.root, "history", "main_log.txt", sep='/'), append=TRUE)
}

################################################################################
# setup the UUID-string based injection hack

# FIXME should use libuuid directly
generate.uuid <- function() system("uuidgen", intern=TRUE);

stash.result <- function(value) {
  new.hash <- generate.uuid();
  global.result.hash[[new.hash]] <- value;
  new.hash;
}

deferred.rcloud.result <- function(value) {
  uuid <- stash.result(value);
  paste(wplot.uuid, uuid, sep="|");
}

rcloud.fetch.deferred.result <- function(key) {
  v <- global.result.hash[[key]]
  del(key, global.result.hash)
  v
}

################################################################################
# setup the r-side environment

configure.rcloud <- function () {
  .session <<- new.env(parent=emptyenv())
  .session$WSdev.width <- 300
  .session$WSdev.height <- 300

  wplot.uuid <<- generate.uuid();
  global.result.hash <<- hash::hash(); # why doesn't this work as 'hash()'?

  .rcloud.conf <<- new.env(parent=emptyenv())
  cat("Using rcloud.conf" , .rcloud.conf)

  ## it is useful to have access to the root of your
  ## installation from R scripts -- for RCloud this is *mandatory*
  .rcloud.conf$root <- Sys.getenv("ROOT")
  if (is.null(.rcloud.conf$root) || nchar(.rcloud.conf$root) == 0) root <- "/var/FastRWeb"
  cat("Using ROOT =", .rcloud.conf$root, "\n")

  # CONFROOT/DATAROOT are purely optional
  # Whom are we kidding? Although it may be nice to abstract out all paths
  # this is far from complete (what about htdocs?) and not very practical
  # and this likely to go away (it's gone from the start script already)
  # until replaced by something more sensible (if at all)
  .rcloud.conf$configuration.root <- Sys.getenv("CONFROOT")
  if (!nzchar(.rcloud.conf$configuration.root))
    .rcloud.conf$configuration.root <- paste(.rcloud.conf$root, "code", sep='/')
  cat("Using CONFROOT =", .rcloud.conf$configuration.root, "\n")

  .rcloud.conf$data.root <- Sys.getenv("DATAROOT")
  if (!nzchar(.rcloud.conf$data.root))
    .rcloud.conf$data.root <- paste(.rcloud.conf$root, "data", sep='/')
  cat("Using DATAROOT =", .rcloud.conf$data.root, "\n")

  ## load any local configuration (optional)
  .rcloud.conf$local.conf <- paste(.rcloud.conf$configuration.root, "local.R", sep='/')
  if (file.exists(.rcloud.conf$local.conf))
    source(.rcloud.conf$local.conf)

  ## run the server in the "tmp" directory of the root in
  ## case some files need to be created
  .rcloud.conf$tmp.dir <- paste(.rcloud.conf$root,"tmp",sep='/')
  if (!file.exists(.rcloud.conf$tmp.dir))
    dir.create(.rcloud.conf$tmp.dir)
  setwd(.rcloud.conf$tmp.dir)

  ## if you have multiple servers it's good to know which machine this is
  .rcloud.conf$host <- tolower(system("hostname -s", TRUE))
  cat("Starting Rserve on", .rcloud.conf$host,"\n")

  ## This is jsut a friendly way to load package and report success/failure
  ## You will definiteily need FastRWeb, others are optional
  pkgs <- c("Cairo", "FastRWeb", "Rserve", "png", "knitr", "markdown")
  cat("Loading packages...\n")
  for (pkg in pkgs)
    cat(pkg, ": ",require(pkg, quietly=TRUE, character.only=TRUE),"\n",sep='')
  
  ## we actually need knitr ...
  opts_knit$set(global.device=TRUE)

  ## fix font mappings in Cairo -- some machines require this
  if (exists("CairoFonts"))
    CairoFonts("Arial:style=Regular","Arial:style=Bold","Arial:style=Italic","Helvetica","Symbol")

  options(device=WSdev)

  # FIXME why do we have both this and tmd.dir above??
  setwd(paste(.rcloud.conf$root,"/tmp",sep=''))

  ## Load any data you want
  .rcloud.conf$data.fn <- paste(.rcloud.conf$root, "code", "data.RData", sep='/')
  if (isTRUE(file.exists(.rcloud.conf$data.fn))) {
    cat("Loading data...\n")
    load(.rcloud.conf$data.fn)
  }
}

start.rcloud <- function() {
  ## This is a bit of a hack (errr.. I mean a serious hack)
  ## we fake out R to think that Rhttpd is running and hijack the browser
  ## to pass all requests into the client
  local({
    env <- environment(tools:::startDynamicHelp)
    unlockBinding("httpdPort", env)
    assign("httpdPort", 1L, env)
    lockBinding("httpdPort", env)
  })
  options(help_type="html")
  options(browser = function(url, ...) if(grepl("^http://127.0.0.1:", url)) self.oobSend(list("browsePath", gsub("^http://[^/]+", "", url))) else self.oobSend(list("browseURL", url)))
  
  ## while at it, pass other requests as OOB, too
  options(pager = function(...) self.oobSend(list("pager", ...)))
  options(editor = function(...) self.oobSend(list("editor", ...)))
  
  ## and some options that may be of interest
  options(demo.ask = FALSE)
  options(example.ask = FALSE)
  options(menu.graphics = FALSE)
}

