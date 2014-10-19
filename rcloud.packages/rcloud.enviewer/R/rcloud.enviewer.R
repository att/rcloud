rcloud.enviewer.instrument <- function(f)
  function(...) {
    ret <- f(...)
    rcloud.enviewer.on.change()
    ret
  }

rcloud.enviewer.display.value <- function(val) {
  ## Current values are the vector types "logical", "integer", "double", "complex", "character", "raw" and "list", "NULL", "closure" (function), "special" and "builtin" (basic functions and operators), "environment", "S4" (some S4 objects) and others that are unlikely to be seen at user level ("symbol", "pairlist", "promise", "language", "char", "...", "any", "expression", "externalptr", "bytecode" and "weakref").
  t <- typeof(val)
  if(t == 'closure') {
  }
  else if(t == 'environment') {
    t
  }
  else if(t == 'logical' || t == 'integer' || t == 'double' ||
          t == 'character' || t == 'raw' || t == 'NULL') {
    if(length(val) > 1) {
      ray <- if(length(val) > 10) paste(paste(val, collapse=' '), '...') else paste(val, collapse=' ')
      paste(t, paste('[1:', length(val), ']', sep=''), ray)
    }
    else val
  }
}

rcloud.enviewer.display.function <- function(f) {
  # todo: formal arguments
  "function"
}

rcloud.enviewer.on.change <- function()
{
  vars <- ls()
  ret <- list(data = list(), values = list(), functions = list())
  lapply(vars, function(x) {
    val <- get(x)
    if(is.data.frame(val)) {
      ret$data <- c(ret$data, x)
    }
    else if(typeof(val) == "closure") {
      l <- list()
      l[[x]] <- rcloud.enviewer.display.function(val)
      ret$functions <- c(ret$functions, l)
    }
    else {
      l <- list()
      l[[x]] <- rcloud.enviewer.display.value(val)
      ret$values <- c(ret$values, l)
    }
  })
  rcloud.enviewer.caps$on_change(ret)
}
