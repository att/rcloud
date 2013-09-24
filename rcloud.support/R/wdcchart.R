
wdcchart <- function(data, dcexpr)
{
  path <- system.file("javascript", "dc_chart.js", package="rcloud.support");
  caps <- rcloud.install.js.module("dc_chart",
                                   paste(readLines(path), collapse='\n'))
  dcexpr2 <- substitute(dcexpr)
  deferred.rcloud.result(function() caps$handle_dcchart(list("dcchart", data, dcexpr2)))
}

wdcplot <- function(data, dims=NULL, groups=NULL, charts=NULL)
{
  path <- system.file("javascript", "dc_chart.js", package="rcloud.support");
  caps <- rcloud.install.js.module("dc_chart",
                                   paste(readLines(path), collapse='\n'))
  dims2 <- substitute(dims)
  groups2 <- substitute(groups)
  charts2 <- substitute(charts)

  deferred.rcloud.result(function() caps$handle_dcplot(list("dcplot", data, dims2, groups2, charts2)))
}
