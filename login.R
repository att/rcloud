run <- function(url, query, body, headers) {
  #return(list(paste(rawToChar(headers), collapse="\n"), "text/plain"))
  #save(headers, file="/tmp/hdr.RData")
  if (is.null(query) && !is.null(body)) query <- body
  user <- query["user"]
  ret  <- query["url"]
  if (!length(user) || is.na(user)) return("ERROR: invalid username")
  if (is.na(ret)) ret <- paste(hosturl, "/main.html", sep='')
  list(paste("<a href='",ret,"'>Continue here...</a>", sep=''),
       "text/html",
       paste("Set-Cookie: user=", user, "; domain=", host,"; path=/;\r\nSet-Cookie: sessid=rss", rnorm(1), "; domain=", host, "; path=/;\r\nRefresh: 1; url=", ret, sep=''))
}
