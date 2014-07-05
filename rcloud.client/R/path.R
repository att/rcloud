resolve.notebook.id <- function(conn, path)
{
  pex <- strsplit(path, "/+")[[1L]]
  et <- "Error fetching content:"
  version <- NULL
  ## is this first part a notebook hash?
  if (grepl("^[0-9a-f]{20}$", pex[1L])) {
    nb.name <- notebook <- pex[1L]
    skip <- 1L
    if (length(pex) > 1L && grepl("^[0-9a-f]{40}$", pex[2L])) {
      version <- pex[2L]
      skip <- 1:2
    }
    extra.path <- pex[-skip]
    if (!length(extra.path)) extra.path <- NULL
  } else { ## user/name designation
    if (length(pex) < 2L) stop("incomplete path - notebook is missing in user/notebook notation")
    user <- pex[1L]
    pex <- pex[-1L]
    nb.name <- paste(pex, collapse="/")
    if (is.null(conn$caps$rcloud$notebook_by_name)) stop("Anonymous users are not allowed to use notebooks by path - try authenticating")
    nb <- RSclient::RS.eval.qap(conn$rserve, as.call(list(conn$caps$rcloud$notebook_by_name, nb.name, user)))
    if (inherits(nb, "try-error")) stop("Error finding notebook: ", nb)
    if (is.null(nb)) stop("Notebook `", nb.name, "' by user `", user, "' not found", if (conn$anonymous) " or not published" else "")
    extra.path <- nb[1L, 2L]
    nb.name <- substr(nb.name, 1, nchar(nb.name) - nchar(extra.path))
    notebook <- nb[1L, 1L]
    if (!nzchar(extra.path)) extra.path <- NULL
  }

  if (!is.null(version))
    list(notebook=notebook, version=version)
  else
    list(notebook=notebook)
}
