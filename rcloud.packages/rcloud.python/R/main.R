.start.python <- function(rcloud.session)
{
  require(rpython2, quietly=TRUE)
  if (rcloud.support:::hasConf("rcloud.python.path"))
    py.init(rcloud.support:::getConf("rcloud.python.path"))
  else
    py.init()
  sys <- py.import("sys")
  path <- system.file("python", package="rcloud.python")
  py.attr(sys, "path", .ref=TRUE)$append(path)
  ## append any admin-specified paths (as ":" - separated paths)
  if (rcloud.support:::nzConf("python.extra.libs"))
    path <- paste(path, rcloud.support:::getConf("python.extra.libs"), sep=":")
  sys$argv <- c("rcloud")
  py.eval("import notebook_runner")
  py.eval(paste("runner = notebook_runner.NotebookRunner(rcloud_python_lib_path='", path, "', extra_arguments=['--matplotlib=inline'], executable='python')", sep=''))
  rcloud.session$python.runner <- py.get("runner", .ref=TRUE)
  ## keep the runner reference only on the R side
  py.eval("del runner");
  f <- .GlobalEnv$.Rserve.done
  .GlobalEnv$.Rserve.done <- function(...) { .shutdown.python(); if (!is.function(f)) f(...) }
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

rcloud.exec.pythonsubmit <- function(cmd, rcloud.session)
{ # submits the cell to Python engine for execution
  if (rcloud.session$device.pixel.ratio > 1) {
    rcloud.session$python.runner$run_magic("config InlineBackend.figure_format = 'retina'")
  }
  tryCatch({  # We submit the command to the kernel and try to catch immediate problems here
      rcloud.session$python.runner$submit_cell(cmd)
      NULL
  }, error=function(e) {
    if(grepl('None must be a string', e$message)) # special case the empty string
      "(no input)"
    else
      structure(list(error=e$message), class="parse-error")
  })
}

rcloud.exec.python <- function(cmd, rcloud.session)
{
  res <- rcloud.exec.pythonsubmit(cmd, rcloud.session)
  if(!is.null(res))
     return(res)  # Something went wrong on submission, so assume end of cell
  mime_order <- c("html", "png", "jpeg", "text") # richest representation to poorest [order is debatable!]
  to.chunk <- function(chunk) {
    # Handler to convert a chunk of response from Python engine to html to send via oob
    found_mimes = names(chunk)
    # Pick first format one in mime_order: hard-coded list; no SVG, no latex/mathjax
    t = mime_order[mime_order %in% found_mimes][1] # First match in mime_order
    if (t %in% c("html", "text"))
      return(c(t, chunk[[t]]))  # we assume text is 'html-escaped and within <pre></pre>'
    if (t %in% c("png", "jpeg")) {
        img_data <- paste0("data:image/", t, ";base64,", sub("\\s+$", "", chunk[[t]]))
        return(c(t, paste0("<img src=\"",  img_data, "\">\n")))
    }
  }
  repeat
  {
      tryCatch({  # We submit the command to the kernel and try to catch immediate problems here
          outval <- rcloud.session$python.runner$poll_for_msgs()
      }, error=function(e) {
          # i don't think this gets hit anymore
          msg <- e$message
          rcloud.html.out(msg)
          return()
      })
      outval <- as.list(outval)
      outType <- outval$output_type
      if (outType %in% c("IDLE", "NoOp", "EMPTY")) next()
      if (outType %in% c("END_CELL")) return()
      res <- to.chunk(outval)
      if ( (res[1] == "text") && (outType == "CONSOLE") ) {
          rcloud.out(res[2])
      } else {
          rcloud.html.out(res[2])
          if(outType %in% c("pyerr"))
            return(structure(list(error="Python evaluation error"), class='cell-eval-error'))
      }
  }
}

.eval.python <- function(command, silent, rcloud.session, ...) {
  if (is.null(rcloud.session$python.runner))
      .start.python(rcloud.session)  # if there is no backend Python engine, start it
  rcloud.exec.python(command, rcloud.session)
}

pycomplete <- function(text, pos, thissession) {
  if (is.null(thissession$python.runner))
      .start.python(thissession)  # if there is no backend Python engine, start it
  res <- thissession$python.runner$complete(text, pos)
  return(res)
}

rcloud.language.support <- function()
{
  list(language="Python",
       run.cell=.eval.python,
       complete = pycomplete,
       ace.mode="ace/mode/python",
       hljs.class="py",
       extension="py",
       setup=function(rcloud.session) {},
       teardown=function(rcloud.session) {})
}
