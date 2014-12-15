rcloud.enviewer.refresh <- function()
  rcloud.enviewer.on.change(.GlobalEnv)

# could be eval but is that unsafe?
# should this be pushed to rcloud.viewer?
rcloud.enviewer.display.structure <- function(x)
  list(command="str", object=x)

rcloud.enviewer.view.dataframe <- function(expr)
  View(get(expr, .GlobalEnv))

rcloud.enviewer.display.dataframe <- function(x)
  list(command="view", object=x)

rcloud.enviewer.display.double <- function(x)
  signif(x,3)

rcloud.enviewer.display.string <- function(x)
  paste0("'", as.character(x), "'")

rcloud.enviewer.display.value <- function(val) {
   classOfObject <- if (is.numeric(val)) {
    typeof(val)
  } else {
    class(val)
  }
    disp <- function(classOfObject,x)
      switch(classOfObject,
        character = rcloud.enviewer.display.string(x),
        logical = rcloud.enviewer.display.string(x),
        x)
      if(length(val) >1){
        if(is.null(dim(val))){
          dimensionOfObject <- paste0('[1:', length(val), ']', sep='')  
        } else {
           dimensionOfObject <- paste0(dim(val)[1],' x ',dim(val)[2])
        }

      list(type=classOfObject, value=dimensionOfObject)
    }
    else list(type=classOfObject, value=disp(classOfObject, val))
}

rcloud.enviewer.display.function <- function(f) {
  deparse(args(f))[1]
}

rcloud.enviewer.build <- function(vars, env) {
  ret <- list(data = list(), values = list(), functions = list())
  lapply(vars, function(x) {
    val <- get(x, envir=env)
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
  ret <- rcloud.enviewer.build(ls(envir=env), env)
  rcloud.enviewer.caps$display(ret)
}
