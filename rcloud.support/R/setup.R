################################################################################
# setup the r-side environment
# configure.rcloud is called once in the main Rserve instance, so it should do and load
# everything that is common to all connections
# the per-connection setup is done by start.cloud()
#
# mode = "startup" is assuming regular startup via Rserve
# mode = "script"  will attempt to login anonymously, intended to be
#                  used in scripts
configure.rcloud <- function (mode=c("startup", "script")) {
  mode <- match.arg(mode)

  ## If we're running in startup mode, suicide on error!
  if (mode == "startup")
    options(error=function(...) {
      cat("\n***FATAL ERROR** aborting RCloud startup\n")
      tools:::pskill(Sys.getpid())
    })

  ## FIXME: should not be needed - try out?
  require(rcloud.support)

  ## it is useful to have access to the root of your
  ## installation from R scripts -- for RCloud this is *mandatory*
  setConf("root", Sys.getenv("ROOT"))
  if (!nzConf("root")) {
    ## some fall-back attempts
    for (guess in c("/data/rcloud", "/var/rcloud", "/usr/local/rcloud")) {
      if (file.exists(file.path(guess, "conf", "rcloud.conf"))) {
        setConf("root", guess)
        warning("ROOT is unset, falling back to `", getConf("root"), "'")
      }
    }
    if (!nzConf("root"))
      stop("FATAL: ROOT not specified and cannot guess RCloud location, please set ROOT!")
  }

  ## forward our HTTP handler so Rserve can use it
  .GlobalEnv$.http.request <- .http.request
  ## forward oc.init
  .GlobalEnv$oc.init <- oc.init

  debug.override <- FALSE
  if (nzchar(Sys.getenv("DEBUG"))) {
    dl <- as.integer(Sys.getenv("DEBUG"))
    if (any(is.na(dl))) dl <- 1L
    setConf("debug", dl)
    debug.override <- TRUE
    cat("=== NOTE: DEBUG is set, enabling debug mode at level", dl, "===\n")
  }
  if (rcloud.debug.level()) cat("Using ROOT =", getConf("root"), "\n")

  # CONFROOT/DATAROOT are purely optional
  # Whom are we kidding? Although it may be nice to abstract out all paths
  # this is far from complete (what about htdocs?) and not very practical
  # and this likely to go away (it's gone from the start script already)
  # until replaced by something more sensible (if at all)
  setConf("configuration.root", Sys.getenv("CONFROOT"))
  if (!nzConf("configuration.root"))
    setConf("configuration.root", pathConf("root", "conf"))
  if (rcloud.debug.level()) cat("Using CONFROOT =", getConf("configuration.root"), "\n")

  setConf("data.root", Sys.getenv("DATAROOT"))
  if (!nzConf("data.root"))
    setConf("data.root", pathConf("root", "data"))
  if (rcloud.debug.level()) cat("Using DATAROOT =", getConf("data.root"), "\n")

  ## load any local configuration (optional)
  setConf("local.conf", pathConf("configuration.root", "local.R"))
  if (validFileConf("local.conf"))
    source(pathConf("local.conf"))

  ## run the server in the "tmp" directory of the root in
  ## case some files need to be created
  setConf("tmp.dir", pathConf("root", "tmp"))
  if (!validFileConf("tmp.dir"))
    dir.create(pathConf("tmp.dir"), FALSE, TRUE, "0770")
  setwd(pathConf("tmp.dir"))

  ## if you have multiple servers it's good to know which machine this is
  setConf("host", tolower(system("hostname -f", TRUE)))
  cat("Starting Rserve on", getConf("host"),"\n")

  ## load configuration --- I'm not sure if DCF is a good idea - we may change this ...
  ## ideally, all of the above should be superceded by the configuration file
  rc.cf <- pathConf("configuration.root", "rcloud.conf")
  if (isTRUE(file.exists(rc.cf))) {
    cat("Loading RCloud configuration file...\n")
    rc.c <- read.dcf(rc.cf)[1,]
    for (n in names(rc.c)) setConf(gsub("[ \t]", ".", tolower(n)), as.vector(rc.c[n]))
  }

  ## use public github by default (FIXME: this should go away when set in the githubgist package)
  if (!nzConf("github.base.url")) setConf("github.base.url", "https://github.com/")
  if (!nzConf("github.api.url")) setConf("github.api.url", "https://api.github.com/")

  ## set locale - default is UTF-8
  locale <- getConf("locale")
  if (!isTRUE(nzchar(locale))) locale <- "en_US.UTF-8"
  Sys.setlocale(,locale)

  ## This is jsut a friendly way to load package and report success/failure
  ## Cairo, knitr, markdown and png are mandatory, really
  pkgs <- c("Cairo", "FastRWeb", "Rserve", "png", "knitr", "markdown", "base64enc", "rjson", "httr", "RCurl")
  ## $CONFROOT/packages.txt can list additional packages
  if (file.exists(fn <- pathConf("configuration.root", "packages.txt")))
    pkgs <- c(pkgs, readLines(fn))
  if (rcloud.debug.level()) cat("Loading packages...\n")
  for (pkg in pkgs) {
    succeeded <- require(pkg, quietly=TRUE, character.only=TRUE)
    if (rcloud.debug.level()) cat(pkg, ": ",succeeded,"\n",sep='')
    if (!succeeded)
      stop(paste("Missing package: ", pkg, sep=''))
  }

  ## we actually need knitr ...
  opts_knit$set(global.device=TRUE, tidy=FALSE, dev=CairoPNG, progress=FALSE)
  ## the dev above doesn't work ... it's still using png()
  ## so make sure it uses the cairo back-end ..
  if (capabilities()['cairo']) options(bitmapType='cairo')

  ## fix font mappings in Cairo -- some machines require this
  if (exists("CairoFonts"))
    CairoFonts("Arial:style=Regular","Arial:style=Bold","Arial:style=Italic","Helvetica","Symbol")

  ## Load any data you want
  if (nzConf("preload.data")) {
    fns <- strsplit(getConf("preload.data"), ", *")[[1]]
    for (fn in fns) {
      fn <- absPath(fn)
      if (isTRUE(file.exists(fn))) {
        if (rcloud.debug.level()) cat("Loading data", fn, "...\n")
        load(fn)
      }
    }
  }

  ## re-visit debug level based on the config file
  if (is.character(getConf("debug"))) {
    if (debug.override) {
      cat("NOTE: configuration debug level is '", getConf("debug"),"' but DEBUG is set to '", dl, "', the latter wins\n", sep='')
      setConf("debug", dl)
    } else {
      setConf("debug", as.integer(getConf("debug")))
      if (any(is.na(getConf("debug")))) setConf("debug", 1L) ## if the content is not an integer, use 1
    }
  }

  if (!nzConf("cookie.domain")) setConf("cookie.domain", getConf("host"))
  if (!isTRUE(grepl("[.:]", getConf("cookie.domain"))))
    stop("*** ERROR: cookie.domain must be a FQDN! Please set your hostname correctly or add cookie.domain directive to rcloud.conf")

  rcloud.setup.dirs()

  if (nzConf("curl.cainfo")) {
    cainfo <- pathConf("curl.cainfo", anchor=getConf("configuration.root"))
    httr::set_config(httr::config(cainfo = cainfo))
  }

  setConf("instanceID", generate.uuid())

  ## sanity check on redis
  if (isTRUE(getConf("rcs.engine") == "redis")) {
    redis <- rcs.redis(getConf("rcs.redis.host"))
    if (is.null(redis$handle)) stop("ERROR: cannot connect to redis host `",getConf("rcs.redis.host"),"', aborting")
    ## FIXME: we don't expose close in RCS, so do it by hand
    rediscc::redis.close(redis$handle)
    cat("Redis back-end .... OK\n")
  }
  options(HTTPUserAgent=paste(getOption("HTTPUserAgent"), "- RCloud (http://github.com/cscheid/rcloud)"))

  ## determine verison/revision/branch
  ##
  ## in absence of a VERSION file claim 0.0
  ver <- 0.0
  v.parts <- c(0L, 0L, 0L)
  f.ver <- "0.0-UNKNOWN"
  rev <- ""
  branch <- ""
  revFn <- pathConf("root", "REVISION")
  verFn <- pathConf("root", "VERSION")
  if (file.exists(revFn)) {
    vl <- readLines(revFn)
    branch <- vl[1]
    rev <- substr(vl[2],1,7)
  }
  if (file.exists(verFn)) {
    f.ver <- readLines(verFn, 1L)
    ver <- gsub("[^0-9.]+.*","", f.ver)
    v.parts <- as.integer(strsplit(ver, ".", TRUE)[[1]])
    if (length(v.parts) >= 2)
      ver <- as.numeric(paste(v.parts[1], v.parts[2], sep='.'))
    else
      ver <- v.parts[1]
    v.parts <- c(v.parts, 0L, 0L)
  }

  rcloud.info <- list()
  rcloud.version <- ver
  rcloud.info$version.string <- f.ver
  rcloud.info$ver.major <- v.parts[1]
  rcloud.info$ver.minor <- v.parts[2]
  rcloud.info$ver.patch <- v.parts[3]
  rcloud.info$revision <- rev
  rcloud.info$branch <- branch

  .info$rcloud.info <- rcloud.info
  .info$rcloud.version <- rcloud.version

  if (mode == "startup") ## reset error suicide
    options(error=NULL)

  if (mode == "script")
    rcloud.support:::start.rcloud.anonymously()
  else
    TRUE
}

