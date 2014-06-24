rcloud.get.comments <- function(id)
{
  res <- get.gist.comments(id, ctx = .session$rgithub.context)
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
  res <- create.gist.comment(id, content, ctx = .session$rgithub.context)
  if (nzConf("solr.url")) mcparallel(.solr.post.comment(id, content, res$content$id), detached=TRUE)
  res
}

.solr.modify.comment <- function(id, content, comment.id) {
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

rcloud.modify.comment <- function(id, cid, content)
{
  res <- modify.gist.comment(id,cid,content, ctx = .session$rgithub.context)
  url <- getConf("solr.url")  
  library("rredis")
  redisConnect(host="localhost",port=6379, password=NULL, returnRef= FALSE, nodelay=FALSE, timeout=2678399L)
  ## query ID to see if it has existing comments
  solr.url <- URLencode(paste0(url, "/select?q=id:",id,"&start=0&rows=1000&fl=comments&wt=json"))
  write(url,"/vagrant/work/debug/url",append=TRUE)
  solr.res <- fromJSON(getURL(solr.url,.encoding = 'utf-8',.mapUnicode=FALSE))
  for(i in c(1:(length(solr.res$response$docs[[1]]$comments)))){
    split.solr.comment <- strsplit(solr.res$response$docs[[1]]$comments[[i]],":")
    split.solr.comment[[1]][1] <- gsub("^\\s+|\\s+$", "",split.solr.comment[[1]][1])
    if(paste0(cid,"")==split.solr.comment[[1]][1]){
      solr.res$response$docs[[1]]$comments[[i]]<-paste0(cid,":",content$body)
    }
  }
  write(toJSON(solr.res),"/vagrant/work/debug/solr.res")
  res$ok
}

rcloud.delete.comment <- function(id,cid)
{
  res <- delete.gist.comment(id,1250554, ctx = .session$rgithub.context)
  res$ok
}
