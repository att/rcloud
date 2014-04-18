# FIXME these need to be moved elsewhere and renamed

wgeoplot <- function(lats, lons, col=1L)
{
  path <- system.file("javascript", "lux_plot.js", package="rcloud.support")
  caps <- rcloud.install.js.module("lux_plot",
                                   paste(readLines(path), collapse='\n'))

  if (is.null(dim(col))) col <- col2rgb(col) / 255
  #col <- rep(col, length.out = 3 * length(lats))
  col <- as.double(col)
  deferred.rcloud.result(function() caps$handle_osm_plot(list("lux_osm_plot", lats, lons, col, c(960, 600))))
}

wtour <- function(...)
{
  path <- system.file("javascript", "lux_plot.js", package="rcloud.support")
  caps <- rcloud.install.js.module("lux_plot",
                                   paste(readLines(path), collapse='\n'))

  opts <- list(...)
  deferred.rcloud.result(function() caps$handle_tour_plot(list("lux_tour_plot", opts)))
}
