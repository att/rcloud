.mk.user <- function(name, id=1)
  list(login = name, id = id, type="User")

.mk.ts <- function(ts)
  format(ts, "%Y-%m-%dT%H:%M:%SZ", tz="GMT")

.mk.files <- function(repo, version=NULL) {
  if (repo$is_empty()) return(list())
  t <- if (is.null(version))
    repo$head()$peel(guitar::GIT_OBJ_TREE)
  else
    repo$object_lookup(OID$new(version), guitar::GIT_OBJ_COMMIT)$tree()

  n <- t$entry_count()
  l <- lapply(seq.int(n), function(i) {
    e <- t$entry_by_index(i - 1L)
    fn <- e$name()
    r <- e$object(repo)$data()
    sz <- length(r)
    lang <- "Unknown"
    ext <- if (length(grep(".", fn, fixed=TRUE))) gsub(".*\\.","",fn) else ""
    ## this is a hack for now - we should store this in theory
    ll <- c(R="R", md="Markdown", js="Javascript", py="Python", S="S", json="JSON")
    m <- match(ext, names(ll))
    if (!is.na(m)) lang <- as.vector(ll[m])
    list(filename = fn,
         type = "text/plain",
         language = lang,
         raw_url = "",
         size = sz,
         content = rawToChar(r))
  })
  names(l) <- sapply(l, function(o) o$filename)
  hidden <- grep("^\\.", names(l))
  if (length(hidden)) l[-hidden] else l
}

config.options <- function() list(gist.git.root=TRUE)

create.gist.context <- function(username, gist.git.root, ...)
  structure(list(root.dir=gist.git.root, username=username), class="gitgistcontext")

# we don't use tokens
access.token.gitgistcontext <- function(...) NULL

context.info.gitgistcontext <- function(ctx) list(username=username)

# global: FALSE=owner-writable only, TRUE=write-all
.rpath <- function(id, ctx, global=FALSE)
  file.path(ctx$root.dir, substr(id,1L,2L), substr(id,3L,4L), paste0(substr(id,5L,20L), if (global) ".global" else ""))

## create repository from id
.repo <- function(ctx, id, global=FALSE) {
  path <- .rpath(id, ctx, global)
  try(Repository$new(path), silent=TRUE)
}

.iserr <- function(x) inherits(x, "try-error")

.v <- function(x, def) if (is.null(x)) def else x

.get.meta <- function(r, version=NULL) {
  if (!r$is_empty()) {
    t <- if (is.null(version))
      r$head()$peel(guitar::GIT_OBJ_TREE)
    else
      r$object_lookup(OID$new(version), guitar::GIT_OBJ_COMMIT)$tree()
    tryCatch(rjson::fromJSON(rawToChar(t$entry_by_name(".meta")$object(r)$data())), error=function(e) list())
  } else list()
}

## this is probably horribly inefficient ...
.get.history <- function(r)
  lapply(r$commits(NULL), function(c)
         list(user = .mk.user(c$author$name),
              version = c$id,
              committed_at = .mk.ts(c$time),
              change_status = list(), ## FIXME: N/A
              url = ""
              )
         )
#                change_status = list(total = 2, additions = 1, deletions = 1),

.err <- function(x) list(ok=FALSE, content=list(message=x))

.get.global.json <- function(id, name, ctx, version=NULL) {
  if (.iserr(r <- .repo(ctx, id, TRUE))) return(list())
  if (!r$is_empty()) {
    t <- if (is.null(version))
      r$head()$peel(guitar::GIT_OBJ_TREE)
    else
      r$object_lookup(OID$new(version), guitar::GIT_OBJ_COMMIT)$tree()
    tryCatch(rjson::fromJSON(rawToChar(t$entry_by_name(name)$object(r)$data())),
             error=function(e) list())
  } else list()
}

.set.global.json <- function(id, name, value, ctx) {
  if (.iserr(r <- .repo(ctx, id, TRUE))) return(.err(r))
  if (length(name) > 1) {
    changes <- value
    names(changes) <- name
  } else {
    changes <- list(value)
    names(changes) <- name
  }
  for (i in seq.int(length(changes)))
    if (!is.character(changes[[i]])) changes[[i]] <- rjson::toJSON(changes[[i]])
  old.mask <- Sys.umask()
  if (old.mask > 0) {
    Sys.umask("0")
    on.exit(Sys.umask(old.mask))
  }
  commit_HEAD_changes(r, changes, ctx$username, "gitgist")
}

