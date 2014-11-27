rcloud.language.support <- function()
{
  ev <- function(command, silent, rcloud.session) {
    .session <- rcloud.session
    if (!is.null(.session$device.pixel.ratio))
      opts_chunk$set(dpi=72*.session$device.pixel.ratio)
    if (!is.null(.session$disable.warnings))
      opts_chunk$set(warning=FALSE)
    else
      opts_chunk$set(warning=TRUE)
    if (!is.null(.session$disable.echo))
      opts_chunk$set(echo=FALSE)
    else
      opts_chunk$set(echo=TRUE)
    # opts_chunk$set(prompt=TRUE)
    opts_chunk$set(dev="CairoPNG", tidy=FALSE)

    if (command == "") command <- " "
    command <- paste("```{r}", command, "```\n", sep='\n')
    val <- try(markdownToHTML(text=paste(knit(text=command, envir=.GlobalEnv), collapse="\n"),
                              fragment=TRUE), silent=TRUE)
    if (!inherits(val, "try-error") && !silent && rcloud.debug.level()) print(val)
    if (inherits(val, "try-error")) {
      # FIXME better error handling
      paste("<pre>", val[1], "</pre>", sep="")
    } else {
      val
    }
  }
  list(language="R",
       run.cell=ev,
       setup=function(rcloud.session) {},
       teardown=function(rcloud.session) {})
}

