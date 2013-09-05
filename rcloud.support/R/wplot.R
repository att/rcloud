## scatterplot
wplot <- function(x, y, ...) {
  path <- system.file("javascript", "wplot.js", package="rcloud.support");
  caps <- rcloud.install.js.module("wplot",
                                   paste(readLines(path), collapse='\n'))
  opts <- list(...)
  if (missing(y)) {
    y <- x
    x <- seq.int(y)
  }
  if (is.null(opts$width)) {
    width <- 300
  } else {
    width <- opts$width
  }
  if (is.null(opts$height)) {
    height <- width
  } else {
    height <- opts$height
  }

  if (is.null(opts$group)) {
    if (is.null(.session$group)) {
      .session$group <- 1L
      .session$group.len <- length(x)
    } else {
      if (.session$group.len != length(x)) {
        .session$group <- .session$group + 1L
        .session$group.len <- length(x)
      }
    }
    opts$group <- .session$group
  }
  if (!is.null(opts$kind)) {
    deferred.rcloud.result(function() caps$handle(list("scatterplot",x,y,opts$kind,c(width,height),opts$group)))
  } else {
    deferred.rcloud.result(function() caps$handle(list("scatterplot",x,y,c(width,height),opts$group)))
  }
}

## FIXME fix this
select <- function(what, group) {
  path <- system.file("javascript", "wplot.js", package="rcloud.support");
  caps <- rcloud.install.js.module("wplot",
                                   paste(readLines(path), collapse='\n'))

  if (missing(group)) group <- .session$group
  if (is.numeric(what)) what <- seq.int(.session$group.len) %in% what

  deferred.rcloud.result(function() caps$handle_select(list("select", as.integer(group), as.integer(what))))
}
