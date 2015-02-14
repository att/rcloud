## --- interface to the session server

## API used by the credentials code: get/set/revoke tokens

session.server.set.token <- function(realm, user, token)
    .session.server.request(paste0("/stored_token?token=", URIencode(token), "&user=", URIencode(user), "&realm=", URIencode(realm)))

session.server.revoke.token <- function(realm, token)
    .session.server.request(paste0("/revoke?token=", URIencode(token), "&realm=", URIencode(realm)))

session.server.replace.token <- function(realm, token)
    strsplit(.session.server.request(paste0("/replace?token=", URIencode(token), "&realm=", URIencode(realm))), "\n")[[1]]

## result c(<result>, <user>, <source>); <result>=YES|SUPERCEDED|NO
session.server.get.token <- function(realm, token)
    strsplit(.session.server.request(paste0("/valid?token=", URIencode(token), "&realm=", URIencode(realm))), "\n")[[1]]

session.server.auth <- function(realm,user,pwd,module)
	strsplit(.session.server.request(paste0("/auth_token?realm=",URIencode(realm),"&user=",URIencode(user),"&pwd=",URIencode(pwd),"&module=",getConf("exec.auth"))),"\n")

## FIXME: better error handling (server down etc.)
## simple GET requests at this point
.session.server.request <- function(request)
    RCurl::getURL(paste0(getConf("session.server"), request))
