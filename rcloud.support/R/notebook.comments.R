rcloud.get.comments <- function(id)
{
  res <- get.gist.comments(.session$rgithub.context, id)
  if (res$ok)
    toJSON(res$content)
  else
    list()
}

rcloud.post.comment <- function(id, content)
{
  res <- create.gist.comment(.session$rgithub.context, id, content)
  if (!res$ok)
    print(res)
  res$ok
}
