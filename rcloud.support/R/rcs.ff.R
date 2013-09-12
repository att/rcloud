## fallback to flat-files engine

.ffpath <- function(key, engine) file.path(engine$root, key)

rcs.get.RCSff <- function(key, engine=.session$rcs.engine) (tryCatch(readRDS(.ffpath(key, engine)), error=function(e) NULL, warning=function(w) NULL))

rcs.set.RCSff <- function(key, value, engine=.session$rcs.engine) {
  tmp <- paste0(.ffpath(key, engine), "...tmp")
  dir <- dirname(tmp)
  if (!file.exists(dir)) dir.create(dir, FALSE, TRUE, "0777")
  saveRDS(value, tmp)
  file.rename(tmp, .ffpath(key, engine))
  value
}

rcs.incr.RCSff <- function(key, engine=.session$rcs.engine) {
  x <- tryCatch(as.integer(rcs.get(key, engine)), warning=function(w) 0L)
  if (length(x) != 1L) x <- 0L
  rcs.set(key, x + 1L, engine)
}

rcs.decr.RCSff <- function(key, engine=.session$rcs.engine) {
  x <- tryCatch(as.integer(rcs.get(key, engine)), warning=function(w) 0L)
  if (length(x) != 1L) x <- 0L
  if (x < 1L) x <- 0L else x <- x - 1L
  rcs.set(key, x, engine)
}

rcs.list.RCSff <- function(pattern="*", engine=.session$rcs.engine) {
  if (is.null(pattern)) pattern <- "*"
  substr(Sys.glob(.ffpath(pattern, engine)), nchar(.ffpath("", engine)) + 1L, 1000)
}
