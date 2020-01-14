## FIXME: we could also treat WebResult properly by converting it to HTML as needed
.html.in <- function(x) if (inherits(x, "javascript_function") || (is.character(x) && length(x) == 1)) x else paste(as.character(x), collapse='\n')

rcw.attr <- function(element, attribute, value) if (missing(value)) (caps$attr(element, attribute)) else caps$attr(element, attribute, .html.in(value))
rcw.value <- function(element, value) if (missing(value)) (caps$value(element)) else caps$value(element, .html.in(value))
rcw.style <- function(element, value) rcw.attr(element, 'style', value)
rcw.css <- function(element, property, value) if (missing(value)) (caps$css(element, property)) else caps$css(element, property, .html.in(value))
rcw.on <- function(element, events, callback, data=element, ...)
    if (length(list(...))) {
        l <- list(...)
        if (!length(names(l)))
            stop("callbacks must be named when passed via ...")
        if (!missing(events) || !missing(callback))
            stop("events/callback and using named events in ... are mutually exclusive")
        for (n in names(l))
            rcw.on(element, n, l[[n]], data)
        invisible(names(l))
    } else {
        events <- paste(events, collapse=' ')
        if (!inherits(callback, "OCref")) {
            if (is.function(callback))
                callback <- ocap(callback)
            else
                stop("callback must be a function or ocap")
        }
        caps$on(element, events, callback, data)
    }
rcw.off <- function(element, events) if (missing(events)) caps$off(element) else caps$off(element, events)
rcw.in <- function(element, expr) {
    ctx <- rcloud.output.context(element)
    Rserve.context(ctx)
    on.exit({ rcloud.flush.plot(); rcloud.close.context(ctx) })
    expr
}

rcw.cookies <- function(raw=FALSE) {
    cookies <- caps$cookies()
    (if (!raw) { ## parse?
        if (length(cookies) && nzchar(cookies)) ## valid cookie header?
            as.list(sapply(strsplit(strsplit(cookies, ";\\s*")[[1]], "=", TRUE),
                           function(o) { x = URLdecode(o[2]); names(x) = URLdecode(o[1]); x}))
        else list()
    } else cookies)
}

rcw.url <- function(detailed=TRUE) (if (detailed) caps$url() else caps$url()$url)

rcw.redirect <- function(url) caps$setLocation(url)

.handleFrontendResult <- function(result) {
  if(!is.na(result) && !is.logical(result)) {
    if(!is.null(result$message)) {
      stop(result$message)
    }
  }
  invisible(result)
} 

#' Append content to an HTML element
#'
#' @param element target element selector, e.g. '#my-div'
#' @param what content to add, e.g. shiny.tag
#'
#' @return `TRUE` on success
#' @export
rcw.append <- function(element, what) {
  .handleFrontendResult(caps$appendDiv(Rserve.context(), element, .html.in(what), FALSE))
}

#' Prepend content to an HTML element
#'
#' @param element target element selector, e.g. '#my-div'
#' @param what content to prepend, e.g. shiny.tag
#'
#' @return `TRUE` on success
#' @export
rcw.prepend <- function(element, what) {
  .handleFrontendResult(caps$prependDiv(Rserve.context(), element, .html.in(what), FALSE))
}

#' Set content of an HTML element
#'
#' @param selector target element selector, e.g. '#my-div'
#' @param what content to set, e.g. shiny.tag
#'
#' @return `TRUE` on success
#' @export
rcw.set <- function(element, what) {
  .handleFrontendResult(caps$setDiv(Rserve.context(), element, .html.in(what), FALSE))
}

#' Append content to an HTML element
#'
#' Operation performed in sync with cell results processing queue
#'
#' @param element target element selector, e.g. '#my-div'
#' @param what content to add, e.g. shiny.tag
#'
#' @return `TRUE` on success
#' @export
rcw.append.crs <- function(element, what, sync) {
  .handleFrontendResult(caps$appendDiv(Rserve.context(), element, .html.in(what), TRUE))
}

#' Prepend content to an HTML element
#'
#' Operation performed in sync with cell result processing queue
#'
#' @param element target element selector, e.g. '#my-div'
#' @param what content to prepend, e.g. shiny.tag
#'
#' @return `TRUE` on success
#' @export
rcw.prepend.crs <- function(element, what) {
  .handleFrontendResult(caps$appendDiv(Rserve.context(), element, .html.in(what), TRUE))
}

#' Set content of an HTML element
#'
#' Operation performed in sync with cell result processing queue
#'
#' @param selector target element selector, e.g. '#my-div'
#' @param what content to set, e.g. shiny.tag
#'
#' @return `TRUE` on success
#' @export
rcw.set.crs <- function(element, what) {
  .handleFrontendResult(caps$setDiv(Rserve.context(), element, .html.in(what), TRUE))
}

#' Generate plot in an HTML element
#'
#' @param element target element selector, e.g. '#my-div'
#' @param plot.fun function producing a plot
#' @param width width of the plot
#' @param height height of the plot
#'
#' @return `TRUE` on success
#' @export
rcw.plot <- function(element, plot.fun, width = 300, height = 300) {
  wp <- WebPlot(width = width, height = height)
  do.call(plot.fun, list(), envir = globalenv())
  rcw.set(element, wp)
}

#' Generate plot in an HTML element
#'
#' Operation performed in sync with cell result processing queue
#'
#' @param element target element selector, e.g. '#my-div'
#' @param plot.fun function producing a plot
#' @param width width of the plot
#' @param height height of the plot
#'
#' @return `TRUE` on success
#' @export
rcw.plot.crs <- function(element, plot.fun, width = 300, height = 300) {
  wp <- WebPlot(width = width, height = height)
  do.call(plot.fun, list(), envir = globalenv())
  rcw.set.crs(element, wp)
}
