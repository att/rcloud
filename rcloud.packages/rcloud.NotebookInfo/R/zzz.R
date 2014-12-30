rcloud.NotebookInfo.caps <- NULL

.onLoad <- function(libname, pkgname)
{
  f <- function(module.name, module.path) {
    path <- system.file("javascript", module.path, package="rcloud.NotebookInfo")
    caps <- rcloud.install.js.module(module.name,
                                     paste(readLines(path), collapse='\n'))
    caps
  }
  rcloud.NotebookInfo.caps <<- f("rcloud.NotebookInfo", "rcloud.NotebookInfo.js")
  if(!is.null(rcloud.NotebookInfo.caps))
    rcloud.NotebookInfo.caps$init()
}
