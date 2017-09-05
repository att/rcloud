config.options <- function() list(github.api.url=TRUE, github.base.url=FALSE, github.client.id=FALSE, github.client.secret=FALSE, github.auth.forward=FALSE)

create.gist.context <- function(username, token, github.api.url, github.client.id, github.client.secret, github.base.url, ...) {
  if ((is.character(token) && !isTRUE(nzchar(token))) || is.null(github.client.secret) || is.null(github.client.id)) token <- NULL ## github requires token to be NULL if not used
  ctx <- github::create.github.context(api_url=github.api.url, client_id=github.client.id, client_secret=github.client.secret, access_token=token)
  ctx$github.base.url=github.base.url
  ctx$read.only <- is.null(token)
  ctx$gist.params <- list(...)
  ctx
}

auth.url.githubcontext <- function(redirect, ctx) {
    if (is.character(fwd.url <- ctx$gist.params$github.auth.forward))
        return(paste0(fwd.url, if (length(grep("?", fwd.url, fixed=TRUE))) "&" else "?", "redirect=", URLencode(as.character(redirect)[1], TRUE)))

  state <- list(nonce=rnorm(1), redirect=as.vector(redirect))
  paste0(ctx$github.base.url,
         "login/oauth/authorize?client_id=", ctx$client_id,
         "&state=",URLencode(toJSON(state), TRUE),
         "&scope=gist,user:email")
}

access.token.githubcontext <- function(query, ctx) {
  state <- fromJSON(URLdecode(query["state"]))
  result <- POST(paste(rcloud.config("github.base.url"), "login/oauth/access_token", sep=''),
                 config=accept_json(),
                 body=list(
                   client_id=ctx$client_id,
                   client_secret=ctx$client_secret,
                   code=query["code"]))
  l <- list(token=content(result)$access_token)
  if (is.character(ret <- state$redirect) && length(ret) && nzchar(ret[1L]))
    l$redirect <- ret[1L]
  l
}

context.info.githubcontext <- function(ctx) list(username=ctx$user$login)

## we have to post-process the result from Github, because it may contain
## truncated content which has to be fetched directly
.fix.truncated <- function(res) {
    if (isTRUE(res$ok) && length(res$content$files)) {
        for (i in seq_along(res$content$files))
            if (isTRUE(res$content$files[[i]]$truncated))
                res$content$files[[i]]$content <- content(GET(res$content$files[[i]]$raw_url))
    }
    res
}

get.gist.githubcontext <- function(...) .fix.truncated(github::get.gist(...))

fork.gist.githubcontext <- function(...) .fix.truncated(github::fork.gist(...))

get.gist.forks.githubcontext <- function(...) github::get.gist.forks(...)

modify.gist.githubcontext <- function(...) .fix.truncated(github::modify.gist(...))

create.gist.githubcontext <- function(...) .fix.truncated(github::create.gist(...))

delete.gist.githubcontext <- github::delete.gist

create.gist.comment.githubcontext <- github::create.gist.comment

get.gist.comments.githubcontext <- github::get.gist.comments

delete.gist.comment.githubcontext <- github::delete.gist.comment

modify.gist.comment.githubcontext <- github::modify.gist.comment

get.user.githubcontext <- github::get.user

