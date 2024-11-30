################################################################################
# setup the r-side environment
# configure.rcloud is called once in the main Rserve instance, so it should do and load
# everything that is common to all connections
# the per-connection setup is done by start.cloud()
#
# mode = "startup" is assuming regular startup via Rserve
# mode = "script"  will attempt to login anonymously, intended to be
#                  used in scripts

## which minimal version of SessionKeyServer do we require?
.SKS.version.required <- 1.3

configure.rcloud <- function (mode=c("startup", "script")) {
  mode <- match.arg(mode)

  if (is.null(.session$mode)) .session$mode <- mode

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
  setConf("host", tolower(system("hostname -f 2>/dev/null", TRUE)))
  cat("Starting Rserve on", getConf("host"),"\n")

  ## populate $host mostly so it is available for logging
  .session$host <- getConf("host")

  ## load configuration --- I'm not sure if DCF is a good idea - we may change this ...
  ## ideally, all of the above should be superceded by the configuration file
  rc.cf <- pathConf("configuration.root", "rcloud.conf")
  rc.gsrc <- list()
  if (isTRUE(file.exists(rc.cf))) {
    .dcf.sections.with <- function(d, sec) {
      if (!sec %in% colnames(d)) return(list())
      w <- which(!is.na(d[,sec]))
      l <- lapply(w, function(o) { e <- d[o,]; e <- e[!is.na(e)]; names(e) <- gsub("[ \t]", ".", tolower(names(e))); e })
      names(l) <- d[w,sec]
      l
    }
    cat("Loading RCloud configuration file...\n")
    rc.all <- read.dcf(rc.cf)
    # TODO: DCF format expects that blank lines separate records, and
    # we only read a single record. That means if users put blank
    # lines in their conf files, the subsequent configurations will be
    # silently ignored.
    rc.c <- rc.all[1,]
    rc.c <- rc.c[!is.na(rc.c)]
    rc.gsrc <- .dcf.sections.with(rc.all, "gist.source")
    for (n in names(rc.c)) setConf(gsub("[ \t]", ".", tolower(n)), gsub("${ROOT}", getConf("root"), as.vector(rc.c[n]), fixed=TRUE))
  }
  .session$gist.sources.conf <- rc.gsrc
  ulog(paste(capture.output(str(rc.gsrc)), collapse='\n'))

  if (!nzConf("rcloud.user.home"))
    setConf("rcloud.user.home", pathConf("data.root", "home"))

  ## without exec.auth make sure the rcloud.home exists since it's not
  ## handled by the user switching code in that case
  if (!nzConf("exec.auth") && !file.exists(rcloud.home()))
      tryCatch(dir.create(rcloud.home(), FALSE, TRUE, "0700"),
               error=function(e) ulog("WARNING: unable to create rcloud.home ", rcloud.home()))

  ## set locale - default is UTF-8
  locale <- getConf("locale")
  if (!isTRUE(nzchar(locale))) locale <- "en_US.UTF-8"
  Sys.setlocale(,locale)

  ## This is jsut a friendly way to load package and report success/failure
  ## Cairo, knitr, markdown and png are mandatory, really
  pkgs <- c("Cairo", "FastRWeb", "Rserve", "png", "knitr", "markdown", "base64enc", "rjson", "httr", "RCurl", "sendmailR")
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
  opts_knit$set(tidy=FALSE, dev=CairoPNG, progress=FALSE)
  ## the dev above doesn't work ... it's still using png()
  ## so make sure it uses the cairo back-end ..
  if (capabilities()['cairo']) options(bitmapType='cairo')

  ## fix font mappings in Cairo -- some machines require this
  if (exists("CairoFonts"))
    tryCatch(CairoFonts("Arial:style=Regular","Arial:style=Bold","Arial:style=Italic","Helvetica","Symbol"),
             error=function(e) warning("*** Cannot set Cairo fonts", e$message, "\n*** maybe your system doesn't have basic fonts?"))

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

  ## check whether SKS is running and has the right version (if configured)
  ##
  ## WARNING: cURL gets into some odd state on RedHat when forked,
  ##          so do NOT issue any requests before forking, so we don't use this test for now ...
  if (FALSE && nzConf("session.server")) {
      sks.ver <- session.server.version()
      if (!is.character(sks.ver) || !nzchar(sks.ver) || is.na(sks.ver <- as.numeric(sks.ver)))
          stop("*** ERROR: session key server is configured, but either not working or outdated!")
      if (sks.ver < .SKS.version.required)
          stop("*** ERROR: more recent version of session key server is required (", .SKS.version.required, ", have ", sks.ver, ")")
  }

  if (!nzConf("cookie.domain")) setConf("cookie.domain", getConf("host"))
  if (!isTRUE(grepl("[.:]", getConf("cookie.domain"))) && !isTRUE(getConf("cookie.domain") == "*"))
    stop("*** ERROR: cookie.domain must be a FQDN! Please set your hostname correctly or add cookie.domain directive to rcloud.conf")

  rcloud.setup.dirs()

  if (nzConf("curl.cainfo")) {
    cainfo <- pathConf("curl.cainfo", anchor=getConf("configuration.root"))
    httr::set_config(httr::config(cainfo = cainfo))
    if (is.null(getOption("RCurlOptions")))
        options(RCurlOptions = list(cainfo="/data/rcloud/conf/verisign.crt"))
  }

  setConf("instanceID", generate.uuid())

  ## open RCS, initialize RCS .allusers/system/* based on conf rcs.system.*, close
  session.init.rcs()
  conf.keys <- keysConf()
  system.config <- conf.keys[grep('^rcs\\.system\\..*', conf.keys)]
  lapply(system.config, function(key) {
    parts <- strsplit(key, '\\.')[[1]]
    value <- strsplit(getConf(key), ' *, *')[[1]]
    rcs.set(rcs.key('.allusers', parts[[2]], parts[[3]], parts[[4]]), value)
  })
  ## we have to close the engine since we don't want the children to fork
  ## the same connection
  rcs.close()
  .session$rcs.engine <- NULL

  options(HTTPUserAgent=paste(getOption("HTTPUserAgent"), "- RCloud (http://github.com/att/rcloud)"))

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

  ## clean up to forks don't need to do gc soon
  gc()

  if (mode == "script")
    rcloud.support:::start.rcloud.anonymously()
  else
    TRUE
}

