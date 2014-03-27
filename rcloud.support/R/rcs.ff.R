## fallback to flat-files engine

# readRDS unaccountably seems to leave connections open if
# the file does not exist.  this is a temporary workaround
readRDS.if.exists <- function (file, refhook = NULL)
{
    if (is.character(file) && !file.exists(file))
      stop(paste("file", file, "doesn't exist", sep=" "))
    else readRDS(file, refhook);
}

.ffpath <- function(key, engine) file.path(engine$root, key)

.lnapply <- function(X, ...) { l <- lapply(X, ...); names(l) <- X; l }

## rcs_ff_error <- function(rv)
##   function(w) {cat("rcs.ff error: "); print(w); cat("\n"); rv}
## rcs_ff_warning <- function(rv)
##   function(w) {cat("rcs.ff warning: "); print(w); cat("\n"); rv}

rcs_ff_error <- rcs_ff_warning <- function(rv) function(w) rv

rcs.get.RCSff <- function(key, list=FALSE, engine=.session$rcs.engine)
   if (list || length(key) != 1L) .lnapply(key, rcs.get.RCSff, FALSE, engine) else (tryCatch(readRDS.if.exists(.ffpath(key, engine)), warning=rcs_ff_warning(NULL), error=rcs_ff_error(NULL)))

rcs.set.RCSff <- function(key, value, counter=FALSE, engine=.session$rcs.engine) {
  if (counter)
    value <- as.integer(value)
  if (missing(value)) {
    if (!is.list(key) || is.null(names(key))) stop("Missing `value' and `key' is not a named vector")
    for (i in seq.int(length(key))) rcs.set.RCSff(names(key)[i], key[[i]], engine=engine)
    key
  } else {
    tmp <- paste0(.ffpath(key, engine), "...tmp")
    dir <- dirname(tmp)
    if (!file.exists(dir)) dir.create(dir, FALSE, TRUE, "0777")
    saveRDS(value, tmp)
    file.rename(tmp, .ffpath(key, engine))
    value
  }
}

rcs.rm.RCSff <- function(key, engine=.session$rcs.engine)
  tryCatch(file.remove(.ffpath(key, engine)), warning=rcs_ff_warning(FALSE), error=rcs_ff_error(FALSE))

rcs.incr.RCSff <- function(key, engine=.session$rcs.engine) {
  x <- tryCatch(as.integer(rcs.get(key, engine=engine)), warning=rcs_ff_warning(0L), error=rcs_ff_error(0L))
  if (length(x) != 1L) x <- 0L
  rcs.set(key, x + 1L, engine=engine)
}

rcs.decr.RCSff <- function(key, engine=.session$rcs.engine) {
  x <- tryCatch(as.integer(rcs.get(key, engine=engine)), warning=rcs_ff_warning(0L), error=rcs_ff_error(0L))
  if (length(x) != 1L) x <- 0L
  if (x < 1L) x <- 0L else x <- x - 1L
  rcs.set(key, x, engine=engine)
}

rcs.list.RCSff <- function(pattern="*", engine=.session$rcs.engine) {
  if (is.null(pattern)) pattern <- "*"
  files <- Sys.glob(.ffpath(pattern, engine))
  files <- files[!file.info(files)$isdir] ## filter out directories
  substr(files, nchar(.ffpath("", engine)) + 1L, 1000)
}
