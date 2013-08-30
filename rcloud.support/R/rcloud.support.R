################################################################################
# rcloud_status stuff goes here

## FIXME: should we really allow JS to supply the username in all of the below?
## If we do, then some access control would be in order ...

## Yes. The right way to do this is when a user has successfully connected,
## we create a unique session key, send this key to Javascript-side on startup,
## and check the session key at every attempt at execution. This way users
## cannot (easily) fake identities.

## We're almost there now that we use github for authentication. The next step
## is to move all of these to require the session token to match against
## the one we have stored during the login process.


rcloud.user.config.filename <- function(user = .session$username)
  pathConf("data.root", "userfiles", paste(user, ".json", sep=''))

rcloud.load.user.config <- function(user = .session$username, map = FALSE) {
  ufile <- rcloud.user.config.filename(user)
  payload <- 
    if(file.exists(ufile))
      paste(readLines(ufile), collapse="\n")
    else
      "null"
  if (map) paste0('"', user, '": ', payload) else payload
}

# hackish? but more efficient than multiple calls
rcloud.load.multiple.user.configs <- function(users)
  paste('{', paste(sapply(users, rcloud.load.user.config, TRUE), collapse=',\n'), '}')

rcloud.save.user.config <- function(user = .session$username, content) {
  if (rcloud.debug.level()) cat("rcloud.save.user.config(", user, ")\n", sep='')
  filename <- rcloud.user.config.filename(user)
  ## write and then move atomically to avoid corruption due to concurrency
  writeLines(content, paste0(filename, ".tmp"))
  invisible(file.rename(paste0(filename, ".tmp"), filename))
}

rcloud.get.notebook <- function(id, version = NULL) {
  res <- get.gist(.session$rgithub.context, id, version)
  if (rcloud.debug.level() > 1L) {
    if(res$ok) {
      cat("==== GOT GIST ====\n")
      cat(toJSON(res$content))
      cat("==== END GIST ====\n")
    }
    else {
      cat("==== GET NOTEBOOK FAILED ====\n");
      print(res);
    }
  }
  res
}

## this evaluates a notebook for its result
## this is extremely experimental -- use at your own risk
## the meaining of args is ambiguous and probably a bad idea - it jsut makes the client code a bit easier to write ...
## <hack>if the result is a function, it will be treated like the run() function in a FastRWeb script</hack>
rcloud.call.notebook <- function(id, version = NULL, args = NULL) {
  res <- get.gist(.session$rgithub.context, id, version)
  if (res$ok) {
    args <- as.list(args)
    ## this is a hack for now - we should have a more general infrastructure for this ...
    ## get all files
    p <- res$content$files
    n <- names(p)
    ## extract the integer number
    i <- as.integer(gsub("^\\D+(\\d+)\\..*", "\\1", n))
    result <- NULL
    e <- new.env(parent=.GlobalEnv)
    if (is.list(args) && length(args)) for (i in names(args)) e[[i]] <- args[[i]]
    ## sort 
    for (o in p[match(sort.int(i), i)]) {
      if (grepl("^part.*\\.R$", o$filename)) { ## R code
        expr <- parse(text=o$content)
        result <- eval(expr, e)
      } else if (grepl("^part.*\\.md", o$filename)) { ## markdown
        ## FIXME: we ignore markdown for now ...
      }
    }
    result
  } else NULL
}

rcloud.call.FastRWeb.notebook <- function(id, version = NULL, args = NULL) {
  result <- rcloud.call.notebook(id, version, args)
  if (is.function(result)) {
    require(FastRWeb)
    l <- as.list(as.WebResult(do.call(result, args, envir=e)))
    l[[1]] <- NULL ## FIXME: we assume "html" type here .. need to implement others ...
    l
  } else result
}

rcloud.update.notebook <- function(id, content) update.gist(.session$rgithub.context, id, content)

rcloud.create.notebook <- function(content) create.gist(.session$rgithub.context, content)

rcloud.rename.notebook <- function(id, new.name)
  update.gist(.session$rgithub.context,
              id,
              list(description=new.name))

rcloud.fork.notebook <- function(id) fork.gist(.session$rgithub.context, id)

rcloud.get.users <- function(user)  ## instead of using a list file let's simply look for existing user configs ...
  unique(c(user, gsub(".json$", "", basename(Sys.glob(pathConf("data.root", "userfiles", "*.json"))))))

rcloud.setup.dirs <- function() {
    for (data.subdir in c("userfiles", "history", "home"))
        if (!file.exists(fn <- pathConf("data.root", data.subdir)))
             dir.create(fn, FALSE, TRUE, "0770")
}

rcloud.search <- function(search.string) {
  if (nchar(search.string) == 0)
    list(NULL, NULL)
  else {
    cmd <- paste0("find ", getConf("data.root"), "/userfiles -type f -exec grep -iHn ",
                 search.string,
                 " {} \\; | sed 's:^", getConf("data.root"), "/userfiles::'")
    source.results <- system(cmd, intern=TRUE)

    cmd <- paste0("grep -in ", search.string, " ", getConf("data.root"), "/history/main_log.txt")
    history.results <- rev(system(cmd, intern=TRUE))
    list(source.results, history.results)
  }
}

## FIXME: won't work - uses a global file!
rcloud.record.cell.execution <- function(user = .session$username, json.string) {
  cat(paste(paste(Sys.time(), user, json.string, sep="|"), "\n"),
      file=pathConf("data.root", "history", "main_log.txt"), append=TRUE)
}

rcloud.debug.level <- function() if (hasConf("debug")) getConf("debug") else 0L

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
  
  if (!all(sapply(c("github.client.id", "github.client.secret"), nzConf)))
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
  res <-
    rgithub.context.from.token(getConf("github.api.url"), getConf("github.client.id"),
                               getConf("github.client.secret"), token)
  if(res$ok)
    .session$rgithub.context <- res$content
  else
    stop(paste('error in rgithub.context.from.token: ', res$content))

  if (is.function(getOption("RCloud.session.auth")))
    getOption("RCloud.session.auth")(username=username, ...)

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
