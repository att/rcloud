################################################################################
# rcloud_status stuff goes here

# FIXME what's the relationship between this and rcloud.config in conf.R?
rcloud.get.conf.value <- function(key) {
  Allowed <- c('host', 'github.base.url', 'github.api.url', 'github.gist.url')
  if(key %in% Allowed)
    getConf(key)
  else
    NULL
}

rcloud.unauthenticated.load.notebook <- function(id, version = NULL) {
  if (!rcloud.is.notebook.published(id))
    stop("Notebook does not exist or has not been published")
  rcloud.load.notebook(id, version)
}

rcloud.load.notebook <- function(id, version = NULL) {
  res <- rcloud.get.notebook(id, version)
  ulog("RCloud rcloud.load.notebook(",id,",",version,", user=", .session$username,"): ", if(res$ok) "OK" else "FAILED")
  if (res$ok) {
    .session$current.notebook <- res
    rcloud.reset.session()
  }
  res
}

rcloud.install.notebook.stylesheets <- function() {
  n <- .session$current.notebook$content
  urls <- sapply(grep('^rcloud-.*\\.css$', names(n$files)), function(v) {
    n$files[[v]]$raw_url
  })
  rcloud.install.css(urls)
}

rcloud.unauthenticated.get.notebook <- function(id, version = NULL) {
  if (!rcloud.is.notebook.published(id))
    stop("Notebook does not exist or has not been published")
  rcloud.get.notebook(id, version)
}

rcloud.get.notebook <- function(id, version = NULL) {
  res <- if (!is.null(stash <- .session$deployment.stash)) {
    if (is.null(version))
      version <- rcs.get(stash.key(stash, id, "HEAD", type="tag"))
    res <- rcs.get(stash.key(stash, id, version))
    if (is.null(res$ok)) res <- list(ok=FALSE)
    res
  } else suppressWarnings(get.gist(id, version, ctx = .session$gist.context))
  ## FIXME: suppressWarnings is a hack to get rid of the stupid "Duplicated curl options"
  ##        which seem to be a httr bug
  if (rcloud.debug.level() > 1L) {
    if(res$ok) {
      cat("==== GOT GIST ====\n")
      cat(toJSON(res$content))
      cat("==== END GIST ====\n")
    }
    else {
      cat("==== GET NOTEBOOK FAILED ====\n")
      print(res)
    }
  }
  res
}

## this evaluates a notebook for its result
## this is extremely experimental -- use at your own risk
## the meaining of args is ambiguous and probably a bad idea - it jsut makes the client code a bit easier to write ...

## FIXME shouldn't the detection of unauthenticated vs authenticated happen
## transparently so we don't need to write different calls for different
## situations?
rcloud.unauthenticated.call.notebook <- function(id, version = NULL, args = NULL) {
  if (!rcloud.is.notebook.published(id))
    stop("Notebook does not exist or has not been published")
  rcloud.call.notebook(id, version, args)
}

rcloud.call.notebook <- function(id, version = NULL, args = NULL, attach = FALSE) {
  ulog("RCloud rcloud.call.notebook(", id, ",", version, ")")
  
  res <- rcloud.get.notebook(id, version)
  if (res$ok) {
    if (is.null(.session$current.notebook)) ## no top level? set us as the session notebook so that get.asset et al work
      .session$current.notebook <- res
      
    args <- as.list(args)
    ## this is a hack for now - we should have a more general infrastructure for this ...
    ## get all files
    p <- res$content$files
    p <- p[grep("^part", names(p))]
    n <- names(p)
    if (!length(n)) return(NULL)
    ## extract the integer number
    i <- suppressWarnings(as.integer(gsub("^\\D+(\\d+)\\..*", "\\1", n)))
    result <- NULL
    if (is.environment(args)) {
      e <- args
    } else {
      e <- new.env(parent=.GlobalEnv)
      if (is.list(args) && length(args)) for (i in names(args)) if (nzchar(i)) e[[i]] <- args[[i]]
    }
    ## sort
    for (o in p[match(sort.int(i), i)]) {
      if (grepl("^part.*\\.R$", o$filename)) { ## R code
        expr <- parse(text=o$content)
        result <- eval(expr, e)
      } else if (grepl("^part.*\\.md", o$filename)) { ## markdown
        ## FIXME: we ignore markdown for now ...
      }
    }
    if (attach) attach(e)
    result
  } else NULL
}

