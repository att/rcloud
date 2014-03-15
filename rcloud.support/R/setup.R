################################################################################
# setup the r-side environment
# this is called once in the main Rserve instance, so it should do and load
# everything that is common to all connections
# the per-connection setup is done by start.rcloud()
configure.rcloud <- function () {
  require(rcloud.support) ## make sure we're on the search path (may not be needed once we switch to OCap)
  
  ## it is useful to have access to the root of your
  ## installation from R scripts -- for RCloud this is *mandatory*
  setConf("root", Sys.getenv("ROOT"))
  if (!nzConf("root")) {
    setConf("root", "/var/FastRWeb")
    warning("Invalid ROOT - falling back to", getConf("root"))
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

  ## use public github by default
  if (!nzConf("github.base.url")) setConf("github.base.url", "https://github.com/")
  if (!nzConf("github.api.url")) setConf("github.api.url", "https://api.github.com/")
  
  if (!all(sapply(c("github.client.id", "github.client.secret"), nzConf))
      && !nzConf("gist.deployment.stash"))
    stop("*** ERROR: You need a GitHub configuration in rcloud.conf! Please refer to README.md for more instructions.")

  ## set locale - default is UTF-8
  locale <- getConf("locale")
  if (!isTRUE(nzchar(locale))) locale <- "en_US.UTF-8"
  Sys.setlocale(,locale)

  ## This is jsut a friendly way to load package and report success/failure
  ## Cairo, knitr, markdown and png are mandatory, really
  pkgs <- c("Cairo", "FastRWeb", "Rserve", "png", "knitr", "markdown", "base64enc", "rjson", "httr", "github", "RCurl")
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

  options(HTTPUserAgent=paste(getOption("HTTPUserAgent"), "- RCloud (http://github.com/cscheid/rcloud)"))

  TRUE
}


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
  options(pager = function(...) self.oobSend(list("pager", ...)))
  options(editor = function(...) self.oobSend(list("editor", ...)))

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

## --- RCloud part folows ---
## this is called by session.init() on per-connection basis
start.rcloud <- function(username="", token="", ...) {
  if (rcloud.debug.level()) cat("start.rcloud(", username, ", ", token, ")\n", sep='')
  if (!check.user.token.pair(username, token))
    stop("bad username/token pair");
  .session$username <- username
  .session$token <- token
  #Getting these parameters from configuration files
  .session$rhost <- getConf("host")
  .session$solr.host.port <- getConf("solr.host.port")
  .session$collection<- getConf("solr.collection")
  #End
  if (nzConf("gist.deployment.stash"))
    .session$deployment.stash <- getConf("gist.deployment.stash")
  else
    .session$rgithub.context <- create.github.context(
                                getConf("github.api.url"), getConf("github.client.id"),
                                getConf("github.client.secret"), token)

  if (is.function(getOption("RCloud.session.auth")))
    getOption("RCloud.session.auth")(username=username, ...)
  start.rcloud.common(...)
}

start.rcloud.anonymously <- function(...) {
  if (rcloud.debug.level()) cat("start.rcloud.anonymously()")
  if (nzConf("gist.deployment.stash"))
    .session$deployment.stash <- getConf("gist.deployment.stash")
  else
    .session$rgithub.context <- create.github.context(
                                getConf("github.api.url"), getConf("github.client.id"),
                                getConf("github.client.secret"))
  .session$username <- ""
  .session$token <- ""

  if (is.function(getOption("RCloud.session.auth")))
    getOption("RCloud.session.auth")(username=username, ...)
  start.rcloud.common(...)
}
