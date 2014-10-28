rcloud.enviewer.refresh <- function()
  rcloud.enviewer.on.change(.GlobalEnv)

# could be eval but is that unsafe?
# should this be pushed to rcloud.viewer?
rcloud.enviewer.view.dataframe <- function(expr)
  View(get(expr))

rcloud.enviewer.display.dataframe <- function(x)
  list(command="view", object=x)

rcloud.enviewer.display.double <- function(x)
  signif(x,3)

rcloud.enviewer.display.string <- function(x)
  paste("'", x, "'", sep="")

rcloud.enviewer.display.value <- function(val) {
  ## Current values are the vector types "logical", "integer", "double", "complex", "character", "raw" and "list", "NULL", "closure" (function), "special" and "builtin" (basic functions and operators), "environment", "S4" (some S4 objects) and others that are unlikely to be seen at user level ("symbol", "pairlist", "promise", "language", "char", "...", "any", "expression", "externalptr", "bytecode" and "weakref").
  t <- typeof(val)
  if(t == 'environment') {
    t
  }
  else if(t == 'logical' || t == 'integer' || t == 'double' ||
          t == 'character' || t == 'raw' || t == 'NULL') {
    disp <- function(t, x)
      switch(t,
        double = rcloud.enviewer.display.double(x),
        character = rcloud.enviewer.display.string(x),
        x)
    if(length(val) > 1) {
      chop = if(length(val) > 10) val[1:10] else val
      fmt = disp(t, chop)
      print = paste(fmt, collapse=' ')
      if(length(val) > 10) print <- paste(print, '...')
      type <- paste(t, paste('[1:', length(val), ']', sep=''))
      list(type=type, value=print)
    }
    else list(type=t, value=disp(t, val))
  }
}

rcloud.enviewer.display.function <- function(f) {
  # todo: formal arguments
  "function"
}

rcloud.enviewer.build <- function(vars) {
  ret <- list(data = list(), values = list(), functions = list())
  lapply(vars, function(x) {
    val <- get(x)
    if(is.data.frame(val)) {
      l <- list()
      l[[x]] <- rcloud.enviewer.display.dataframe(x)
      ret$data <<- c(ret$data, l)
    }
    else if(typeof(val) == "closure") {
      l <- list()
      l[[x]] <- rcloud.enviewer.display.function(val)
      ret$functions <<- c(ret$functions, l)
    }
    else {
      l <- list()
      l[[x]] <- rcloud.enviewer.display.value(val)
      ret$values <<- c(ret$values, l)
    }
  })
  ret
}

rcloud.enviewer.on.change <- function(env)
{
  ret <- rcloud.enviewer.build(ls(envir=env))
  rcloud.enviewer.caps$display(ret)
}
