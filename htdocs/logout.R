require(rcloud.support)

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

run <- function(url, query, body, headers) {
  cookies <- cookies(headers)
  if (!is.null(cookies$execToken))
    rcloud.support:::revoke.token(cookies$execToken, realm="rcloud.exec")
  if (!is.null(cookies$token))
    rcloud.support:::revoke.token(cookies$token)
  ret <- rcloud.config("goodbye.page")
  if (is.null(ret)) ret <- '/goodbye.R'
  list("<html><head></head><body>Logout...</body></html>",
       "text/html",
       paste0("Set-Cookie: user=; domain=", rcloud.config("cookie.domain"), "; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT\r\nSet-Cookie: token=; domain=", rcloud.config("cookie.domain"), "; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT\r\nSet-Cookie: execUser=; domain=", rcloud.config("cookie.domain"), "; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT\r\nSet-Cookie: execToken=; domain=", rcloud.config("cookie.domain"), "; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT\r\nRefresh: 0.1; url=", ret, sep=''))
}
