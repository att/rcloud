config.options <- function() list(github.api.url="https://api.github.com/", github.base.url="https://github.com/", github.client.id=TRUE, github.client.secret=TRUE)

create.gist.context <- function(username, token, github.api.url, github.client.id, github.client.secret, github.base.url, ...) {
  if (is.character(token) && !isTRUE(nzchar(token))) token <- NULL ## github requires token to be NULL if not used
  ctx <- github::create.github.context(api_url=github.api.url, client_id=github.client.id, client_secret=github.client.secret, access_token=token)
  ctx$github.base.url=github.base.url
  str(ctx)
  ctx
}

auth.url.githubcontext <- function(redirect, ctx) {
  state <- list(nonce=rnorm(1), redirect=as.vector(redirect))
  paste0(ctx$github.base.url,
         "login/oauth/authorize?client_id=", ctx$client_id,
         "&state=",URLencode(toJSON(state), TRUE),
         "&scope=gist,user:email")
}

get.gist.githubcontext <- github::get.gist

fork.gist.githubcontext <- github::fork.gist

modify.gist.githubcontext <- github::modify.gist

create.gist.githubcontext <- github::create.gist

delete.gist.githubcontext <- github::delete.gist

modify.gist.githubcontext <- github::modify.gist

create.gist.comment.githubcontext <- github::create.gist.comment

get.gist.comments.githubcontext <- github::get.gist.comments
