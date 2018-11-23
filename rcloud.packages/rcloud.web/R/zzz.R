.onLoad <- function(libname, pkgname) {
  
  f <- function(module.name, module.path) {
    path <- system.file("javascript", module.path, package="rcloud.web")
    caps <- rcloud.install.js.module(module.name,
                                     paste(readLines(path), collapse='\n'))
    caps
  }
  
  tryCatch({
    e <- environment(.onLoad)
    e$caps <- f("rcloud.web.module", "rcloud.web.module.js")
  }, error=function(...) warning("NOTE: rcloud.web can only be used in an RCloud session!"))
}