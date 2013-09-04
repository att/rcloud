
wdcchart <- function(data, dcexpr)
{
  path <- system.file("javascript", "dc_chart.js", package="rcloud.support");
  caps <- rcloud.install.js.module("dc_chart",
                                   paste(readLines(path), collapse='\n'))
  deferred.rcloud.result(function() caps$handle_dcchart(list("dcchart", data, substitute(dcexpr))))
}

wdcplot <- function(data, dims, groups, charts)
{
  path <- system.file("javascript", "dc_chart.js", package="rcloud.support");
  caps <- rcloud.install.js.module("dc_chart",
                                   paste(readLines(path), collapse='\n'))
  deferred.rcloud.result(function() caps$handle_dcplot(list("dcplot", data, substitute(dims), substitute(groups), substitute(charts))))
}
