rcloud.config.get.notebooks.discover <- function(order = "recently.modified") {
  switch(order,
         recently.modified = rcloud.config.get.recently.modified.notebooks(),
         most.popular = rcloud.config.get.most.popular.notebooks()
         )
}

rcloud.config.get.recently.modified.notebooks <- function() {
  users <- rcloud.get.users()
  keys = unlist(lapply(usr.key(user = users, notebook = "system",
                               "config", "recently-modified", "*"), rcs.list))
  vals <- rcs.get(keys, list=TRUE)
  names(vals) <- gsub(".*/", "", names(vals))
  list(sort='date', values=vals)
}

rcloud.config.set.recently.modified.notebook <- function(id, date) {
  rcs.set(usr.key(user=.session$username, notebook="system", "config", "recently-modified", id), date)
}

middle.key <- function(x) sub('.*/(.*)/.*', '\\1', x)

# i'm sure there's a sharper way to do this
sum.lists <- function(a, b) {
    both <- list(a, b)
    n <- unique(unlist(lapply(both, names)))
    names(n) <- n
    lapply(n, function(ni) {
        x <- if(is.null(a[[ni]])) 0 else as.numeric(a[[ni]])
        y <- if(is.null(b[[ni]])) 0 else as.numeric(b[[ni]])
        x + y
    })
}

rcloud.config.get.most.popular.notebooks <- function() {
  starkeys <- rcs.list(rcs.key(".notebook", '*', "starcount"))
  starvals <- if(length(starkeys) == 0) list() else rcs.get(starkeys, list=TRUE)
  forkeys <- rcs.list(rcs.key(".notebook", '*', "forkcount"))
  forkvals <- if(length(forkeys) == 0) list() else rcs.get(forkeys, list=TRUE)
  names(starvals) <- middle.key(names(starvals))
  names(forkvals) <- middle.key(names(forkvals))
  list(sort='number', values=sum.lists(starvals, forkvals))
}
