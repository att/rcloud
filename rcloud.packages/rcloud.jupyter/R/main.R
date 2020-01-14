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
#' Other optional settings:
#'  * rcloud.jupyter.delayed.init: disable - if included Jupyter will be initialized immediately, otherwise on first use
#'
#' Kernels are loaded from the following default locations, if JUPYTER_PATH is not set:
#' * "/home/<USER_NAME>/.local/share/jupyter/kernels"
#' * "/usr/local/share/jupyter/kernels"
#' * "/usr/share/jupyter/kernels"
#'  

## max age of kernelspec cache
.max.cache.age <- 86400 ## refresh the cache at least once a day

PYTHON_PATH <- 'rcloud.jupyter.python.path'
PYTHON_EXTRA_LIBS <- 'rcloud.jupyter.python.extra.libs'
JUPYTER_CELL_EXEC_TIMEOUT <- 'rcloud.jupyter.cell.exec.timeout'
JUPYTER_KERNEL_STARTUP_TIMEOUT <- 'rcloud.jupyter.kernel.startup.timeout'
JUPYTER_LANGUAGE_MAPPING <- 'rcloud.jupyter.language.mapping.config'
JUPYTER_CONNECTION_DIR_PATH <- 'rcloud.jupyter.connection_dir.path'

.set_default_kernel <- function(language, kernel_name) {
  default_kernel_key <- paste0(language, '_kernel')
  session <- rcloud.support:::.session
  ulog("rcloud.jupyter::.set_default_kernel: ", kernel_name)
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
      return(jsonlite::fromJSON(txt = customMappingPath))
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

.replace.null.with.empty.list <- function (param) {
  if(is.null(param)) return(list())
  param
}

.merge.lists <- function(left, right) {
  for(key in names(right)) {
      left[key] <- right[[key]]
  }
  left
}

.create.language.settings <- function(kernel_name, spec) {
  defaultMapping <- jsonlite::fromJSON(txt = system.file("jupyter/mapping.json", package="rcloud.jupyter"))
  customMapping <- .load.custom.mapping()
  kernelMapping <- .load.mapping.from.kernel.metadata(spec)
  res <- list(
    "hljs.class" = "",
    "extension" = "",
    "ace.mode" = "ace/mode/text",
    "display.name" = spec$display_name,
    "init.script" = "function (session) { '' }"
  )
  language <- spec$language
  
  defaultLangDefinition <- .replace.null.with.empty.list(defaultMapping[['languages']][[language]])
  customLangDefinition <- .replace.null.with.empty.list(customMapping[['languages']][[language]])
  defaultKernelMapping <- .replace.null.with.empty.list(defaultMapping[['kernelMapping']][[kernel_name]])
  customKernelMapping <- .replace.null.with.empty.list(customMapping[['kernelMapping']][[kernel_name]])
  
  defaultLangMapping <- .merge.lists(defaultLangDefinition, defaultKernelMapping)
  customLangMapping <- .merge.lists(customLangDefinition, customKernelMapping)
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
  if (rcloud.support:::nzConf(JUPYTER_CELL_EXEC_TIMEOUT)) {
    as.integer(rcloud.support:::getConf(JUPYTER_CELL_EXEC_TIMEOUT))
  } else {
    as.integer(1200)
  }
}

#'
#' @returnt time in seconds
#' 
.get_cell_startup_timeout <- function() {
  if (rcloud.support:::nzConf(JUPYTER_KERNEL_STARTUP_TIMEOUT)) {
    as.integer(rcloud.support:::getConf(JUPYTER_KERNEL_STARTUP_TIMEOUT))
  } else {
    as.integer(600)
  }
}

#'
#' @returnt connnection dir path
#' 
.get_connection_dir_path <- function() {
  if (rcloud.support:::nzConf(JUPYTER_CONNECTION_DIR_PATH)) {
    rcloud.support:::getConf(JUPYTER_CONNECTION_DIR_PATH)
  } else {
    '/tmp'
  }
}

#'
#' Initializes Jupyter Adapter and stores reference to it in session with 'jupyter.adapter' key.
#'
.start.jupyter.adapter <- function(rcloud.session)
{
    ulog("rcloud.jupyter::.start.jupyter.adapter")
    require(reticulate, quietly=TRUE)
    if (rcloud.support:::hasConf(PYTHON_PATH))
        reticulate::use_python(rcloud.support:::getConf(PYTHON_PATH))
    sys <- reticulate::import("sys")
    ## append any admin-specified paths (as ":" - separated paths)
    if (rcloud.support:::nzConf(PYTHON_EXTRA_LIBS)) {
        extraLibs <- unlist(strsplit(rcloud.support:::getConf(PYTHON_EXTRA_LIBS), ':'))
        sys$path <-c(sys$path, extraLibs)
    }
    sys$path <- c(sys$path, system.file("jupyter", package="rcloud.jupyter"))
    ulog("rcloud.jupyter::.start.jupyter.adapter: adapter system path ", paste(sys$path, collapse=':'))

    jupyter_adapter <- reticulate::import("jupyter_adapter")

    runner <- jupyter_adapter$JupyterAdapter(
                                           kernel_startup_timeout = .get_cell_startup_timeout(),
                                           cell_exec_timeout = .get_cell_exec_timeout(),
                                           connection_dir = .get_connection_dir_path(),
                                           console_in = .console.in.handler, 
                                           kernel_name = .get_default_kernel('python')
                                           )
    rcloud.session$jupyter.adapter <- runner

    f <- .GlobalEnv$.Rserve.done
    session <- rcloud.session

    .GlobalEnv$.Rserve.done <- function(...) {
        tryCatch({
            .stop.jupyter.adapter(session)
        }, error=function(e) {
            err <- paste("Process id", Sys.getpid(), "session id", session$sessionID, " error during jupyter adapter shutdown:", as.character(e))
            ulog("rcloud.jupyter: ERROR: ", err)
            warning(err)
        })
        if (is.function(f)) {
            f(...)
        }
    }

    if (length(rcloud.session$.jupyter.delayed.init)) {
        ulog("rcloud.jupyter::.start.jupyter.adapter: initializing scripts for kernels: ",
             paste(names(rcloud.session$.jupyter.delayed.init), collapse=", "))
        for (kernel.name in names(rcloud.session$.jupyter.delayed.init))
            rcloud.session$jupyter.adapter$add_init_script(kernel.name, rcloud.session$.jupyter.delayed.init[[kernel.name]])
    }
    rcloud.session$.jupyter.delayed.init <- NULL

    ulog("rcloud.jupyter::.start.jupyter.adapter: done")
    rcloud.session$jupyter.adapter
}

#'
#' callback handler invoked when stdin input is requested from Python
#'
.console.in.handler <- function(prompt) {
    ulog("rcloud.jupyer::.console.in.handler: requesting input")
    readline(prompt)
}

.stop.jupyter.adapter <- function(rcloud.session) {
    if (!is.null(rcloud.session$jupyter.adapter)) {
        ulog("rcloud.jupyer::.stop.jupyter.adapter: stopping Jupyter adapter")
        rcloud.session$jupyter.adapter$shutdown()
        rcloud.session$jupyter.adapter <- NULL
        ## force GC so R side holds no reference
        invisible(gc())
    }
}

.get.jupyter.adapter <- function(rcloud.session)
    if (is.null(rcloud.session$jupyter.adapter)) .start.jupyter.adapter(rcloud.session) else rcloud.session$jupyter.adapter

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
  outputs <- tryCatch(.get.jupyter.adapter(rcloud.session)$run_cmd(cmd, kernel_name = kernel),
                      error=function(e) {
    msg <- e$message
    rcloud.html.out(msg)
    return(structure(list(error=e$message), class='cell-eval-error'))
  })
  
  if(is.null(outputs)) return()

  if(inherits(outputs, 'cell-eval-error')) return(outputs)

  processed <- lapply(outputs, function(outval) 
  {
    outType <- outval$output_type
    res <- to.chunk(outval)
    if ( (res[1] == "text") && (outType == "CONSOLE") ) {
      rcloud.out(res[2])
      return(structure(list(), class='cell-eval-result'))
    } else {
      rcloud.html.out(res[2])
      if(outType %in% c("error"))
        return(structure(list(error="Cell evaluation error"), class='cell-eval-error'))
    }
  })
  errors <- Filter(function(x) { inherits(x, 'cell-eval-error') }, processed)
  if (length(errors) > 0) {
    return(errors[[1]])
  }
  return(structure(list(), class='cell-eval-result'))
}

