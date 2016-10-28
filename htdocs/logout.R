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

deleteCookieHeaders <- function(){
  headers <- c("user=","token=","execUser=","execToken=")
  if(rcloud.support:::nzConf("cookie.domain")) headers <- paste0(headers, "; domain=", rcloud.support:::getConf("cookie.domain"))
   headers <- paste0("Set-Cookie: ",headers, " ;path=/; ","expires=Thu, 01 Jan 1970 00:00:00 GMT")
  return(paste0(headers,collapse="\r\n"))
}

run <- function(url, query, body, headers) {
  cookies <- cookies(headers)
  cookie.headers <- list()

  if (!is.null(cookies$execToken))
    rcloud.support:::revoke.token(cookies$execToken, realm="rcloud.exec")
  if (!is.null(cookies$token))
    rcloud.support:::revoke.token(cookies$token)
  ret <- rcloud.config("goodbye.page")
  if (is.null(ret)) ret <- '/goodbye.R'
  
  list("<html><head></head><body>Logout...</body></html>",
       "text/html",
       paste0(deleteCookieHeaders,"\r\nRefresh: 0.1; url=", ret, sep=''))
}
