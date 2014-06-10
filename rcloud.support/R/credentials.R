## Credential management

################################################################################
# There are currently two supported credential management systems
#
# The most secure one is based on a session server which matches
# github identities to local usernames and runs sessions as separate
# unix users. This is defined in session.server.R .
#
# The most convenient one simply checks for a valid GitHub username and
# runs all notebooks as the same user. This has obvious problems in case
# different github users run conflicting system commands (say, overwriting
# one another's temporary files). This is defined in simple.credentials.R
#
# Which credential management system is going to be used is controlled by
# the configuration option "session.server", in setup.R:configure.rcloud

set.token <- function(user, token, realm="rcloud")
{
  credentials$set(realm, user, token)
}

revoke.token <- function(token, realm="rcloud")
{
  credentials$revoke(realm, token)
}

check.user.token.pair <- function(user, token, valid.sources="stored", realm="rcloud")
{
  if (is.null(token)) {
    FALSE
  } else {
    credentials$check.pair(realm, user, token, valid.sources)
  }
}

check.token <- function(token, valid.sources="stored", realm="rcloud")
{
  if (is.null(token)) {
    FALSE
  } else {
    credentials$check(realm, token, valid.sources)
  }
}
