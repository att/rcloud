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
JUPYTER_CELL_EXEC_TIMEOUT <- 'rcloud.jupyter.cell.exec.timeout'
JUPYTER_CELL_STARTUP_TIMEOUT <- 'rcloud.jupyter.cell.startup.timeout'
JUPYTER_LANGUAGE_MAPPING <- 'rcloud.jupyter.language.mapping.config'

.set_default_kernel <- function(language, kernel_name) {
  default_kernel_key <- paste0(language, '_kernel')
  session <- rcloud.support:::.session
  assign(default_kernel_key, kernel_name, envir = session)
}

.get_default_kernel <- function(language) {
  default_kernel_key <- paste0(language, '_kernel')
  if (default_kernel_key %in% names(rcloud.support:::.session)) {
    session <- rcloud.support:::.session
    get(default_kernel_key, envir = session)
  } else {
    language
  }
}

.load.custom.mapping <- function() {
  if (rcloud.support:::nzConf(JUPYTER_LANGUAGE_MAPPING)) {
    customMappingPath <- rcloud.support:::getConf(JUPYTER_LANGUAGE_MAPPING)
    if (file.exists(customMappingPath)) {
      return(jsonlite::read_json(path = customMappingPath))
    }
  }
  list()
}

.load.mapping.from.kernel.metadata <- function(kernel_spec) {
  rcloud.metadata <- kernel_spec$metadata[grep("^rcloud\\..*", names(kernel_spec$metadata))]
  if(is.null(rcloud.metadata)) { 
    return(list())
  }
  names(rcloud.metadata) <- sub("^rcloud\\.", "", names(rcloud.metadata))
  rcloud.metadata
}

.create.language.settings <- function(kernel_name, spec) {
  defaultMapping <- jsonlite::read_json(path = system.file("jupyter/mapping.json", package="rcloud.jupyter"))
  customMapping <- .load.custom.mapping()
  kernelMapping <- .load.mapping.from.kernel.metadata(spec)
  res <- list(
    "hljs.class" = "",
    "extension" = "",
    "ace.mode" = "ace/mode/text",
    "display.name" = spec$display_name,
    "init.script" = "function (session) { '' }"
  )
  defaultLangMapping <- defaultMapping[[kernel_name]]
  customLangMapping <- customMapping[[kernel_name]]
  for(key in names(res)) {
    fromKernel <- kernelMapping[[key]]
    fromCustom <- customLangMapping[[key]]
    fromDefault <- defaultLangMapping[[key]]
    if(!is.null(fromKernel) && nchar(fromKernel)>0) {
      res[key] <- fromKernel
    } else if(!is.null(fromCustom) && nchar(fromCustom)>0) {
      res[key] <- fromCustom
    } else if(!is.null(fromDefault) && nchar(fromDefault)>0) {
      res[key] <- fromDefault
    }
    if(!nchar(res[key]) > 0) {
      stop(paste0("Language definition error: language '", kernel_name,"' property '", key, "' is missing value."))
    }
  }
  res
}


#'
#' @returnt time in seconds
#' 
.get_cell_exec_timeout <- function() {
  if (rcloud.support:::hasConf(JUPYTER_CELL_EXEC_TIMEOUT)) {
    as.integer(rcloud.support:::getConf(JUPYTER_CELL_EXEC_TIMEOUT))
  } else {
    as.integer(1200)
  }
}

#'
#' @returnt time in seconds
#' 
.get_cell_startup_timeout <- function() {
  if (rcloud.support:::hasConf(JUPYTER_CELL_STARTUP_TIMEOUT)) {
    as.integer(rcloud.support:::getConf(JUPYTER_CELL_STARTUP_TIMEOUT))
  } else {
    as.integer(600)
  }
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
                                           cell_startup_timeout = .get_cell_startup_timeout(),
                                           cell_exec_timeout = .get_cell_exec_timeout(),
                                           console_in = .console.in.handler, 
                                           kernel_name = .get_default_kernel('python')
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

.exec.with.jupyter <- function(kernel, cmd, rcloud.session)
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
    rcloud.session$jupyter.adapter$run_cmd(cmd, kernel_name = kernel)
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

rcloud.jupyter.list.kernel.specs.for.language <- function(language, rcloud.session) {
  Filter(function(x) { x$spec$language == language }, rcloud.jupyter.list.kernel.specs(rcloud.session))
}

.jupyter.cell.runner.factory <- function(kernel_name) {
  local <- list(
    kernel_name = kernel_name
  )
  function(command, silent, rcloud.session, ...) {
   if (is.null(rcloud.session$jupyter.adapter))
        .start.jupyter.adapter(rcloud.session)
    .exec.with.jupyter(local$kernel_name, command, rcloud.session)
  }
}

.jupyter.completer.factory <- function(kernel_name) {
  local <- list(
    kernel_name = kernel_name
  )
  function(text, pos, thissession) {
    if (is.null(thissession$jupyter.adapter))
      .start.jupyter.adapter(thissession)
    completions <- thissession$jupyter.adapter$complete(local$kernel_name, text, pos)
    res <- list()
    if(is.null(completions)) {
      return(res)
    }
    res$prefix <- if (completions$cursor_start < completions$cursor_end) substr(text, completions$cursor_start+1, completions$cursor_end) else ""
    res$values <- completions$matches
    res$position <- completions$cursor_start
    return(res)
  }
}

.init.language <- function(kernel_name, kernel_spec, rcloud.session) {
  language_descriptor <- list(
    settings = .create.language.settings(kernel_name, kernel_spec),
    run.cell = .jupyter.cell.runner.factory(kernel_name),
    complete = .jupyter.completer.factory(kernel_name)
  )
  
  init.script.builder <- eval(parse(text=language_descriptor$settings$init.script))
  
  init.script <- init.script.builder(rcloud.session)
  
  rcloud.session$jupyter.adapter$add_init_script(kernel_name, init.script)
  
  RCloudLanguage(list(language=language_descriptor$settings$display.name,
                      run.cell=language_descriptor$run.cell,
                      complete=language_descriptor$complete,
                      ace.mode=language_descriptor$settings$ace.mode,
                      hljs.class=language_descriptor$settings$hljs.class,
                      extension=language_descriptor$settings$extension,
                      setup=function(rcloud.session) {},
                      teardown=function(rcloud.session) {}))
}

rcloud.language.support <- function(rcloud.session)
{
  kernel.specs <- rcloud.jupyter.list.kernel.specs(rcloud.session)
  lapply(names(kernel.specs), function(kernel_name, kernel_spec, rcloud.session) {
    .init.language(kernel_name, kernel_spec, rcloud.session)
  }, kernel.specs, rcloud.session)
}