get.gist.gitgistcontext <- function (id, version = NULL, ctx) {
  if (.iserr(r <- .repo(ctx, id))) return(.err(r))

  meta <- .get.meta(r)
  ## FIXME: some metadata like the user and description should probably not be versioned
  ##        otherwise reverting will also revert re-names, go back to the original fork etc.
  ##        is it ok to always pull HEAD of metadata regardless of the version?

  ## do we really needs this or could we just skip it? We need onyl the number after all ...
  comments <- .get.global.json(id, ".comments.json", ctx)
  
  list(ok = TRUE,
       content = list(
         url = "", forks_url="", commits_url="",
         id = id,
         git_pull_url = "", git_push_url="", html_url="",
         files = .mk.files(r, version),
         public = FALSE,
         created_at = .v(meta$created_at, .mk.ts(Sys.time())),
#         updated_at = .mk.ts(Sys.time()),
         updated_at = if (r$is_empty()) .v(meta$created_at, .mk.ts(Sys.time())) else .mk.ts(.POSIXct(r$head()$peel(guitar::GIT_OBJ_COMMIT)$time()$time, "GMT")),
         description = .v(meta$description, ""),
         comments = length(comments),
         user = .v(meta$user, .mk.user("-unknown-")),
         comments_url = "",
         forks = .v(meta$forks, list()),
#           list(url = "",
#                user = .mk.user(),
#                id = "",
#                created_at = .mk.ts(Sys.time()),
#                updated_at = .mk.ts(Sys.time())
#                )
         history = .get.history(r),
         fork_of = .v(meta$fork_of, list())
#           url = "",
#           forks_url = "",
#           commits_url = "",
#           id = "...",
#           git_pull_url = "",
#           git_push_url = "",
#           html_url = "",
#           files = list(),
#           public = FALSE,
#           created_at = "",
#           updated_at = "",
#           description = "",
#           comments = 0,
#           user = .mk.user(),
#           comments_url = "")
         ), ## content
       headers = list(
         server = "",
         date = .mk.ts(Sys.time()),
         `content-type` = "",
         status = "200",
         statusmessage = "OK"
         ),
       code = 200
       )
}

fork.gist.gitgistcontext  <- function (src.id, ctx) {
  id <- paste(c(0:9,letters[1:6])[as.integer(runif(20,0,15.999)) + 1L], collapse='')
  old.mask <- Sys.umask()
  r <- try({
    Sys.umask("0") ## for the directories we have to allow 777
    ## path leading to the repo
    dir.create(file.path(ctx$root.dir, substr(id,1L,2L), substr(id,3L,4L)), FALSE, TRUE, "0777")
    ## repo itself
    dir.create(dir <- .rpath(id, ctx), FALSE, TRUE, "0755")
    Sys.umask("22")
    on.exit(Sys.umask(old.mask))
    ## FIXME: we are not forking the corresponding global repo - e.g., comments. Is that ok?
    tryCatch( ## first try to use hard links - it may fail due to permissions
             guitar::repository_clone(URLencode(paste0("file://", normalizePath(.rpath(src.id, ctx), '/', TRUE))),
                                      dir, TRUE, TRUE),
             error = function(e) ## if it does, try w/o hardlinks
             guitar::repository_clone(URLencode(paste0("file://", normalizePath(.rpath(src.id, ctx), '/', TRUE))),
                                      dir, TRUE, FALSE)
             )
             
  }, silent=TRUE)
  if (.iserr(r)) return(.err(r))
  ## FIXME: we populate fork_of in the new repo, but not forks in the old repo
  ## should we perhaps record "forks" in the global repo?
  modify.gist(id=id, content=list(fork_of=get.gist(id=src.id, ctx=ctx), user=.mk.user(ctx$username), created_at=.mk.ts(Sys.time())), ctx=ctx)
}

modify.gist.gitgistcontext  <- function (id, content, ctx) {
  if (.iserr(r <- .repo(ctx, id))) return(.err(r))
  if (is.character(content)) content <- rjson::fromJSON(content)
  if (length(content$files)) {
    changes <- lapply(content$files, function(o) o$content)
    names(changes) <- names(content$files)
  } else changes <- list()
  if (!is.null(content$files)) content$files <- NULL
  if (r$is_empty() && is.null(content$user)) { ## empty repo - we have to create mandatory fields
    content$user <- .mk.user(ctx$username)
    content$created_at <- .mk.ts(Sys.time())
  }
  if (length(content)) {
    meta <- .get.meta(r)
    for (i in names(content))
      meta[[i]] <- content[[i]]
    changes[[".meta"]] <- rjson::toJSON(meta)
  }
  if ((old.mask <- Sys.umask()) != 18) {
    Sys.umask("22")
    on.exit(Sys.umask(old.mask))
  }
  commit_HEAD_changes(r, changes, ctx$username, "modify.gist")
  get.gist(id=id, ctx=ctx)
}

