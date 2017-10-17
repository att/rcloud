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
    ocaps <- list(refresh = rcloud.support:::make.oc(rcloud.enviewer.refresh),
                  view_dataframe = rcloud.support:::make.oc(rcloud.enviewer.view.dataframe),
                  view_dataframe_page = rcloud.support:::make.oc(rcloud.enviewer.view.dataframe.page))
    rcloud.enviewer.caps$init(ocaps)
  }
}