## create rcs back-end according to teh config files
session.init.rcs <- function() {
    if (isTRUE(getConf("rcs.engine") == "redis")) {
        db <- getConf("rcs.redis.db")
        if (is.null(db)) db <- getOption("redis.default.db", 0L)
        .session$rcs.engine <- rcs.redis(getConf("rcs.redis.host"), db=as.integer(db), password=getConf("rcs.redis.password"))
        if (is.null(.session$rcs.engine$handle)) stop("ERROR: cannot connect to redis host `",getConf("rcs.redis.host"),"', aborting")
    } else {
        if (nzConf("exec.auth") && identical(getConf("exec.match.user"), "login"))
            warning("*** WARNING: user switching is enabled but no rcs.engine is specified!\n *** This will break due to permission conflicts! rcs.engine: redis is recommended for multi-user setup")
        .session$rcs.engine <- rcs.ff(pathConf("data.root", "rcs"), TRUE)
    }
    .session$rcs.engine
}

rcloud.version <- function() .info$rcloud.version
rcloud.info <- function(name) if (missing(name)) .info$rcloud.info else .info$rcloud.info[[name]]

.info <- new.env(emptyenv())


RCloudLanguage <- function(...) {
  d <- as.list(...)
  if (is.null(d$language) || !is.character(d$language) || length(d$language) != 1)
    stop(paste("'language' field must be a length-1 character", sep=''))
  if (!is.function(d$run.cell) && !is.primitive(d$run.cell))
    stop(paste("'run.cell' field must be either a function or a primitive", sep=''))
  if (!is.function(d$setup) && !is.primitive(d$setup))
    stop(paste("'setup' field must be either a function or a primitive", sep=''))
  if (!is.function(d$teardown) && !is.primitive(d$teardown))
    stop(paste("'teardown' field must be either a function or a primitive", sep=''))
  structure(d, class = "RCloudLanguage")
}

