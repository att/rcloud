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

set.token <- function(user, token, realm="rcloud")
{
  if (!nzConf("session.server")) {
    d <- .get.token.list()
    old.token <- d$user.to.token[[user]]
    if (!is.null(old.token)) d$token.to.user[[old.token]] <- NULL
    d$user.to.token[[user]] <- token
    d$token.to.user[[token]] <- user
    .save.token.list(d)
  } else session.server.set.token(realm, user, token)
}

revoke.token <- function(token, realm="rcloud") {
  if (!nzConf("session.server")) {
    d <- .get.token.list()
    user <- d$token.to.user[[token]]
    if (!is.null(user)) d$user.to.token[[user]] <- NULL
    d$token.to.user[[token]] <- NULL
    .save.token.list(d)
  } else session.server.revoke.token(realm, token)
}

generate.token <- function() paste(c(0:9,letters)[as.integer(runif(25,0,35.999))+1L], collapse='')

replace.token <- function(token, realm="rcloud") {
  if (!nzConf("session.server")) {
    d <- .get.token.list()
    user <- d$token.to.user[[token]]
    if (is.null(user)) stop("bad token")
    new.token <- generate.token()
    d$user.to.token[[user]] <- new.token
    d$token.to.user[[token]] <- NULL
    d$token.to.user[[new.token]] <- user
    .save.token.list(d)
    new.token
  } else {
      res <- session.server.replace.token(realm, token)
      if (length(res) < 3) stop("invalid token")
      res[1]
  }
}

check.user.token.pair <- function(user, token, valid.sources="stored", realm="rcloud")
{
  if (is.null(token)) {
    FALSE
  } else if (!nzConf("session.server")) {
    d <- .get.token.list()
    token.from.user <- d$user.to.token[[user]]
    user.from.token <- d$token.to.user[[token]]

    if (rcloud.debug.level()) cat("check.user.token.pair(", user, ", ", token, ")\n", sep='')

    (!is.null(user.from.token) &&
     (user.from.token == user) &&
     !is.null(token.from.user) &&
     (token.from.user == token))
  } else {
    res <- session.server.get.token(realm, token)

    if (rcloud.debug.level()) cat("check.user.token.pair(", user, ", ", token, ", ", realm, ") valid: ", res[1],", user: ", res[2], ", source: ", res[3], "\n", sep='')

    (length(res) > 1) && isTRUE(res[1] == "YES") && isTRUE(res[2] == as.vector(user)) && isTRUE(res[3] %in% valid.sources)
  }
}

check.token <- function(token, valid.sources="stored", realm="rcloud")
{
  if (is.null(token)) {
    FALSE
  } else if (!nzConf("session.server")) {
    d <- .get.token.list()
    user.from.token <- d$token.to.user[[token]]
    if (!is.null(user.from.token))
      user.from.token
    else
      FALSE
  } else {
    res <- session.server.get.token(realm, token)
    if (rcloud.debug.level()) cat("check.token(", token,", ", realm,") valid: ", res[1],", user: ", res[2], ", source: ", res[3], "\n", sep='')
    if ((length(res) > 1) && isTRUE(res[1] == "YES") && isTRUE(res[3] %in% valid.sources)) res[2] else FALSE
  }
}

get.user.key <- function(token=.session$token, realm="rcloud", generate=TRUE, required=FALSE) {
    if (!nzConf("session.server")) stop("secure key storage requires SessionKeyServer, see session.server configuration in rcloud.conf")
    key <- session.server.get.key(realm, token)
    if (length(key) && nzchar(key)) return(.Call(hex2raw,key))
    if (!generate) {
        if (required) Rf_error("user key is required, but no key is present")
        return(NULL)
    }
    key <- session.server.generate.key(realm, token)
    if (length(key) && nzchar(key)) return(.Call(hex2raw,key))
    if (required) Rf_error("user key is required, but it could not be retrieved")
    NULL
}

new.user.key <- function(token=.session$token, realm="rcloud") {
    if (!nzConf("session.server")) stop("secure key storage requires SessionKeyServer, see session.server configuration in rcloud.conf")
    key <- session.server.generate.key(realm, token)
    if (length(key) && nzchar(key)) .Call(hex2raw,key) else stop("failed to obtain a new key")
}
