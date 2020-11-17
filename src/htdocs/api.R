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

create.notebook <- function(c, caps, body) {
  if (is.raw(body)) body <- rawToChar(body)
  content <- fromJSON(body)
  new.nb <- RSclient::RS.eval.qap(c, as.call(list(caps$rcloud$create_notebook, content)))
  if (!isTRUE(new.nb$ok)) stop(paste("failed to create new notebook",toString(new.nb),sep='\n'))
  id <- new.nb$content$id
  RSclient::RS.eval.qap(c, as.call(list(caps$rcloud$set_notebook_visibility, id, TRUE)))
  RSclient::RS.eval.qap(c, as.call(list(caps$rcloud$stars$star_notebook, id)))

  headers <- paste0("Location: /edit.html?notebook=", id)
  list("", "", headers, 302L)
}

run <- function(url, query, body, headers) {
  tryCatch({
    if(is.null(body)) {
      ## This is a GET, needs to have a token that refers to a submission
      body <- retrieve_submission(query[["token"]])
    }
    if (!is.raw(body)) body <- charToRaw(body)
    headers <- if (is.raw(headers)) strsplit(rawToChar(headers), "\n", TRUE)[[1]] else character()
    cookies <- cookies(headers)
    et <- "Unable to connect to R back-end"
    if (is.null(path.info)) stop("incomplete path - needs a verb")
    pex <- strsplit(path.info, "/+")[[1L]]
    query <- as.list(query)
    query$.cookies <- cookies
    query$.body <- body
    query$.headers <- headers
    query$.url <- url
    c <- if (is.null(rcloud.config("rserve.socket"))) RSclient::RS.connect() else RSclient::RS.connect(rcloud.config("rserve.socket"), 0L)
    oc.init <- attr(c, "capabilities")
    if (is.null(oc.init)) stop("Unexpected response from Rserve (no initial capability provided)")
    et <- paste0("Unable to authenticate - please <a href=\"/login.R?redirect=",URLencode(url, TRUE),"\">login to RCloud</a> first")
    ## authenticate
    caps <- RSclient::RS.eval.qap(c, as.call(list(oc.init, c(cookies$token, cookies$execToken), "call")))
    ## session init
    if (!is.list(caps)) return(list(paste0(et, "<p><!-- error: ", as.character(caps)[1], " -->"), "text/html"))
    anonymous <- FALSE
    init.cap <- caps$rcloud$session_init
    if (is.null(init.cap)) {
      ## Request is not authenticated. We redirect to login.R and ask it
      ## to redirect here again.
      token <- store_submission(body)
      headers <- paste0(
        "Location: /login.R?redirect=/api.R/create",
        utils::URLencode(paste0("?token=", token), reserved = TRUE)
      )
      return(list("", "", headers, 302L))

    }
    RSclient::RS.eval.qap(c, as.call(list(init.cap, cookies$user, cookies$token)))
    verb <- pex[1L]
    et <- paste("Error executing", verb)
    switch(verb,
           create = create.notebook(c, caps, body),
           stop(paste("Unknown verb", verb))
           )
  }, error=function(e) {
    list(paste(et,"<pre>", paste(as.character(e), collapse='\n'), "</pre>"), "text/html", character(), 500L)
  })
}

store_file <- function(token) {
  file.path(dirname(tempdir()), token)
}

store_submission <- function(body) {
  token <- paste(PKI::PKI.digest(body), collapse = "")
  writeBin(body, store_file(token))
  token
}

retrieve_submission <- function(token) {
  file <- store_file(token)
  body <- readBin(file, what = "raw", n = file.info(file)$size)
  file.remove(file)
  body
}
