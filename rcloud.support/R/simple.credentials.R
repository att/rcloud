## FIXME when #569 is closed, add back the debugging lines commented out

## this is only used is there is no session server ... and it's a bad hack since it's not safe>
.get.token.list <- function()
{
  rcloud.auth.path <- pathConf("configuration.root", "rcloud.auth")
  tryCatch(readRDS(rcloud.auth.path),
           error=function(e) {
             d <- new.env(parent=emptyenv())
             d$user.to.token <- new.env(parent=emptyenv())
             d$token.to.user <- new.env(parent=emptyenv())
             d
           })
}

.save.token.list <- function(d) {
  rcloud.auth.path <- pathConf("configuration.root", "rcloud.auth")
  ## save + move to ensure that at least the content will be consitent
  ## it is still unsafe because there is no lock between read and save, so
  ## concurrent changes will be lost -- but that's why this is jsut
  ## (discouraged) fallback -- admins are strongly encouraged to use
  ## the session sever instead.
  saveRDS(d, tmpfn <- paste0(rcloud.auth.path, Sys.getpid()))
  file.rename(tmpfn, rcloud.auth.path)
}

simple.credential.set.token <- function(realm, user, token)
{
  d <- .get.token.list()
  old.token <- d$user.to.token[[user]]
  if (!is.null(old.token)) d$token.to.user[[old.token]] <- NULL
  d$user.to.token[[user]] <- token
  d$token.to.user[[token]] <- user
  .save.token.list(d)
}

simple.credential.revoke.token <- function(realm, token)
{
  d <- .get.token.list()
  user <- d$token.to.user[[token]]
  if (!is.null(user)) d$user.to.token[[user]] <- NULL
  d$token.to.user[[token]] <- NULL
  .save.token.list(d)
}

simple.credential.check.token <- function(realm, token, valid.sources)
{ 
  d <- .get.token.list()
  user.from.token <- d$token.to.user[[token]]
  if (!is.null(user.from.token))
    user.from.token
  else
    FALSE
}

simple.credential.check.user.token.pair <- function(realm, user, token, valid.sources)
{
  d <- .get.token.list()
  token.from.user <- d$user.to.token[[user]]
  user.from.token <- d$token.to.user[[token]]
  # if (rcloud.debug.level()) cat("check.user.token.pair(", user, ", ", token, ")\n", sep='')

  (!is.null(user.from.token) &&
   (user.from.token == user) &&
   !is.null(token.from.user) &&
   (token.from.user == token))
}

simple.credential.manager <- function()
{
  list(set = simple.credential.set.token,
       revoke = simple.credential.revoke.token,
       check = simple.credential.check.token,
       check.pair = simple.credential.check.user.token.pair)
}
