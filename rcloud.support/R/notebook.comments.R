rcloud.get.comments <- function(id)
{
  res <- get.gist.comments(id, ctx = .session$rgithub.context)
  if (res$ok)
    toJSON(res$content)
  else
    list()
}

rcloud.post.comment <- function(id, content)
{
  res <- create.gist.comment(id, content, ctx = .session$rgithub.context)
  if (!res$ok)
    print(res)
  res$ok
}
