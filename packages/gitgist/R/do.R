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

## create repository from id
.repo <- function(ctx, id) {
  path <- file.path(ctx$root.dir, substr(id,1L,2L), substr(id,3L,4L), substr(id,5L,20L))
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

get.gist.gitgistcontext <- function (id, version = NULL, ctx) {
  if (.iserr(r <- .repo(ctx, id))) return(.err(r))

  meta <- .get.meta(r)
  ## FIXME: some metadata like the user and description should probably not be versioned
  ##        otherwise reverting will also revert re-names, go back to the original fork etc.
  ##        is it ok to always pull HEAD of metadata regardless of the version?

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
         comments = 0,
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

.rpath <- function(id, ctx) file.path(ctx$root.dir, substr(id,1L,2L), substr(id,3L,4L), substr(id,5L,20L))
  
fork.gist.gitgistcontext  <- function (src.id, ctx) {
  id <- paste(c(0:9,letters[1:6])[as.integer(runif(20,0,15.999))], collapse='')
  old.mask <- Sys.umask()
  r <- try({
    Sys.umask("0") ## for the directories we have to allow 777
    ## path leading to the repo
    dir.create(file.path(ctx$root.dir, substr(id,1L,2L), substr(id,3L,4L)), FALSE, TRUE, "0777")
    ## repo itself
    dir.create(dir <- .rpath(id, ctx), FALSE, TRUE, "0755")
    Sys.umask("22")
    on.exit(Sys.umask(old.mask))
    ## FIXME: we are using "git" in teh shell to clone since it's a serious pain to do in libgit2
    system(paste0("git clone --bare --quiet ",shQuote(.rpath(src.id, ctx))," ",shQuote(dir)))
    Repository$new(dir)
  }, silent=TRUE)
  if (.iserr(r)) return(.err(r))
  ## FIXME: we populate fork_of in the new repo, but not forks in the old repo
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
  id <- paste(c(0:9,letters[1:6])[as.integer(runif(20,0,15.999))], collapse='')
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

delete.gist.comment.gitgistcontext  <- function (gist.id, comment.id, ctx) {
  if (.iserr(r <- .repo(ctx, gist.id))) return(.err(r))
  .err("Sorry, currently unsupported")
}

modify.gist.comment.gitgistcontext  <- function (gist.id, comment.id, content, ctx) {
  if (.iserr(r <- .repo(ctx, gist.id))) return(.err(r))
  .err("Sorry, currently unsupported")
}

create.gist.comment.gitgistcontext  <- function (gist.id, content, ctx) {
  if (.iserr(r <- .repo(ctx, gist.id))) return(.err(r))
  .err("Sorry, currently unsupported")
}

get.gist.comments.gitgistcontext  <- function (id, ctx) {
  if (.iserr(r <- .repo(ctx, id))) return(.err(r))
  list(ok=TRUE, content=list())
}

auth.url.gitgistcontext <- function(redirect, ctx) NULL ## no auth provided
