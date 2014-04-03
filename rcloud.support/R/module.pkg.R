## OCAP to load a package as an RCloud module and wrap the OCAPs accordingly
rcloud.load.module.package <- function(pkg) {
  ns <- asNamespace(pkg)
  rcx <- ns[[".rcloud.export.ocaps"]]
  if (isTRUE(rcx)) lapply(eapply(getNamespaceInfo(ns, "exports"), get, ns), make.oc) else
  if (is.function(rcx)) lapply(rcx(), make.oc) else stop("`",pkg,"' is not an RCloud module")
}
