require(rcloud.support)
require(httr)
require(rjson)

## (as in logout.R)
cookies <- function(headers) {
  a <- strsplit(rawToChar(headers), "\n")
  if (length(a) && length(c <- grep("^cookie:", a[[1]], TRUE)) &&
      length(p <- unlist(strsplit(gsub("^cookie:\\s*", "", a[[1]][c], TRUE), ";\\s*")))) {
    keys <- gsub("\\s*=.*", "", p)
    vals <- as.list(gsub("^[^=]+=\\s*", "", p))
    names(vals) <- keys
    vals
  } else list()
}

run <- function(url, query, body, headers)
{
    ql <- as.list(query)
    ## special case: if used as target for github.auth.forward we simply forward to the target instead
    if (is.null(ql$state) && nzchar(ql$redirect)) {
        if (!isTRUE(getConf("github.auth") == "exec.token")) return(list("ERROR: This instance doesn't allow authentication pass-through forwarding.", "text/html"))
        ## FIXME: check the cookies? It's optional since the target will check them anyway but we could catch it preemptively...
        target <- rcloud.support:::safe.redirect(URLdecode(ql$redirect), "/edit.html")
        return(list(paste0("Thanks, please proceed to <a href='",rcloud.support:::sanitize.error(target),"'>this location</a>."), "text/html", paste0("Location: ",target), 302L))
    }

  ## create empty context
  ctx <- create.gist.backend()
  res <- gist::access.token(query, ctx=ctx)
  ## a back-end that returns a nonce (githubgist) must have it match the
  ## cookie login.R set in this browser; otherwise anyone could sign this
  ## browser in to their own account with their own code (login CSRF)
  clear.nonce <- rcloud.support:::.mk.cookie(oauthNonce="", expires="Thu, 01 Jan 1970 00:00:00 GMT")
  if (!is.null(res$nonce)) {
    expected <- cookies(headers)$oauthNonce
    if (!is.character(expected) || !nzchar(expected) || !identical(as.character(res$nonce), expected))
      return(list("<html><head></head><body>This sign-in could not be verified. Please <a href='/login.R'>sign in again</a>.</body></html>",
                  "text/html", clear.nonce))
  }
  token <- res$token
  ## the redirect comes back from the OAuth state and goes into a Refresh: header
  ret <- redirect <- rcloud.support:::safe.redirect(res$redirect)
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
         paste0(rcloud.support:::.mk.cookie(user=username, token=token), "\r\n", clear.nonce, "\r\nRefresh: 0.1; url=", ret))
  } else {
      ret <- rcloud.support:::getConf("tokenfail.page")
      if (is.null(ret))
          list("<html><head></head><body>Invalid token, could not authenticate with the back-end</body></html>", "text/html")
      else {
          if (!is.null(redirect)) ret <- paste0(ret, if (isTRUE(grepl("?", ret, fixed=TRUE))) "&" else "?", "redirect=", encode(redirect))
          list(paste("<html><head><meta http-equiv='refresh' content='0;URL=\"",ret,"\"'></head></html>", sep=''), "text/html")
      }
  }
}
