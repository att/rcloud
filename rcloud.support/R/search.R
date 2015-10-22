# Some intelligent parsing account for basics like /solr/notebook and /solr/notebook/ is essentially the same thing
# Using httr::parse_url

.solr.post <- function(data) {
  solr.post.url <- httr::parse_url(getConf("solr.url"))
  if(hasConf('solr.authkey')){
  solr.post.url$path <- paste(solr.post.url$path,"secureupdate?commit=true",sep="/")
  } else {
    solr.post.url$path <- paste(solr.post.url$path,"update?commit=true",sep="/")
  }
  httr::POST(build_url(solr.post.url) , body = paste("[",data,"]",sep=''),content_type_json(),accept_json() ,add_headers("auth-key"=getConf("solr.authkey")))
}

.solr.get <- function(query){
  solr.get.url <- httr::parse_url(getConf("solr.url"))
  solr.authkey <- getConf('solr.authkey')
  if(hasConf('solr.authkey')){
  solr.get.url$path <- paste(solr.get.url$path,"secureselect",sep="/")
  } else {
    solr.get.url$path <- paste(solr.get.url$path,"select",sep="/")
  }
  ## query ID to see if it has existing comments
  solr.get.url$query <- query
  solr.res <- httr::GET(build_url(solr.get.url),accept_json(),add_headers("auth-key"=as.character(solr.authkey)))
  solr.res <- fromJSON(content(solr.res, "parsed"))
  return(solr.res)
}

update.solr <- function(notebook, starcount){
  solr.post.url <- getConf("solr.url")
  if (is.null(solr.post.url)) stop("solr configuration not enabled")
  solr.post.url <- httr::parse_url(solr.post.url)
  if(hasConf('solr.authkey')){
    solr.post.url$path <- paste(solr.post.url$path,"secureupdate?commit=true",sep="/")
    } else {
      solr.post.url$path <- paste(solr.post.url$path,"update?commit=true",sep="/")
    }


  ## FIXME: gracefully handle unavailability
  content.files <- notebook$content$files
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
    .solr.post(completedata)
  }
}

