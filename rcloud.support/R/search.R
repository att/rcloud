# Some intelligent parsing account for basics like /solr/notebook and /solr/notebook/ is essentially the same thing
# Using httr::parse_url

.solr.post <- function(data,solr.url=getConf("solr.url"),solr.auth.user=getConf("solr.auth.user"),solr.auth.pwd=getConf("solr.auth.pwd"),isXML=FALSE) {
  content_type <- "application/json"
  body = paste("[",data,"]",sep='')
  httpConfig <- httr::config()

  # Check if Authentication info exists in the parameters
  if(!is.null(solr.auth.user)) httpConfig <- c(httpConfig,httr::authenticate(solr.auth.user,solr.auth.pwd))
  if(isXML){
    content_type ="text/xml"
    body=data
    }
  if(!is.null(solr.url)){
    solr.post.url <- httr::parse_url(solr.url)
    solr.post.url$path <- paste(solr.post.url$path,"update?commit=true",sep="/")
    mcparallel(httr::POST(build_url(solr.post.url) , body=body,add_headers('Content-Type'=content_type), config=httpConfig) ,detach=TRUE)   
  }
}

.solr.get <- function(query,solr.url=getConf("solr.url"),solr.auth.user=getConf("solr.auth.user"),solr.auth.pwd=getConf("solr.auth.pwd")){
  solr.get.url <- httr::parse_url(solr.url)
  solr.get.url$path <- paste(solr.get.url$path,"select",sep="/")
  solr.get.url$query <- query
  # https://cwiki.apache.org/confluence/display/solr/Response+Writers
  solr.get.url$query$wt<-"json"
  httpConfig <- httr::config()
  solr.res <- list(error=list(code=solr.get.url$hostname,msg="Unknown Error"))


  if(!is.null(solr.auth.user)) httpConfig <- c(httpConfig,httr::authenticate(solr.auth.user,solr.auth.pwd))
  resp <- tryCatch({
    httr::GET(build_url(solr.get.url),content_type_json(),accept_json(),config=httpConfig)
    }, 
    error = function(e) {solr.res$error$msg = e},
    warnings = function(w) {solr.res$error$msg = w}
  ) 
  
  if(!is.null(resp$message)) solr.res$error$msg <- paste0(solr.get.url$hostname," : ",resp$message)
    else if(!httr::http_error(resp)) solr.res <- fromJSON(content(resp, "parsed"))
      else solr.res$error$msg <- rawToChar(resp$content)
  return(solr.res)
}

update.solr <- function(notebook, starcount){
  #Update only notebooks which are visible
  if(rcloud.is.notebook.visible(notebook$content$id) && !(is.notebook.encrypted(notebook$content$id))){
  ## FIXME: gracefully handle unavailability
  content.files <- notebook$content$files
  ## Remove binary assets by removing elements with .b64 extention
  content.files <- content.files[unlist(lapply(names(content.files),function(o){tail(strsplit(o,split="\\.")[[1]],1) != "b64"}))]
  fns <- as.vector(sapply(content.files, function(o) o$filename))
  ## only index cells for now ...
  ## FIXME: do we really want to exclude the scratch file?
  if (length(content.files)) {
    sizes <- as.numeric(sapply(content.files, function(o) o$size))
    size <- sum(sizes, na.rm=TRUE)
    desc <- notebook$content$description
    desc <- gsub("^\"*|\"*$", "", desc)
    desc <- gsub("^\\\\*|\\\\*$", "", desc)
    if (length(grep("\"",desc) == 1)) {
      notebook.description <- strsplit(desc,'\"')
      desc <- paste(notebook.description[[1]],collapse="\\\"")
    } else if(length(grep("\\\\",desc) == 1)){
      notebook.description <- strsplit(desc,'\\\\')
      desc <- paste(notebook.description[[1]],collapse="\\\\")
    } else {
      desc
    }
    session.content <- notebook$content
    ## FIXME: followers is not in the notebook, set to 0 for now
    metadata<-paste0('{\"id\":\"',session.content$id, '\",\"user\":\"',session.content$user$login, '\",\"created_at\":\"',session.content$created_at, '\",\"updated_at\":\"',session.content$updated_at, '\",\"description\":\"',desc, '\",\"user_url\":\"',session.content$user$url, '\",\"avatar_url\":\"',session.content$user$avatar_url, '\",\"size\":\"',size, '\",\"commited_at\":\"',session.content$updated_at, '\",\"followers\":\"',0, '\",\"public\":\"',session.content$public, '\",\"starcount\":\"',starcount, '\",\"content\":{\"set\":\"\"}}')
    metadata.list <- fromJSON(metadata)
    content.files <- unname(lapply(content.files, function(o) list('filename'=o$filename,'content'=o$content)))
    content.files <- toJSON(content.files)
    metadata.list$content$set <- content.files
    completedata <- toJSON(metadata.list)
    .solr.post(data=completedata)
    }
  }
}

