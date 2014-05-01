# Functions defined or referenced here are to be considered as public
# API for RCloud notebooks. Any other functions are *NOT*.
#
# FIXME: we currently seem to expose all of rcloud.support. That
# is a terrible idea on the face of it, both because of documentation
# (how is the user to know which functions they're expected to call
# and which they aren't?) and security (are we sure all calls are safe?)
#
################################################################################

################################################################################
# functions that are part of the API in other files:
#
# assets.R
# - rcloud.get.asset
# - rcloud.execute.asset
# conf.R
# - rcloud.config
# javascript.R
# - rcloud.install.js.module
# - rcloud.install.css
# - rcloud.clear.css
# lux.plot.R
# - wgeoplot
# - wtour
# module.pkg.R
# - rcloud.load.module.package
# output.R
# - rcloud.out
# password.R
# - password
# rcloud.support.R
# - rcloud.get.conf.value
# - rcloud.call.notebook
# - rcloud.unauthenticated.call.notebook
# setup.R
# - rcloud.version
# - rcloud.info
# show.iframe.R
# - show.iframe
# tools.R
# - rcloud.get.notebook.file
# upload.R
# - rcloud.upload.path
# wdcplot.R
# - wdcplot
# wplot.R
# - wplot
# - select
#
################################################################################
# Returns an asset from the notebook (simply one of the files in the
# gist) This is useful for getting to files that have been uploaded to
# the notebook without needing to go through the GitHub URL.
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

# This adjusts the warning level
# for the current RCloud session, and is not reset after each
# evaluation (which happens, say, with `options(warn=-1)`). To disable warnings, call
# `rcloud.disable.warnings()` or `rcloud.disable.warnings(TRUE)`. To re-enable them,
# call `rcloud.enable.warnings()`
rcloud.disable.warnings <- function()
{
  .session$disable.warnings <- TRUE
}

rcloud.enable.warnings <- function()
{
  .session$disable.warnings <- NULL
}

rcloud.disable.echo <- function()
{
  .session$disable.echo <- TRUE
}

rcloud.enable.echo <- function()
{
  .session$disable.echo <- NULL
}

rcloud.set.url <- function(url)
{
  .session$url <- url
}

rcloud.get.url <- function(url)
{
  .session$url
}
