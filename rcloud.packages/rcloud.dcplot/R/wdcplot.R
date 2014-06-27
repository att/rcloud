wdcplot.special.variable <- function(name) structure(name, wdcplot.placeholder = "special")
wdcplot.column <- function(name) structure(name, wdcplot.placeholder = "column")

wdcplot <- function(data, dims=NULL, groups=NULL, charts=NULL)
{
  # make a pseudo-environment which maps columns and special variables to placeholders
  specials <- list(..index.. = wdcplot.special.variable('index'),
                   ..value.. = wdcplot.special.variable('value'),
                   ..selected.. = wdcplot.special.variable('selected'),
                   ..key.. = wdcplot.special.variable('key'))
  cols2placeholders <- Map(wdcplot.column, names(data))
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

  deferred.rcloud.result(function() dcplot.caps$handle_dcplot(list("dcplot", data, dims2, groups2, charts2)))
}
