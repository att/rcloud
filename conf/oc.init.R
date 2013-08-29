make.oc <- function(fun)
{
  .Call("Rserve_oc_register", fun)
}

oc.init <- function()
{
  make.oc(rcloud.support:::oc.init)
}
