## this serves Rserve's built-in HTTP server
.http.request <- function(url, query, body, headers, ...) {
    if (nzConf("http.user")) {
      http.user <- getConf("http.user")
      unixtools::chown(tempdir(), http.user, NULL)
      unixtools::set.user(http.user)
      dir.create(td <- paste(tempdir(), http.user, sep='-'), FALSE, TRUE, "0700")
      unixtools::set.tempdir(td)
    }
    ## if there is a custom authentication mechanism, invoke it
    if (is.function(getOption("RCloud.auth"))) {
        auth <- getOption("RCloud.auth")(url, query, body, headers)
        if (!is.null(auth)) return (auth)
    }

    ## pass-thru requests for the built-in R help system
    if (grepl("^/library/|^/doc/", url)) return(tools:::httpd(url, query, body, headers, ...))

    ## process everything else
    if (isTRUE(url == "") || isTRUE(url == "/")) url <- "/index.html"

    path.info <- NULL
    ## serve files from the htdocs directory
    fn <- pathConf("root", "htdocs", url)
    self.path <- gsub("//+", "/", file.path("/", url))
    if (!file.exists(fn)) {
      ## try to support PATH_INFO-like access
      htdocs <- pathConf("root", "htdocs")
      if (file.exists(htdocs)) {
        exf <- strsplit(url, "/", TRUE)[[1L]]
        valid <- htdocs
        self.path <- "/"
        while (length(exf) && isTRUE(file.info(valid)$isdir)) {
          valid <- file.path(valid, exf[1L])
          self.path <- file.path(self.path, exf[1L])
          exf <- exf[-1L]
        }
        if (isTRUE(!file.info(valid)$isdir)) {
          fn <- valid
          path.info <- paste(exf, collapse=.Platform$file.sep)
          self.path <- gsub("//+", "/", self.path)
        }
      }
    }
    fn <- gsub("//+", "/", fn)
    if (!file.exists(fn))
        list(paste("ERROR: item '", fn, "' not found!", sep=''),"text/html", character(), 404L)
    else {
        ## if the file is an R script, run it (via FastRWeb) instead of serving the content
        if (length(grep("\\.R$", fn))) {
            ## first, figure out our hostname + port for back-references
          port <- ""
          host <- if (length(headers)) {
              h <- strsplit(rawToChar(headers), "[\n\r]+")[[1]]
              l <- strsplit(h, "[\t ]*:[ \t]*")
              names(l) <- sapply(l, function(x) tolower(x[1]))
              if (length(l[["host"]]) > 2L) port <- paste(":", l[["host"]][3L], sep='')
              l[["host"]][2L]
          } else NULL
          if (is.null(host)) host <- "localhost"
          hosturl <- paste("http://", host, port, sep='')

          ## source the script - in here so all of the above is available
          source(fn, TRUE)
          ## run the run() function but like .httpd
          return(run(url, query, body, headers))
      }

        s <- file.info(fn)$size
        f <- file(fn, "rb")
        r <- readBin(f, raw(), s)
        close(f)
        ## deduce content type by extension
        ct <- "text/html"
        ctl <- list("text/javascript"=".js",
                    "image/png"=".png",
                    "image/jpeg"=".jpg",
                    "image/jpeg"=".jpeg",
                    "image/svg+xml"=".svg",
                    "text/css"=".css")
        for (i in seq_along(ctl))
            if (length(grep(paste("\\",ctl[[i]],"$",sep=''), fn, TRUE))) {
                ct <- names(ctl)[i]
                break
            }
        list(r, ct)
    }
}
