################################################################################
# rcloud_status stuff goes here

# FIXME what's the relationship between this and rcloud.config in conf.R?
rcloud.get.conf.value <- function(key, source = NULL) {
  Allowed <- c('host', 'exec.token.renewal.time', 'github.base.url', 'github.api.url', 'github.gist.url', 'solr.page.size', 'smtp.server', 'email.from')
  if(key %in% Allowed) {
    if(is.null(source) || source=='default')
      getConf(key)
    else {
      if(key %in% names(.session$gist.sources.conf[[source]]))
        .session$gist.sources.conf[[source]][[key]]
      else
        NULL
    }
  }
  else
    NULL
}

# note: this does not have the ineffective security check of the above
rcloud.get.conf.values <- function(pattern) {
  conf.keys <- keysConf()
  matched <- conf.keys[grep(pattern, conf.keys)]
  names(matched) <- matched
  lapply(matched, getConf)
}

filter.notebooks <- function(f, ids)
  if(is.list(ids)) {
    ids[filter.notebooks(f, names(ids))]
  } else ids[f(ids)]

.guess.language <- function(fn) {
    if (!length(grep(".",fn,TRUE))) return("unknown")
    ext <- gsub(".*\\.","",fn)
    ## just my guess ... no idea what GH actually uses ...
    .langs <- c(js="JavaScript", R="R", S="R", Rd="Rdoc", md="Markdown",
                c="C", C="C++", cc="C++", cxx="C++", java="Java",
                tex="TeX", Rmd="RMarkdown", sh="Shell", py="Python",
                css="CSS", html="HTML", svg="SVG")
    m <- match(ext, names(.langs))
    if (is.na(m)) "unknown" else .langs[[m]]
}

# any attributes we want to add onto what github gives us
# and re-code payload where needed
rcloud.augment.notebook <- function(res) {
  if(res$ok) {
    notebook <- res$content
    fork.of <- rcloud.get.notebook.property(notebook$id, 'fork_of')
    if(!is.null(fork.of))
      res$content$fork_of <- fork.of

    ## convert any binary contents stored in .b64 files
    res$content <- .gist.binary.process.incoming(res$content)

    hist <- res$content$history
    versions <- lapply(hist, function(h) { h$version })
    version2tag <- rcs.get(rcloud.support:::rcs.key('.notebook', notebook$id, 'version2tag', versions), list=TRUE)
    names(version2tag) <- versions
    version2tag <- Filter(Negate(is.null), version2tag)

    if(length(res$content$files))
      res$content$files <- lapply(res$content$files, function(o) {
        file.ext <- if (is.null(o$filename)) "" else tail(strsplit(o$filename, '\\.')[[1]], n=1)
        if (file.ext %in% names(.session$file.extensions))
          o$language <- .session$file.extensions[[file.ext]]
        o
      })


    if(length(hist)>0)
      for(i in 1:length(hist)) {
        tag <- version2tag[[hist[[i]]$version]]
        if(!is.null(tag))
          res$content$history[[i]]$tag <- tag
      }
    res$augmented <- TRUE
  }
  res
}

rcloud.fail.if.unpublished <- function(f)
  function(id, ...)
    if (!rcloud.is.notebook.published(id)) {
      stop("Notebook does not exist or has not been published")
    } else f(id, ...)

rcloud.unauthenticated.load.notebook <-
  rcloud.fail.if.unpublished(rcloud.load.notebook)

rcloud.load.notebook <- function(id, version = NULL, source = NULL, reset = TRUE) {
  res <- rcloud.get.notebook(id, version, source)
  ulog("RCloud rcloud.load.notebook(",id,",",version,", user=", .session$username,"): ", if(res$ok) "OK" else "FAILED")
  if (res$ok) {
    .session$current.notebook <- res
    if(reset)
       rcloud.reset.session()
  }
  res
}