is.RCloudLanguage <- function(x) inherits(x, "RCloudLanguage")

start.rcloud.common <- function(...) {
  ## This is a bit of a hack (errr.. I mean a serious hack)
  ## we fake out R to think that Rhttpd is running and hijack the browser
  ## to pass all requests into the client
  if (is.function(tools:::httpdPort)) tools:::httpdPort(1L) else local({ ## R before 3.2.0 needs a hack
    env <- environment(tools:::startDynamicHelp)
    unlockBinding("httpdPort", env)
    assign("httpdPort", 1L, env)
    lockBinding("httpdPort", env)
  })
  options(help_type="html")
  options(browser = function(url, ...) {
      if (grepl("^http://127.0.0.1:", url)) {
          path <-  gsub("^http://[^/]+", "", url)
          ## mangle paths for internal help to use the help.R proxy
          path <- gsub("^(/library/|/doc/)", "/help.R\\1", path)
          .rc.oobSend("browsePath", path)
    } else
      .rc.oobSend("browseURL", url)
  })

  ## while at it, pass other requests as OOB, too
  options(pager = function(files, header, title, delete.file) {
    content <- lapply(files, function(fn) {
      c <- readLines(fn)
      if (isTRUE(delete.file)) unlink(fn)
      paste(c, collapse='\n')
    })
    .rc.oobSend("pager", content, header, title)
  })
  options(editor = function(what, file, name) {
    ## FIXME: this should be oobMessage()
    if (nzchar(file)) file <- paste(readLines(file), collapse="\n")
    .rc.oobSend("editor", what, file, name)
  })

  ## and some options that may be of interest
  options(demo.ask = FALSE)
  options(example.ask = FALSE)
  options(menu.graphics = FALSE)

  ## generate per-session result UUID (optional, really)
  .session$result.prefix.uuid <- generate.uuid()

  session.init.rcs()
  ## scrub sensitive information from the configuration
  scrubConf(c("rcs.redis.db", "rcs.redis.password"))

  ## last-minute updates (or custom initialization) to be loaded
  ## NB: it should be really fast since it will cause connect delay
  if (file.exists(fn <- pathConf("configuration.root", "init.R")))
    source(fn, TRUE)

  ## per-user setup
  if (nzchar(.session$username)) {
    .session$username <- gsub("[^a-zA-Z0-9_.-]+", "_", .session$username)
    if (!file.exists(fn <- pathConf("data.root", "userfiles", .session$username)))
      dir.create(fn, FALSE, TRUE, "0770")
  }

  ## set up the languages which will be supported by this session
  lang.list <- list()
  file.ext.list <- list(md = "Markdown")
  if (identical(.session$mode, "IDE")) { ## only IDE uses languages; client (=JS mini/shiny) and call use call.notebook
      lang.str <- getConf("rcloud.languages")
      if (!is.character(lang.str))
          lang.str <- "rcloud.r"
      ## FIXME: should we somehow ignore languages that fail? Curretnly we just bail out with an error.
      for (lang in gsub("^\\s+|\\s+$", "", strsplit(lang.str, ",")[[1]])) {
          d <- tryCatch(suppressMessages(suppressWarnings(getNamespace(lang))), error=function(e) e)
          if (!is.environment(d))
              stop("Package `", lang,"` with language support cannot be loaded: ", as.character(d), "; Check rcloud.languages configuration.")
          d <- d$rcloud.language.support
          if (!is.function(d))
              stop("Could not find a function named rcloud.language.support in package `", lang,"'; Check rcloud.languages configuration.")
          initialize.language <- d
          d <- tryCatch(suppressMessages(suppressWarnings(initialize.language(.session))),
                        error=function(e) stop("Error ocurred while initializing `", lang,"' laguage package:", as.character(e),"; Check rcloud.languages configuration."))
          if (!is.RCloudLanguage(d) && !is.list(d))
              stop("Invalid result calling rcloud.language.support() for package '", lang,"'; Check rcloud.languages configuration.", sep='')
          package.languages <- if(is.RCloudLanguage(d)) list(d) else d

          for (package.lang in package.languages) {
              if (!is.RCloudLanguage(package.lang))
                  stop("Result of calling rcloud.language.support for package '", lang,"' must be a list of RCloudLanguage or RCloudLanguage")

              if (package.lang$language %in% names(lang.list))
                  stop("ERROR: Language Conflict! Package '", lang, "' tried to register language '", package.lang$language, "', but it already exists. Check rcloud.languages configuration.")

              if (!package.lang$extension %in% names(file.ext.list)) {
                  lang.list[[package.lang$language]] <- package.lang
                  suppressMessages(suppressWarnings(lang.list[[package.lang$language]]$setup(.session)))
                  file.ext.list[package.lang$extension] <- package.lang$language
              } else {
                  warning(paste("Ignoring", package.lang$language, ". Extension", package.lang$extension, "has already been registered for language", file.ext.list[package.lang$extension], "."))
              }
          }
      }
  }
  .session$languages <- lang.list
  .session$file.extensions <- file.ext.list

  ## any last-minute overrides akin to Rprofile
  if (validFileConf("configuration.root", "rcloud.profile"))
      source(pathConf("configuration.root", "rcloud.profile"))

  ## wipe sensitive configuration options -- does gc()!
  .wipe.secrets()

  ulog("RCloud start.rcloud.common() complete, user='", .session$username, "'")

  TRUE
}

