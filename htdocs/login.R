cookies <- function(headers) {
  a <- strsplit(rawToChar(headers), "\n")
  if (length(a) && length(c <- grep("^cookie:", a[[1]], TRUE)) &&
      length(p <- unlist(strsplit(gsub("^cookie:\\s*", "", a[[1]][c], TRUE), ";\\s*")))) {
    ## annoyingly, we can't use strsplit, because it has no limit argument and we need only one =
    keys <- gsub("\\s*=.*", "", p)
    vals <- as.list(gsub("^[^=]+=\\s*", "", p))
    names(vals) <- keys
    vals
  } else list()
}

## + is not reserved, but some servers interpret it as ' ' so we have to encode it explicitly
encode <- function(x) gsub("+", "%2b", URLencode(as.character(x), TRUE), fixed=TRUE)

run <- function(url, query, body, headers)
{
  cookies <- cookies(headers)
  extra.headers <- character(0)

  ## redirect is either in the query or body, but we have to also guard against nonsensical values
  redirect <- query["redirect"]
  if (is.null(redirect)) redirect <- body["redirect"]
  if (is.character(redirect) && !nzchar(redirect)) redirect <- NULL
  if (!is.null(redirect) && isTRUE(any(is.na(redirect)))) redirect <- NULL

  if (!is.null(.rc.conf$exec.auth)) {
    ret <- rcloud.support:::getConf("welcome.page")
    if (is.null(ret)) ret <- '/welcome.html'
    if (!is.null(redirect)) ret <- paste0(ret, "?redirect=", encode(redirect))
    if (is.null(.rc.conf$session.server))
      return(list("<html><head></head><body>ERROR: This RCloud instance is not properly configured: Exec.auth is set, but session.server is not!", "text/html"))
    if (length(body) > 2 && "execLogin" %in% body['action']) {
      res <- unlist(strsplit(RCurl::getURL(paste0(.rc.conf$session.server, "/", .rc.conf$exec.auth, "_token?realm=rcloud.exec&user=", encode(body['user']), "&pwd=", encode(body['pwd']))), "\n"))
      if (length(res) > 2) {
        extra.headers <- paste0("Set-Cookie: execUser=", res[2], "; domain=", .rc.conf$cookie.domain,"; path=/;\r\nSet-Cookie: execToken=", res[1], "; domain=", .rc.conf$cookie.domain, "; path=/;")
        cookies$execToken <- res[1]
      } else return(list("<html><head></head><body>Authentication failed - please check your username and password.</body></html>", "text/html"))
    }

    if (is.null(cookies$execToken))
      return(list("<html><head></head><body>Missing execution token, requesting authentication...",
                  "text/html", paste0("Refresh: 0.1; url=", ret)))
    usr <- rcloud.support:::check.token(cookies$execToken, .rc.conf$exec.auth, "rcloud.exec")
    if (usr == FALSE)
      return(list("<html><head></head><body>Invalid or expired execution token, requesting authentication...",
                  "text/html", paste0("Refresh: 0.1; url=", ret)))
  }
  if (is.null(redirect))
    redirect <- '/edit.html'
  ctx <- create.gist.backend(as.character(cookies$user), as.character(cookies$token))
  url <- gist::auth.url(redirect, ctx=ctx)
  if (is.null(url)) {
    ## module signals that it doesn't use authentication
    ## so let's check if we have execAuth to replace it
    if (!is.null(.rc.conf$exec.auth) && !isTRUE(cookies$user == usr)) {
      ## at this point it is guaranteed to be valid since it was checked above
      ## so we can generate a token
      token <- paste(c(0:9,letters)[as.integer(runif(25,0,35.999))+1L], collapse='')
      rcloud.support:::set.token(usr, token)
      extra.headers <- c(paste0("Set-Cookie: user=", usr, "; domain=", .rc.conf$cookie.domain,"; path=/;\r\nSet-Cookie: token=", token, "; domain=", .rc.conf$cookie.domain,"; path=/;"), extra.headers)
      ## re-create the back-end because the username/token have changed
      ctx <- create.gist.backend(usr, token)
      url <- gist::auth.url(redirect, ctx=ctx)
    }
  }
  if (!is.character(url) || length(url) != 1 || !nzchar(url))
    url <- redirect ## safe-guard against bad return values
  list(paste("<html><head><meta http-equiv='refresh' content='0;URL=\"",url,"\"'></head></html>", sep=''),
       "text/html", extra.headers)
}
