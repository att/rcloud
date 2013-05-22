# configuration environment -- we should really abstract the access out ..
.rc.conf <- new.env(parent=emptyenv())

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


rcloud.user.config.filename <- function(user)
  file.path(.rc.conf$data.root, "userfiles", paste(user, ".json", sep=''))


rcloud.load.user.config <- function(user) {
  print(rcloud.user.config.filename(user))
  print("huh")
  paste(readLines(rcloud.user.config.filename(user)), collapse="\n")
}

rcloud.save.user.config <- function(user, content) {
  filename <- rcloud.user.config.filename(user)
  invisible(write(content,filename))
}

rcloud.get.notebook <- function(id) {
  res <- get.gist(.session$rgithub.context, id)
  # this assumption of text might not be accurate in all cases,
  # just a workaround because rserve.js doesn't support raw vectors yet
  # and i'm not sure if/how to deal with binary json either
  json <- rawToChar(res$content);
  print("GOT GIST:")
  print(json)
  print("END GIST!")
  json
}

rcloud.update.notebook <- function(id, content)
  update.gist(.session$rgithub.context, id, content)

  
##########################

rcloud.exec.user.file <- function(user, filename)
  session.eval(eval(parse(text=readLines(rcloud.user.file.name(user, filename)))),
               silent=TRUE)

rcloud.user.file.name <- function(user, filename)
  file.path(.rc.conf$data.root, "userfiles", user, filename)


rcloud.list.all.initial.filenames <- function() {
    users <- list.files(path = file.path(.rc.conf$data.root, "userfiles"))
    lapply(users, function(user) {
        filenames <- list.files(path = file.path(.rc.conf$data.root, "userfiles", user))
        list(user, lapply(filenames, function(filename) {
            list(filename, format(file.info(file.path(.rc.conf$data.root, "userfiles", user, filename))$mtime))
        }))
    })
}

rcloud.list.initial.filenames <- function(user) {
  list.files(path=file.path(.rc.conf$data.root, "userfiles", user))
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
      dir.create(dir, FALSE, TRUE, "0770")
    file.create(internal_filename);
    write("[]\n", internal_filename);
    TRUE
  } else
    FALSE
}

rcloud.setup.dirs <- function() {
    for (data.subdir in c("userfiles", "history"))
        if (!file.exists(fn <- file.path(.rc.conf$data.root, data.subdir)))
             dir.create(fn, FALSE, TRUE, "0770")
}

rcloud.search <- function(search.string) {
  if (nchar(search.string) == 0)
    list(NULL, NULL)
  else {
    cmd <- paste0("find ", .rc.conf$data.root, "/userfiles -type f -exec grep -iHn ",
                 search.string,
                 " {} \\; | sed 's:^", .rc.conf$data.root, "/userfiles::'")
    source.results <- system(cmd, intern=TRUE)

    cmd <- paste0("grep -in ", search.string, " ", .rc.conf$data.root, "/history/main_log.txt")
    history.results <- rev(system(cmd, intern=TRUE))
    list(source.results, history.results)
  }
}

rcloud.record.cell.execution <- function(user, json.string) {
  cat(paste(paste(Sys.time(), user, json.string, sep="|"), "\n"),
      file=file.path(.rc.conf$data.root, "history", "main_log.txt"), append=TRUE)
}

