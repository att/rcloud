rcloud.enviewer.caps <- NULL

.onLoad <- function(libname, pkgname)
{
  f <- function(module.name, module.path) {
    path <- system.file("javascript", module.path, package="rcloud.enviewer")
    caps <- rcloud.install.js.module(module.name,
                                     paste(readLines(path), collapse='\n'))
    caps
  }
  rcloud.enviewer.caps <<- f("rcloud.enviewer", "rcloud.enviewer.js")
  if(!is.null(rcloud.enviewer.caps)) {
    rcloud.authenticated.cell.eval <<- rcloud.enviewer.instrument(rcloud.authenticated.cell.eval)
    rcloud.enviewer.caps$init()
  }
}
