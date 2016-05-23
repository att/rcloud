.onLoad <- function(libname, pkgname) {
  if (nzchar(Sys.getenv("RCS_SILENCE_LOADCHECK"))) options(rcs.silence.loadcheck=TRUE)
  ## make sure we try the embedding version first and then fall back to whatever is registered
  environment(.onLoad)$Rserve_oc_register <-
    tryCatch(getNativeSymbolInfo("Rserve_oc_register", "(embedding)"),
             error=function(e)
             tryCatch(getNativeSymbolInfo("Rserve_oc_register"),
                      ## we cannot make this an error, because R attempts to try-load the package
                      error=function(e) if (is.null(getOption("rcs.silence.loadcheck"))) warning("WARNING: rcloud.support must be loaded by an Rserve instance, not stand-alone R!")))

  printjs <- rcloud.install.js.module("",
                "(function() {
                    return {
                      console: function(message, k) {
                        console.log(message)
                      }
                    }
                  })()",
                TRUE)
}
