rcloud.enviewer.refresh <- function()
  rcloud.enviewer.on.change(.GlobalEnv)

## OCAP
rcloud.enviewer.view.dataframe <- function(expr)
  View(get(expr, .GlobalEnv))

## -- how to handle each group --
rcloud.enviewer.display.dataframe <- function(x)
  structure(list(command="view", object=x), class="data")

rcloud.enviewer.display.value <- function(val) {
    type <- class(val)
    str <- capture.output(str(val))
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
    structure(list(type="function", value=deparse(args(f))[1]), class="functions")

## retrieve objects and format them
rcloud.enviewer.build <- function(vars, env) {
    ret <- lapply(vars, function(x) {
        val <- get(x, envir=env)
        if (is.data.frame(val)) {
            rcloud.enviewer.display.dataframe(x)
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