## FIXME shouldn't the detection of unauthenticated vs authenticated happen
## transparently so we don't need to write different calls for different
## situations?
rcloud.unauthenticated.call.FastRWeb.notebook <- function(id, version = NULL, args = NULL) {
  if (!rcloud.is.notebook.published(id))
    stop("Notebook does not exist or has not been published")
  rcloud.call.FastRWeb.notebook(id, version, args)
}

rcloud.call.FastRWeb.notebook <- function(id, version = NULL, args = NULL) {
  result <- rcloud.call.notebook(id, version, NULL)
  if (is.function(result)) {
    require(FastRWeb)
    l <- as.list(as.WebResult(do.call(result, args, envir=environment(result))))
    if (isTRUE(l[[1]] == "tmpfile")) {
      fn <- file.path(getwd(), gsub("/","_",l[[2]],fixed=TRUE))
      cat("rcloud.call.FastRWeb.notebook: file is", fn,"\n")
      sz <- file.info(fn)$size
      if (any(is.na(sz))) stop("Error reading temporary file ",fn)
      r <- readBin(fn, raw(), sz)
      unlink(fn)
      return(c(list(r), l[-(1:2)]))
    }
    l[[1]] <- NULL ## FIXME: we assume "html" type here .. need to implement others ...
    l
  } else result
}

rcloud.notebook.by.name <- function(name, user=.session$username, path=TRUE) {
  nl <- user.all.notebooks(user)
  if (!length(nl)) return(if(path) NULL else character(0))
  names <- unlist(rcs.get(usr.key("description", user=".notebook", notebook=nl), TRUE))
  names(names) <- nl ## we want the ids as keys, not the RCS keys
  ok <- sapply(names, function(s) (name == s || (path && substr(name, 1, nchar(s)) == s && substr(name, nchar(s)+1L, nchar(s)+1L) == "/")))
  if (!any(ok)) return(if(path) NULL else character(0))
  notebook <- as.character(names(names)[ok])
  if (!path) return(notebook)
  extra.path <- sapply(names[ok], function(nmatch) if (nmatch == name) "" else substr(name, nchar(nmatch) + 1L, nchar(name)))
  m <- matrix(c(notebook, extra.path),,2)
  colnames(m) <- c("id", "extra.path")
  m
}

## FIXME shouldn't the detection of unauthenticated vs authenticated happen
## transparently so we don't need to write different calls for different
## situations?
rcloud.unauthenticated.notebook.by.name <- function(name, user=.session$username, path=TRUE) {
  candidates <- rcloud.notebook.by.name(name, user)
  if (length(candidates) < 1L) return(candidates)
  vec <- is.null(dim(candidates))
  id <- if (vec) candidates else candidates[,1L]
  pub <- sapply(id, rcloud.is.notebook.published)
  if (all(!pub)) return(if(vec) character(0) else NULL)
  if (vec) candidates[pub] else candidates[pub,,drop=FALSE]
}

rcloud.upload.to.notebook <- function(file, name) {
  if (is.null(.session$current.notebook))
    stop("Notebook must be loaded")
  id <- .session$current.notebook$content$id
  ulog("RCloud rcloud.upload.to.notebook(id=", id, ", name=", name, ")")
  files <- list()
  files[[name]] <- list(content=rawToChar(file))
  content <- list(files = files)
  res <- rcloud.update.notebook(id, content)
  .session$current.notebook <- res
  res
}

rcloud.update.notebook <- function(id, content) {
  res <- modify.gist(id, content, ctx = .session$gist.context)
  .session$current.notebook <- res
  if (nzConf("solr.url")) {
    star.count <- rcloud.notebook.star.count(id)
    mcparallel(update.solr(res, star.count), detached=TRUE)
  }
  res
}

update.solr <- function(notebook, starcount){
  url <- getConf("solr.url")
  if (is.null(url)) stop("solr configuration not enabled")

  ## FIXME: gracefully handle unavailability
  curlTemplate <- paste0(url, "/update/json?commit=true")
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
    postForm(curlTemplate, .opts = list(
             postfields = paste("[",completedata,"]",sep=''),
             httpheader = c('Content-Type' = 'application/json', Accept = 'application/json')))
  }
}

