rcloud.notebook.info.caps <- NULL

.onLoad <- function(libname, pkgname)
{
  f <- function(module.name, module.path) {
    path <- system.file("javascript", module.path, package="rcloud.notebook.info")
    caps <- rcloud.install.js.module(module.name,
                                     paste(readLines(path), collapse='\n'))
    caps
  }
  rcloud.notebook.info.caps <<- f("rcloud.notebook.info", "rcloud.notebook.info.js")
  if(!is.null(rcloud.notebook.info.caps))
    rcloud.notebook.info.caps$init()
}
