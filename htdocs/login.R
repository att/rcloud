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

run <- function(url, query, body, headers)
{
  encode <- rcloud.support:::URIencode
  getConf <- rcloud.support:::getConf
  cookies <- cookies(headers)
  extra.headers <- character(0)

  exec.only <- isTRUE(getConf("github.auth") == "exec.token")
  exec.realm <- if(exec.only) "rcloud" else "rcloud.exec"

  ## redirect is either in the query or body, but we have to also guard against nonsensical values
  redirect <- query["redirect"]
  if (! "redirect" %in% names(query)) redirect <- body["redirect"]
  redirect <- if (is.character(redirect) && !nzchar(redirect)) NULL else URLdecode(redirect)
  if (!is.null(redirect) && isTRUE(any(is.na(redirect)))) redirect <- NULL

  if (isTRUE(getConf("exec.auth") == "as-local")) { ## special case where RCloud is run in single-user mode, create token for the unix user
    usr <- unixtools::user.info()$name
    ## if we already have a cookie, check its validity - if it's not valid, remove it as we need to generate a new one
    if (isTRUE(cookies$user == usr) && !rcloud.support:::check.user.token.pair(usr, cookies$token)) cookies$user <- NULL
  } else  if (!is.null(getConf("exec.auth"))) {
    ret <- rcloud.support:::getConf("welcome.page")
    if (is.null(ret)) ret <- '/rcloud.html'
    if (!is.null(redirect)) ret <- paste0(ret, "?redirect=", encode(redirect))
    if (is.null(getConf("session.server")))
      return(list("<html><head></head><body>ERROR: This RCloud instance is not properly configured: Exec.auth is set, but session.server is not!", "text/html"))
    if (length(body) > 2 && "execLogin" %in% body['action']) {
      res <- unlist(rcloud.support:::session.server.auth(realm=exec.realm,user=body['user'],pwd=body['pwd']))
      if (length(res) > 2) {
          if (exec.only) {
              extra.headers <- rcloud.support:::.mk.cookie(user=res[2], token=res[1])
              cookies$token <- res[1]
              cookies$execToken <- res[1]
              cookies$user <- res[2]
          } else {
              extra.headers <- rcloud.support:::.mk.cookie(execUser=res[2], execToken=res[1])
              cookies$execToken <- res[1]
              cookies$execUser <- res[2]
          }
      } else return({
          ret <- rcloud.support:::getConf("authfail.page")
          if (is.null(ret))
              list("<html><head></head><body>Authentication failed - please check your username and password.</body></html>", "text/html")
          else {
              if (!is.null(redirect)) ret <- paste0(ret, if (isTRUE(grepl("?", ret, fixed=TRUE))) "&" else "?", "redirect=", encode(redirect))
              list(paste("<html><head><meta http-equiv='refresh' content='0;URL=\"",ret,"\"'></head></html>", sep=''), "text/html")
          }
      })
    } else if (exec.only) cookies$execToken <- cookies$token ## use only the "token" cookie in exec-only mode

    if (is.null(cookies$execToken))
      return(list("<html><head></head><body>Missing execution token, requesting authentication...",
                  "text/html", paste0("Refresh: 0.1; url=", ret)))
    usr <- rcloud.support:::check.token(cookies$execToken, paste0("auth/",getConf("exec.auth")), exec.realm)
    if (usr == FALSE)
      return(list("<html><head></head><body>Invalid or expired execution token, requesting authentication...",
                  "text/html", paste0("Refresh: 0.1; url=", ret)))
  }
  if (is.null(redirect))
    redirect <- '/edit.html'
  ## create.gist.backend may fail if a token is present but is not valid
  ## in that case we have to re-try with no token to force re-authentication
  ctx <- tryCatch(create.gist.backend(as.character(cookies$user), as.character(cookies$token)),
                  error=function(e) create.gist.backend(as.character(cookies$user), NULL))
  url <- gist::auth.url(redirect, ctx=ctx)
  if (is.null(url)) {
    ## module signals that it doesn't use authentication
    ## so let's check if we have execAuth to replace it
    if (!exec.only && !is.null(getConf("exec.auth")) && !isTRUE(cookies$user == usr)) {
      ## at this point it is guaranteed to be valid since it was checked above
      ## so we can generate a token
      token <- rcloud.support:::generate.token()
      rcloud.support:::set.token(usr, token)
      extra.headers <- c(rcloud.support:::.mk.cookie(user=usr, token=token), extra.headers)
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
