rcloud.language.support <- function()
{
  require(rmarkdown)

  rmarkdown.markdownToHTML <- function(text, fragment=FALSE) {
    input <- "./input.Rmd"
    output <- "output.html"
    output_dir <- "."
    # do we need some of the options that markdown/r set to opts_chunk?
    knitr_opts = knitr_options(opts_chunk = list(results = 'hold', message=FALSE))
    cat(text, file=input)
    rmarkdown::render(input, output_format = html_fragment(),
                      output_file=output, output_dir=output_dir,
                      output_options = output_format(knitr_opts),
                      intermediates_dir=output_dir, quiet = TRUE)
    readChar(output, file.info(output)$size)
  }

  ev <- function(command, silent, rcloud.session) {
    .session <- rcloud.session
    if (command == "") command <- " "

    command <- paste('---', 'output: html_fragment', '---', command, sep='\n')

    val <- try(rmarkdown.markdownToHTML(text=paste(knit(text=command, envir=.GlobalEnv), collapse="\n"),
                              fragment=TRUE), silent=TRUE)
    if (!inherits(val, "try-error") && !silent && rcloud.debug.level()) print(val)
    if (inherits(val, "try-error")) {
      # FIXME better error handling
      paste("<pre>", val[1], "</pre>", sep="")
    } else {
      val
    }
  }
  complete <- function(text, pos) {
    # from rcompgen.completion
    utils:::.assignLinebuffer(text)
    utils:::.assignEnd(pos)
    utils:::.guessTokenFromLine()
    utils:::.completeToken()
    utils:::.CompletionEnv[["comps"]]
  }

  list(language="RMarkdown",
       run.cell=ev,
       complete=complete,
       ace.mode="ace/mode/rmarkdown",
       extension="Rmd",
       setup=function(rcloud.session) {},
       teardown=function(rcloud.session) {})
}

