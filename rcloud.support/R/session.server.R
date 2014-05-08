## --- interface to the session server

## API used by the credentials code: get/set/revoke tokens

session.server.set.token <- function(realm, user, token)
    .session.server.request(paste0("/stored_token?token=", URLencode(token), "&user=", URLencode(user), "&realm=", URLencode(realm)))

session.server.revoke.token <- function(realm, token)
    .session.server.request(paste0("/revoke?token=", URLencode(token), "&realm=", URLencode(realm)))

## result c(<result>, <user>, <source>); <result>=YES|SUPERCEDED|NO
session.server.get.token <- function(realm, token)
    strsplit(.session.server.request(paste0("/valid?token=", URLencode(token), "&realm=", URLencode(realm))), "\n")[[1]]


## FIXME: better error handling (server down etc.)
## simple GET requests at this point
.session.server.request <- function(request)
    RCurl::getURL(paste0(getConf("session.server"), request))

