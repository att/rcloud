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

rcloud.load.user.config <- function(user = .session$username, map = FALSE) {
  payload <- rcs.get(usr.key("config.json", user=user, notebook="system"))
  if (is.null(payload)) payload <- "null"
  if (map) paste0('"', user, '": ', paste(payload, collapse='\n')) else payload
}

rcloud.load.multiple.user.configs <- function(users) {
  if (length(users) == 0) {
    "{}"
  } else {
    res <- unlist(lapply(rcs.get(usr.key("config.json", user=users, notebook="system"), TRUE), paste, collapse="\n"))
    paste0('{', paste(paste0('"', users, '": ', res), collapse=','), '}')
  }
}

rcloud.save.user.config <- function(user = .session$username, content) {
  if (rcloud.debug.level()) cat("rcloud.save.user.config(", user, ")\n", sep='')
  invisible(rcs.set(usr.key("config.json", user=user, notebook="system"), content))
}

rcloud.get.conf.value <- function(key) {
  Allowed <- c('host', 'github.base.url', 'github.api.url', 'github.gist.url')
  if(key %in% Allowed)
    getConf(key)
  else
    NULL
}

rcloud.unauthenticated.load.notebook <- function(id, version = NULL) {
  if (!rcloud.is.notebook.published(id))
    stop("Notebook does not exist or has not been published")
  rcloud.load.notebook(id, version)
}

rcloud.load.notebook <- function(id, version = NULL) {
  res <- rcloud.get.notebook(id, version)
  if (res$ok) {
    .session$current.notebook <- res
    rcloud.reset.session()
  }
  res
}

## stash the notebook into RCS such that it can ge used in non-github execution
## environment
rcloud.stash.notebook <- function(stash, id = .session$current.notebook$content$id, version = NULL) {
  res <- rcloud.get.notebook(id, version)
  if (res$ok) {
    tag <- NULL
    ## FIXME: maybe we should set HEAD even if the version is specified such
    ##        that a get without version succeeds even if only a
    ##        specific version is stashed
    ##        But that will require us to fetch the current HEAD
    ##        entry and compare commit timestamps or some such nonsense ...
    if (is.null(version)) {
      version <- res$content$history[[1L]]$version
      tag <- "HEAD"
    }
    stu <- paste0(".stash.", gsub("[-/]","_", stash))
    rcs.set(usr.key(paste0(version, ".gist"), user=stu, notebook=id), res)
    if (!is.null(tag))
      rcs.set(usr.key(paste0(tag, ".tag"), user=stu, notebook=id), version)
    TRUE
  } else FALSE
}

rcloud.install.notebook.stylesheets <- function() {
  n <- .session$current.notebook$content
  urls <- sapply(grep('css$', names(n$files)), function(v) {
    n$files[[v]]$raw_url
  })
  rcloud.install.css(urls)
}

rcloud.unauthenticated.get.notebook <- function(id, version = NULL) {
  if (!rcloud.is.notebook.published(id))
    stop("Notebook does not exist or has not been published")
  rcloud.get.notebook(id, version)
}

rcloud.get.notebook <- function(id, version = NULL) {
  res <- if (!is.null(.session$deployment.stash)) {
    stu <- paste0(".stash.",gsub("[-/]","_",.session$deployment.stash))
    if (is.null(version))
      version <- rcs.get(usr.key("HEAD.tag", user=stu, notebook=id))
    res <- rcs.get(usr.key(paste0(version, ".gist"), user=stu, notebook=id))
    if (is.null(res$ok)) res$ok <- FALSE
    res
  } else get.gist(id, version, ctx = .session$rgithub.context)
  if (rcloud.debug.level() > 1L) {
    if(res$ok) {
      cat("==== GOT GIST ====\n")
      cat(toJSON(res$content))
      cat("==== END GIST ====\n")
    }
    else {
      cat("==== GET NOTEBOOK FAILED ====\n")
      print(res)
    }
  }
  res
}