create.gist.backend <- function(username="", token="", source=NULL, ...) {
  ## to simplify things we just pick the config from the source
  getConf <- if (is.null(source)) getConf else {
    my.conf <- .session$gist.sources.conf[[source]]
    if (is.null(my.conf)) stop("gist source `", source, "' is not configured in this instance")
    function(o) { if (o %in% names(my.conf)) my.conf[[o]] else NULL }
  }

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
    l <- lapply(names(gbns$config.options()), function(o) { x <- getConf(o); if (!is.null(x)) gsub("${ROOT}", rcloud.support:::getConf("root"), x, fixed=TRUE) else x })
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
  ulog("INFO: create gist context for source `", source, "', backend `", gb, "`")
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

  if (is.read.only(.session$gist.context) && isTRUE(nzchar(username)) && !isTRUE(.session$mode %in% "script"))
      stop("the gist back-end in the main section cannot be read-only - check whether you have all necessary settings in rcloud.conf")

  .session$gist.contexts <- list(default=.session$gist.context)
  ## FIXME: what about backend-specific tokens?
  ## create any additional sources defined in the config
  if (length(.session$gist.sources.conf))
    for (src in names(.session$gist.sources.conf))
      .session$gist.contexts[[src]] <- create.gist.backend(username=username, token=token, source=src, ...)

  if (is.function(getOption("RCloud.session.auth")))
    getOption("RCloud.session.auth")(username=username, ...)
  start.rcloud.common(...)
}

## this is called by session.init() on per-connection basis
start.rcloud <- function(username="", token="", ...) {
  valid.source <- if(isTRUE(getConf("github.auth") == "exec.token")) paste0("auth/",getConf("exec.auth")) else "stored"
  if (!check.user.token.pair(username, token, valid.source))
    stop("bad username/token pair");
  start.rcloud.gist(username=username, token=token, ...)
}

start.rcloud.anonymously <- function(...)
  start.rcloud.gist("", "", ...)

## perform whatever is needed to wipe traces of
## anything sensitive before the user gets control
##
.wipe.secrets <- function() {
    ## Redis is already dealt with since we scrub it right when we use it,
    ## but gist back-ends are separate
    scrubConf(c("github.client.secret", "github.client.id"))
}
