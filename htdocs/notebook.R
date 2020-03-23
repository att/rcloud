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
    if (is.null(path.info)) stop("incomplete path - must contain some notebook designation")
    pex <- strsplit(path.info, "/+")[[1L]]
    query <- as.list(query)
    query$.cookies <- cookies
    query$.body <- body
    query$.headers <- headers
    query$.url <- url
    c <- if (is.null(rcloud.config("rserve.socket"))) RSclient::RS.connect() else RSclient::RS.connect(rcloud.config("rserve.socket"), 0L)
    oc.init <- attr(c, "capabilities")
    if (is.null(oc.init)) stop("Unexpected response from Rserve (no iniital capability provided)")
    et <- paste0("Unable to authenticate - please <a href=\"/login.R?redirect=",URLencode(url, TRUE),"\">login to RCloud</a> first")
    ## authenticate
    caps <- RSclient::RS.eval.qap(c, as.call(list(oc.init, c(cookies$token, cookies$execToken), "call")))
    ## session init
    if (!is.list(caps)) return(list(paste0(et, "<p><!-- error: ", as.character(caps)[1], " -->"), "text/html"))
    anonymous <- FALSE
    init.cap <- caps$rcloud$session_init
    if (is.null(init.cap)) {
      init.cap <- caps$rcloud$anonymous_session_init
      anonymous <- TRUE
    }
    if (is.null(init.cap)) stop("Server refused to provide RCloud session initialization capabilites - access denied")
    res <- RSclient::RS.eval.qap(c, as.call(if(anonymous) list(init.cap) else list(init.cap, cookies$user, cookies$token)))
    if (inherits(res, "OCAP-eval-error")) return(list(
         paste0("Error occurred while initializing session:<p><pre>",
                paste(capture.output(print(res)),collapse="\n"), "</pre></p>"), "text/html"))
    et <- "Error fetching content:"
    version <- NULL
    ## is this first part a notebook hash?
    if (grepl("^[0-9a-f]{20}$", pex[1L]) || grepl("^[0-9a-f]{32}$", pex[1L])) {
      nb.name <- notebook <- pex[1L]
      skip <- 1L
      if (length(pex) > 1L && grepl("^[0-9a-f]{40}$", pex[2L])) {
        version <- pex[2L]
        skip <- 1:2
      }
      extra.path <- pex[-skip]
      if (!length(extra.path)) extra.path <- NULL
    } else { ## user/name designation
      if (length(pex) < 2L) stop("incomplete path - notebook is missing in user/notebook notation")
      user <- pex[1L]
      pex <- pex[-1L]
      nb.name <- paste(pex, collapse="/")
      if (is.null(caps$rcloud$notebook_by_name)) stop("Anonymous users are not allowed to use notebooks by path - try authenticating")
      nb <- RSclient::RS.eval.qap(c, as.call(list(caps$rcloud$notebook_by_name, nb.name, user)))
      if (inherits(nb, "try-error")) stop("Error finding notebook: ", nb)
      if (is.null(nb)) stop("Notebook `", nb.name, "' by user `", user, "' not found", if (anonymous) " or not published" else "")
      if (inherits(nb, "OCAP-eval-error")) return(list(
         paste0("Error occurred while trying to find the notebook:<p><pre>",
                paste(capture.output(print(nb)),collapse="\n"),
                "</pre><p>"), "text/html"))
      extra.path <- nb[1L, 2L]
      nb.name <- substr(nb.name, 1, nchar(nb.name) - nchar(extra.path))
      notebook <- nb[1L, 1L]
      if (!nzchar(extra.path)) extra.path <- NULL
    }

    query$notebook <- notebook
    if (!is.null(version)) query$.version <- version
    query$.path.info <- extra.path
    if (is.null(extra.path) || length(grep("^/*\\.self",extra.path))) { ## no extra path => call
      RSclient::RS.eval.qap(c, as.call(list(caps$rcloud$call_fastrweb_notebook, notebook, version, query)))
    } else { ## extra path => get the contents
      ## ready to get the notebook
      et <- paste0("Error fetching contents from notebook '",notebook,"', version '",version,"'")
      nb <- RSclient::RS.eval.qap(c, as.call(list(caps$rcloud$get_notebook, notebook, version)))
      if (inherits(nb, "try-error")) stop(nb)
      if (!isTRUE(tryCatch(nb$ok, error=function(...) FALSE))) stop("Cannot get notebook contents:", paste(capture.output(str(nb)),collapse="\n"))
      extra.path <- gsub("^/+", "", extra.path)
      payload <- nb$content$files[[extra.path]]$content
      if (is.null(payload)) stop("File `", extra.path, "' not found in notebook `", nb.name, "'")
      type <- nb$content$files[[extra.path]]$type

      ## override types according to the extension (c.f. #680)
      ## NOTE: we could use mime::guess_type(extra.path, type, type), but we're being conservative for now
      if (length(grep(".", extra.path, fixed=TRUE))) {
          nt <- auto.convert.ext[tolower(gsub(".*\\.","",extra.path))]
          if (!any(is.na(nt))) type <- as.vector(nt)
      }
      list(payload, type)
    }
  }, error=function(e) {
    list(paste(et,"<pre>", sanitize.error(paste(as.character(e), collapse='\n')), "</pre>"), "text/html", character(), 500L)
  })
}
