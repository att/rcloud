.onLoad <- function(libname, pkgname) {
  tryCatch({
    e <- environment(.onLoad)
    e$caps <- rcloud.support::rcloud.install.js.module("rcloud.web.module",
"({
appendDiv: function(div, content, k) {
  if (_.isFunction(content)) content = content();
  $(div).append(content);
  k(true);
},
prependDiv: function(div, content, k) {
  if (_.isFunction(content)) content = content();
  $(div).prepend(content);
  k(true);
},
setDiv: function(div, content, k) {
  if (_.isFunction(content)) content = content();
  $(div).empty(content);
  $(div).append(content);
  k(true);
},
registerRCWResult: function(content, k) {
  window.notebook_result = content;
  k(true);
},
attr: function(div, attr, val, k) {
  if (_.isFunction(val)) val($(div).attr(attr)); else k($(div).attr(attr,val).attr(attr));
},
value: function(div, val, k) {
  if (_.isFunction(val)) val($(div).val()); else k($(div).val(val).val());
},
css: function(div, prop, val, k) {
  if (_.isFunction(val)) val($(div).css(prop)); else k($(div).css(prop, val).css(prop));
},
on: function(div, handler, fn, data, k) {
  $(div).on(handler, function() { fn(data, {id:this.id, name:this.name, node:this.nodeName}, function() {}) });
  k(true);
},
off: function(div, handler, k) {
 if (_.isFunction(handler)) { k = handler; $(div).off(); } else $(div).off(handler);
 k(true);
},
cookies: function(k) { k(document.cookie); },
url: function(k) { k({ url:document.location.href, query:document.location.search, path:document.location.pathname, origin:document.location.origin, hash:document.location.hash }); },
setLocation: function(loc,k) { document.location.href=loc; k(loc); }
})")
  }, error=function(...) warning("NOTE: rcloud.web can only be used in an RCloud session!"))
}

## FIXME: we could also treat WebResult properly by converting it to HTML as needed
.html.in <- function(x) if (inherits(x, "javascript_function") || (is.character(x) && length(x) == 1)) x else paste(as.character(x), collapse='\n')

rcw.append <- function(element, what) caps$appendDiv(element, .html.in(what))
rcw.prepend <- function(element, what) caps$prependDiv(element, .html.in(what))
rcw.set <- function(element, what) caps$setDiv(element, .html.in(what))
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
    if (!raw) {
        cookies <- as.list(sapply(strsplit(strsplit(cookies, ";\\s*")[[1]], "=", TRUE),
                                  function(o) { x = URLdecode(o[2]); names(x) = URLdecode(o[1]); x}))
    }
    (cookies)
}
rcw.url <- function(detailed=TRUE) (if (detailed) caps$url() else caps$url()$url)

rcw.redirect <- function(url) caps$setLocation(url)

rcw.parameters <- function() {
    query <- gsub("^\\?", "", rcw.url()$query)
    comp <- strsplit(query, "&", TRUE)[[1]]
    nam<- gsub("=.*", "", comp)
    n <- nchar(nam) + 2L
    t <- nchar(comp)
    val <- substr(comp, n, t)
    names(val) <- nam
    as.list(val)
}
