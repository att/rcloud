.mk.cookie <- function(..., expires, path="/") {
    l <- list(...)
    dom <- getConf("cookie.domain")
    dom <- if (isTRUE(as.vector(dom) == "*")) "" else paste0(" domain=", dom, ";")
    exp <- if (missing(expires)) "" else paste0(" expires=", expires, ";")
    paste0("Set-Cookie: ", names(l), "=", l, ";", dom, " path=", path, ";", exp, collapse="\r\n")
}

## The redirect target of the login pages goes into Refresh:/Location:
## headers, so accept only a path on this server: it starts with a single "/"
## (not "//" or "/\", which browsers treat as another host) and has no
## control characters (a CR LF would add headers or replace the response).
## Anything else gives `default`.
safe.redirect <- function(url, default=NULL) {
    if (is.character(url) && length(url) == 1L && !is.na(url) &&
        grepl("^/([^/\\\\]|$)", url) && !grepl("[[:cntrl:]]", url))
        url else default
}