rcloud.search <-function(query, all_sources, sortby, orderby, start, pagesize) {
  url <- getConf("solr.url")
  if (is.null(url)) stop("solr is not enabled")
  
  ## FIXME: The Query comes URL encoded. From the search box? Replace all spaces with +
  ## Check if search terms are already URL encoded?
  if(nchar(query) > nchar(URLdecode(query))) query <- URLdecode(query)
  
  solr.query <- list(q=query,start=start,rows=pagesize,indent="true",hl="true",hl.preserveMulti="true",hl.fragsize=0,hl.maxAnalyzedChars=-1
                    ,fl="description,id,user,updated_at,starcount",hl.fl="content,comments",sort=paste(sortby,orderby))
  query <- function(solr.url,source='',solr.auth.user=NULL,solr.auth.pwd=NULL) {
    solr.res <- .solr.get(solr.url=solr.url,query=solr.query,solr.auth.user=solr.auth.user,solr.auth.pwd=solr.auth.pwd)
    
    rcloud.solr::parse.solr.res(solr.res, pagesize = pagesize, source = source)
  }
  if (isTRUE(all_sources)) {
    main <- query(url,solr.auth.user=getConf("solr.auth.user"),solr.auth.pwd=getConf("solr.auth.pwd"))
    l <- lapply(.session$gist.sources.conf, function(src)
      if ("solr.url" %in% names(src)) query(src['solr.url'], src['gist.source'],src['solr.auth.user'],src['solr.auth.pwd'])
      else character(0))
    unlist(c(list(main), l))
  }
  else query(url,solr.auth.user=getConf("solr.auth.user"),solr.auth.pwd=getConf("solr.auth.pwd"))
}

stitch.search.result <- function(splitted, type,k) {
  #Using '|-|' as delimitter here as <br>,/n or anything else might be the content of HTML
  switch(type,
         optA = paste0(k-1,'line_no',splitted[k-1],'|-|',k,'line_no',splitted[k],'|-|',k+1,'line_no',splitted[k+1],sep='|-|'),
         optB = paste0(k,'line_no',splitted[k],'|-|',k+1,'line_no',splitted[k+1],sep='|-|'),
         optC = paste0(k-1,'line_no',splitted[k-1],'|-|',k,'line_no',splitted[k],sep='|-|'),
         optD = paste0(k-1,'line_no',splitted[k-1],sep='|-|'),
         default = paste0(k,'line_no',splitted[k],sep='|-|'))
}

.solr.post.comment <- function(id, content, comment.id) {

  ## Post comments to only notebooks with visibility flag true or non encrypted notebooks
  if(rcloud.is.notebook.visible(id) && !(is.notebook.encrypted(id))){
  

  ## query ID to see if it has existing comments
  query <- list(q=paste0("id:",id),start=0,rows=1000)
  solr.res <- .solr.get(query=query)
  comment.content <- fromJSON(content)

  # Create reponse
  res <- list()
  res$id <- id
  body <- paste(comment.id,':::',comment.content,':::',.session$username)
  ## pick set/add depending on the exsitng content
  if(is.null(solr.res$response$docs[[1]]$comments)) {res$comments$set <- body } else { res$comments$add <- body }

  ## send the update request
  metadata <- toJSON(res)
  .solr.post(data=metadata)
  }
}

.solr.modify.comment <- function(id, content, cid) {

  query <- list(q=paste0("id:",id),start=0,rows=1000)
  solr.res <- .solr.get(query=query)

  cids <- trimws(unlist(lapply(solr.res$response$docs,function(o){lapply(o$comments,function(p){strsplit(p,":")[[1]][1]})})))
  index <- match(cid,cids)
  # If comment does not exist in the index create a new entry
  if(is.na(index)) {.solr.post.comment(id,content,cid)} else {
  solr.res$response$docs[[1]]$comments[[index]] <- paste(cid, ':::' , fromJSON(content)$body, ':::' , .session$username)
  res <- list()
  res$id <- id
  res$comments$set <- solr.res$response$docs[[1]]$comments
  metadata <- toJSON(res)
  .solr.post(data=metadata)
}
}

.solr.delete.comment <- function(id, cid) {
  query <- list(q=paste0("id:",id),start=0,rows=1000)
  solr.res <- .solr.get(query=query)
  index <- grep(cid, solr.res$response$docs[[1]]$comments)
  solr.res$response$docs[[1]]$comments <- solr.res$response$docs[[1]]$comments[-index]
  metadata <- paste0('{"id":"',id,'","comments":{"set":[\"',paste(solr.res$response$docs[[1]]$comments, collapse="\",\""),'\"]}}')
  .solr.post(data=metadata)
}

.solr.delete.doc <- function(id){
    metadata <- paste0('<delete><id>',id,'</id></delete>')
    .solr.post(data=metadata, isXML=TRUE)
}