################################################################################
# setup the r-side environment
# this is called once in the main Rserve instance, so it should do and load
# everything that is common to all connections
# the per-connection setup is done by start.rcloud()
configure.rcloud <- function () {
  ## it is useful to have access to the root of your
  ## installation from R scripts -- for RCloud this is *mandatory*
  .rc.conf$root <- Sys.getenv("ROOT")
  if (is.null(.rc.conf$root) || nchar(.rc.conf$root) == 0) .rc.conf$root <- "/var/FastRWeb"
  cat("Using ROOT =", .rc.conf$root, "\n")

  # CONFROOT/DATAROOT are purely optional
  # Whom are we kidding? Although it may be nice to abstract out all paths
  # this is far from complete (what about htdocs?) and not very practical
  # and this likely to go away (it's gone from the start script already)
  # until replaced by something more sensible (if at all)
  .rc.conf$configuration.root <- Sys.getenv("CONFROOT")
  if (!nzchar(.rc.conf$configuration.root))
    .rc.conf$configuration.root <- file.path(.rc.conf$root, "conf")
  cat("Using CONFROOT =", .rc.conf$configuration.root, "\n")

  .rc.conf$data.root <- Sys.getenv("DATAROOT")
  if (!nzchar(.rc.conf$data.root))
    .rc.conf$data.root <- file.path(.rc.conf$root, "data")
  cat("Using DATAROOT =", .rc.conf$data.root, "\n")

  ## load any local configuration (optional)
  .rc.conf$local.conf <- file.path(.rc.conf$configuration.root, "local.R")
  if (file.exists(.rc.conf$local.conf))
    source(.rc.conf$local.conf)

  ## run the server in the "tmp" directory of the root in
  ## case some files need to be created
  .rc.conf$tmp.dir <- file.path(.rc.conf$root, "tmp")
  if (!file.exists(.rc.conf$tmp.dir))
    dir.create(.rc.conf$tmp.dir, FALSE, TRUE, "0770")
  setwd(.rc.conf$tmp.dir)

  ## if you have multiple servers it's good to know which machine this is
  .rc.conf$host <- tolower(system("hostname -s", TRUE))
  cat("Starting Rserve on", .rc.conf$host,"\n")

  ## This is jsut a friendly way to load package and report success/failure
  ## Cairo, knitr, markdown and png are mandatory, really
  pkgs <- c("Cairo", "FastRWeb", "Rserve", "png", "knitr", "markdown", "base64enc", "rjson", "httr", "github")
  ## $CONFROOT/packages.txt can list additional packages
  if (file.exists(fn <- file.path(.rc.conf$configuration.root, "packages.txt")))
    pkgs <- c(pkgs, readLines(fn))
  cat("Loading packages...\n")
  for (pkg in pkgs) {
    succeeded <- require(pkg, quietly=TRUE, character.only=TRUE)
    cat(pkg, ": ",succeeded,"\n",sep='')
    if (!succeeded)
      stop(paste("Missing package: ", pkg, sep=''))
  }

  ## we actually need knitr ...
  opts_knit$set(global.device=TRUE, tidy=FALSE, dev=CairoPNG)

  ## fix font mappings in Cairo -- some machines require this
  if (exists("CairoFonts"))
    CairoFonts("Arial:style=Regular","Arial:style=Bold","Arial:style=Italic","Helvetica","Symbol")

  ## Load any data you want
  .rc.conf$data.fn <- file.path(.rc.conf$configuration.root, "data.RData")
  if (isTRUE(file.exists(.rc.conf$data.fn))) {
    cat("Loading data...\n")
    load(.rc.conf$data.fn)
  }

  ## github API information is loaded from github_info.txt
  gh.cf <- file.path(.rc.conf$configuration.root, "github_info.txt")
  if (file.exists(gh.cf)) {
    ln <- readLines(gh.cf, 4)
    n <- c("github.client.id", "github.client.secret", "github.base.url", "github.api.url")
    for (i in seq.int(ln)) .rc.conf[[n[i]]] <- ln[i]
  }

  rcloud.setup.dirs()

  .rc.conf$instanceID <- generate.uuid()
  
  TRUE
}

## --- RCloud part folows ---
## this is called by session.init() on per-connection basis
start.rcloud <- function(username="", token="", ...) {
  cat("FOOOOOOOOOO\n")
  print(username)
  print(token)
  cat("BAAARRRRRRR\n")
  if (!check.user.token.pair(username, token))
    stop("bad username/token pair");
  .session$username <- username
  .session$token <- token
  .session$rgithub.context <-
    rgithub.context.from.token(.rc.conf$github.api.url,
                               .rc.conf$github.client.id,
                               .rc.conf$github.client.secret,
                               token)
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
  if (file.exists(fn <- file.path(.rc.conf$configuration.root, "init.R")))
    source(fn, TRUE)
  
  ## per-user setup
  if (nzchar(.session$username)) {
    .session$username <- gsub("[^a-zA-Z0-9_.]+", "_", .session$username)
    if (!file.exists(fn <- file.path(.rc.conf$data.root, "userfiles", .session$username)))
      dir.create(fn, FALSE, TRUE, "0770")
  }
  TRUE
}
