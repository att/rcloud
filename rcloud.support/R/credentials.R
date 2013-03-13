get.token.list <- function()
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
  print(user)
  print(token)
  rcloud.auth.path <- paste(rcloud.support:::.rc.conf$configuration.root, "/rcloud.auth", sep="")
  d <- get.token.list()
  old.token <- d$user.to.token[[user]]
  if (!is.null(old.token)) {
    d$token.to.user[[old.token]] <- NULL
  }
  d$user.to.token[[user]] <- token
  d$token.to.user[[token]] <- user
  saveRDS(d, rcloud.auth.path)
}

check.user.token.pair <- function(user, token)
{
  d <- get.token.list()
  user.from.token <- d$user.to.token[[user]]
  token.from.user <- d$token.to.user[[token]]

  (!is.null(user.from.token) &&
   (user.from.token == user) &&
   !is.null(token.from.user) &&
   (token.from.user == user))
}

check.token <- function(token)
{
  d <- get.token.list()
  user.from.token <- d$token.to.user[[token]]
  if (!is.null(user.from.token))
    user.from.token
  else
    FALSE
}
