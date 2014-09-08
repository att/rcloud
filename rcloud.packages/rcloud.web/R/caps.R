.onLoad <- function(libname, pkgname) {
  tryCatch({
    e <- environment(.onLoad)
    e$caps <- rcloud.support::rcloud.install.js.module("rcould.web.module",
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
}
})")
  }, error=function(...) warning("NOTE: rcloud.web can only be used in an RCloud session!"))
}

## FIXME: we could also treat WebResult properly by converting it to HTML as needed
.html.in <- function(x) paste(as.character(x), collapse='\n')

rcw.append <- function(element, what) caps$appendDiv(element, .html.in(what))
rcw.prepend <- function(element, what) caps$prependDiv(element, .html.in(what))
rcw.set <- function(element, what) caps$setDiv(element, .html.in(what))
