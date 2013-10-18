rcs.redis <- function(host=NULL) {
  require(rredis)
  if (!is.null(host)) {
    hp <- strsplit(as.character(host), ':', TRUE)[[1]]
    host <- hp[1]
    port <- if (length(hp) < 2L) 6379L else as.integer(hp[2])
  } else {
    host <- "localhost"
    port <- 6379L
  }
  redisConnect(host, as.numeric(port), timeout=100000000L)
  structure(list(host=host, port=port, handle=rredis:::.redisEnv$current), class="RCSredis")
}

## unfortunately rredis only supports one connection at a time
## we have to swap the handle in and out of its guts so that notebooks can still use rredis
## it would be probably better to just write our own internal rredis package instead to avoid the clash ...
.rdo <- function(expr, engine) {
  e <- rredis:::.redisEnv
  o <- e$current
  on.exit(e$current <- o)
  e$current <- engine$handle
  expr
}

rcs.get.RCSredis <- function(key, list=FALSE, engine=.session$rcs.engine) .rdo(if (list || length(key) != 1L) redisMGet(key) else redisGet(key), engine)

rcs.set.RCSredis <- function(key, value, engine=.session$rcs.engine) .rdo(if (missing(value) && is.list(key)) redisMSet(key) else redisSet(key, value), engine)

rcs.rm.RCSredis <- function(key, engine=.session$rcs.engine) .rdo(redisDelete(key), engine)

rcs.incr.RCSredis <- function(key, engine=.session$rcs.engine) .rdo(redisIncr(key), engine)

rcs.decr.RCSredis <- function(key, engine=.session$rcs.engine) .rdo(redisDecr(key), engine)

rcs.list.RCSredis <- function(pattern="*", engine=.session$rcs.engine) .rdo(redisKeys(if (is.null(pattern)) "*" else pattern), engine)
