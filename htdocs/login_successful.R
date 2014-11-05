require(rcloud.support)
require(httr)
require(rjson)
require(github)

run <- function(url, query, body, headers)
{
  ## create empty context
  ctx <- create.gist.backend()
  res <- gist::access.token(query, ctx=ctx)
  token <- res$token
  ret <- res$redirect
  if (is.null(ret)) ret <- '/edit.html'

  ## create new context with the token
  ctx <- create.gist.backend(token=token)
  username <- context.info(ctx=ctx)$username
  if (!is.null(username)) {
    rcloud.support:::set.token(username, token)
    list(paste("<html><head></head><body>",
               "<pre>Welcome, ", username, ".</pre>",
               "</body></html>", sep=''),
         "text/html",
         paste("Set-Cookie: user=", username, "; domain=", rcloud.config("cookie.domain"), "; path=/;\r\nSet-Cookie: token=", token, "; domain=", rcloud.config("cookie.domain"), "; path=/;\r\nRefresh: 0.1; url=", ret, sep=''))
  } else list("<html><head></head><body>Invalid token, could not authenticate with the back-end</body></html>", "text/html")
}
