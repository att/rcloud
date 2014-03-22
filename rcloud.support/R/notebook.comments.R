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
  solr.host.port <- toString(.session$solr.host.port)  
  solr.url <- URLencode(paste0("http://",solr.host.port,"/solr/",.session$collection,"/select?q=id:",id,"&start=0&rows=1000&wt=json&sort=starcount desc"))
  solr.res<-getURL(solr.url,.encoding = 'utf-8',.mapUnicode=FALSE)
  solr.res<-fromJSON(solr.res)
  comment.content<-fromJSON(content)
  if(is.null(solr.res$response$docs[[1]]$comments))
  {
	 curlTemplate <- paste0("http://",solr.host.port,"/solr/",.session$collection,"/update/json?commit=true")
	 metadata<-paste0('{\"id\":\"',id, '\",\"comments\":{\"set\":\"',comment.content,'\"}}')
	 postForm(curlTemplate,.opts = list(postfields = paste("[",metadata,"]",sep=''),httpheader = c('Content-Type' = 'application/json',Accept = 'application/json')))
  }else{
	curlTemplate <- paste0("http://",solr.host.port,"/solr/",.session$collection,"/update/json?commit=true")
	metadata<-paste0('{\"id\":\"',id, '\",\"comments\":{\"add\":\"',comment.content,'\"}}')
	postForm(curlTemplate,.opts = list(postfields = paste("[",metadata,"]",sep=''),httpheader = c('Content-Type' = 'application/json',Accept = 'application/json')))
  }
  if (!res$ok)
    print(res)
  res$ok
}