rcloud.version <- function() .info$rcloud.version
rcloud.info <- function(name) if (missing(name)) .info$rcloud.info else .info$rcloud.info[[name]]

.info <- new.env(emptyenv())

start.rcloud.common <- function(...) {

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
  options(browser = function(url, ...) {
    if(grepl("^http://127.0.0.1:", url))
      self.oobSend(list("browsePath", gsub("^http://[^/]+", "", url)))
    else
      self.oobSend(list("browseURL", url))
  })

  ## while at it, pass other requests as OOB, too
  options(pager = function(files, header, title, delete.file) {
    content <- lapply(files, function(fn) {
      c <- readLines(fn)
      if (isTRUE(delete.file)) unlink(fn)
      paste(c, collapse='\n')
    })
    self.oobSend(list("pager", content, header, title))
  })
  options(editor = function(what, file, name) {
    ## FIXME: this should be oobMessage()
    if (nzchar(file)) file <- paste(readLines(file), collapse="\n")
    self.oobSend(list("editor", what, file, name))
  })

  ## and some options that may be of interest
  options(demo.ask = FALSE)
  options(example.ask = FALSE)
  options(menu.graphics = FALSE)

  ## generate per-session result UUID (optional, really)
  .session$result.prefix.uuid <- generate.uuid()

  if (isTRUE(getConf("rcs.engine") == "redis"))
    .session$rcs.engine <- rcs.redis(getConf("rcs.redis.host"))

  if (is.null(.session$rcs.engine)) { ## fall-back engine are flat files
    if (nzConf("exec.auth") && identical(getConf("exec.match.user"), "login"))
      warning("*** WARNING: user switching is enabled but no rcs.engine is specified!\n *** This will break due to permission conflicts! rcs.engine: redis is recommended for multi-user setup")
    fdir <- pathConf("data.root", "rcs")
    if (!file.exists(fdir))
      dir.create(fdir, FALSE, TRUE, "0777")
    .session$rcs.engine <- structure(list(root=fdir), class="RCSff")
  }

  ## last-minute updates (or custom initialization) to be loaded
  ## NB: it should be really fast since it will cause connect delay
  if (file.exists(fn <- pathConf("configuration.root", "init.R")))
    source(fn, TRUE)

  ## per-user setup
  if (nzchar(.session$username)) {
    .session$username <- gsub("[^a-zA-Z0-9_.]+", "_", .session$username)
    if (!file.exists(fn <- pathConf("data.root", "userfiles", .session$username)))
      dir.create(fn, FALSE, TRUE, "0770")
  }

  TRUE
}

