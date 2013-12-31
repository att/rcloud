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
  res <- if (!is.null(stash <- .session$deployment.stash)) {
    if (is.null(version))
      version <- rcs.get(stash.key(stash, id, "HEAD", type="tag"))
    res <- rcs.get(stash.key(stash, id, version))
    if (is.null(res$ok)) res <- list(ok=FALSE)
    res
  } else suppressWarnings(get.gist(id, version, ctx = .session$rgithub.context))
  ## FIXME: suppressWarnings is a hack to get rid of the stupid "Duplicated curl options"
  ##        which seem to be a httr bug
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

rcloud.unauthenticated.call.notebook <- function(id, version = NULL, args = NULL) {
  if (!rcloud.is.notebook.published(id))
    stop("Notebook does not exist or has not been published")
  rcloud.call.notebook(id, version, args)
}

rcloud.call.notebook <- function(id, version = NULL, args = NULL) {
  res <- rcloud.get.notebook(id, version)
  if (res$ok) {
    args <- as.list(args)
    ## this is a hack for now - we should have a more general infrastructure for this ...
    ## get all files
    p <- res$content$files
    p <- p[grep("^part", names(p))]
    n <- names(p)
    if (!length(n)) return(NULL)
    ## extract the integer number
    i <- suppressWarnings(as.integer(gsub("^\\D+(\\d+)\\..*", "\\1", n)))
    result <- NULL
    e <- new.env(parent=.GlobalEnv)
    if (is.list(args) && length(args)) for (i in names(args)) if (nzchar(i)) e[[i]] <- args[[i]]
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

rcloud.unauthenticated.call.FastRWeb.notebook <- function(id, version = NULL, args = NULL) {
  if (!rcloud.is.notebook.published(id))
    stop("Notebook does not exist or has not been published")
  rcloud.call.FastRWeb.notebook(id, version, args)
}

rcloud.call.FastRWeb.notebook <- function(id, version = NULL, args = NULL) {
  result <- rcloud.call.notebook(id, version, args)
  if (is.function(result)) {
    require(FastRWeb)
    l <- as.list(as.WebResult(do.call(result, args, envir=environment(result))))
    if (isTRUE(l[[1]] == "tmpfile")) {
      fn <- file.path(getwd(), gsub("/","_",l[[2]],fixed=TRUE))
      cat("rcloud.call.FastRWeb.notebook: file is", fn,"\n")
      sz <- file.info(fn)$size
      if (any(is.na(sz))) stop("Error reading temporary file ",fn)
      r <- readBin(fn, raw(), sz)
      unlink(fn)
      return(c(list(r), l[-(1:2)]))
    }
    l[[1]] <- NULL ## FIXME: we assume "html" type here .. need to implement others ...
    l
  } else result
}

rcloud.notebook.by.name <- function(name, user=.session$username, path=TRUE) {
  cfg <- rcloud.load.user.config(user)
  if (cfg == "null") stop("user `", user, "' not found")
  if (inherits(cfg, "try-error")) stop("Error while loading user `", user, "' configuration: ", cfg)
  cfg <- rjson::fromJSON(cfg)
  nbs <- lapply(cfg$all_books, function(o) o$description)
  ok <- sapply(nbs, function(s) (name == s || (path && substr(name, 1, nchar(s)) == s && substr(name, nchar(s)+1L, nchar(s)+1L) == "/")))
  if (!any(ok)) return(if(path) NULL else character(0))
  notebook <- as.character(names(nbs)[ok])
  if (!path) return(notebook)
  extra.path <- sapply(nbs[ok], function(nmatch) if (nmatch == name) "" else substr(name, nchar(nmatch) + 1L, nchar(name)))
  m <- matrix(c(notebook, extra.path),,2)
  colnames(m) <- c("id", "extra.path")
  m
}

rcloud.unauthenticated.notebook.by.name <- function(name, user=.session$username, path=TRUE) {
  candidates <- rcloud.notebook.by.name(name, user)
  if (length(candidates) < 1L) return(candidates)
  vec <- is.null(dim(candidates))
  id <- if (vec) candidates else candidates[,1L]
  pub <- sapply(id, rcloud.is.notebook.published)
  if (all(!pub)) return(if(vec) character(0) else NULL)
  if (vec) candidates[pub] else candidates[pub,,drop=FALSE]
}

rcloud.upload.to.notebook <- function(file, name) {
  if (is.null(.session$current.notebook))
    stop("Notebook must be loaded")
  id <- .session$current.notebook$content$id
  files <- list()
  files[[name]] <- list(content=rawToChar(file))
  content <- list(files = files)
  res <- rcloud.update.notebook(id, content)
  .session$current.notebook <- res
  res
}

rcloud.update.notebook <- function(id, content) {
  res <- modify.gist(id, content, ctx = .session$rgithub.context)
  .session$current.notebook <- res
  res
}

rcloud.create.notebook <- function(content) {
  res <- create.gist(content, ctx = .session$rgithub.context)
  if (res$ok) {
    .session$current.notebook <- res
    rcloud.reset.session()
  }
  res
}

rcloud.rename.notebook <- function(id, new.name)
  modify.gist(id,
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

rcloud.multiple.notebook.star.counts <- function(notebooks)
{
  Map(rcloud.notebook.star.count, notebooks)
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
