rcw.inline <- function(result, ...) {
    if (!is.list(result) || !isTRUE(result$ok)) stop("invalid result passed - must be from rcw.result()")
    caps$registerRCWResult(result$content)
    if (!is.null(result$content$body))
        rcloud.html.out(result$content$body)
    if (inherits(result$content$run, "OCref"))
        Rserve::resolve.ocap(result$content$run)(list(...))
}
