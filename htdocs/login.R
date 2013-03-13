run <- function(url, query, body, headers)
{
  print(rcloud.support:::.rc.conf)
  state <- rnorm(1)
  list(paste("<html><head><meta http-equiv='refresh' content='0;URL=\"",rcloud.support:::.rc.conf$github.base.url,
             "login/oauth/authorize?client_id=", rcloud.support:::.rc.conf$github.client.id, 
             "&state=",state,
             "&scope=gist,user",
             "\"'></head></html>", sep=''),
       "text/html")
}
