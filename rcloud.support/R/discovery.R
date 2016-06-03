rcloud.config.get.recent.notebooks <- function() {
  #users <- rcloud.get.users()
  keys <- rcs.list(usr.key(user=.session$username, notebook="system", "config", "recent", "*"))
  vals <- rcs.get(keys, list=TRUE)
  names(vals) <- gsub(".*/", "", names(vals))
  vals
}

rcloud.config.set.recent.notebook <- function(id, date) {
  rcs.set(usr.key(user=.session$username, notebook="system", "config", "recent", id), date)
}

rcloud.config.clear.recent.notebook <- function(id) {
  #users <- rcloud.get.users()
  rcs.rm(usr.key(user=.session$username, notebook="system", "config", "recent", id))
}
