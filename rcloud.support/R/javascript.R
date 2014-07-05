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
  # This early return is a really terrible hack: we want packages that
  # depend on rcloud.support to be able to call rcloud.install.js.module
  # on .onLoad, so that the appropriate javascript files are installed
  # on the browser-side of an RCloud session. But when *installing*
  # these packages, R tests them by importing the package outside
  # an RCloud session, which then fails because install.js hasn't been
  # setup.
  #
  # We simply short-circuit the call here, but beware: this could cause
  # hard-to-track-down bugs if install.js happens to be null for some
  # reason.
  if (is.null(.rcloud.javascript.session$install.js))
    return(NULL)
  
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
