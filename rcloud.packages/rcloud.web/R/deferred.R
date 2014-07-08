## FIXME: we should check the UUID
rcw.resolve <- function(x) (Rserve::resolve.ocap(structure(gsub(".*\\|", "", x), class="OCref")))()
