## FIXME when #569 is closed, add back the debugging lines commented out
session.server.set.token <- function(realm, user, token)
    .session.server.request(paste0("/stored_token?token=", URLencode(token), "&user=", URLencode(user), "&realm=", URLencode(realm)))

session.server.revoke.token <- function(realm, token)
    .session.server.request(paste0("/revoke?token=", URLencode(token), "&realm=", URLencode(realm)))

## result c(<result>, <user>, <source>); <result>=YES|SUPERCEDED|NO
session.server.get.token <- function(realm, token)
    strsplit(.session.server.request(paste0("/valid?token=", URLencode(token), "&realm=", URLencode(realm))), "\n")[[1]]

session.server.check.token <- function(realm, token, valid.sources)
{
  res <- session.server.get.token(realm, token)
  # if (rcloud.debug.level()) cat("check.user.token.pair(", user, ", ", token, ", ", realm, ") valid: ", res[1],", user: ", res[2], ", source: ", res[3], "\n", sep='')
  if ((length(res) > 1) && isTRUE(res[1] == "YES") && isTRUE(res[3] %in% valid.sources)) res[2] else FALSE
}

session.server.check.user.token.pair <- function(realm, user, token, valid.sources)
{
  res <- session.server.get.token(realm, token)
  # if (rcloud.debug.level()) cat("check.user.token.pair(", user, ", ", token, ", ", realm, ") valid: ", res[1],", user: ", res[2], ", source: ", res[3], "\n", sep='')
  (length(res) > 1) && isTRUE(res[1] == "YES") && isTRUE(res[2] == as.vector(user)) && isTRUE(res[3] %in% valid.sources)
}

## FIXME: better error handling (server down etc.)
## simple GET requests at this point
.session.server.request <- function(request)
    RCurl::getURL(paste0(getConf("session.server"), request))

session.server.credential.manager <- function()
{
  list(set = session.server.set.token,
       revoke = session.server.revoke.token,
       check = session.server.check.token,
       check.pair = session.server.check.user.token.pair)
}