## this evaluates a notebook for its result
## this is extremely experimental -- use at your own risk
## the meaining of args is ambiguous and probably a bad idea - it jsut makes the client code a bit easier to write ...

rcloud.call.notebook <- function(id, version = NULL, args = NULL) {
  res <- rcloud.get.notebook(id, version)
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
    l <- as.list(as.WebResult(do.call(result, args, envir=environment(result))))
    l[[1]] <- NULL ## FIXME: we assume "html" type here .. need to implement others ...
    l
  } else result
}

rcloud.update.notebook <- function(id, content) {
  res <- update.gist(id, content, ctx = .session$rgithub.context)
  .session$current.notebook <- res
  res
}

rcloud.create.notebook <- function(content) create.gist(content, ctx = .session$rgithub.context)

rcloud.rename.notebook <- function(id, new.name)
  update.gist(id,
              list(description=new.name),
              ctx = .session$rgithub.context)

rcloud.fork.notebook <- function(id) fork.gist(id, ctx = .session$rgithub.context)

rcloud.get.users <- function(user) ## NOTE: this is a bit of a hack, because it abuses the fact that users are first in usr.key...
  gsub("/.*","",rcs.list(usr.key("config.json", user="*", notebook="system")))

rcloud.publish.notebook <- function(id) {
  nb <- rcloud.get.notebook(id)
  if (nb$content$user$login == .session$rgithub.context$user$login) {
    rcs.set(rcs.key("notebook", id, "public"), 1)
    TRUE
  } else
    FALSE
}

rcloud.unpublish.notebook <- function(id) {
  nb <- rcloud.get.notebook(id)
  if (nb$content$user$login == .session$rgithub.context$user$login) {
    rcs.rm(rcs.key("notebook", id, "public"))
    TRUE
  } else
    FALSE
}

rcloud.is.notebook.published <- function(id) {
  !is.null(rcs.get(rcs.key("notebook", id, "public")))
}

rcloud.port.notebooks <- function(url, books, prefix) {
  foreign.ctx <- create.github.context(url)

  Map(function(notebook) {
    getg <- get.gist(notebook, ctx = foreign.ctx)
    if(getg$ok) {
      gist <- getg$content
      newgist <- list(description = paste(prefix, gist$description, sep=""),
                      files = gist$files);
      rcloud.create.notebook(newgist)
    }
    else getg
  }, books)
}

rcloud.setup.dirs <- function() {
    for (data.subdir in c("userfiles", "history", "home"))
        if (!file.exists(fn <- pathConf("data.root", data.subdir)))
             dir.create(fn, FALSE, TRUE, "0770")
}

rcloud.get.completions <- function(text, pos) {
  # from rcompgen.completion
  utils:::.assignLinebuffer(text)
  utils:::.assignEnd(pos)
  utils:::.guessTokenFromLine()
  utils:::.completeToken()
  utils:::.CompletionEnv[["comps"]]
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
# stars

star.key <- function(notebook)
{
  user <- .session$username
  rcs.key("notebook", notebook, "stars", user)
}

star.count.key <- function(notebook)
{
  rcs.key("notebook", notebook, "starcount")
}

rcloud.notebook.star.count <- function(notebook)
{
  result <- rcs.get(star.count.key(notebook))
  if (is.null(result)) 0 else result
}

rcloud.is.notebook.starred <- function(notebook)
{
  !is.null(rcs.get(star.key(notebook)))
}

rcloud.star.notebook <- function(notebook)
{
  if (!rcloud.is.notebook.starred(notebook)) {
    rcs.set(star.key(notebook), TRUE)
    rcs.incr(star.count.key(notebook))
  }
}

rcloud.unstar.notebook <- function(notebook)
{
  if (rcloud.is.notebook.starred(notebook)) {
    rcs.rm(star.key(notebook))
    rcs.decr(star.count.key(notebook))
  }
}

rcloud.get.my.starred.notebooks <- function()
{
  rcs.list(star.key("*"))
}
