cookies <- function(headers) {
  a <- strsplit(rawToChar(headers), "\n")
  if (length(a) && length(c <- grep("^cookie:", a[[1]], TRUE)) &&
      length(p <- unlist(strsplit(gsub("^cookie:\\s*", "", a[[1]][c], TRUE), ";\\s*")))) {
    ## annoyingly, we can't use strsplit, because it has no limit argument and we need only one =
    keys <- gsub("\\s*=.*", "", p)
    vals <- as.list(gsub("^[^=]+=\\s*", "", p))
    names(vals) <- keys
    vals
  } else list()
}

run <- function(url, query, body, headers)
{
  cookies <- cookies(headers)
  et <- "Unable to connect"
  tryCatch({
    if (is.null(path.info)) stop("incomplete path - must contain some notebook designation")
    pex <- strsplit(path.info, "/+")[[1L]]
    query <- as.list(query)
    query$.cookies <- cookies
    query$.body <- body
    query$.url <- url
    c <- RSclient::RS.connect()
    oc.init <- attr(c, "capabilities")
    et <- paste0("Unable to authenticate - please <a href=\"/login.R?redirect=",URLencode(url, TRUE),"\">login to RCloud</a> first")
    ## authenticate
    caps <- RSclient::RS.eval.qap(c, as.call(list(oc.init, c(cookies$token, cookies$execToken))))
    ## session init
    RSclient::RS.eval.qap(c, as.call(list(caps$rcloud$session_init, cookies$user, cookies$token)))
    et <- "Error fetching content:"
    version <- NULL
    ## is this first part a notebook hash?
    if (grepl("^[0-9a-f]{20}$", pex[1L])) {
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
      cfg <- RSclient::RS.eval.qap(c, as.call(list(caps$rcloud$load_user_config, user)))
      if (cfg == "null") stop("user `", user, "' not found")
      cfg <- rjson::fromJSON(cfg)
      nbs <- lapply(cfg$all_books, function(o) o$description)
      ok <- sapply(nbs, function(s) (nb.name == s || (substr(nb.name, 1, nchar(s)) == s && substr(nb.name, nchar(s)+1L, nchar(s)+1L) == "/")))
      if (!any(ok)) stop("notebook `", nb.name,"' not found")
      ok <- which(ok)[1L] ## pick the first one if there are multiple
      nb.name <- nbs[ok][1L]
      notebook <- as.character(names(nbs)[ok])
      extra.path <- if (nbs[ok] == nb.name) NULL else substr(nb.name, nchar(nbs[ok]) + 1L, nchar(nb.name))
    }

    query$notebook <- notebook
    if (!is.null(version)) query$.version <- version
    if (is.null(extra.path)) { ## no extra path => call
      RSclient::RS.eval.qap(c, as.call(list(caps$rcloud$call_fastrweb_notebook, notebook, version, query)))
    } else { ## extra path => get the contents
      ## ready to get the notebook
      nb <- RSclient::RS.eval.qap(c, as.call(list(caps$rcloud$get_notebook, notebook, version)))
      if (!isTRUE(nb$ok)) stop("Cannot get notebook contents")
      extra.path <- gsub("^/+", "", extra.path)
      payload <- nb$content$files[[extra.path]]$content
      if (is.null(payload)) stop("File `", extra.path, "' not found in notebook `", nb.name, "'")
      type <- nb$content$files[[extra.path]]$type
      list(payload, type)
    }
  }, error=function(e) {
    list(paste(et,"<pre>", paste(as.character(e), collapse='\n'), "</pre>"), "text/html")
  })
}
