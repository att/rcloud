rcloud.enviewer.refresh <- function()
  rcloud.enviewer.on.change(.GlobalEnv)

## OCAP
rcloud.enviewer.view.dataframe <- function(expr) {
  # pass un-evaluated expression, so it can be used by View
  View(get(expr, .GlobalEnv), expr = expr)
}

## -- how to handle each group --
rcloud.enviewer.display.dataframe <- function(x, val) {
  structure(list(command="view", object=x, text=paste0("data.frame [",paste(dim(val), collapse=', '),"]")), class="data")
}

rcloud.enviewer.display.value <- function(val) {
    type <- class(val)
    ## there are broken packages like XML that can error out on str() so just display the class in that case
    str <- tryCatch(capture.output(str(val)), error=function(e) paste(class(val), collapse='/'))
    if (is.list(val) && !is.null(names(val)))
      str[1] <- paste0("List with names ", paste(capture.output(str(names(val))), collapse=' '))
    if (length(str) > 3)
      str <- c(str[1:3], "...")
    ## also limit the length since deparsing langs can be reaaaaaly long
    if (any(too.long <- (nchar(str) > 100)))
        str[too.long] <- paste(substr(str[too.long], 1, 100), "...")
    if (length(str) > 1L) str <- paste(str, collapse='\n')
    structure(list(type=type, value=str), class="values")
}

rcloud.enviewer.display.function <- function(f)
    structure(list(type="function", value=gsub("^function ","",deparse(args(f))[1])), class="functions")

## retrieve objects and format them
rcloud.enviewer.build <- function(vars, env) {
    ret <- lapply(vars, function(x) {
        val <- get(x, envir=env)
        if (is.data.frame(val)) {
            rcloud.enviewer.display.dataframe(x, val)
        } else if (is.function(val)) {
            rcloud.enviewer.display.function(val)
        } else
            rcloud.enviewer.display.value(val)
    })
    names(ret) <- vars
    ## re format to what the UI expects and split by group
    split(ret, factor(sapply(ret, class), levels=c("data", "functions", "values")))
}

rcloud.enviewer.on.change <- function(env)
{
    ret <- rcloud.enviewer.build(ls(envir=env), env)
    rcloud.enviewer.caps$display(ret)
}
