.session <- new.env(parent=emptyenv())
.session$device.pixel.ratio <- 1

################################################################################
## evaluation of R code

canonicalize.command <- function(command, language) {
  if (language == "R") {
    command <- paste("```{r}", command, "```\n", sep='\n')
  } else if (language == "Markdown") {
    command
  } else
    stop(paste("Don't know language '",  language, "' - only Markdown or R supported."))
}

rcloud.get.gist.part <- function(partname) {
  .session$current.notebook$content$files[[partname]]$content
}

rcloud.unauthenticated.session.cell.eval <- function(partname, language, silent) {
  notebook.id <- .session$current.notebook$content$id
  if (rcloud.is.notebook.published(notebook.id))
    rcloud.session.cell.eval(partname, language, silent)
  else
    stop("Notebook does not exist or is not published.")
}

rcloud.session.cell.eval <- function(partname, language, silent) {
  ulog("RCloud rcloud.session.cell.eval(", partname, ",", language,")")
  command <- rcloud.get.gist.part(partname)
  if (language == "R" || language == "Markdown") {
    session.markdown.eval(command, language, silent)
  } else if (language == "Python") {
    session.python.eval(command)
  } else if (language == "Text") {
    command
  }
}

rcloud.authenticated.cell.eval <- function(command, language, silent) {
  if (language == "R" || language == "Markdown") {
    session.markdown.eval(command, language, silent)
  } else if (language == "Python") {
    session.python.eval(command)
  } else if (language == "Text") {
    command
  }
}

rcloud.set.device.pixel.ratio <- function(ratio) {
  .session$device.pixel.ratio <- ratio
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

session.python.eval <- function(command) {
  mime_order <- c("html", "png", "jpeg", "text")
  typesOK <- c("pyout", "stream", "display_data", "pyerr")
  if (is.null(.session$python.runner))
    rcloud.start.python()
  result <- rcloud.exec.python(command)
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
                best_repr <- paste("<pre>", chunk$text, "</pre>", sep='')
            }
            break # bail out after the first representation we found along the hierarchy
         }
      }
    }
    best_repr
  }
  # SSI -- Suggest dropping Markdown for formatting Python code -- considering Pygments is used for many languages!
  md <- paste("```py",command,"```\n",paste(lapply(result, to.chunk), collapse='\n'), sep='\n')
  val <- if (nzchar(md)) markdownToHTML(text=md, fragment=TRUE) else ""
  val
}

session.markdown.eval <- function(command, language, silent) {
  command <- canonicalize.command(command, language)
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

## WS init
rcloud.compute.init <- function(...) {
  set.seed(Sys.getpid()) # we want different seeds so we get different file names
  .GlobalEnv$tmpfile <- paste('tmp-',paste(sprintf('%x',as.integer(runif(4)*65536)),collapse=''),'.tmp',sep='')
  start.rcloud(...)
  rcloud.reset.session()

  ## set default mirror if not specified to avoid interactive selection
  if (isTRUE("@CRAN@" %in% getOption("repos")))
      options(repos=c(CRAN = if(nzConf("cran.mirror")) getConf("cran.mirror") else "http://cran.r-project.org"))

  ver <- paste0('RCloud ', rcloud.info("version.string"), ' ')
  if (nzchar(rcloud.info("revision"))) ver <- paste0(ver, "(", rcloud.info("branch"), "/", rcloud.info("revision"), "), ")
  paste0(ver, R.version.string, "<br>Welcome, ", .session$username)
}

## WS init
rcloud.anonymous.compute.init <- function(...) {
  set.seed(Sys.getpid()) # we want different seeds so we get different file names
  .GlobalEnv$tmpfile <- paste('tmp-',paste(sprintf('%x',as.integer(runif(4)*65536)),collapse=''),'.tmp',sep='')
  start.rcloud.anonymously(...)
  rcloud.reset.session()
  paste(R.version.string, " --- welcome, anonymous user", sep='')
}

rcloud.session.init <- function(...) {
    start.rcloud(...)
}

rcloud.anonymous.session.init <- function(...) {
    start.rcloud.anonymously(...)
}

rcloud.reset.session <- function() {
  ## use the global workspace as the parent to avoid long lookups across irrelevant namespaces
  .session$knitr.env <- new.env(parent=.GlobalEnv)
  ## load all-user and per-user rcloud add-ons
  all.addons <- rcs.get(rcs.key(user=".allusers", notebook="system", "config", "addons"))
  user.addons <- rcloud.config.get.user.option("addons")
  lapply(c(all.addons,user.addons), function(x) { suppressWarnings(suppressMessages(require(x, character.only=TRUE))) })
  ## FIXME: we should reset the knitr graphics state which lingers as well as the current device which is dirty at this point
  NULL
}
