## this is only used is there is no session server ... and it's a bad hack since it's not safe>
.get.token.list <- function()
{
  rcloud.auth.path <- paste(rcloud.support:::.rc.conf$configuration.root, "/rcloud.auth", sep="")
  d <- NULL
  tryCatch(d <- readRDS(rcloud.auth.path),
           error=function(e) {
             d <<- new.env(parent=emptyenv())
             d$user.to.token <<- new.env(parent=emptyenv())
             d$token.to.user <<- new.env(parent=emptyenv())
           })
  d
}

set.token <- function(user, token)
{
  if (is.null(rcloud.support:::.rc.conf$session.server)) {
    rcloud.auth.path <- paste(rcloud.support:::.rc.conf$configuration.root, "/rcloud.auth", sep="")
    d <- .get.token.list()
    old.token <- d$user.to.token[[user]]
    if (!is.null(old.token)) {
      d$token.to.user[[old.token]] <- NULL
    }
    d$user.to.token[[user]] <- token
    d$token.to.user[[token]] <- user
    saveRDS(d, rcloud.auth.path)
  } else {
    RCurl::getURL(paste0(rcloud.support:::.rc.conf$session.server, "/stored_token?token=", URLencode(token), "&user=", URLencode(user), "&realm=rcloud"))
  }    
}

check.user.token.pair <- function(user, token)
{
  if (is.null(rcloud.support:::.rc.conf$session.server)) {
    d <- .get.token.list()
    token.from.user <- d$user.to.token[[user]]
    user.from.token <- d$token.to.user[[token]]
    cat("check.user.token.pair\n");
    print(user);
    print(token);
    print(user.from.token);
    print(token.from.user);

    (!is.null(user.from.token) &&
     (user.from.token == user) &&
     !is.null(token.from.user) &&
     (token.from.user == token))
  } else {
    res <- RCurl::getURL(paste0(rcloud.support:::.rc.conf$session.server, "/valid?token=", URLencode(token), "&realm=rcloud"))
    res <- strsplit(res, "\n")[[1]]
    cat("check.user.token.pair(", user, ", ", token, ") valid: ", res[1],", user: ", res[2], ", source: ", res[3], "\n", sep='')
    (length(res) > 1) && isTRUE(res[1] == "YES") && isTRUE(res[2] == user) && isTRUE(res[3] == "stored")
  }
}

check.token <- function(token, valid.sources="stored")
{
  if (is.null(rcloud.support:::.rc.conf$session.server)) {
    d <- .get.token.list()
    user.from.token <- d$token.to.user[[token]]
    if (!is.null(user.from.token))
      user.from.token
    else
      FALSE
  } else {
    res <- RCurl::getURL(paste0(rcloud.support:::.rc.conf$session.server, "/valid?token=", URLencode(token), "&realm=rcloud"))
    res <- strsplit(res, "\n")[[1]]
    cat("check.token(", token,") valid: ", res[1],", user: ", res[2], ", source: ", res[3], "\n", sep='')
    if ((length(res) > 1) && isTRUE(res[1] == "YES") && isTRUE(res[3] %in% valid.sources)) res[2] else FALSE    
  }
}
