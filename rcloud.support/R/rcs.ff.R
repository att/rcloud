## fallback to flat-files engine

.ffpath <- function(key, engine) file.path(engine$root, key)

.lnapply <- function(X, ...) { l <- lapply(X, ...); names(l) <- X; l }

rcs.get.RCSff <- function(key, list=FALSE, engine=.session$rcs.engine)
   if (list || length(key) != 1L) .lnapply(key, rcs.get.RCSff, FALSE, engine) else (tryCatch(readRDS(.ffpath(key, engine)), error=function(e) NULL, warning=function(w) NULL))

rcs.set.RCSff <- function(key, value, engine=.session$rcs.engine) {
  if (missing(value)) {
    if (!is.list(key) || is.null(names(key))) stop("Missing `value' and `key' is not a named vector")
    for (i in seq.int(length(key))) rcs.set.RCSff(names(key)[i], key[[i]], engine)
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
  tryCatch(file.remove(.ffpath(key, engine)), warning=function(w) FALSE, error=function(e) FALSE)

rcs.incr.RCSff <- function(key, engine=.session$rcs.engine) {
  x <- tryCatch(as.integer(rcs.get(key, engine=engine)), warning=function(w) 0L, error=function(w) 0L)
  if (length(x) != 1L) x <- 0L
  rcs.set(key, x + 1L, engine)
}

rcs.decr.RCSff <- function(key, engine=.session$rcs.engine) {
  x <- tryCatch(as.integer(rcs.get(key, engine=engine)), warning=function(w) 0L, error=function(w) 0L)
  if (length(x) != 1L) x <- 0L
  if (x < 1L) x <- 0L else x <- x - 1L
  rcs.set(key, x, engine)
}

rcs.list.RCSff <- function(pattern="*", engine=.session$rcs.engine) {
  if (is.null(pattern)) pattern <- "*"
  substr(Sys.glob(.ffpath(pattern, engine)), nchar(.ffpath("", engine)) + 1L, 1000)
}
