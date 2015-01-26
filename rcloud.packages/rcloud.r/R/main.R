rcloud.language.support <- function()
{
  ev <- function(command, silent, rcloud.session) {
    .session <- rcloud.session
    # .session$device.pixel.ratio
    res <- withVisible(eval(parse(text=command, keep.source=TRUE), .GlobalEnv))
    if (res$visible) print(res$value)
    ## FIXME: in principle this should move from rcloud.support to rcloud.R
    rcloud.support:::.post.eval()
    NULL
  }
  complete <- function(text, pos) {
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

