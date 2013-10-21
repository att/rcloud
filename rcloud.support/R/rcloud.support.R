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
  if (length(users) < 1L) return("{}")
  res <- unlist(lapply(rcs.get(usr.key("config.json", user=users, notebook="system"), TRUE), paste, collapse="\n"))
  paste0('{', paste(paste0('"', users, '": ', res), collapse=','), '}')
}

rcloud.save.user.config <- function(user = .session$username, content) {
  if (rcloud.debug.level()) cat("rcloud.save.user.config(", user, ")\n", sep='')
  invisible(rcs.set(usr.key("config.json", user=user, notebook="system"), content))
}

rcloud.get.conf.value <- function(key) getConf(key)

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
    l <- as.list(as.WebResult(do.call(result, args, envir=environment(result))))
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

rcloud.get.users <- function(user) ## NOTE: this is a bit of a hack, because it abuses the fact that users are first in usr.key...
  gsub("/.*","",rcs.list(usr.key("config.json", user="*", notebook="system")))

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
