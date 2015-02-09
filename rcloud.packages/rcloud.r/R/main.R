rcloud.language.support <- function()
{
  ## a bit ugly, but just to keep the formatting in one place
  .eval <- rcloud.support:::.eval

  ev <- function(command, silent, rcloud.session) {
    .session <- rcloud.session
    # .session$device.pixel.ratio
    exp <- tryCatch(parse(text=command), error=function(o) structure(list(error=o$message), class="parse-error"))
    # ulog(".EXP: ", paste(capture.output(str(exp)), collapse='\n'))
    res <- if (!inherits(exp, "parse-error")) .eval(exp, FALSE, .GlobalEnv) else exp
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