create.gist.backend <- function(username="", token="", ...) {
  if (is.null(gb <- getConf("gist.backend"))) {
    ## FIXME: for compatibility only
    gb <- "githubgist"
    ## don't issue a warning for now since this get run in the user's session so it's user-visible
    ## cat(" ** WARNING: no gist.backend specified in the config file, using 'githubgist' which may change in the future!\n")
  }
  if (!require(gb, quietly=TRUE, character.only=TRUE))
    stop(" *** FATAL: cannot load gist.backend package `", gb, "'")
  gbns <- getNamespace(gb)
  l <- list()
  if (is.function(gbns$config.options)) {
    ## this is a bit ugly - we do ${ROOT} substitution regardless of the scope and we don't substitute anything else ...
    l <- lapply(names(gbns$config.options()), function(o) { x <- getConf(o); if (!is.null(x)) gsub("${ROOT}", getConf("root"), x, fixed=TRUE) else x })
    names(l) <- names(gbns$config.options())
    l0 <- sapply(l, is.null)
    req <- sapply(gbns$config.options(), isTRUE)
    if (any(l0 & req))
      stop("Following options required by `", gb, "' are missing: ", paste(names(gbns$config.options())[l0 & req]), collapse=', ')
  }
  
  l["username"]=list(username)
  l["token"]=list(token)
  if (rcloud.debug.level()) {
    cat("create.gist.ctx call:\n")
    str(l)
  }
  gist::set.gist.context(do.call(gbns$create.gist.context, l))
}


## This sets up the gist context and calls start.rcloud.common
## (FIXME: this exists only for historic reasons)
start.rcloud.gist <- function(username="", token="", ...) {
  .session$username <- username
  .session$token <- token
  ## FIXME: we have really two places where the context is stored:
  ## in the gist package's volatile and in the .session
  ## The rationale was security such that user cannot use
  ## set.gist.context to override it and steal credentials,
  ## but then we may have to remove it from gists entirely.
  .session$gist.context <- create.gist.backend(username=username, token=token, ...)

  if (is.function(getOption("RCloud.session.auth")))
    getOption("RCloud.session.auth")(username=username, ...)
  start.rcloud.common(...)
}

## this is called by session.init() on per-connection basis
start.rcloud <- function(username="", token="", ...) {
  if (!check.user.token.pair(username, token))
    stop("bad username/token pair");
  start.rcloud.gist(username=username, token=token, ...)
}

start.rcloud.anonymously <- function(...)
  start.rcloud.gist("", "", ...)
