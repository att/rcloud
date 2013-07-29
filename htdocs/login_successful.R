run <- function(url, query, body, headers)
{
  state <- rnorm(1)
  result <- POST(paste(rcloud.support:::.rc.conf$github.base.url, "login/oauth/access_token", sep=''),
                 config=accept_json(),
                 body=list(
                   client_id=rcloud.support:::.rc.conf$github.client.id,
                   client_secret=rcloud.support:::.rc.conf$github.client.secret,
                   code=query["code"]))
  if (rcloud.debug.level()) {
    cat("login_successful.R: github.access_token result:\n")
    print(content(result))
  }
  token <- content(result)$access_token
  result <- rgithub.context.from.token(rcloud.support:::.rc.conf$github.api.url,
                                    rcloud.support:::.rc.conf$github.client.id,
                                    rcloud.support:::.rc.conf$github.client.secret,
                                    token)
  if(!result$succeeded)
    stop(paste("login failed: ", result$content$message))
  else
    ctx <- result$content
  ret = '/main.html'
  if (rcloud.debug.level()) cat("context: ", ctx$user$login, token, "\n")
  set.token(ctx$user$login, token)
  list(paste("<html><head></head><body>",
             "<pre>Welcome, ", ctx$user$login, ".</pre>",
             "</body></html>", sep=''),
       "text/html",
       paste("Set-Cookie: user=", ctx$user$login, "; domain=", .rc.conf$cookie.domain,"; path=/;\r\nSet-Cookie: token=", token, "; domain=", .rc.conf$cookie.domain, "; path=/;\r\nRefresh: 0.1; url=", ret, sep=''))
}
