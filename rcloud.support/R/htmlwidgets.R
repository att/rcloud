
## Some comments about how htmlwidgets work in Rcloud.
##
## # In the notebook
##
## This is simple. We override the 'viewer' option when the
## rcloud.support package is loaded (see .onLoad in zzz.R),
## and the rcloud.htmlwidgets.viewer function will be called
## whenever the widget is printed.
##
## So one can simply do
##     library(radarchart)
##     chartJSRadar(scores = skills)
## in a notbeook, and the radar chart widget will be shown in a cell.
##
## Our viewer does the following:
## 1. Creates an OCAP for htmlwidgets, if it does not exist yet.
## 2. Creates a self-contained HTML file from the widget using
##    an internal function htmlwidgets:::pandoc_self_contained_html
##    which in turn uses Pandoc. So htmlwidgets won't work, unless
##    Pandoc is installed on the server. Unfortunately this also
##    means that we write the HTML for the widget to disk, twice.
##    This is fine for small widgets, but not ideal for some that
##    contain a lot of data.
## 3. Sticks the HTML in an iframe, using the 'srcdoc' attribute
##    This is supported in most browsers, except in IE. This polyfill
##    could be used for IE, if this is a concern:
##    https://github.com/jugglinmike/srcdoc-polyfill
##    We are not using it currently.
## 4. Sends the HTML with the iframe over via the OCAP, which sticks
##    it in the cell, and sizes it correctly. See sizing below.
##
## # In mini.html
##
## Mini is a bit different. Here is an example, it is also at
## https://gist.github.com/gaborcsardi/63b8a334e3596724ec9bc1c16744b4c3
##
##     library(rcloud.web)
##     library(rcloud.support)
##     library(DT)
##
##     out("Data set:")
##     oselection(
##         "dataset",
##         c("iris", "mtcars"),
##         onChange = "window.notebook_result.update(this.value, function() {});"
##     )
##     out("<div id=\"mytable\"></div>")
##
##     update <- function(dataset = "iris") {
##         data <- get(dataset, asNamespace("datasets"))
##         rcw.set("#mytable", datatable(data))
##     }
##
##     rcw.result(
##         update = update,
##         run = function(..., dataset = "iris") {
##             rcw.append("body", out())
##             update(dataset)
##         }
##     )
##
## This is mostly standard mini.html stuff. The widget is created via
## the datatable() call, and note that you can just stick it into
## rcw.set() and everything works magically.
##
## This is because rcw.set() calls as.character() on the second argument.
## Here: https://github.com/att/rcloud/blob/1a90eb240f8e96dd1ead1c0f21f5095a06954f85/rcloud.packages/rcloud.web/R/caps.R#L31-L35
##
## This is required, because we define as.character() for htmlwidget
## objects. Our new as.character() method basically uses the same
## method as above, to create an iframe that will be eventually put in
## the div in mini.html.
##
## Note that as.character() also creates the OCAP if it does not exist,
## but only if we are on mini.html, not in the IDE, i.e. not in the
## notebook editor.
##
## # Sizing
##
## Sizing of html widgets is tricky by itself. See the vignette in the
## R package, currently here:
## https://cran.r-project.org/web/packages/htmlwidgets/vignettes/develop_sizing.html
##
## In Rcloud it is even more difficult, because we need to update the
## size of the div that contains the iframe, whenever the user resizes
## the browser window, or just the width of the cell changes.
##
## The good thing is that the widgets within the iframe get the resize
## event and resize themselves properly, so we don't need to deal with
## that. But we need to capture when the width of the cell changes, and
## rezise the div(s) containing widgets, **after** the widget itself
## already resized itself properly within the iframe.
##
## The JS code that does this is in the OCAP, see the inst/htmlwidgets.js
## file for the source. There are four different cases we need to
## handle, and they come up both for the notebook editor and mini.html.
##
## 1. Notebook, the first widget is being put on the page
##
## * We set the hooks for capturing window resize events.
## * We wait (well, aync) for 100ms, and if the widget within the iframe
##   has its <body> built already, we resize the iframe, and thus the
##   cell. If there is no body yet, we try it again 100ms later, and keep
##   trying. A more robust implementation would maybe use a gradually
##   increasing timeout, but is only a problem for faulty widgets, that
##   do not create an HTML <body>, so if this happens, the user has bigger
##   problems to worry about. In case a widget is slow deciding about
##   its size, and the <body> is already there, but the widget will still
##   change its mind about the size, we also have a periodic size checker
##   and resizer, see below.
##
## 2. Notebook, a widget is being put on the page that already has one
##
## This is similar to 1., but we don't need to add the resize event
## hooks. They are there already. The hook resizes *all* widgets on the
## page, so we only want one hook, and not one for each widget.
##
## 3. Notebook, the browser window is resized
##
## Our hook is fired, it resizes all widgets on the page, in parallel.
## For each widget, it uses the algorithm in 1., i.e. it tries resizing
## it every 100ms, looking for a <body> tag in the iframe.
##
## 4. Notebook, the width of the cell changes, not the browser window size
##
## This is more tricky, because AFAIK we can't capture this event currently.
## In the future RCloud could trigger an event, maybe.
##
## So the way we handle this for now is by running a periodic check,
## currently every five seconds, to see if we need to resize any widget.
## This periodic check is installed when the htmlwidgets OCAP is
## installed. Actually, the check starts running every 200ms, but as soon
## as it resizes a widget on the page, it adjusts itself to run every five
## seconds. This is because of mini, see below.
##
## 5. Mini, first widget is being put on the page
##
## We add the hooks to the window resize event. We cannot directly size
## the widget(s) on the page, unfortunately, because we are not calling
## an OCAP explicitly from R to do this. (In the notebook this is called
## by the custom print method, but in mini, we want to avoid extra calls
## from the user just because of htmlwidgets, and we don't want to mess
## with the rcloud.web functions, either.
##
## Instead, we just use the periodic check to size the widget properly.
## We don't want the user to wait for 5 seconds for a correct sizing,
## so we start with periodic resize events every 200ms. Once a resize
## is successful, we switch to the 5 seconds period.
##
## 6. Mini, subsequent widgets
##
## Nothing special here, they work the same as the first in 5.
## One small glitch is that we cannot be sure how many widgets the page
## has, they are added dynamically, and we relax the check period after
## the first resized widget. So it might happen that one widget is sized
## properly when the page loads, but the others only 5 seconds later.
##
## 7. Mini, browser window is resized
##
## This is like 3. Our hook is fired and it takes care of business.
##
## 8. Mini, widget width changes without a resized browser window
##
## This probably does not happen in mini, because there are no cells.
## But even if it does, because of some complicated custom HTML layout,
## the periodic resizer takes care of it, albeit maybe only a couple
## of seconds later.

