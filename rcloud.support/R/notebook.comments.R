rcloud.get.comments <- function(id)
{
  res <- get.gist.comments(id, ctx = .session$gist.context)
  if (res$ok)
    toJSON(res$content)
  else
    list()
}

.solr.post.comment <- function(id, content, comment.id) {
  url <- getConf("solr.url")
  ## query ID to see if it has existing comments
  solr.url <- URLencode(paste0(url, "/select?q=id:",id,"&start=0&rows=1000&wt=json&sort=starcount desc"))
  solr.res <- fromJSON(getURL(solr.url,.encoding = 'utf-8',.mapUnicode=FALSE))
  comment.content <- fromJSON(content)
  
  ## pick set/add depending on the exsitng content
  method <- if(is.null(solr.res$response$docs[[1]]$comments)) "set" else "add"

  ## send the update request
  curlTemplate <- paste0(url,"/update/json?commit=true")
  metadata <- paste0('{"id":"', id, '","comments":{"', method, '":"', paste(comment.id,':',comment.content), '"}}')
  postForm(curlTemplate, .opts = list(
                           postfields = paste0("[",metadata,"]"),
                           httpheader = c('Content-Type' = 'application/json',Accept = 'application/json')))
}

rcloud.post.comment <- function(id, content)
{
  res <- create.gist.comment(id, content, ctx = .session$gist.context)
  if (nzConf("solr.url")) mcparallel(.solr.post.comment(id, content, res$content$id), detached=TRUE)
  res
}

.solr.modify.comment <- function(id, content, cid) {
  url <- getConf("solr.url")
  solr.url <- URLencode(paste0(url, "/select?q=id:",id,"&start=0&rows=1000&fl=comments&wt=json"))
  solr.res <- fromJSON(getURL(solr.url,.encoding = 'utf-8',.mapUnicode=FALSE))
  index <- grep(cid, solr.res$response$docs[[1]]$comments)
  solr.res$response$docs[[1]]$comments[[index]] <- paste(cid, fromJSON(content)$body, sep=' : ')
  curlTemplate <- paste0(url,"/update/json?commit=true")
  metadata <- paste0('{"id":"',id,'","comments":{"set":[\"',paste(solr.res$response$docs[[1]]$comments, collapse="\",\""),'\"]}}')
  postForm(curlTemplate, .opts = list(
                           postfields = paste0("[",metadata,"]"),
                           httpheader = c('Content-Type' = 'application/json',Accept = 'application/json')))
}

rcloud.modify.comment <- function(id, cid, content)
{
  res <- modify.gist.comment(id,cid,content, ctx = .session$gist.context)
  mcparallel(.solr.modify.comment(id, content, cid), detached=TRUE)
  res$ok
}

.solr.delete.comment <- function(id, cid) {
  url <- getConf("solr.url")
  solr.url <- URLencode(paste0(url, "/select?q=id:",id,"&start=0&rows=1000&fl=comments&wt=json"))
  solr.res <- fromJSON(getURL(solr.url,.encoding = 'utf-8',.mapUnicode=FALSE))
  index <- grep(cid, solr.res$response$docs[[1]]$comments)
  solr.res$response$docs[[1]]$comments <- solr.res$response$docs[[1]]$comments[-index]
  curlTemplate <- paste0(url,"/update/json?commit=true")
  metadata <- paste0('{"id":"',id,'","comments":{"set":[\"',paste(solr.res$response$docs[[1]]$comments, collapse="\",\""),'\"]}}')
  write(metadata, "/vagrant/work/debug/deletec")
  postForm(curlTemplate, .opts = list(
                           postfields = paste0("[",metadata,"]"),
                           httpheader = c('Content-Type' = 'application/json',Accept = 'application/json')))
}

rcloud.delete.comment <- function(id,cid)
{
  mcparallel(.solr.delete.comment(id, cid), detached=TRUE)
  res <- delete.gist.comment(id,cid, ctx = .session$gist.context)
  res$ok
}
