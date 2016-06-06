get.gist  <- function (id, version = NULL, ctx = current.gist.context())
  UseMethod("get.gist", ctx)

fork.gist  <- function (id, ctx = current.gist.context())
  UseMethod("fork.gist", ctx)

get.gist.forks  <- function (id, ctx = current.gist.context())
  UseMethod("get.gist.forks", ctx)

modify.gist  <- function (id, content, ctx = current.gist.context())
  UseMethod("modify.gist", ctx)

create.gist  <- function (content, ctx = current.gist.context())
  UseMethod("create.gist", ctx)