rcloud.search <-function(query, all_sources, sortby, orderby, start, pagesize) {
  url <- getConf("solr.url")
  if (is.null(url)) stop("solr is not enabled")
  ## FIXME: shouldn't we URL-encode the query?!?
  solr.query <- paste0("q=",query,"&start=",start,"&rows=",pagesize,"&wt=json&indent=true&fl=description,id,user,updated_at,starcount&hl=true&hl.preserveMulti=true&hl.fl=content,comments&hl.fragsize=0&hl.maxAnalyzedChars=-1&sort=",sortby,"+",orderby)
  query <- function(solr.url,source='',solr.authkey=NA) {
    solr.get.url <- httr::parse_url(solr.url)
    if(!(is.na(solr.authkey))){
      solr.get.url$path <- paste(solr.get.url$path,"secureselect",sep="/")
      } else {
        solr.get.url$path <- paste(solr.get.url$path,"select",sep="/")
      }
      solr.get.url$query <- solr.query
      solr.res <- httr::GET(build_url(solr.get.url),accept_json(),add_headers("auth-key"=as.character(solr.authkey)))
      solr.res <- fromJSON(content(solr.res, "parsed")) 
      response.docs <- solr.res$response$docs
      count <- solr.res$response$numFound
      rows <- solr.res$params$rows
      response.high <- solr.res$highlighting
      if(is.null(solr.res$error)) {
        if(length(response.docs) > 0) {
          for(i in 1:length(response.high)) {
            if(length(response.high[[i]]) != 0) {
              if(!is.null(response.high[[i]]$content)) {
                parts.content <- fromJSON(response.high[[i]]$content)
                for(j in 1:length(parts.content)) {
                  splitted <-strsplit(parts.content[[j]]$content,'\n')[[1]]
                  res <-list()
                  for(k in 1: length(splitted)) {
                    is_match <- grep("open_b_close",splitted[[k]])
                    is_match_next <- NULL
                    is_match_next2 <- NULL
                    if(k < length(splitted)){
                      is_match_next <- grep("open_b_close",splitted[[k+1]])
                    }
                    if(k < (length(splitted) -2)){
                      is_match_next2 <- grep("open_b_close",splitted[[k+2]])
                    }
                    if(as.logical(length(is_match))) {
                      if(!as.logical(length(is_match_next)) && !as.logical(length(is_match_next2)) ) {
                        if(as.logical(length(splitted[k-1]) == "") | k ==1) {
                          res[k] <- stitch.search.result(splitted,'optB',k)
                          } else {
                            if(as.logical(length(splitted[k-1]) != "")) {
                              res[k] <- stitch.search.result(splitted,'optC',k)
                            }
                          }
                          } else if (as.logical(length(is_match_next)) && !as.logical(length(is_match_next2)) ) {
                            if(k !=1)
                            res[k] <- stitch.search.result(splitted,'optD',k)
                            } else {
                              res[k] <- stitch.search.result(splitted,'default',k)
                            }
                          }
                          if(k == length(splitted)) {
                            res[sapply(res, is.null)] <- NULL
                            parts.content[[j]]$content <- paste0(toString(res))
                          }
                        }
                      }
                      } else {
                        response.high[[i]]$content <- "[{\"filename\":\"part1.R\",\"content\":[]}]"
                        parts.content <- fromJSON(response.high[[i]]$content)
                      }
                      if(!is.null(response.high[[i]]$comments)) {
                        final_res <-list()
                        comments <- response.high[[i]]$comments
                        for(n in 1: length(comments)) {
                          cmt_match <- grep("open_b_close",comments[n])
                          if(as.logical(length(cmt_match))) {
                            final_res[[length(final_res)+1]] <- comments[n]
                          }
                        }
                        response.high[[i]]$comments <- final_res
                        parts.content[[length(parts.content)+1]] <- list(filename="comments", content=response.high[[i]]$comments)
                      }
                      response.high[[i]]$content <- toJSON(parts.content)
                                        #Handling HTML content
                                        response.high[[i]]$content <- gsub("<","&lt;",response.high[[i]]$content)
                                        response.high[[i]]$content <- gsub(">","&gt;",response.high[[i]]$content)
                                        response.high[[i]]$content <- gsub("open_b_close","<b style=\\\\\"background:yellow\\\\\">",response.high[[i]]$content)
                                        response.high[[i]]$content <- gsub("open_/b_close","</b>",response.high[[i]]$content)
                                        } else
                                        response.high[[i]]$content <-"[{\"filename\":\"part1.R\",\"content\":[]}]"
                                      }
                                      json <- ""
                                      for(i in 1:length(response.docs)){
                                        time <- solr.res$responseHeader$QTime
                                        notebook <- response.docs[[i]]$description
                                        id <- response.docs[[i]]$id
                                        starcount <- response.docs[[i]]$starcount
                                        updated.at <- response.docs[[i]]$updated_at
                                        user <- response.docs[[i]]$user
                                        parts <- response.high[[i]]$content
                                        json[i] <- toJSON(c(QTime=time,notebook=notebook,id=id,starcount=starcount,updated_at=updated.at,user=user,numFound=count,pagesize=pagesize,parts=parts,source=as.vector(source)))
                                      }
                                      return(json)
                                      } else
                                      return(solr.res$response$docs)
                                      } else
                                      return(c("error",solr.res$error$msg))
                                    }

                                    solr.authKey <- getConf('solr.authkey')
                                    if(is.null(solr.authKey))solr.authKey=NA 
                                    if (isTRUE(all_sources)) {
                                      main <- query(url,solr.authkey=c('solr.authkey'=solr.authKey))
                                      l <- lapply(.session$gist.sources.conf, function(src)
                                       if ("solr.url" %in% names(src)) query(src['solr.url'], src['gist.source'],src['solr.authkey']) 
                                       else character(0))
                                      unlist(c(list(main), l))
                                    } 
                                    else query(url,solr.authkey=c('solr.authkey'=solr.authKey))
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
