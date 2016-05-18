
.htmlwidgets.cache <- new.env(parent = emptyenv())

rcloud.htmlwidgets.viewer <- function(url, height) {

  width <- "100%"
  where <- paste0("rc_htmlwidget_", as.integer(runif(1)*1e6))
  rcloud.html.out(paste0("<div id=\"", where, "\"></div>"))
  where <- paste0("#", where)

  if (is.null(.htmlwidgets.cache$ocaps)) {
    jsfile <- file.path(
      system.file(package = "rcloud.support"),
      "javascript", "htmlwidgets.js"
    )
    script <- paste(readLines(jsfile), collapse = "\n")
    oc <- rcloud.install.js.module("htmlwidgets", script, TRUE)
    .htmlwidgets.cache$ocaps <- oc
  }

  htmlwidgets:::pandoc_self_contained_html(url, url)
  widget <- paste(readLines(url), collapse = "\n")

  html <- paste(
    sep = "",
    "<iframe frameBorder=\"0\" width=\"100%\" height=\"50%\" srcdoc=\"",
    gsub("\"", "&quot;", widget),
    "\"></iframe>"
  )

  .htmlwidgets.cache$ocaps$create(where, html)

  invisible()
}
