run <- function(url, query, body, headers)
{
  et <- "Unable to connect"
  tryCatch({
    require(rcloud.client)
    conn <- connect.to.rcloud(url, query, body, headers)
    result <- resolve.notebook.id(conn, path.info)

    cells <- RSclient::RS.eval.qap(conn$rserve, as.call(list(conn$caps$rcloud$notebook_cells, result$notebook, result$version)))

    canonicalized <- lapply(cells, function(cell) {
      canonicalize.command(cell$content, cell$language)
    })
    nbmd <- paste(canonicalized, collapse='\n')
    paste(knit(text = nbmd, envir=.GlobalEnv), collapse='\n')
  }, error=function(e) {
    list(paste(et,"<pre>", paste(as.character(e), collapse='\n'), "</pre>"), "text/html")
  })
}
