# support for RCloud packages that know about javascript

.rcloud.javascript.session <- new.env(parent=emptyenv())
.rcloud.javascript.session$modules <- new.env(parent=emptyenv())

rcloud.setup.js.installer <- function(v)
{
  .rcloud.javascript.session$install.js <- wrap.js.fun(v$install_js)
  .rcloud.javascript.session$install.css <- wrap.js.fun(v$install_css)
  NULL
}

################################################################################

rcloud.install.js.module <- function(module.name, module.content, force=FALSE)
{
  if (force || is.null(.rcloud.javascript.session$modules[[module.name]])) {
    debug.comment <- paste("//@ sourceURL=", module.name, ".js", sep="")
    module.content <- paste(module.content, debug.comment, sep="\n")
    t <- .rcloud.javascript.session$install.js(module.name, module.content)
    t <- wrap.all.js.funs(t)
    .rcloud.javascript.session$modules[[module.name]] <- t
  }
  .rcloud.javascript.session$modules[[module.name]]
}

rcloud.install.css <- function(urls)
{
  t <- .rcloud.javascript.session$install.css(urls)
  NULL
}

rcloud.clear.css <- function(notebook)
{
  .rcloud.javascript.session$clear.css(notebook)
  NULL
}
