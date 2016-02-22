rcloud.get.comments <- function(id, source = NULL) {
    if (is.null(source)) source <- rcloud.get.notebook.source(id)
    res <- get.gist.comments(id, ctx = .rcloud.get.gist.context(source))
    if (res$ok)
        toJSON(res$content)
    else
        list()
}

rcloud.post.comment <- function(id, content)
{
  res <- create.gist.comment(id, content, ctx = .rcloud.get.gist.context())
  rcloud.comments.email(id, content, ' posted a new')
  if (nzConf("solr.url")) mcparallel(.solr.post.comment(id, content, res$content$id), detached=TRUE)
  res
}

rcloud.modify.comment <- function(id, cid, content)
{
  res <- modify.gist.comment(id,cid,content, ctx = .rcloud.get.gist.context())
  rcloud.comments.email(id, content, ' modified an old')
  mcparallel(.solr.modify.comment(id, content, cid), detached=TRUE)
  res$ok
}

rcloud.delete.comment <- function(id,cid)
{
  mcparallel(.solr.delete.comment(id, cid), detached=TRUE)
  res <- delete.gist.comment(id,cid, ctx = .rcloud.get.gist.context())
  res$ok
}

rcloud.comments.email <- function(id, content, type) {
  to <- .session$username
  to.email <- rcloud.get.git.user(to)$email
  from.email <- getConf("email.from")
  title <- rcloud.get.notebook.info(id)$description
  smtp <- getConf("smtp.server")
  is.subscribed <- rcloud.config.get.user.option('subscribe-to-comments')

  if (from.email == "" || length(from.email) == 0)
    from.email <- 'DoNotREPLY'

  if(is.null(is.subscribed) | length(is.subscribed) == 0 | smtp == "" || length(smtp) == 0)
    is.subscribed <- FALSE

  if(is.subscribed) {
    subject <- paste(.session$username, type, " comment on your notebook [",title,"]",sep="");
    cont <- rcloud.create.email(fromJSON(content[1]))
    msg <- mime_part(cont)
    msg[["headers"]][["Content-Type"]] <- "text/html"
    body <- list(msg)
    sendmail(from.email, to.email, subject, body , control=list(smtpServer=smtp))
  }
}

Rcloud.create.email <- function(content) {
  url <- .session$url
  email.content <- paste0('<html><head><title>Comment Notification</title></head><body><div><h3>Comment :</h3><p>"',
    content,'"</p><p><a href=\'', url, '\' target=\'', url, '\'>Go To Notebook</a></p></div></body></html>')
  email.content
}
