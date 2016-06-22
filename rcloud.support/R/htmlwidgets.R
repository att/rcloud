
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
