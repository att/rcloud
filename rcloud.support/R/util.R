.mk.cookie <- function(..., expires, path="/") {
    l <- list(...)
    dom <- getConf("cookie.domain")
    dom <- if (isTRUE(as.vector(dom) == "*")) "" else paste0(" domain=", dom, ";")
    exp <- if (missing(expires)) "" else paste0(" expires=", expires, ";")
    paste0("Set-Cookie: ", names(l), "=", l, ";", dom, " path=", path, ";", exp, collapse="\r\n")
}
