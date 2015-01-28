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

## Exceedingly crappy vt100 color translation
vt100.translate <- function(s) {
  preamble <- "<span class='vt100'><span>"
  postamble <- "</span>"
  s <- gsub("\033\\[0;([[:digit:]][[:digit:]])m", "</span><span class='color-\\1'>", s)
  s <- gsub("\033\\[0m", "</span><span>", s)
  paste(preamble, s, postamble, sep='')
}

html.escape <- function(s) {
  s <- gsub("&", "&amp;", s)
  s <- gsub("<", "&lt;", s)
  s <- gsub(">", "&gt;", s)
  s
}

rcloud.exec.python <- function(cmd, rcloud.session)
{
  if (rcloud.session$device.pixel.ratio > 1) {
    rcloud.session$python.runner$run_magic("config InlineBackend.figure_format = 'retina'")
  }
  tryCatch({
    rcloud.session$python.runner$run_cmd(cmd)
  }, error=function(e) {
    # FIXME: we're signalling exceptions in-band by creating a new
    # output type "pyexception". This could actually clash with
    # ipython's output.
    # See to.chunk in session.python.eval
    msg <- e$`message`

    # SSI - moving this logic to python module (we have better handle there)
    # # In addition, and this is a gigantic kludge, for some reason
    # # the exception message comes back with "Python exception: <type 'exceptions.Exception'> "
    # # appended to it. So we test for that prefix, bail if the prefix is not there,
    # # and trim it away to get the JSON payload.
    # prefix <- substr(msg, 1, 48)
    # if (prefix != "Python exception: <type 'exceptions.Exception'> ") {
    #   stop("Internal Error: python exception was not returned as expected")
    # }
    list(c(output_type="pyerr", html=msg, collapse='\n'))
    # list(c(output_type="pyexception",
    #        text=paste(fromJSON(substr(msg, 49, nchar(msg)))$traceback, collapse='\n')))
  })
}

.eval.python <- function(command, silent, rcloud.session) {
  mime_order <- c("html", "png", "jpeg", "text")
  typesOK <- c("pyout", "stream", "display_data", "pyerr")
  if (is.null(rcloud.session$python.runner))
    .start.python(rcloud.session)
  result <- rcloud.exec.python(command, rcloud.session)
  to.chunk <- function(chunk) {
    chunk <- as.list(chunk)
    found_mimes = names(chunk)
    best_repr <- ""
    # # We may not need to handle pyerr as a special case anymore...
    # if (chunk$output_type == "pyerr") {
    #   # There are ansi escapes here, we can probably define styles for each cell, since
    #   # the exception trace is not going to be in many cells at the same time
    #   best_repr <- paste("<pre>", vt100.translate(html.escape(chunk$text)), "</pre>", sep='')
    # } else if (chunk$output_type %in% typesOK) {
    if (chunk$output_type %in% typesOK) {
      # When we have multiple formats, go for the "richest" (in SSI's opinion?)
      # Note, the list is fixed; no SVG in here... also no latex/mathjax
      for (t in mime_order) {  # SSI -- this is a poor man's hack; I need to define handlers separately...
                               # Other option is to ensure the python runner always sends HTML?
         if (t %in% found_mimes) {
            if (t == "html") {
                best_repr <- chunk$html
            } else if (t %in% c("png", "jpeg")) {
                best_repr <- paste("<img src=\"data:image/", t, ";base64,",
                                   sub("\\s+$", "", chunk$png), "\">\n", sep='')
            } else if (t == "text") {
                best_repr <- chunk$text  # We assume things are html-escaped and in "<pre>"
            }
            break # bail out after the first representation we found along the hierarchy
         }
      }
    }
    best_repr
  }
  # SSI -- Suggest dropping Markdown for formatting Python code -- considering Pygments is used for many languages!
  md <- paste(paste(lapply(result, to.chunk), collapse='\n'), sep='\n')
  val <- if (nzchar(md)) markdownToHTML(text=md, fragment=TRUE) else ""
  self.oobSend(list("html.out", val))
}

rcloud.language.support <- function()
{
  list(language="Python",
       run.cell=.eval.python,
       ace.mode="ace/mode/python",
       hljs.class="py",
       extension="py",
       setup=function(rcloud.session) {},
       teardown=function(rcloud.session) {})
}
