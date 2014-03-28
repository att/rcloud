# This file contains definitions that hide some of the ugly business
# of running an interactive R process behind a non-interactive

file.show <- function(..., header = rep("", nfiles), title = "R Information",
    delete.file = FALSE, pager = getOption("pager"), encoding = "")
{
    files <- path.expand(c(...))
    nfiles <- length(files)
    if (nfiles == 0L)
        return(invisible(NULL))
    result <- list()
    for (i in seq_along(files)) {
      f <- files[i]
      result[[f]] <- paste(readLines(f, warn = FALSE), sep='\n')
      if (delete.file)
        unlink(f)
    }
    result
}
