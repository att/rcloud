rcw.reactive <- function(body, callback, ...) {
  getid <- function(o) if (is.list(o)) c(list(o$id), lapply(o, getid)) else NULL
  ids <- unlist(getid(body))
  rcw.result(body = as.character(body),
             run = function (...) {
               mod <- rcloud.support::rcloud.install.js.module("rcw.reactive.support", "({ setInputs: function(elts, k) { for (var i=0, el; el=elts[i]; i++) $('#'+el).change(function() { var d={}; for (var j=0, ex; ex=elts[j]; j++) { d[ex]=$('#'+ex).val(); }; debugger; window.notebook_result.callback(d, this.id, $(this).val(), function() { true; }); return true; }); $('#'+elts[0]).change(); k(true); } })")
               mod$setInputs(ids)
               ""
             },
             callback = function(input, ...) {
               for (i in seq.int(length(input))) input[[i]] <- type.convert(input[[i]], as.is=TRUE)
               callback(input, ...)
               TRUE
             }, ...)
}

rcw.renderPlot <- function(name, expr, ...) {
  expr <- substitute(expr)
  pf <- parent.frame()
  .plot <- WebPlot(...)
  shiny::isolate(eval(expr, pf, pf))
  rcw.set(paste0("#",name), as.character(.plot))
  invisible(name)
}
