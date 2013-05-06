require(rcloud.support)
require(RCurl)

run <- function(url, query, body, headers)
{
  state <- rnorm(1)
  result <- POST(paste(rcloud.support:::.rc.conf$github.base.url, "login/oauth/access_token", sep=''),
                 config=accept_json(),
                 body=list(
                   client_id=rcloud.support:::.rc.conf$github.client.id,
                   client_secret=rcloud.support:::.rc.conf$github.client.secret,
                   code=query["code"]))
  print(content(result))
  token <- content(result)$access_token
  ctx <- rgithub.context.from.token(rcloud.support:::.rc.conf$github.api.url,
                                    rcloud.support:::.rc.conf$github.client.id,
                                    rcloud.support:::.rc.conf$github.client.secret,
                                    token)
  ret = '/main.html'
  cat("BEFORE")
  print(ctx$user$login)
  print(token)
  cat("AFTER")
  set.token(ctx$user$login, token)
  list(paste("<html><head></head><body>",
             "<pre>Welcome, ", ctx$user$login, ".</pre>",
             "</body></html>", sep=''),
       "text/html",
       paste("Set-Cookie: user=", ctx$user$login, "; domain=", host,"; path=/;\r\nSet-Cookie: token=", token, "; domain=", host, "; path=/;\r\nRefresh: 1; url=", ret, sep=''))
}
