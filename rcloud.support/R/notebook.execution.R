.load.notebook.execution.caps <- function() {
  
  f <- function(module.name, module.path) {
    path <- system.file("javascript", module.path, package="rcloud.support")
    if (!file.exists(path)) {
      stop(paste0("file ", path, " does not exist."))
    }
    caps <- rcloud.install.js.module(module.name,
                                     paste(readLines(path), collapse='\n')) 
    caps
  }
  
  frontend <- f("rcloud.support.notebook.execution", "notebook.execution.js") 
  
  if (is.null(frontend)) {
    stop("Failed to load notebook.execution.js")
  }
  frontend
}

#' Run cell with given id
#' 
#' @export
rcloud.run.cell <- function(cell.id) {
  frontend <- .load.notebook.execution.caps()
  frontend$runCell(cell.id)
}

#' Run cells with given ids
#' 
#' @export
rcloud.run.cells <- function(cell.ids) {
  frontend <- .load.notebook.execution.caps()
  frontend$runCells(cell.ids)
}

#' Run all cells starting from the given cell id
#' 
#' @export
rcloud.run.cells.from <- function(cell.id) {
  frontend <- .load.notebook.execution.caps()
  frontend$runCellsFrom(cell.id)
}

#' Gracefully stops execution of a notebook by allowing current cell to complete
#' 
#' @export
rcloud.stop.execution <- function() {
  frontend <- .load.notebook.execution.caps()
  frontend$stopExecution()
}