## same as control, just don't return anything (and don't do anything if there is no separation)
## FIXME: since this is handled by githubHandler in JS, we have to pretend to have a valid result even
##        if it is later discarded
rcloud.load.notebook.compute <- function(...) { if (identical(.session$separate.compute, TRUE)) rcloud.load.notebook(...) else list(ok=TRUE) }
rcloud.unauthenticated.load.notebook.compute <- function(...) { if (identical(.session$separate.compute, TRUE)) rcloud.unauthenticated.load.notebook(...) else list(ok=TRUE) }

rcloud.get.version.by.tag <- function(gist_id,tag) {
  v <- rcs.get(rcs.key(username='.notebook', gist_id, 'tag2version', tag))
}

rcloud.get.tag.by.version <- function(gist_id,version) {
  t <- rcs.get(rcs.key(username='.notebook', gist_id, 'version2tag', version))
}

rcloud.tag.notebook.version <- function(gist_id, version, tag_name) {
  if(!notebook.is.mine(gist_id))
    return(FALSE)
  tag2version <- function(tag) rcs.key(username='.notebook', gist_id, 'tag2version', tag)
  version2tag <- function(version) rcs.key(username='.notebook', gist_id, 'version2tag', version)
  version.had.tag <- rcs.get(version2tag(version))
  if(!is.null(version.had.tag)) {
    rcs.rm(tag2version(version.had.tag))
  }
  if(!is.null(tag_name) && tag_name!='') {
    tag.had.version <- rcs.get(tag2version(tag_name))
    if(!is.null(tag.had.version)) {
      rcs.rm(version2tag(tag.had.version))
    }
    rcs.set(version2tag(version), tag_name)
    rcs.set(tag2version(tag_name), version)
  }
  else {
    rcs.rm(version2tag(version))
  }
  TRUE
}

rcloud.install.notebook.stylesheets <- function() {
  n <- rcloud.session.notebook()$content
  nn <- names(n$files)
  urls <- sapply(nn[grep('^rcloud-.*\\.css$', nn)], function(v) {
    paste0("/notebook.R/", n$id, "/", v)
  })
  rcloud.install.css(urls)
}

rcloud.unauthenticated.get.notebook <-
  rcloud.fail.if.unpublished(rcloud.get.notebook)

rcloud.get.notebook <- function(id, version = NULL, source = NULL, raw=FALSE) {
  if (is.null(source)) source <- rcloud.get.notebook.source(id)
  res <- get.gist(id, version, ctx = .rcloud.get.gist.context(source))
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
  if (raw) res else rcloud.augment.notebook(res)
}

## this evaluates a notebook for its result
## this is extremely experimental -- use at your own risk
## the meaining of args is ambiguous and probably a bad idea - it jsut makes the client code a bit easier to write ...

rcloud.unauthenticated.call.notebook <-
  rcloud.fail.if.unpublished(rcloud.call.notebook)

# get notebook cells, in sorted order
rcloud.notebook.cells <- function(id, version = NULL) {
  res <- rcloud.get.notebook(id, version)
  if (res$ok) {
    if (is.null(rcloud.session.notebook())) ## no top level? set us as the session notebook so that get.asset et al work
      .session$current.notebook <- res

    ## get all files
    p <- res$content$files
    p <- p[grep("^part", names(p))]
    n <- names(p)
    if (!length(n)) return(NULL)
    ## extract the integer number
    i <- suppressWarnings(as.integer(gsub("^\\D+(\\d+)\\..*", "\\1", n)))
    result <- NULL
    ## sort
    p[match(sort.int(i), i)]
  }
  else NULL
}

# todo: use rcloud.notebook.cells which was pulled out of here
rcloud.call.notebook <- function(id, version = NULL, args = NULL, attach = FALSE) {
  ulog("RCloud rcloud.call.notebook(", id, ",", version, ")")

  res <- rcloud.get.notebook(id, version)
  if (res$ok) {
    if (is.null(rcloud.session.notebook())) ## no top level? set us as the session notebook so that get.asset et al work
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
      if (is.list(args) && length(args)) for (arg in names(args)) if (nzchar(arg)) e[[arg]] <- args[[arg]]
    }
    ## sort
    for (o in p[match(sort.int(i), i)]) {
      if (grepl("^part.*\\.R$", o$filename)) { ## R code
        expr <- parse(text=o$content)
        result <- eval(expr, e)
        rcloud.flush.plot()
      } else if (grepl("^part.*\\.md", o$filename)) { ## markdown
        ## FIXME: we ignore markdown for now ...
      }
    }
    if (attach) attach(e)
    result
  } else NULL
}

