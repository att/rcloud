## auto-convert mime-type based on the extension because typically GitHub jsut gives us text/plain
auto.convert.ext <- c(js = "application/javascript", css ="text/css", html = "text/html",
                      png = "image/png", jpg = "image/jpeg", jpeg = "image/jpeg",
                      tiff = "image/tiff", tif = "image/tiff", svg = "image/svg+xml",
                      pdf = "application/pdf"
                      )

cookies <- function(a) {
  if (length(a) && length(c <- grep("^cookie:", a, TRUE)) &&
      length(p <- unlist(strsplit(gsub("^cookie:\\s*", "", a[c], TRUE), ";\\s*")))) {
    ## annoyingly, we can't use strsplit, because it has no limit argument and we need only one =
    keys <- gsub("\\s*=.*", "", p)
    vals <- as.list(gsub("^[^=]+=\\s*", "", p))
    names(vals) <- keys
    vals
  } else list()
}

run <- function(url, query, body, headers)
{
  headers <- if (is.raw(headers)) strsplit(rawToChar(headers), "\n", TRUE)[[1]] else character()
  cookies <- cookies(headers)
  et <- "Unable to connect to R back-end"
  tryCatch({
      ## remove ourselves from the URL (hacky!!)
      url <- gsub("/help.R/", "/", url, fixed=TRUE)
      c <- if (is.null(rcloud.config("rserve.socket"))) RSclient::RS.connect() else RSclient::RS.connect(rcloud.config("rserve.socket"), 0L)
      oc.init <- attr(c, "capabilities")
      if (is.null(oc.init)) stop("Unexpected response from Rserve (no initial capability provided)")
      caps <- RSclient::RS.eval.qap(c, as.call(list(oc.init, c(cookies$token, cookies$execToken), "call")))
      if (!is.list(caps)) return(list(paste0(et, "<p><!-- error: ", as.character(caps)[1], " -->"), "text/html"))
      init.cap <- caps$rcloud$session_init
      RSclient::RS.eval.qap(c, as.call(list(init.cap, cookies$user, cookies$token)))
      RSclient::RS.eval.qap(c, as.call(list(caps$rcloud$R_httpd, url, query, body, headers)))
  }, error=function(e) {
      ulog("help.R FAILED:", as.character(e),", falling back to built-in help")
      tools:::httpd(url, query, body, headers)
  })
}
