# FIXME these need to be moved elsewhere and renamed

wgeoplot <- function(lats, lons, col=1L)
{
  if (is.null(dim(col))) col <- col2rgb(col) / 255
  #col <- rep(col, length.out = 3 * length(lats))
  col <- as.double(col)
  deferred.rcloud.result(function() lux.caps$handle_osm_plot(list("lux_osm_plot", lats, lons, col, c(960, 600))))
}

wtour <- function(...)
{
  opts <- list(...)
  deferred.rcloud.result(function() lux.caps$handle_tour_plot(list("lux_tour_plot", opts)))
}