rcloud.unauthenticated.call.FastRWeb.notebook <-
  rcloud.fail.if.unpublished(rcloud.call.FastRWeb.notebook)

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

## this should go away antirely *and* be removed from OCAPs
.rcloud.upload.to.notebook <- function(content, name) rcloud.upload.asset(name, content)

rcloud.update.notebook <- function(id, content, is.current = TRUE) {
    ## FIXME: this is more of an optimization - if ther is no group in RCS
    ## we don't need to fetch the notebook content, however, the group
    ## info in RCS is irrelevant for the actual access since it is
    ## governed by the encrypted content
    group <- rcloud.get.notebook.cryptgroup(id)

    ## there is one special case: if the notebook is encrypted and this is a request for a
    ## partial update of the files, we have to compute the new encrypted content by merging
    ## the request. This is only the case if the request doesn't involve direct
    ## manipulation of the encrypted content *and* the notebook is encrypted
    if (!is.null(content$files) && !is.null(group) &&
        !.encryped.content.filename %in% names(content$files)) {
        ## NB: we support files=list() as a way to say that the notebook needs re-encryption
        old <- rcloud.get.notebook(id)
        l <- old$content$files
        ## ulog("rcloud.update.notebook: encrypted, merging ", paste(names(l),collapse=",")," with ", paste(names(content$files),collapse=","))
        for (i in seq_along(content$files)) {
            fn <- names(content$files)[i]
            ct <- content$files[[i]]
            l[[fn]] <- if (is.null(ct$content)) NULL else {
                ## we have to do whatever augmentation GitHub does since it no longer is handled by it ...
                ## at the very minimum we need the filename since some parts may rely on it
                ##
                ## FIXME: should we move such things into .gist.binary.process.outgoing?
                ## we can do things that we cannot do here such as `size` ...
                if (is.null(ct$filename)) ct$filename <- fn
                if (is.null(ct$language)) ct$language <- .guess.language(fn)
                ## also auto-detect text content
                if (is.raw(ct$content) && checkUTF8(ct$content, quiet=TRUE, min.char=7L)) {
                    ct$content <- rawToChar(ct$content)
                    Encoding(ct$content) <- "UTF-8"
                }
                ct
            }
        }
        if(group$id != "private") {
            users <- rcloud.get.cryptgroup.users(group$id)
            if(!.session$username %in% names(users))
                stop(paste0(.session$username, " is not a member of protection group ", group$id))
        }
        ## take the content and encrypt it
        enc <- .encrypt.by.group(list(files=l), group$id)
        ## update contains just the encrypted piece
        ## if this is a conversion, remove the unencrypted pieces
        cfiles <- if (!isTRUE(old$content$is.encrypted)) .zlist(names(rcloud.get.notebook(id, raw=TRUE)$content$files)) else list()
        cfiles[[.encryped.content.filename]] <- list(content=encode.b64(enc))
        content$files <- cfiles
    }
    content <- .gist.binary.process.outgoing(id, content)

    # save thumbnail to key-value database
    if ("thumb.png.b64" %in% names(content$files))
      rcloud.discovery.set.thumb(id = id, thumb_png = content$files$thumb.png.b64$content)

    res <- modify.gist(id, content, ctx = .rcloud.get.gist.context())
    aug.res <- rcloud.augment.notebook(res)

    if(is.current)
      .session$current.notebook <- aug.res

    rcloud.discovery.set.recently.modified.notebook(id, res$content$updated_at)

    if (nzConf("solr.url") && is.null(group)) { # don't index private/encrypted notebooks
        star.count <- rcloud.notebook.star.count(id)
        # Curl SSL Bug. Don't fork Curl. Refer http://stackoverflow.com/questions/15466809/libcurl-ssl-error-after-fork
        #mcparallel(update.solr(res, star.count), detached=TRUE)
        update.solr(res,star.count)
    }
    aug.res
}

