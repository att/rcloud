## scatterplot
wplot <- function(x, y, ...) {
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
    deferred.rcloud.result(list("scatterplot",x,y,opts$kind,c(width,height),opts$group))
  } else {
    deferred.rcloud.result(list("scatterplot",x,y,c(width,height),opts$group))
  }
}

select <- function(what, group) {
  if (missing(group)) group <- .session$group
  if (is.numeric(what)) what <- seq.int(.session$group.len) %in% what 
  invisible(self.oobSend(list("select", as.integer(group), as.integer(what))))
}

fplot <- function()
{
  deferred.rcloud.result(list("iframe", "http://cscheid.github.io/lux/demos/osm/osm.html", c(960, 600)))
}

wgeoplot <- function(lats, lons, col=1L)
{
  if (is.null(dim(col))) col <- col2rgb(col) / 255
  #col <- rep(col, length.out = 3 * length(lats))
  col <- as.double(col)
  deferred.rcloud.result(list("lux_osm_plot", lats, lons, col, c(960, 600)))
}

wtour <- function(...)
{
  opts <- list(...)
  deferred.rcloud.result((list("lux_tour_plot", opts)))
}

wdcchart <- function(data, dcexpr)
{
  deferred.rcloud.result(list("dcchart", data, substitute(dcexpr)))
}
