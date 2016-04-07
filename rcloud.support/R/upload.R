# FIXME Add support for multiple file upload

.rcloud.upload.state <- new.env()

rcloud.upload.create.file <- function(filename, force=FALSE)
{
  if (!is.null(.rcloud.upload.state$file) && isOpen(.rcloud.upload.state$file))
    rcloud.upload.close.file()
  if (file.exists(filename) && !force)
    stop("rcloud.upload: file already exists")
  .rcloud.upload.state$file <- file(filename, "wb")
  if (!isOpen(.rcloud.upload.state$file))
    stop("rcloud.upload: could not open file for writing")
  TRUE
}

rcloud.upload.write.file <- function(bytes)
{
  if (is.null(.rcloud.upload.state$file) || !isOpen(.rcloud.upload.state$file))
    stop("rcloud.upload: must create file first")
  writeBin(bytes, .rcloud.upload.state$file)
}

rcloud.upload.close.file <- function()
{
  if (is.null(.rcloud.upload.state$file) || !isOpen(.rcloud.upload.state$file))
    stop("rcloud.upload: must create file first")
  close(.rcloud.upload.state$file)
  .rcloud.upload.state$file <- NULL
}

rcloud.upload.path <- function(...) file.path(rcloud.home(), ...)