create.gist.gitgistcontext  <- function (content, ctx) {
  id <- paste(c(0:9,letters[1:6])[as.integer(runif(20,0,15.999)) + 1L], collapse='')
  old.mask <- Sys.umask()
  r <- try({
    Sys.umask("0") ## for the directories we have to allow 777
    ## path leading to the repo
    dir.create(file.path(ctx$root.dir, substr(id,1L,2L), substr(id,3L,4L)), FALSE, TRUE, "0777")
    ## repo itself
    dir.create(file.path(ctx$root.dir, substr(id,1L,2L), substr(id,3L,4L), substr(id,5L,20L)), FALSE, TRUE, "0755")
    Sys.umask("22")
    on.exit(Sys.umask(old.mask))
    repository_init(file.path(ctx$root.dir, substr(id,1L,2L), substr(id,3L,4L), substr(id,5L,20L)), TRUE)
  }, silent=TRUE)
  if (.iserr(r)) return(.err(r))
  modify.gist(id=id, content=content, ctx=ctx)
}

.mk.comment <- function(content, num, ctx) {
  if (is.null(content$user)) content$user <- .mk.user(ctx$username)
  content$created_at <- content$updated_at <- .mk.ts(Sys.time())
  content$id <- num
  content
}

delete.gist.comment.gitgistcontext  <- function (gist.id, comment.id, ctx) {
  cid <- as.integer(comment.id)
  if (any(is.na(cid)) || any(cid < 1L)) stop("invalid comments id `", comment.id, "'")
  comments <- .get.global.json(gist.id, ".comments.json", ctx)
  ids <- sapply(comments, function(o) as.integer(o$id))
  m <- match(cid, ids)
  if (is.na(m)) stop("comment with id `", comment.id, "' not found")
  if (!isTRUE(comments[[m]]$user$login == ctx$username)) stop("you are not authorized to edit other user's comments")
  comments[[m]] <- NULL
  .set.global.json(gist.id, ".comments.json", comments, ctx)
  list(ok=TRUE)
}

modify.gist.comment.gitgistcontext  <- function (gist.id, comment.id, content, ctx) {
  cid <- as.integer(comment.id)
  if (is.character(content)) content <- rjson::fromJSON(content)
  if (any(is.na(cid)) || any(cid < 1L)) stop("invalid comments id `", comment.id, "'")
  comments <- .get.global.json(gist.id, ".comments.json", ctx)
  ids <- sapply(comments, function(o) as.integer(o$id))
  m <- match(cid, ids)
  if (is.na(m)) stop("comment with id `", comment.id, "' not found")
  if (!isTRUE(comments[[m]]$user$login == ctx$username)) stop("you are not authorized to edit other user's comments")
  mod <- .mk.comment(content, cid, ctx)
  mod$user <- NULL
  mod$created_at <- NULL
  for (n in names(mod)) comments[[m]][[n]] <- mod[[n]]
  .set.global.json(gist.id, ".comments.json", comments, ctx)
  list(ok=TRUE, content=comments[[m]]) ## FIXME: we don't return the actually stored object ...
}

create.gist.comment.gitgistcontext  <- function (gist.id, content, ctx) {
  id <- gist.id
  if (is.character(content)) content <- rjson::fromJSON(content)
  if (.iserr(r <- .repo(ctx, id, TRUE))) { ## no global repo - have to create one
    old.mask <- Sys.umask("0") ## for the directories we have to allow 777
    on.exit(Sys.umask(old.mask))
    ## path leading to the repo
    dir.create(file.path(ctx$root.dir, substr(id,1L,2L), substr(id,3L,4L)), FALSE, TRUE, "0777")
    ## repo itself
    dir.create(dir <- .rpath(id, ctx, TRUE), FALSE, TRUE, "0777")
    repository_init(dir, TRUE)
  }
  comments <- .get.global.json(id, ".comments.json", ctx)
  n <- if (length(comments))
    max(c(0L, unlist(lapply(comments, function(o) as.integer(o$id)[1L]))), na.rm=TRUE) + 1L
  else
    1L
  comments <- c(comments, list(.mk.comment(content, n, ctx)))
  .set.global.json(id, ".comments.json", comments, ctx)
  list(ok=TRUE, content=comments[[length(comments)]]) ## FIXME: we don't return the actually stored object ...
}

get.gist.comments.gitgistcontext  <- function (id, ctx)
  list(ok=TRUE, content=.get.global.json(id, ".comments.json", ctx))

auth.url.gitgistcontext <- function(redirect, ctx) NULL ## no auth provided