rcloud.jupyter.list.kernel.specs <- function(rcloud.session, use.cache=TRUE)
{
    if (use.cache) {
        cache <- rcloud.home(".rcloud.jupyter.kernelspec.cache.rds")
        tryCatch({
            if (isTRUE(as.numeric(Sys.time()) - as.numeric(file.info(cache)$mtime) < .max.cache.age))
                return(readRDS(cache))
            ulog("rcloud.jupyter.list.kernel.specs: not using cache, too old or not present")
        }, error=function(e) ulog("rcloud.jupyter.list.kernel.specs: ERROR loading cache: ", as.character(e)))
    }

    ulog("rcloud.jupyter.list.kernel.specs: calling jupter.adapter$get_kernel_specs()")
    spec <- .get.jupyter.adapter(rcloud.session)$get_kernel_specs()

    if (use.cache) tryCatch({
        ## write to file that is unique to the process in case two processes
        ## try it in parallel
        rn <- paste(cache, Sys.getpid(), sep='.')
        saveRDS(spec, file=rn)
        ## do atomic rename to avoid race conditions
        file.rename(rn, cache)
        ulog("rcloud.jupyter.list.kernel.specs: kernelspec cache saved to ", cache)
    }, error=function(e)
        ulog("rcloud.jupyter.list.kernel.specs: ERROR saving cache: ", as.character(e)))

    spec
}

