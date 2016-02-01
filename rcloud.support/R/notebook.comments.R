rcloud.get.comments <- function(id, source = NULL) {
    if (is.null(source)) source <- rcloud.get.notebook.source(id)
    res <- get.gist.comments(id, ctx = .rcloud.get.gist.context(source))
    if (res$ok)
        toJSON(res$content)
    else
        list()
}

.solr.post.comment <- function(id, content, comment.id) {
  
  ## query ID to see if it has existing comments
  query <- list(q=paste0("id:",id),start=0,rows=1000)
  solr.res <- .solr.get(query=query)
  comment.content <- fromJSON(content)
  
  ## pick set/add depending on the exsitng content
  method <- if(is.null(solr.res$response$docs[[1]]$comments)) "set" else "add"

  ## send the update request
  metadata <- paste0('{"id":"', id, '","comments":{"', method, '":"', paste(comment.id,':::',comment.content,':::',.session$username), '"}}')
 .solr.post(data=metadata)
}

rcloud.post.comment <- function(id, content)
{
  res <- create.gist.comment(id, content, ctx = .rcloud.get.gist.context())
  rcloud.comments.email(id, content, ' posted a new')
  if (nzConf("solr.url")) mcparallel(.solr.post.comment(id, content, res$content$id), detached=TRUE)
  res
}

.solr.modify.comment <- function(id, content, cid) {
  query <- list(q=paste0("id:",id),start=0,rows=1000)
  solr.res <- .solr.get(query=query)
  index <- grep(cid, solr.res$response$docs[[1]]$comments)
  solr.res$response$docs[[1]]$comments[[index]] <- paste(cid, fromJSON(content)$body, sep=' : ')
  metadata <- paste0('{"id":"',id,'","comments":{"set":[\"',paste(solr.res$response$docs[[1]]$comments, collapse="\",\""),'\"]}}')
  .solr.post(data=metadata)
}

rcloud.modify.comment <- function(id, cid, content)
{
  res <- modify.gist.comment(id,cid,content, ctx = .rcloud.get.gist.context())
  rcloud.comments.email(id, content, ' modified an old')
  mcparallel(.solr.modify.comment(id, content, cid), detached=TRUE)
  res$ok
}

.solr.delete.comment <- function(id, cid) {
  query <- list(q=paste0("id:",id),start=0,rows=1000)
  solr.res <- .solr.get(query=query)
  index <- grep(cid, solr.res$response$docs[[1]]$comments)
  solr.res$response$docs[[1]]$comments <- solr.res$response$docs[[1]]$comments[-index]
  metadata <- paste0('{"id":"',id,'","comments":{"set":[\"',paste(solr.res$response$docs[[1]]$comments, collapse="\",\""),'\"]}}')
  .solr.post(data=metadata)
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

rcloud.create.email <- function(content) {
  url <- .session$url
  email.content <- paste0('<html><head><title>Comment Notification</title></head><body><div><h3>Comment :</h3><p>"', 
    content,'"</p><p><a href=\'', url, '\' target=\'', url, '\'>Go To Notebook</a></p></div></body></html>')
  email.content
}
