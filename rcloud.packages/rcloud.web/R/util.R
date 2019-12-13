rcw.parameters <- function(cached=FALSE) {
    s <- rcloud.support:::.session
    if (cached && !is.null(s$rcw.parameters)) s$rcw.parameters
    query <- gsub("^\\?", "", rcw.url()$query)
    comp <- strsplit(query, "&", TRUE)[[1]]
    nam<- gsub("=.*", "", comp)
    n <- nchar(nam) + 2L
    t <- nchar(comp)
    val <- substr(comp, n, t)
    names(val) <- nam
    (s$rcw.parameters <- as.list(val))
}

rcw.parameter <- function(name, default=NULL, cached=FALSE) {
    p <- rcw.parameters(cached=cached)[[name]]
    (if (is.null(p)) default else p)
}
