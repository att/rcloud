wdcplot <- function(data, dims=NULL, groups=NULL, charts=NULL)
{

  path <- system.file("javascript", "wdcplot-rcloud.js", package="rcloud.support");
  caps <- rcloud.install.js.module("wdcplot",
                                   paste(readLines(path), collapse='\n'))

  # make a pseudo-environment which maps columns and special variables to placeholders
  specials <- list(..index.. = structure('index', class = "wdcplot.special"),
                   ..value.. = structure('value', class = "wdcplot.special"),
                   ..selected.. = structure('selected', class = "wdcplot.special"),
                   ..key.. = structure('key', class = 'wdcplot.special'))
  cols2placeholders <- Map(function(n) { structure(n, class = "dataframe.column") }, names(data))
  looksee <- list2env(c(cols2placeholders, specials))

  # substitute in this order:
  # - first evaluate anything bquoted with .(expr)
  # - then substitute in the dataframe pseudo-environment
  # - then substitute in the parent environment
  bfp <- function(sexpr, penv)
    do.call(substitute,
            list(do.call(substitute,
                         list(do.call(bquote, list(sexpr, where = parent.frame(2))),
                              looksee)),
                 parent.frame(2)))

  # Enable use of R variables as parameters in definitions, i.e. width = mywidth
  dims2 <- bfp(substitute(dims))
  groups2 <- bfp(substitute(groups))
  charts2 <- bfp(substitute(charts))

  deferred.rcloud.result(function() caps$handle_dcplot(list("dcplot", data, dims2, groups2, charts2)))
}
