# Functions here should be exposed in runtime to users of RCloud
#
# FIXME: we currently seem to expose all of rcloud.support. That
# is a terrible idea on the face of it, both because of documentation
# (how is the user to know which functions they're expected to call
# and which they aren't?)
#
################################################################################

rcloud.get.notebook.asset <- function(asset.name, notebook = NULL, version = NULL)
{
  if (is.null(notebook)) {
    notebook <- .session$current.notebook
  } else {
    notebook <- rcloud.get.notebook(notebook, version)
  }
  file <- notebook$content$files[[asset.name]]
  if (is.null(file)) {
    stop(paste("asset", asset.name, "doesn't exist"))

  }
  file$content
}
