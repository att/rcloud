rcw.parameters <- function(cached=FALSE) {
    if (cached && !is.null(rcloud.support:::.session$rcw.parameters)) rcloud.support:::.session$rcw.parameters
    query <- gsub("^\\?", "", rcw.url()$query)
    comp <- strsplit(query, "&", TRUE)[[1]]
    nam<- gsub("=.*", "", comp)
    n <- nchar(nam) + 2L
    t <- nchar(comp)
    val <- substr(comp, n, t)
    names(val) <- nam
    (rcloud.support:::.session$rcw.parameters <- as.list(val))
}

rcw.parameter <- function(name, default=NULL, cached=FALSE) {
    p <- rcw.parameters(cached=cached)[[name]]
    (if (is.null(p)) default else p)
}
