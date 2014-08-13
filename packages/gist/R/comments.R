delete.gist.comment  <- function (gist.id, comment.id, ctx = current.gist.context())
  UseMethod("delete.gist.comment", ctx)

modify.gist.comment  <- function (gist.id, comment.id, content, ctx = current.gist.context())
  UseMethod("modify.gist.comment", ctx)

create.gist.comment  <- function (gist.id, content, ctx = current.gist.context())
  UseMethod("create.gist.comment", ctx)

get.gist.comments  <- function (id, ctx = current.gist.context())
  UseMethod("get.gist.comments", ctx)
