require(rcloud.support)
require(httr)
require(rjson)

run <- function(url, query, body, headers)
{
    ql <- as.list(query)
    ## special case: if used as target for github.auth.forward we simply forward to the target instead
    if (is.null(ql$state) && nzchar(ql$redirect)) {
        if (!isTRUE(getConf("github.auth") == "exec.token")) return(list("ERROR: This instance doesn't allow authentication pass-through forwarding.", "text/html"))
        ## FIXME: check the cookies? It's optional since the target will check them anyway but we could catch it preemptively...
        return(list(paste0("Thanks, please proceed to <a href='",URLdecode(ql$redirect),"'>this location</a>."), "text/html", paste0("Location: ",URLdecode(ql$redirect)), 302L))
    }

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
         paste0(rcloud.support:::.mk.cookie(user=username, token=token), "\r\nRefresh: 0.1; url=", ret))
  } else list("<html><head></head><body>Invalid token, could not authenticate with the back-end</body></html>", "text/html")
}
