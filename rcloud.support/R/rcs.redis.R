rcs.redis <- function(host=NULL) {
  require(rediscc)
  if (!is.null(host)) {
    hp <- strsplit(as.character(host), ':', TRUE)[[1]]
    host <- hp[1]
    port <- if (length(hp) < 2L) 6379L else as.integer(hp[2])
  } else {
    host <- "localhost"
    port <- 6379L
  }
  structure(list(host=host, port=port, handle=redis.connect(host, port, 3, TRUE)), class="RCSredis")
}

rcs.get.RCSredis <- function(key, list=FALSE, engine=.session$rcs.engine) redis.get(engine$handle, key, list)

rcs.set.RCSredis <- function(key, value, engine=.session$rcs.engine) if (missing(value) && is.list(key)) redis.set(engine$handle, names(key), key) else redis.set(engine$handle, key, value)

rcs.rm.RCSredis <- function(key, engine=.session$rcs.engine) redis.rm(engine$handle, key)

rcs.incr.RCSredis <- function(key, engine=.session$rcs.engine) stop("unimplemented")

rcs.decr.RCSredis <- function(key, engine=.session$rcs.engine) stop("unimplemented")

rcs.list.RCSredis <- function(pattern="*", engine=.session$rcs.engine) redis.keys(engine$handle, pattern)
