rcloud.get.notebook.source <- function(id)
      rcloud.get.notebook.property(id, "source")

## get active context for a given source
## if NULL, uses the default source
.rcloud.get.gist.context <- function(source=NULL)
    if (is.null(source)) .session$gist.context else {
        if (is.null(.session$gist.contexts[[source]]))
            stop("notebook source `", source, "' is not configured in this instance")
        .session$gist.contexts[[source]]
    }

