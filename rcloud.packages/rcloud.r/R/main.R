.eval <- function(o, result=TRUE, where=parent.frame(), context="cell-eval") {
    o <- Rserve.eval(o, where, last.value=result, context=context)
    # ulog("CELL EVAL: ", paste(capture.output(str(o)), collapse='\n'))
    if (inherits(o, "Rserve-eval-error")) {
        class(o) <- "cell-eval-error"
        o$traceback <- unlist(o$traceback)
        ## ulog("CELL-EVAL-ERROR: ", paste(capture.output(str(o)), collapse='\n'))
        o
    } else o
}

rcloud.language.support <- function()
{
  ev <- function(command, silent, rcloud.session) {
    .session <- rcloud.session
    # make sure the last expression is always terminated
    command <- paste0(command, "\n")
    # .session$device.pixel.ratio
    exp <- tryCatch(parse(text=command), error=function(o) structure(list(error=o$message), class="parse-error"))
    # ulog(".EXP: ", paste(capture.output(str(exp)), collapse='\n'))
    res <- if (!inherits(exp, "parse-error")) .eval(exp, FALSE, .GlobalEnv, context=NULL) else exp
    ## R hides PrintWarnings() so this is the only way to get them out
    .Internal(printDeferredWarnings())
    rcloud.flush.plot()
    res
  }

  complete <- function(text, pos, rcloud.session) {
    # from rcompgen.completion
    rc.settings(ops=TRUE, args=TRUE)
    utils:::.assignLinebuffer(text)
    utils:::.assignEnd(pos)
    utils:::.guessTokenFromLine()
    utils:::.completeToken()
    result <- list()
    result$values <- utils:::.CompletionEnv[["comps"]]
    result$prefix <- utils:::.CompletionEnv[["token"]]
    result$position <- utils:::.CompletionEnv[["start"]]
    result
  }

  list(language="R",
       run.cell=ev,
       complete=complete,
       ace.mode="ace/mode/r",
       hljs.class="r",
       extension="R",
       setup=function(rcloud.session) {},
       teardown=function(rcloud.session) {})
}

