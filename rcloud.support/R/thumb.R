rcloud.get.thumb <- function(id) {
  base <- usr.key(user=".notebook", notebook=id)
  rcs.get(rcs.key(base, "thumb"))
}

# thumb_png is a location
rcloud.set.thumb <- function(id, thumb_png){
  base <- usr.key(user=".notebook", notebook=id)
  rcs.set(rcs.key(base, "thumb"), thumb_png)
  resized # return resized version for upload to gitgist
}
