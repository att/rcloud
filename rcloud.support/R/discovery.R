rcloud.discovery.get.notebooks <- function(order = "recently.modified") {
  switch(order,
         recently.modified = rcloud.discovery.get.recently.modified.notebooks(),
         most.popular = rcloud.discovery.get.most.popular.notebooks(),
         none = list(sort='none', values=list())
         )
}

rcloud.discovery.unauthenticated.get.notebooks <- function(order = "recently.modified") {
  notebooks <- rcloud.discovery.get.notebooks(order)
  list(
    sort = notebooks$sort,
    values = rcloud.filter.published(notebooks$values)
  )
}

rcloud.discovery.get.recently.modified.notebooks <- function() {
  keys <- unlist(lapply(usr.key(user = ".allusers", notebook = "system",
                               "config", "recently-modified", "*"), rcs.list))
  if(length(keys) == 0) {
    vals <- list()
  } else {
    vals <- rcs.get(keys, list=TRUE)
    names(vals) <- gsub(".*/", "", names(vals))
  }
  list(sort='date', values=vals)
}

rcloud.discovery.set.recently.modified.notebook <- function(id, date) {
  rcs.set(usr.key(user=".allusers", notebook="system", "config", "recently-modified", id), date)
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

rcloud.discovery.get.most.popular.notebooks <- function() {
  starkeys <- rcs.list(rcs.key(".notebook", '*', "starcount"))
  starvals <- if(length(starkeys) == 0) list() else rcs.get(starkeys, list=TRUE)
  forkeys <- rcs.list(rcs.key(".notebook", '*', "forkcount"))
  forkvals <- if(length(forkeys) == 0) list() else rcs.get(forkeys, list=TRUE)
  names(starvals) <- middle.key(names(starvals))
  names(forkvals) <- middle.key(names(forkvals))
  list(sort='number', values=sum.lists(starvals, forkvals))
}

rcloud.discovery.get.thumb <- function(id) {
  base <- usr.key(user=".notebook", notebook=id)
  rcs.get(rcs.key(base, "thumb"))
}

rcloud.discovery.unauthenticated.get.thumb <- function(id)
  rcloud.fail.if.unpublished(rcloud.discovery.get.thumb)

# thumb_png is a location
rcloud.discovery.set.thumb <- function(id, thumb_png){
  base <- usr.key(user=".notebook", notebook=id)
  thumb_png <- paste0("data:image/png;base64,", thumb_png)
  rcs.set(rcs.key(base, "thumb"), thumb_png)
}
