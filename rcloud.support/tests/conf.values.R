## get_conf_values is available to unauthenticated clients, so it must never
## return secrets from rcloud.conf, whatever pattern it is given

## rcloud.support warns when loaded outside Rserve; that is expected here
Sys.setenv(RCS_SILENCE_LOADCHECK = "TRUE")
library(rcloud.support)

get.values <- rcloud.support:::rcloud.get.conf.values
conf <- list(github.client.secret = "s3cret",
             github.client.id = "id",
             rcs.redis.password = "pw",
             rcloud.menu.help = "100, edit, link, Help, http://example.org",
             rcloud.menu.docs = "200, edit, link, Docs, http://example.org/docs",
             rational.githubgist = "true")
for (k in names(conf)) rcloud.support:::setConf(k, conf[[k]])

## no secrets, whatever the pattern
res <- get.values(".*")
stopifnot(setequal(names(res), c("rcloud.menu.help", "rcloud.menu.docs", "rational.githubgist")),
          !any(c("s3cret", "id", "pw") %in% unlist(res)),
          length(get.values("secret|password")) == 0L)

## the existing callers (menus.js, shell_tab.js) still get what they ask for
menus <- get.values("^rcloud\\.menu\\..*")
stopifnot(setequal(names(menus), c("rcloud.menu.help", "rcloud.menu.docs")),
          identical(menus$rcloud.menu.help, conf$rcloud.menu.help),
          identical(get.values("rational.githubgist"), list(rational.githubgist = "true")))