rcloud.search <-function(query,sortby,orderby) {
  url <- getConf("solr.url")
  if (is.null(url)) stop("solr is not enabled")

  ## FIXME: shouldn't we URL-encode the query?!?
  q <- gsub("%20","+",query)
  solr.url <- paste0(url,"/select?q=",q,"&start=0&rows=1000&wt=json&indent=true&fl=description,id,user,updated_at,starcount&hl=true&hl.fl=content,comments&hl.fragsize=0&hl.maxAnalyzedChars=-1&sort=",sortby,"+",orderby)
  solr.res <- getURL(solr.url, .encoding = 'utf-8', .mapUnicode=FALSE)
  solr.res <- fromJSON(solr.res)
  response.docs <- solr.res$response$docs
  response.high <- solr.res$highlighting
  if(is.null(solr.res$error)){
    if(length(response.docs) > 0){
      for(i in 1:length(response.high)){
        if(length(response.high[[i]]) != 0){
	  if(!is.null(response.high[[i]]$content)) {
            parts.content <- fromJSON(response.high[[i]]$content)
	    for(j in 1:length(parts.content)){
              strmatched <- grep("open_b_close",strsplit(parts.content[[j]]$content,'\n')[[1]],value=T,fixed=T)
              if(length(which(strsplit(parts.content[[j]]$content,'\n')[[1]] == strmatched[1]) !=0)) {
                if(which(strsplit(parts.content[[j]]$content,'\n')[[1]] == strmatched[1])%in%1 | (which(strsplit(parts.content[[j]]$content,'\n')[[1]] == strmatched[1])%in%length(strsplit(parts.content[[j]]$content,'\n')[[1]]))) {
                  parts.content[[j]]$content <- strsplit(parts.content[[j]]$content,'\n')[[1]][which(strsplit(parts.content[[j]]$content,'\n')[[1]] == strmatched[1])]
                } else
                  parts.content[[j]]$content <- strsplit(parts.content[[j]]$content,'\n')[[1]][(which(strsplit(parts.content[[j]]$content,'\n')[[1]] == strmatched[1])-1):(which(strsplit(parts.content[[j]]$content,'\n')[[1]] == strmatched[1])+1)]
              } else
                parts.content[[j]]$content <- grep("open_b_close",strsplit(parts.content[[j]]$content,'\n')[[1]],value=T,ignore.case=T)
            }
	  } else {
            response.high[[i]]$content <- "[{\"filename\":\"part1.R\",\"content\":[]}]"
	    parts.content <- fromJSON(response.high[[i]]$content)
          }
          if(!is.null(response.high[[i]]$comments)) parts.content[[length(parts.content)+1]] <- list(filename="comments", content=response.high[[i]]$comments)
          response.high[[i]]$content <- toJSON(parts.content)
                                        #Handling HTML content
          response.high[[i]]$content <- gsub("<","&lt;",response.high[[i]]$content)
          response.high[[i]]$content <- gsub(">","&gt;",response.high[[i]]$content)
          response.high[[i]]$content <- gsub("open_b_close","<b style=\\\\\"background:yellow\\\\\">",response.high[[i]]$content)
          response.high[[i]]$content <- gsub("open_/b_close","</b>",response.high[[i]]$content)
        } else
        response.high[[i]]$content <-"[{\"filename\":\"part1.R\",\"content\":[]}]"
      }
      json<-""
      for(i in 1:length(response.docs)){
        time <- solr.res$responseHeader$QTime
        notebook <- response.docs[[i]]$description
        id <- response.docs[[i]]$id
        starcount <- response.docs[[i]]$starcount
        updated.at <- response.docs[[i]]$updated_at
        user <- response.docs[[i]]$user
        parts <- response.high[[i]]$content
        json[i] <- toJSON(c('QTime'=time,'notebook'=notebook,'id'=id,'starcount'=starcount,'updated_at'=updated.at,'user'=user,'parts'=parts))
      }
      return(json)
    } else
    return(solr.res$response$docs)
  } else
  return(c("error",solr.res$error$msg))
}

rcloud.create.notebook <- function(content) {
  res <- create.gist(content, ctx = .session$gist.context)
  if (res$ok) {
    .session$current.notebook <- res
    rcloud.reset.session()
  }
  res
}

