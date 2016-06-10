rcloud.get.thumb <- function(id) {
  base <- usr.key(user=".notebook", notebook=id)
  rcs.get(rcs.key(base, "thumb"))
}

# thumb_png is a location
rcloud.set.thumb <- function(id, thumb_png){
  base <- usr.key(user=".notebook", notebook=id)
  thumb_png <- paste0("data:image/png;base64,", thumb_png)
  rcs.set(rcs.key(base, "thumb"), thumb_png)
}
