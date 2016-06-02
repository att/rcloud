rcloud.config.get.notebooks.discover <- function(order = "recently.modified") {
  switch(order,
    recently.modified = rcloud.config.get.recently.modified.notebooks()
    )
}

rcloud.config.get.recently.modified.notebooks <- function() {
  users <- rcloud.get.users()
  keys <- rcs.list(usr.key(user=users, notebook="system", "config", "recentlymodified", "*"))
  vals <- rcs.get(keys, list=TRUE)
  names(vals) <- gsub(".*/", "", names(vals))
  vals
}

rcloud.config.set.recently.modified.notebook <- function(id, date) {
  rcs.set(usr.key(user=.session$username, notebook="system", "config", "recentlymodified", id), date)
}
