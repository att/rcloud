# there doesn't seem to be a lower-level way to customize View?


View <- function (x, title)
{
  # borrow pre-processing from base R, replace the final command
  if (missing(title))
    title <- paste("Data:", deparse(substitute(x))[1])
  as.num.or.char <- function(x) {
    if (is.character(x))
      x
    else if (is.numeric(x)) {
      storage.mode(x) <- "double"
      x
    }
    else as.character(x)
  }
  x0 <- as.data.frame(x)
  x <- lapply(x0, as.num.or.char)
  rn <- row.names(x0)
  if (any(rn != seq_along(rn)))
    x <- c(list(row.names = rn), x)
  if (!is.list(x) || !length(x) || !all(sapply(x, is.atomic)) ||
      !max(sapply(x, length)))
    stop("invalid 'x' argument")
  x <- as.data.frame(x)
  if(nrow(x) > 1000)
    x <- x[1:1000,]

  # R calls invisible(.External2(C_dataviewer, x, title)) here
  invisible(rcloud.viewer.caps$view(x, title))
}

