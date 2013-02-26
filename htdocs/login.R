# FIXME must be something other than /tmp/.
# I wanted to say paste(.rc.conf$configuration.root, "/rcloud.auth", sep="")),
# but I don't have access to .rc.conf here...

rcloud.auth.path <- "/tmp/rcloud.auth"

create_token <- function(user)
{
  d <- NULL
  tryCatch(d <- readRDS(rcloud.auth.path),
           error=function(e) {
             d <<- new.env(parent=emptyenv())
             d$uuid_to_user <<- new.env(parent=emptyenv())
             d$user_to_uuid <<- new.env(parent=emptyenv())
           })
  uuid <- uuid::UUIDgenerate()

  old.uuid <- d$user_to_uuid[[user]]
  if (!is.null(old.uuid)) {
    d$uuid_to_user[[old.uuid]] <- NULL
  }
  d$user_to_uuid[[user]] <- uuid
  d$uuid_to_user[[uuid]] <- user
  saveRDS(d, rcloud.auth.path)
  uuid
}

run <- function(url, query, body, headers) {
  #return(list(paste(rawToChar(headers), collapse="\n"), "text/plain"))
  #save(headers, file="/tmp/hdr.RData")
  if (is.null(query) && !is.null(body)) query <- body
  user <- query["user"]
  ret  <- query["url"]
  if (!length(user) || is.na(user)) return("ERROR: invalid username")
  if (is.na(ret)) ret <- paste(hosturl, "/main.html", sep='')
  token <- create_token(user)
  
  list(paste("<a href='",ret,"'>Continue here...</a>", sep=''),
       "text/html",
       paste("Set-Cookie: user=", user, "; domain=", host,"; path=/;\r\nSet-Cookie: sessid=", token, "; domain=", host, "; path=/;\r\nRefresh: 1; url=", ret, sep=''))
}
