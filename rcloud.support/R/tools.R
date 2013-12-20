rcloud.get.notebook.file <- function(file, notebook=.session$current.notebook$content$id, version=NULL) {  
    res <- rcloud.get.notebook(notebook, version)  
    if (!isTRUE(res$ok)) stop("unable to get notebook `", notebook,"'")  
    res <- res$content$files[[file]]$content  
    if(is.null(res)) stop("file `", file, "' not found in notebook `", notebook, "'")  
    res
}