rcloud.create.notebook <- function(content, is.current = TRUE) {
    content <- .gist.binary.process.outgoing(NULL, content)
    res <- create.gist(content, ctx = .rcloud.get.gist.context())
    if (res$ok && is.current) {
        .session$current.notebook <- res
        rcloud.reset.session()
    }
    rcloud.discovery.set.recently.modified.notebook(res$content$id,
        res$content$updated_at)
    rcloud.augment.notebook(res)
}

rcloud.rename.notebook <- function(id, new.name) {
  ulog("RCloud rcloud.rename.notebook(", id, ", ", toJSON(new.name), ")")
  modify.gist(id,
              list(description=new.name),
              ctx = .rcloud.get.gist.context())
}

rcloud.fork.notebook <- function(id, source = NULL) {
    if (is.null(source)) source <- rcloud.get.notebook.source(id)
    group <- rcloud.get.notebook.cryptgroup(id)
    src.ctx <- .rcloud.get.gist.context(source)
    dst.ctx <- .rcloud.get.gist.context()
    if (!identical(src.ctx, dst.ctx)) { ## is this a cross-source fork?
        ## NOTE: forking encrypted notebooks across sources will only work as long as the sources
        ## share SKS, otherwise SKS won't have the key to decrypt it.
        src.nb <- rcloud.get.notebook(id, source = source)
        if (!isTRUE(src.nb$ok)) stop("failed to retrieve source notebook")
        owner <- src.nb$content$owner
        if (is.null(owner)) owner <- src.nb$content$user

        ## For encrypted ones we intentionally fetch the source both in decrypted
        ## and encrypted form - the former will fail if you don't have a the key so
        ## it acts as a safe-guard, and the latter is really what we need
        if (!is.null(group))
            src.nb <- rcloud.get.notebook(id, source = source, raw = TRUE)
        new.nb <- rcloud.create.notebook(src.nb$content)
        if (!isTRUE(new.nb$ok)) stop("failed to create new notebook")
        rcloud.set.notebook.property(new.nb$content$id, "fork_of",
                                     new.nb$fork_of <-
                                     list(owner=owner,
                                          description=src.nb$content$description,
                                          id=src.nb$content$id))
    } else {## src=dst, regular fork
        new.nb <- fork.gist(id, ctx = src.ctx)
        rcloud.discovery.set.recently.modified.notebook(new.nb$content$id, new.nb$content$updated_at)
    }
    ## inform the UI as well
    if (!is.null(group))
        rcloud.set.notebook.cryptgroup(new.nb$content$id, group$id, FALSE)

    rcloud.update.fork.count(id)
    new.nb
}

rcloud.get.notebook.forks <- function(id)
  get.gist.forks(id, ctx = .rcloud.get.gist.context())

rcloud.update.fork.count <- function(id) {
  count <- length(rcloud.get.notebook.forks(id)$content)
  rcs.set(rcs.key('.notebook', id, 'forkcount'), count)
}

rcloud.get.fork.count <- function(id)
  rcs.get(rcs.key('.notebook', id, 'forkcount'))

rcloud.unauthenticated.get.fork.count <-
  rcloud.fail.if.unpublished(rcloud.get.fork.count)

rcloud.multiple.notebook.fork.counts <- function(notebooks) {
  if (!length(notebooks)) return(list())
  counts <- lapply(rcs.get(rcs.key('.notebook', notebooks, 'forkcount'), list=TRUE),
                   function(o) if(is.null(o)) 0L else as.integer(o))
  names(counts) <- notebooks
  counts
}

rcloud.unauthenticated.multiple.notebook.fork.counts <- function(notebooks)
  filter.published(rcloud.multiple.notebook.fork.counts(notebooks))

rcloud.get.users <- function() ## NOTE: this is a bit of a hack, because it abuses the fact that users are first in usr.key...
  ## also note that we are looking deep in the config space - this shold be really much easier ...
  gsub("/.*","",rcs.list(usr.key(user="*", notebook="system", "config", "current", "notebook")))

