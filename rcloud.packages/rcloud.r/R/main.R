.eval <- function(o, result=TRUE, where=parent.frame()) {
    o <- Rserve.eval(o, where, last.value=result)
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
    res <- if (!inherits(exp, "parse-error")) .eval(exp, FALSE, .GlobalEnv) else exp
    ## R hides PrintWarnings() so this is the only way to get them out
    .Internal(printDeferredWarnings())
    ## FIXME: in principle this should move from rcloud.support to rcloud.R
    rcloud.support:::.post.eval()
    res
  }

  complete <- function(text, pos, rcloud.session) {
    # from rcompgen.completion
    utils:::.assignLinebuffer(text)
    utils:::.assignEnd(pos)
    utils:::.guessTokenFromLine()
    utils:::.completeToken()
    utils:::.CompletionEnv[["comps"]]
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

