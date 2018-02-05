rcloud.language.support <- function()
{
  require(rmarkdown)

  rmarkdown.markdownToHTML <- function(text, fragment=FALSE) {
    input.rmd <- "rmarkdown.cell.Rmd"
    output.html <- "rmarkdown.cell.html"
    cat(text, file=input.rmd)

    format <- default_output_format(input.rmd)$name
    if(format == "html_document")
      format = html_fragment(pandoc_args = "--mathjax")
    else
      format = "all"

    rmarkdown::render(input.rmd, format, quiet = TRUE)

    readChar(output.html, file.info(output.html)$size)
  }

  ev <- function(command, silent, rcloud.session, ...) {
    .session <- rcloud.session
    if (is.null(command) || command == "") command <- " "

    val <- try(rmarkdown.markdownToHTML(text=paste(knit(text=command, envir=.GlobalEnv), collapse="\n"),
                              fragment=TRUE), silent=TRUE)
    if (inherits(val, "try-error")) {
      # FIXME better error handling
      val <- paste("<pre>", val[1], "</pre>", sep="")
    }
    rcloud.html.out(val)
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
       is.a.markdown=TRUE,
       ace.mode="ace/mode/rmarkdown",
       extension="Rmd",
       setup=function(rcloud.session) {},
       teardown=function(rcloud.session) {})
}

