
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
## [ NOTE: Currently we turned off the periodic size check that ran every
## five minutes. It generates an infinite loop for some widgets:
## plotly, networkd3 and dygraphs. In theory this might mean that
## some widgets might not size properly, especially in mini.html.
## A possible workaround is to resize the window (again) by hand. ]
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

rcloud.htmlwidgets.viewer <- function(url, height) {

  where <- paste0("rc_htmlwidget_", as.integer(runif(1)*1e6))
  rcloud.html.out(paste0(
    "<div class=\"rcloud-htmlwidget\">",
    "<div id=\"", where, "\"></div>",
    "</div>"))
  where <- paste0("#", where)

  ocaps <- htmlwidgets.install.ocap()

  htmlwidgets:::pandoc_self_contained_html(url, url)
  widget <- paste(readLines(url), collapse = "\n")

  ocaps$create(where, add.iframe.htmlwidget(widget))

  invisible()
}

as.character.htmlwidget <- function(x, ...) {
  tmp <- tempfile(fileext=".html")
  on.exit(unlink(tmp), add = TRUE)
  htmlwidgets::saveWidget(x, file = tmp, selfcontained = FALSE)
  htmlwidgets:::pandoc_self_contained_html(tmp, tmp)

  ## Only in mini, not in the notebook
  if (!isEditMode()) htmlwidgets.install.ocap()

  widget <- paste(readLines(tmp), collapse = "\n")
  where <- paste0("rc_htmlwidget_", as.integer(runif(1)*1e6))
  res <- paste0(
    "<div class=\"rcloud-htmlwidget\">",
    "<div id=\"", where, "\">",
    add.iframe.htmlwidget(widget),
    "</div>",
    "</div>"
  )
  res
}

add.iframe.htmlwidget <- function(widget) {
  paste(
    sep = "",
    "<iframe frameBorder=\"0\" width=\"100%\" height=\"250\" srcdoc=\"",
    gsub("\"", "&quot;", widget),
    "\"></iframe>"
  )
}

isEditMode <- function() {
  identical(.session$mode, "IDE")
}
