rcloud.viewer.caps <- NULL

.onLoad <- function(libname, pkgname)
{
  f <- function(module.name, module.path) {
    path <- system.file("javascript", module.path, package="rcloud.viewer")
    caps <- rcloud.install.js.module(module.name,
                                     paste(readLines(path), collapse='\n'))
    caps
  }
  rcloud.viewer.caps <<- f("rcloud.viewer", "rcloud.viewer.js")
  if(!is.null(rcloud.viewer.caps))
    rcloud.viewer.caps$init()
}
