run <- function(url, query, body, headers)
{
  et <- "Unable to connect"
  tryCatch({
    require(rcloud.client)
    caps <- connect.to.rcloud(url, query, body, headers)
    result <- resolve.notebook.id(caps, path.info)

    list(paste('<html><head><meta http-equiv="refresh" content="0; url=/view.html?notebook=', result$notebook, '"></head></html>', sep=''), "text/html")
  }, error=function(e) {
    list(paste(et,"<pre>", paste(as.character(e), collapse='\n'), "</pre>"), "text/html")
  })
}