# sloooow, but we don't have any other way of verifying the owner
# we could use RCS cache first and then fall back on github?
notebook.is.mine <- function(id) {
  nb <- rcloud.get.notebook(id)
  nb$content$user$login == .session$username
}

rcloud.publish.notebook <- function(id)
  rcloud.set.notebook.property(id, "public", 1)

rcloud.unpublish.notebook <- function(id)
  rcloud.remove.notebook.property(id, "public")

property.multiple.notebooks <- function(id, property)
  if(length(id)>1) {
    x <- rcloud.get.notebook.property(id, property, list=TRUE)
    names(x) <- NULL
    sapply(x, identity) # vectorize
  } else !is.null(rcloud.get.notebook.property(id, property))

falsify.null <- function(v)
  sapply(v, function(x) if(is.null(x)) FALSE else x)

rcloud.is.notebook.published <- function(id)
  as.logical(falsify.null(property.multiple.notebooks(id, "public")))

filter.published <- function(ids)
  filter.notebooks(rcloud.is.notebook.published, ids)

rcloud.is.notebook.visible <- function(id)
  if(length(id)>1) {
    falsify.null(property.multiple.notebooks(id, "visible"))
  } else {
    visibility <- rcloud.get.notebook.property(id, "visible")
    # what is the length zero case for?
    if(is.null(visibility) | length(visibility) == 0) {
      visibility <- FALSE
    }
    visibility
  }

rcloud.set.notebook.visibility <- function(id, value)
  rcloud.set.notebook.property(id, "visible", value != 0);

rcloud.port.notebooks <- function(url, books, prefix) {
  foreign.ctx <- create.github.context(url)

  Map(function(notebook) {
    getg <- get.gist(notebook, ctx = foreign.ctx)
    if(getg$ok) {
      gist <- getg$content
      newgist <- list(description = paste(prefix, gist$description, sep=""),
                      files = gist$files);
      rcloud.create.notebook(newgist, FALSE)
    }
    else getg
  }, books)
}

rcloud.setup.dirs <- function() {
    for (data.subdir in c("userfiles", "history", "home"))
        if (!file.exists(fn <- pathConf("data.root", data.subdir)))
             dir.create(fn, FALSE, TRUE, "0770")
}

