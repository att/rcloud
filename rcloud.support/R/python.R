rcloud.start.python <- function()
{
  require(rpython2, quietly=TRUE)
  if (hasConf("rcloud.python.path"))
    py.init(getConf("rcloud.python.path"))
  else
    py.init()
  sys <- py.import("sys")
  path <- system.file("python", package="rcloud.support")
  py.attr(sys, "path", .ref=TRUE)$append(path)
  sys$argv <- c("rcloud")
  py.eval("import notebook_runner")
  py.eval(paste("runner = notebook_runner.NotebookRunner(rcloud_support_path='", path, "', extra_arguments=['--matplotlib=inline'], executable='python')", sep=''))
  .session$python.runner <- py.get("runner", .ref=TRUE)
  ## keep the runner reference only on the R side
  py.eval("del runner");
  f <- .GlobalEnv$.Rserve.done
  .GlobalEnv$.Rserve.done <- function(...) { .shutdown.python(); if (!is.function(f)) f(...) }
}

rcloud.exec.python <- function(cmd)
{
  if (.session$device.pixel.ratio > 1) {
    .session$python.runner$run_magic("config InlineBackend.figure_format = 'retina'")
  }
  tryCatch({
    .session$python.runner$run_cmd(cmd)
  }, error=function(e) {
    # FIXME: we're signalling exceptions in-band by creating a new
    # output type "pyexception". This could actually clash with
    # ipython's output.
    # See to.chunk in session.python.eval
    msg <- e$`message`

    # In addition, and this is a gigantic kludge, for some reason
    # the exception message comes back with "Python exception: <type 'exceptions.Exception'> "
    # appended to it. So we test for that prefix, bail if the prefix is not there,
    # and trim it away to get the JSON payload.
    prefix <- substr(msg, 1, 48)
    if (prefix != "Python exception: <type 'exceptions.Exception'> ") {
      stop("Internal Error: python exception was not returned as expected")
    }
    list(c(output_type="pyexception",
           text=paste(fromJSON(substr(msg, 49, nchar(msg)))$traceback, collapse='\n')))
  })
}

.shutdown.python <- function() {
  if (inherits(.session$python.runner, "pyref")) {
    ## unfortunately reference-based shutdown (see below) doesn't work
    ## so force shutdown
    .session$python.runner$shutdown()

    .session$python.runner <- NULL
    ## force GC so R side holds no reference
    invisible(gc())
  }
}
