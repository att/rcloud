lux.caps <- NULL
  
.onLoad <- function(libname, pkgname)
{
  f <- function(module.name, module.path) {
    path <- system.file("javascript", module.path, package="rcloud.lux")
    caps <- rcloud.install.js.module(module.name,
                                     paste(readLines(path), collapse='\n'))
    caps
  }
  f("lux", "lux.js")
  lux.caps <<- f("lux_plot", "lux_plot.js")
}