rcloud.jupyter.list.kernel.specs.for.language <- function(language, rcloud.session) {
  Filter(function(x) { x$spec$language == language }, rcloud.jupyter.list.kernel.specs(rcloud.session))
}

.jupyter.cell.runner.factory <- function(kernel_name) {
    local <- list(
        kernel_name = kernel_name
    )
    function(command, silent, rcloud.session, ...)
        tryCatch(.exec.with.jupyter(local$kernel_name, command, rcloud.session),
                 error=function(o) structure(list(error=o$message), class="cell-eval-error"))
}

.jupyter.completer.factory <- function(kernel_name) {
  local <- list(
    kernel_name = kernel_name
  )
  function(text, pos, thissession) {
    
    exp <- tryCatch(
      {
        completions <- .get.jupyter.adapter(thissession)$complete(local$kernel_name, text, pos)
        res <- list()
        if(is.null(completions)) {
          return(res)
        }
        res$prefix <- if (completions$cursor_start < completions$cursor_end) substr(text, completions$cursor_start+1, completions$cursor_end) else ""
        res$values <- completions$matches
        res$position <- completions$cursor_start
        return(res)
      }, error=function(o) structure(list(error=o$message), class="cell-complete-error"))
    
    result <- if (!inherits(exp, "cell-complete-error")) exp else list()
    return(result)
  }
}

.init.language <- function(kernel_name, kernel_spec, rcloud.session, delayed=TRUE) {
    language_descriptor <- list(
        settings = .create.language.settings(kernel_name, kernel_spec),
        run.cell = .jupyter.cell.runner.factory(kernel_name),
        complete = .jupyter.completer.factory(kernel_name)
    )

    init.script.builder <- eval(parse(text=language_descriptor$settings$init.script))

    init.script <- init.script.builder(rcloud.session)

    if (delayed) {
        if (is.null(rcloud.session$.jupyter.delayed.init))
            rcloud.session$.jupyter.delayed.init <- list()
        ulog("rcloud.jupyter::.init.language: delayed init for kernel ", kernel_name)
        rcloud.session$.jupyter.delayed.init[[kernel_name]] <- init.script
    } else {
        ulog("rcloud.jupyter::.init.language: init for kernel ", kernel_name)
        .get.jupyter.adapter(rcloud.session)$add_init_script(kernel_name, init.script)
    }

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
    ## allows config file to disable delayer Jupyter start via jupyter.delayed.init: disable
    delayed <- if (rcloud.support:::hasConf("rcloud.jupyter.delayed.init") && rcloud.support:::getConf("rcloud.jupyter.delayed.init" %in% c("disable", "no", "false"))) FALSE else TRUE
    ulog("rcloud.jupyter::rcloud.language.support, starting")
    kernel.specs <- rcloud.jupyter.list.kernel.specs(rcloud.session, delayed)
    delayed <- is.null(rcloud.session$jupyter.adapter) ## check if list.kernel.specs had to start the adapter - if so, no more delay
    ulog("rcloud.jupyter::rcloud.language.support: found kernels (", if (delayed) "from cache" else "via kernelspecs", "): ",
         paste(names(kernel.specs), collapse=","))
    languages <- lapply(names(kernel.specs), function(kernel_name) {
        lang <- tryCatch(.init.language(kernel_name, kernel.specs[[kernel_name]]$spec, rcloud.session, delayed),
                         error = function(o) {
                             ulog("rcloud.jupyter::rcloud.language.support: .init.language for ", kernel_name, " failed with ", as.character(o))
                             structure(list(error=o$message), class="language-init-error")
                         })
        if(inherits(lang, "language-init-error")) warning(lang$error)
        lang
    })
    languages <- Filter(function(x) { !inherits(x, 'language-init-error') }, languages)
    lang.list <- sapply(languages, function(x) x$language)
    ulog("rcloud.jupyter::rcloud.language.support: langues without init errors: ", paste(lang.list, collapse=", "))
    languages[order(lang.list)]
}

## unfortuantely we have ulog::ulog and Rserve::ulog
## Currently RCloud is configured to only setup Rserve::ulog so we have to
## use it explicitly
ulog <- Rserve::ulog
