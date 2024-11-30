rcs.redis <- function(host=NULL, db=getOption("redis.default.db", 0L), password=NULL) {
  require(rediscc)
  if (!is.null(host)) {
    hp <- strsplit(as.character(host), ':', TRUE)[[1]]
    host <- hp[1]
    port <- if (length(hp) < 2L) 6379L else as.integer(hp[2])
  } else {
    host <- "localhost"
    port <- 6379L
  }
  cat("Attempting to connect to redis host: '", host, "', port: '", port, "'\n", sep="");
  structure(list(host=host, port=port, handle=redis.connect(host, port, 3, TRUE, TRUE, db=db, password=password)), class="RCSredis")
}

rcs.close.RCSredis <- function(engine=.session$rcs.engine)
    redis.close(engine$handle)

rcs.get.RCSredis <- function(key, list=FALSE, engine=.session$rcs.engine) redis.get(engine$handle, key, list)

rcs.set.RCSredis <- function(key, value, counter=FALSE, engine=.session$rcs.engine) if (counter) redis.set(engine$handle, key, charToRaw(as.character(value))) else if (missing(value) && is.list(key)) redis.set(engine$handle, names(key), key) else if (length(key) == 1L) redis.set(engine$handle, key, list(value)) else redis.set(engine$handle, key, value)

rcs.rm.RCSredis <- function(key, engine=.session$rcs.engine) redis.rm(engine$handle, key)

rcs.incr.RCSredis <- function(key, engine=.session$rcs.engine) redis.inc(engine$handle, key)

rcs.decr.RCSredis <- function(key, engine=.session$rcs.engine) redis.dec(engine$handle, key, TRUE)

rcs.zero.RCSredis <- function(key, engine=.session$rcs.engine) redis.zero(engine$handle, key)

rcs.list.RCSredis <- function(pattern="*", engine=.session$rcs.engine) redis.keys(engine$handle, pattern)