rcloud.get.completions <- function(language, text, pos) {
  if (!is.null(.session$languages[[language]]) && !is.null(.session$languages[[language]]$complete))
    .session$languages[[language]]$complete(text, pos, .session)
  else stop("don't know how to auto-complete language ", language);
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

star.starrerlist.key <- function(notebook)
{
  rcs.key(".notebook", notebook, "starrerlist")
}

rcloud.notebook.starrer.list <- function(notebook)
{
  starrerlist <- gsub(rcs.key(".notebook", notebook, "stars", ''), '',
    rcs.list(rcs.key(".notebook", notebook, "stars", "*")))
}

rcloud.notebook.star.count <- function(notebook)
{
    result <- rcs.get(star.count.key(notebook))
    if (is.null(result)) 0 else as.integer(result)
}

rcloud.multiple.notebook.star.counts <- function(notebooks) {
    if (!length(notebooks)) return(list())
    counts <- lapply(rcs.get(star.count.key(notebooks), list=TRUE),
                     function(o) if(is.null(o)) 0L else as.integer(o))
    names(counts) <- notebooks
    counts
}

rcloud.is.notebook.starred <- function(notebook)
{
  !is.null(rcs.get(star.key(notebook)))
}

rcloud.star.notebook <- function(notebook)
{
  if(!rcloud.is.notebook.starred(notebook)) {
    rcs.set(star.key(notebook), TRUE)
    rcs.incr(star.count.key(notebook))
  }
  else rcloud.notebook.star.count(notebook)
}

rcloud.unstar.notebook <- function(notebook)
{
  if(rcloud.is.notebook.starred(notebook)) {
    rcs.rm(star.key(notebook))
    rcs.decr(star.count.key(notebook))
  }
  else rcloud.notebook.star.count(notebook)
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

rcloud.config.get.all.notebook.info <- function() {
  users <- rcloud.get.users()
  notebooks <- rcloud.config.all.notebooks.multiple.users(users)
  ids <- unlist(notebooks)
  infos <- rcloud.get.multiple.notebook.infos(ids)
  stars <- rcloud.multiple.notebook.star.counts(ids)
  list(users = users, notebooks = notebooks, infos = infos, stars = stars)
}

rcloud.config.add.notebook <- function(id)
  rcs.set(usr.key(user=.session$username, notebook="system", "config", "notebooks", id), TRUE)

rcloud.config.remove.notebook <- function(id) {
  # also set visibility for easy filtering
  rcloud.set.notebook.visibility(id, FALSE)
  rcs.rm(usr.key(user=.session$username, notebook="system", "config", "notebooks", id))
}

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
  if(length(keys)>0) {
    vals <- rcs.get(keys, list=TRUE)
    names(vals) <- gsub(".*/", "", names(vals))
    vals
  } else list()
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

rcloud.config.get.alluser.option <- function(key)
  rcs.get(rcs.key(user=".allusers", notebook="system", "config", key))

################################################################################
# notebook cache

# single just changes the format for querying a single notebook (essentially acting as [[1]])
rcloud.get.notebook.info <- function(id, single=TRUE) {
  if(length(id) == 0)
    return(list())
  base <- usr.key(user=".notebook", notebook=id)
  fields <- c("source", "username", "description", "last_commit", "visible")
  keys <- rcs.key(rep(base, each=length(fields)), fields)
  results <- rcs.get(keys, list=TRUE)
  if (length(id) == 1L && single) {
      names(results) <- fields
      results
  } else {
      if (!length(id)) lapply(fields, function(o) character()) else {
         ## results are indiviudal keys - we have to convert that into
	 ## a list of attibutes
	 i0 <- seq_along(fields)
	 l <- lapply((seq_along(id) - 1L) * length(fields), function(i) { o <- results[i + i0]; names(o) <- fields; o })
	 names(l) <- id
         l
      }
  }
}

rcloud.get.multiple.notebook.infos <- function(ids)
  rcloud.get.notebook.info(ids, FALSE)

rcloud.unauthenticated.get.multiple.notebook.infos <- function(ids)
  filter.published(rcloud.get.multiple.notebook.infos(ids))

# notebook properties settable by non-owners
.anyone.settable = c('source', 'username', 'description', 'last_commit');

rcloud.set.notebook.info <- function(id, info) {
  base <- usr.key(user=".notebook", notebook=id)
  rcs.set(rcs.key(base, "source"), info$source)
  rcs.set(rcs.key(base, "username"), info$username)
  rcs.set(rcs.key(base, "description"), info$description)
  rcs.set(rcs.key(base, "last_commit"), info$last_commit)
}

# get/set another property of notebook
# unlike info cache fields above, other properties can only
# be set by owner
rcloud.get.notebook.property <- function(id, key, list=FALSE)
  rcs.get(usr.key(user=".notebook", notebook=id, key), list=list)

rcloud.set.notebook.property <- function(id, key, value)
  if(key %in% .anyone.settable || notebook.is.mine(id)) {
    rcs.set(usr.key(user=".notebook", notebook=id, key), value)
    TRUE
  } else FALSE

rcloud.remove.notebook.property <- function(id, key)
  if(notebook.is.mine(id)) {
    rcs.rm(rcs.key(".notebook", id, "public"))
    TRUE
  } else FALSE

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

rcloud.get.git.user <- function(id, source = NULL) {
    if (is.null(source)) source <- rcloud.get.notebook.source(id)
    res <- get.user(id, ctx = .rcloud.get.gist.context())
    if (res$ok)
        res$content
    else
        list()
}

rcloud.home <- function(..., user=if (is.null(.session$exec.usr)) "" else .session$exec.usr) pathConf("rcloud.user.home", user, ...)
