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
  tryCatch({
    c <- RSclient::RS.connect()
    oc.init <- attr(c, "capabilities")
    ## authenticate
    caps <- RSclient::RS.eval.qap(c, as.call(list(oc.init, c(cookies$token, cookies$execToken))))
    ## session init
    RSclient::RS.eval.qap(c, as.call(list(caps$rcloud$session_init, cookies$user, cookies$token)))
    ## ready to get the notebook
    query <- as.list(query)
    notebook <- query$notebook
#    list(paste0("<pre>",paste(capture.output(print(caps)),collapse='\n'),"</pre>"))
    RSclient::RS.eval.qap(c, as.call(list(caps$rcloud$call_fastrweb_notebook, notebook, NULL, query)))
  }, error=function(e) {
    list(paste("Unable to authenticate + execute.<p><pre>", paste(as.character(e), collapse='\n'), "</pre>"), "text/html")
  })
}