rcloud.rename.notebook <- function(id, new.name) {
  ulog("RCloud rcloud.rename.notebook(", id, ", ", toJSON(new.name), ")")
  modify.gist(id,
              list(description=new.name),
              ctx = .session$gist.context)
}

rcloud.fork.notebook <- function(id) fork.gist(id, ctx = .session$gist.context)

rcloud.get.users <- function() ## NOTE: this is a bit of a hack, because it abuses the fact that users are first in usr.key...
  ## also note that we are looking deep in the config space - this shold be really much easier ...
  gsub("/.*","",rcs.list(usr.key(user="*", notebook="system", "config", "current", "notebook")))

# sloooow, but we don't have any other way of verifying the owner
notebook.is.mine <- function(id) {
  nb <- rcloud.get.notebook(id)
  nb$content$user$login == .session$username
}

rcloud.publish.notebook <- function(id) {
  if(notebook.is.mine(id)) {
    rcs.set(rcs.key(".notebook", id, "public"), 1)
    TRUE
  } else
    FALSE
}

rcloud.unpublish.notebook <- function(id) {
  if(notebook.is.mine(id)) {
    rcs.rm(rcs.key(".notebook", id, "public"))
    TRUE
  } else
    FALSE
}

rcloud.is.notebook.published <- function(id) {
  !is.null(rcs.get(rcs.key(".notebook", id, "public")))
}

rcloud.is.notebook.visible <- function(id)
  rcs.get(rcs.key(".notebook", id, "visible"))

rcloud.set.notebook.visibility <- function(id, value) {
  if(notebook.is.mine(id)) {
    rcs.set(rcs.key(".notebook", id, "visible"), value != 0)
    TRUE
  }
  else
    FALSE
}

rcloud.port.notebooks <- function(url, books, prefix) {
  foreign.ctx <- create.github.context(url)

  Map(function(notebook) {
    getg <- get.gist(notebook, ctx = foreign.ctx)
    if(getg$ok) {
      gist <- getg$content
      newgist <- list(description = paste(prefix, gist$description, sep=""),
                      files = gist$files);
      rcloud.create.notebook(newgist)
    }
    else getg
  }, books)
}

rcloud.setup.dirs <- function() {
    for (data.subdir in c("userfiles", "history", "home"))
        if (!file.exists(fn <- pathConf("data.root", data.subdir)))
             dir.create(fn, FALSE, TRUE, "0770")
}

rcloud.get.completions <- function(text, pos) {
  # from rcompgen.completion
  utils:::.assignLinebuffer(text)
  utils:::.assignEnd(pos)
  utils:::.guessTokenFromLine()
  utils:::.completeToken()
  utils:::.CompletionEnv[["comps"]]
}

rcloud.help <- function(topic) {
  result <- help(topic)
  if(length(result)) {
    print(result)
    TRUE
  }
  else FALSE 
}

## FIXME: won't work - uses a global file!
## FIXME: should search be using this instead of update notebook?!?
rcloud.record.cell.execution <- function(user = .session$username, json.string) {
#  cat(paste(paste(Sys.time(), user, json.string, sep="|"), "\n"),
#      file=pathConf("data.root", "history", "main_log.txt"), append=TRUE)
}

rcloud.debug.level <- function() if (hasConf("debug")) getConf("debug") else 0L

################################################################################
# stars

star.key <- function(notebook)
{
  user <- .session$username
  rcs.key(".notebook", notebook, "stars", user)
}

star.count.key <- function(notebook)
{
  rcs.key(".notebook", notebook, "starcount")
}

rcloud.notebook.star.count <- function(notebook)
{
  result <- rcs.get(star.count.key(notebook))
  if (is.null(result)) 0 else result
}

rcloud.multiple.notebook.star.counts <- function(notebooks)
{
  Map(rcloud.notebook.star.count, notebooks)
}

rcloud.is.notebook.starred <- function(notebook)
{
  !is.null(rcs.get(star.key(notebook)))
}

rcloud.star.notebook <- function(notebook)
{
  if (!rcloud.is.notebook.starred(notebook)) {
    rcs.set(star.key(notebook), TRUE)
    rcs.incr(star.count.key(notebook))
  }
}

rcloud.unstar.notebook <- function(notebook)
{
  if (rcloud.is.notebook.starred(notebook)) {
    rcs.rm(star.key(notebook))
    rcs.decr(star.count.key(notebook))
  }
}