.htmlwidgets.cache <- new.env(parent = emptyenv())

htmlwidgets.install.ocap <- function() {
  if (is.null(.htmlwidgets.cache$ocaps)) {
    jsfile <- file.path(
      system.file(package = "rcloud.support"),
      "javascript", "htmlwidgets.js"
    )
    script <- paste(readLines(jsfile), collapse = "\n")
    oc <- rcloud.install.js.module("htmlwidgets", script, TRUE)
    .htmlwidgets.cache$ocaps <- oc
  }

  .htmlwidgets.cache$ocaps
}

as.character.htmlwidget <- function(x, ocaps = TRUE, ...) {

  html <- htmlwidgets:::toHTML(x, standalone = TRUE)
  deps <- lapply(htmltools::htmlDependencies(html), rcloudHTMLDependency)
  rendered <- htmltools::renderTags(html)

  background <- "white"
  html <- c(
    "<!DOCTYPE html>", "<html>", "<head>", "<meta charset=\"utf-8\"/>",
    htmltools::renderDependencies(deps, "href"),
    rendered$head, "</head>",
    sprintf(
      "<body style=\"background-color:%s;\">",
      htmltools::htmlEscape(background)
    ),
    rendered$html, "</body>", "</html>"
  )

  if (ocaps) htmlwidgets.install.ocap()

  paste(
    sep = "",
    "<iframe frameBorder=\"0\" width=\"100%\" height=\"400\" srcdoc=\"",
    gsub("\"", "&quot;", paste(html, collapse = "\n")),
    "\"></iframe>"
  )
}

# you may need this if your widgets insist on spawning in a separate tab
rcloud.view.recalcitrant.widget <- function(widget) {
  class(widget) <- setdiff(class(widget), "suppress_viewer")
  widget
}

print.htmlwidget <- function(x, ..., view = interactive()) {

  where <- paste0("rc_htmlwidget_", as.integer(runif(1)*1e6))
  rcloud.html.out(paste0(
    "<div class=\"rcloud-htmlwidget\">",
    "<div id=\"", where, "\"></div>",
    "</div>"))
  where <- paste0("#", where)

  widget <- as.character(x, ..., ocaps = FALSE)

  ocaps <- htmlwidgets.install.ocap()

  ocaps$create(where, widget)

  invisible(x)
}

rcloudHTMLDependency <- function(dep) {

  file <- dep$src$file

  lib <- where_in_path(file, .libPaths())
  if (is.na(lib)) {
    warning("Cannot find htmlwidgets dependency: ", file)
    return(dep)
  }

  rel_path <- path_inside(file, lib)
  c_rel_path <- path_components(rel_path)
  pkg <- c_rel_path[1]

  ## strip off pkg/www or pkg/htmlwidgets
  pkgpath <- paste(tail(c_rel_path, -2), collapse = "/")

  if (length(c_rel_path) < 2) {
    warning("Invalid htmlwidgets dependency path: ", file)
    return(dep)
  } else if (c_rel_path[2] == "htmlwidgets") {
    dep$src$href <- paste0("/shared.R/_htmlwidgets/", pkg, "/", pkgpath)

  } else if (c_rel_path[2] == "www") {
    dep$src$href <- paste0("/shared.R/", pkg, "/", pkgpath)
  }

  dep
}

where_in_path <- function(path, parents) {
  for (parent in parents) {
    if (is_in_path(path, parent)) return(parent)
  }
  NA_character_
}

is_in_path <- function(path, parent) {

  path <- normalizePath(path)
  parent <- normalizePath(parent)

  c_path <- path_components(path)
  c_parent <- path_components(parent)

  if (length(c_path) < length(c_parent)) {
    FALSE

  } else {
    all(c_path[seq_along(c_parent)] == c_parent)
  }
}

path_components <- function(path) {
  strsplit(path, "/+")[[1]]
}

path_inside <- function(path, parent) {
  c_path <- path_components(path)
  c_parent <- path_components(parent)

  paste(tail(c_path, -length(c_parent)), collapse = "/")
}
