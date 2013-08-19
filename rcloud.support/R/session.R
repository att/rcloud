.session <- new.env(parent=emptyenv())

################################################################################
## evaluation of R code

# If the results of the function are desired, use session.eval
session.eval <- function(x, silent) {
  val <- try(x, silent=TRUE)
  if (!inherits(val, "try-error") && !silent && rcloud.debug.level()) print(val)
  list("eval", val)
}

# If evaluation is desired only for the output, use markdown.eval.
session.markdown.eval <- function(x, silent) {
  val <- try(x, silent=TRUE)
  if (!inherits(val, "try-error") && !silent && rcloud.debug.level()) print(val)
  list("markdown.eval", val)
}

## FIXME: won't work, global file!
session.log <- function(user, v) {
  vs <- strsplit(v, "\n")
  for (i in 1:length(vs[[1]])) {
    cat(paste(paste(Sys.time(), user, vs[[1]][i], sep="|"),"\n"),
        file=pathConf("data.root", "history", "main_log.txt"), append=TRUE)
  }
}

## WS init
session.init <- function(...) {
  set.seed(Sys.getpid()) # we want different seeds so we get different file names
  .GlobalEnv$tmpfile <- paste('tmp-',paste(sprintf('%x',as.integer(runif(4)*65536)),collapse=''),'.tmp',sep='')
  start.rcloud(...)
  paste(R.version.string, " --- welcome, ", .session$username, sep='')
}
