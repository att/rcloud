rcloud.upload.create.file <- function(filename)
{
  stop("Unimplemented!");
}

rcloud.upload.write.file <- function(bytes)
{
  stop("Unimplemented!");
}

rcloud.upload.close.file <- function()
{
  stop("Unimplemented!");
}

# FIXME we need a better place for this.
rcloud.upload.path <- function() Sys.getenv("HOME")
