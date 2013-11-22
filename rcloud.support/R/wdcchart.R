
wdcchart <- function(data, dcexpr)
{
  path <- system.file("javascript", "dc_chart.js", package="rcloud.support");
  caps <- rcloud.install.js.module("dc_chart",
                                   paste(readLines(path), collapse='\n'))
  dcexpr2 <- substitute(dcexpr)
  deferred.rcloud.result(function() caps$handle_dcchart(list("dcchart", data, dcexpr2)))
}

wdcplot <- function(data, dims=NULL, grps=NULL, chrts=NULL)
{

  path <- system.file("javascript", "dc_chart.js", package="rcloud.support");
  caps <- rcloud.install.js.module("dc_chart",
                                   paste(readLines(path), collapse='\n'))

  dims2 <- substitute(dims)
  groups2 <- substitute(grps)
  charts2 <- substitute(chrts)

  # Enable use of R variables as parameters in chart definitions, i.e. width = mywidth
  dims2 <- do.call("substitute",list(dims2,parent.frame()))
  groups2 <- do.call("substitute",list(groups2,parent.frame()))
  charts2 <- do.call("substitute",list(charts2,parent.frame()))

  deferred.rcloud.result(function() caps$handle_dcplot(list("dcplot", data, dims2, groups2, charts2)))
}
