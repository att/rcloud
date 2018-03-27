#' 
#' Configuration
#' 
#' Python version and library path are defined by the following settings from rcloud.conf:
#'  * rcloud.jupyter.python.path - path to Python installation that should be used
#'  * rcloud.jupyter.python.extra.libs - additional Python lib directories (e.g. where Jupyter Python modules got installed)
#'  
#' IMPORTANT!!! These two do not affect kernels being used, kernels are configured by kernel descriptors.
#'  
#'  For Jupyter configuration options see https://jupyter.readthedocs.io/en/latest/projects/jupyter-directories.html
#'  
#' Kernels are loaded from the following default locations, if JUPYTER_PATH is not set:
#' * "/home/<USER_NAME>/.local/share/jupyter/kernels"
#' * "/usr/local/share/jupyter/kernels"
#' * "/usr/share/jupyter/kernels"
#'  
PYTHON_PATH <- 'rcloud.jupyter.python.path'
PYTHON_EXTRA_LIBS <- 'rcloud.jupyter.python.extra.libs'
JUPYTER_CELL_TIMEOUT <- 'rcloud.jupyter.cell.timeout'

.set_python_kernel <- function(python_kernel) {
  session <- rcloud.support:::.session
  session$python_kernel <- python_kernel
}

.get_python_kernel <- function() {
  if('python_kernel' %in% names(rcloud.support:::.session)) {
    session <- rcloud.support:::.session
    session$python_kernel
  } else {
    'python'
  }
}

#'
#' @returnt time in seconds
#' 
.get_cell_timeout <- function() {
  if (rcloud.support:::hasConf(JUPYTER_CELL_TIMEOUT)) {
    as.integer(rcloud.support:::getConf(JUPYTER_CELL_TIMEOUT))
  } else {
    as.integer(600)
  }
}

.build_init_script <- function(rcloud.session) {
  retina <- ''  
  if (rcloud.session$device.pixel.ratio > 1) {
    retina <- "config InlineBackend.figure_format = 'retina'"
  }
  
  inline_plots <- "%matplotlib inline"
  paste0(retina, '\n', inline_plots)
}

#'
#' Initializes Jupyter Adapter and stores reference to it in session with 'jupyter.adapter' key.
#'
.start.jupyter.adapter <- function(rcloud.session)
{
  require(reticulate, quietly=TRUE)
  if (rcloud.support:::hasConf(PYTHON_PATH))
    use_python(rcloud.support:::getConf(PYTHON_PATH))
  sys <- import("sys")
  ## append any admin-specified paths (as ":" - separated paths)
  if (rcloud.support:::nzConf(PYTHON_EXTRA_LIBS)) {
    extraLibs <- unlist(strsplit(rcloud.support:::getConf(PYTHON_EXTRA_LIBS), ':'))
    sys$path <-c(sys$path, extraLibs)
  }
  sys$path <- c(sys$path, system.file("jupyter", package="rcloud.jupyter"))
  
  jupyter_adapter <- import("jupyter_adapter")
  
  runner <- jupyter_adapter$JupyterAdapter(
                                           cell_exec_timeout = .get_cell_timeout(),
                                           rcloud_python_init_script=.build_init_script(rcloud.session),
                                           console_in = .console.in.handler, 
                                           kernel_name = .get_python_kernel()
                                           )
  rcloud.session$jupyter.adapter <- runner
  
  f <- .GlobalEnv$.Rserve.done
  
  .GlobalEnv$.Rserve.done <- function(...) { 
    .stop.jupyter.adapter(rcloud.session); 
    if (is.function(f)) 
      f(...) 
    }
}

#'
#' callback handler invoked when stdin input is requested from Python
#'
.console.in.handler <- function(prompt ) {
  readline( prompt )
}

.stop.jupyter.adapter <- function(rcloud.session) {
  if (!is.null(rcloud.session$jupyter.adapter)) {
    rcloud.session$jupyter.adapter$shutdown()
    rcloud.session$jupyter.adapter <- NULL
    ## force GC so R side holds no reference
    invisible(gc())
  }
}

.exec.with.jupyter <- function(cmd, rcloud.session)
{
  mime_order <- c("html", "png", "jpeg", "text", "json") # richest representation to poorest [order is debatable!]
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
    if (t %in% c("json"))
      return(c(t, paste0('<pre>', jsonlite:::toJSON(chunk[[t]]), '</pre>')))
  }
  outputs <- tryCatch({
    rcloud.session$jupyter.adapter$run_cmd(cmd)
  }, error=function(e) {
    msg <- e$message
    rcloud.html.out(msg)
    return()
  })
  
  if(is.null(outputs)) {
    return()
  }
  lapply(outputs, function(outval) 
  {
    outType <- outval$output_type
    res <- to.chunk(outval)
    if ( (res[1] == "text") && (outType == "CONSOLE") ) {
      rcloud.out(res[2])
    } else {
      rcloud.html.out(res[2])
      if(outType %in% c("error"))
        return(structure(list(error="Python evaluation error"), class='cell-eval-error'))
    }
  })
}

rcloud.jupyter.list.kernel.specs <- function(rcloud.session)
{
  if (is.null(rcloud.session$jupyter.adapter))
    .start.jupyter.adapter(rcloud.session)
  return(rcloud.session$jupyter.adapter$get_kernel_specs())
}

.run.cell.with.jupyter <- function(command, silent, rcloud.session, ...) {
 if (is.null(rcloud.session$jupyter.adapter))
      .start.jupyter.adapter(rcloud.session)
  .exec.with.jupyter(command, rcloud.session)
}

.complete.with.jupyter <- function(text, pos, thissession) {
  if (is.null(thissession$jupyter.adapter))
    .start.jupyter.adapter(thissession)
  completions <- thissession$jupyter.adapter$complete(.get_python_kernel(), text, pos)
  res <- list()
  if(is.null(completions)) {
    return(res)
  }
  res$values <- completions$matches
  res$prefix <- substr(text, completions$cursor_start, completions$cursor_end)
  res$position <- completions$cursor_end
  return(res)
}

rcloud.language.support <- function()
{
  list(language="Python",
       run.cell=.run.cell.with.jupyter,
       complete=.complete.with.jupyter,
       ace.mode="ace/mode/python",
       hljs.class="py",
       extension="py",
       setup=function(rcloud.session) {},
       teardown=function(rcloud.session) {})
}
