# support for RCloud packages that know about javascript

.rcloud.javascript.session <- new.env(parent=emptyenv())
.rcloud.javascript.session$modules <- new.env(parent=emptyenv())

rcloud.setup.js.installer <- function(v)
{
  .rcloud.javascript.session$install <- wrap.js.fun(v)
  NULL
}

################################################################################

rcloud.install.js.module <- function(module.name, module.content)
{
  if (is.null(.rcloud.javascript.session$modules[[module.name]])) {
    t <- .rcloud.javascript.session$install(module.name, module.content)
    t <- wrap.all.js.funs(t)
    .rcloud.javascript.session$modules[[module.name]] <- t
  }
  .rcloud.javascript.session$modules[[module.name]]
}
