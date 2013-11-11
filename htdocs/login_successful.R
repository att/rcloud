require(rcloud.support)
require(httr)
require(rjson)
require(github)

run <- function(url, query, body, headers)
{
  state <- fromJSON(URLdecode(query["state"]))
  result <- POST(paste(rcloud.config("github.base.url"), "login/oauth/access_token", sep=''),
                 config=accept_json(),
                 body=list(
                   client_id=rcloud.config("github.client.id"),
                   client_secret=rcloud.config("github.client.secret"),
                   code=query["code"]))
  if (rcloud.debug.level()) {
    cat("login_successful.R: github.access_token result:\n")
    print(content(result))
  }
  token <- content(result)$access_token
  ctx <- create.github.context(rcloud.config("github.api.url"),
                               rcloud.config("github.client.id"),
                               rcloud.config("github.client.secret"),
                               token)

  if (!is.character(ret <- state$redirect)) ret <- '/main.html'

  if (rcloud.debug.level()) cat("context: ", ctx$user$login, token, "\n")
  rcloud.support:::set.token(ctx$user$login, token)
  list(paste("<html><head></head><body>",
             "<pre>Welcome, ", ctx$user$login, ".</pre>",
             "</body></html>", sep=''),
       "text/html",
       paste("Set-Cookie: user=", ctx$user$login, "; domain=", rcloud.config("cookie.domain"), "; path=/;\r\nSet-Cookie: token=", token, "; domain=", rcloud.config("cookie.domain"), "; path=/;\r\nRefresh: 0.1; url=", ret, sep=''))
}
