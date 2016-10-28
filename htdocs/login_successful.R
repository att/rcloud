require(rcloud.support)
require(httr)
require(rjson)

getCookieHeaders <- function(NamedCookieList){
  headers <- paste0( names(NamedCookieList), "=" , NamedCookieList )
  if(rcloud.support:::nzConf("cookie.domain")) headers <- paste0(headers, "; domain=", rcloud.support:::getConf("cookie.domain"))
  headers <- paste0("Set-Cookie: ",headers, " ;path=/; ")
  return(paste0(headers,collapse="\r\n"))
}

run <- function(url, query, body, headers)
{
  ## create empty context
  ctx <- create.gist.backend()
  res <- gist::access.token(query, ctx=ctx)
  token <- res$token
  ret <- res$redirect
  if (is.null(ret)) ret <- '/edit.html'
  cookie.headers <- list()

  ## create new context with the token
  ctx <- create.gist.backend(token=token)
  username <- context.info(ctx=ctx)$username
  if (!is.null(username)) {
    rcloud.support:::set.token(username, token)
    cookie.headers$user= username
    cookie.headers$token= token
   
    list(paste("<html><head></head><body>",
               "<pre>Welcome, ", username, ".</pre>",
               "</body></html>", sep=''),
         "text/html",
         paste(getCookieHeaders(cookie.headers),"\r\nRefresh: 0.1; url=", ret, sep=''))
  } else list("<html><head></head><body>Invalid token, could not authenticate with the back-end</body></html>", "text/html")
}