rcloud.get.my.starred.notebooks <- function()
{
  gsub(".notebook/([^/]*).*", "\\1", rcs.list(star.key("*")))
}

################################################################################
# config

user.all.notebooks <- function(user) {
  notebooks <- gsub(".*/", "", rcs.list(usr.key(user=user, notebook="system", "config", "notebooks", "*")))
  if(user == .session$username)
    notebooks
  else { # filter notebooks on their visibility before they get to the client
    visible <- unlist(rcs.get(usr.key(user=".notebook", notebook=notebooks, "visible"), TRUE))
    if (length(visible)) {
      visible.notebooks <- gsub("\\.notebook/(.*)/visible","\\1", names(visible)[visible])
      notebooks[notebooks %in% visible.notebooks]
    } else character()
  }
}

rcloud.config.all.notebooks <- function()
  user.all.notebooks(.session$username)

rcloud.config.all.notebooks.multiple.users <- function(users) {
  result <- lapply(users, user.all.notebooks)
  names(result) <- users
  result

}

rcloud.config.add.notebook <- function(id)
  rcs.set(usr.key(user=.session$username, notebook="system", "config", "notebooks", id), TRUE)

rcloud.config.remove.notebook <- function(id)
  rcs.rm(usr.key(user=.session$username, notebook="system", "config", "notebooks", id))

rcloud.config.get.current.notebook <- function() {
  base <- usr.key(user=.session$username, notebook="system", "config", "current")
  list(notebook = rcs.get(rcs.key(base, "notebook")),
       version = rcs.get(rcs.key(base, "version")))
}

rcloud.config.set.current.notebook <- function(current) {
  base <- usr.key(user=.session$username, notebook="system", "config", "current")
  rcs.set(rcs.key(base, "notebook"), current$notebook)
  rcs.set(rcs.key(base, "version"), current$version)
}

rcloud.config.new.notebook.number <- function()
  rcs.incr(usr.key(user=.session$username, notebook="system", "config", "nextwork"))

rcloud.config.get.recent.notebooks <- function() {
  keys <- rcs.list(usr.key(user=.session$username, notebook="system", "config", "recent", "*"))
  vals <- rcs.get(keys, list=TRUE)
  names(vals) <- gsub(".*/", "", names(vals))
  vals
}

rcloud.config.set.recent.notebook <- function(id, date)
  rcs.set(usr.key(user=.session$username, notebook="system", "config", "recent", id), date)

rcloud.config.clear.recent.notebook <- function(id)
  rcs.rm(usr.key(user=.session$username, notebook="system", "config", "recent", id))

rcloud.config.get.user.option <- function(key) {
  if(length(key)>1) {
    results <- rcs.get(rcs.key(user=.session$username, notebook="system", "config", key), list=TRUE)
    names(results) <- gsub(rcs.key(user=.session$username, notebook="system", "config", ""), "", names(results))
    results
  }
  else
    rcs.get(rcs.key(user=.session$username, notebook="system", "config", key))
}

rcloud.config.set.user.option <- function(key, value)
  rcs.set(rcs.key(user=.session$username, notebook="system", "config", key), value)

################################################################################
# notebook cache

rcloud.get.notebook.info <- function(id) {
  base <- usr.key(user=".notebook", notebook=id)
  fields <- c("username", "description", "last_commit", "visible")
  keys <- rcs.key(base, fields)
  results <- rcs.get(keys, list=TRUE)
  names(results) <- fields
  results
}

rcloud.get.multiple.notebook.infos <- function(ids) {
  result <- lapply(ids, rcloud.get.notebook.info)
  names(result) <- ids
  result
}

rcloud.set.notebook.info <- function(id, info) {
  base <- usr.key(user=".notebook", notebook=id)
  rcs.set(rcs.key(base, "username"), info$username)
  rcs.set(rcs.key(base, "description"), info$description)
  rcs.set(rcs.key(base, "last_commit"), info$last_commit)
}

rcloud.purl.source <- function(contents)
{
  if(length(contents)==1 && contents[[1]]=="")
    return(contents)
  input.file <- tempfile(fileext="Rmd")
  output.file <- tempfile(fileext="R")
  cat(contents, file = input.file)
  purl(input.file, output.file, documentation = 2)
  result <- readLines(output.file)
  unlink(output.file)
  unlink(input.file)
  result
}
