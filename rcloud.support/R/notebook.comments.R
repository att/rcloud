rcloud.get.comments <- function(id)
{
  res <- get.gist.comments(id, ctx = .session$rgithub.context)
  if (res$ok)
    toJSON(res$content)
  else
    list()
}

.solr.post.comment <- function(id, content) {
  url <- getConf("solr.url")
  ## query ID to see if it has existing comments
  solr.url <- URLencode(paste0(url, "/select?q=id:",id,"&start=0&rows=1000&wt=json&sort=starcount desc"))
  solr.res <- fromJSON(getURL(solr.url,.encoding = 'utf-8',.mapUnicode=FALSE))
  comment.content <- fromJSON(content)
  
  ## pick set/add depending on the exsitng content
  method <- if(is.null(solr.res$response$docs[[1]]$comments)) "set" else "add"

  ## send the update request
  curlTemplate <- paste0(url,"/update/json?commit=true")
  metadata <- paste0('{"id":"', id, '","comments":{"', method, '":"', comment.content, '"}}')
  postForm(curlTemplate, .opts = list(
                           postfields = paste0("[",metadata,"]"),
                           httpheader = c('Content-Type' = 'application/json',Accept = 'application/json')))
}

rcloud.post.comment <- function(id, content)
{
  res <- create.gist.comment(id, content, ctx = .session$rgithub.context)
  if (nzConf("solr.url")) mcparallel(.solr.post.comment(id, content), detached=TRUE)
  if (!res$ok)
    print(res)
  res$ok
}
