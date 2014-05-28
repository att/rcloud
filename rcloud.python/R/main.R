.start.python <- function(rcloud.session)
{
  require(rpython2, quietly=TRUE)
  ## if (rcloud.support::hasConf("rcloud.python.path"))
  ##   py.init(rcloud.support::getConf("rcloud.python.path"))
  ## else
  py.init()
  sys <- py.import("sys")
  path <- system.file("python", package="rcloud.python")
  py.attr(sys, "path", .ref=TRUE)$append(path)
  sys$argv <- c("rcloud")
  py.eval("import notebook_runner")
  py.eval(paste("runner = notebook_runner.NotebookRunner(rcloud_support_path='", path, "', extra_arguments=['--matplotlib=inline'], executable='python')", sep=''))
  rcloud.session$python.runner <- py.get("runner", .ref=TRUE)
  ## keep the runner reference only on the R side
  py.eval("del runner");
  f <- .GlobalEnv$.Rserve.done
  .GlobalEnv$.Rserve.done <- function(...) { .shutdown.python(rcloud.session); if (!is.function(f)) f(...) }
}

.shutdown.python <- function(rcloud.session) {
  if (inherits(rcloud.session$python.runner, "pyref")) {
    ## unfortunately reference-based shutdown (see below) doesn't work
    ## so force shutdown
    rcloud.session$python.runner$shutdown()

    rcloud.session$python.runner <- NULL
    ## force GC so R side holds no reference
    invisible(gc())
  }
}

.eval.python <- function(command, silent, rcloud.session) {
  if (is.null(rcloud.session$python.runner))
    .start.python(rcloud.session)
  result <- rcloud.exec.python(command)
  to.chunk <- function(chunk) {
    chunk <- as.list(chunk)
    if (chunk$output_type == "pyout") {
      paste("\n    ", chunk$text, sep='')
    } else if (chunk$output_type == "stream") {
      paste("\n    ", chunk$text, sep='')
    } else if (chunk$output_type == "display_data") {
      paste("<img src=\"data:image/png;base64,", sub("\\s+$", "", chunk$png), "\">\n", sep='')
    } else ""
  }
  md <- paste("```py",command,"```\n",paste(lapply(result, to.chunk), collapse='\n'), sep='\n')
  val <- if (nzchar(md)) markdownToHTML(text=md, fragment=TRUE) else ""
  val
}

rcloud.language.support <- function()
{
  list(language="Python",
       run.cell=.eval.python,
       setup=function(rcloud.session) {},
       teardown=function(rcloud.session) {})
}
