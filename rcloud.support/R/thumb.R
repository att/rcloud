rcloud.update.thumb_hash <- function(content, notebook){
  id <- notebook$content$id
  base <- usr.key(usr=".notebook", notebook=id)

  thumbnail_hash <- digest::digest(content)
  rcs.set(rcs.key(base, "thumbnail_hash"), thumbnail_hash)
}


rcloud.set.thumb <- function(id) {
  base <- usr.key(user=".notebook", notebook=id)

  # Image may not exist so encapsulate in try
  try({ 
    thumbnail <- rcloud.get.asset(name = "thumb.png")

    # hash so that we don't get the image 
    # everytime the notebook is saved
    thumbnail_hash <- digest::digest(thumbnail)
    thumbnail_changed <- .cloud.compare.thumb.hash(thumbnail_hash)

    if (thumbnail_changed){
      # update the thumbnail 
      rcs.set(rcs.key(base, "thumb"), thumbnail)
      # update the hash      
      rcs.set(rcs.key(base, "thumbnail_hash"),
        thumbnail_hash)
    }
    
  }, silent = TRUE)
}

rcloud.get.thumb <- function(id) {
  base <- usr.key(user=".notebook", notebook=id)
  rcs.get(rcs.key(base, "thumb"))
}

.rcloud.compare.thumb.hash <- function(thumbnail_hash){
  thumbnail_changed = TRUE
 
  old_hash <- rcs.get(rcs.key(base, "thumbnail_hash")) 
  thumbnail_changed <- thumbnail_hash == old_hash
  thumbnail_changed
}


.resize.image <- function(img_png, out_dims = c(255, 255)){
  # convert to matrix and then resize the image
  image <- png::readPNG(img_png)
  
  in_rows <- nrow(image)
  in_cols <- ncol(image)
  out_rows <- out_dims[1]
  out_cols <- out_dims[2]
  S_R <- in_rows/out_rows
  S_C <- in_cols/out_cols

  if (all(S_R==1) & all(S_C==1)){
    out <- image
  } else {
    # copy of visualTest:::bilinearInterpolation from https://github.com/MangoTheCat/visualTest
    cf <- outer(1:out_rows * 0, 1:out_cols, FUN = "+") * S_C
    rf <- outer(1:out_rows, 1:out_cols * 0, FUN = "+") * S_R
    r <- floor(rf)
    c <- floor(cf)
    r[r < 1] <- 1
    c[c < 1] <- 1
    r[r > in_rows - 1] <- in_rows - 1
    c[c > in_cols - 1] <- in_cols - 1
    delta_R <- rf - r
    delta_C <- cf - c
    in1_ind <- as.vector((c - 1) * in_rows + r)
    in2_ind <- as.vector((c - 1) * in_rows + r + 1)
    in3_ind <- as.vector(c * in_rows + r)
    in4_ind <- as.vector(c * in_rows + r + 1)
    out <- array(0, dim = c(out_rows, out_cols, dim(image)[3]))
    class(out) <- class(image)
    for (idx in 1:dim(image)[3]) {
        chan <- image[, , idx]
        out[, , idx] <- chan[in1_ind] * (1 - delta_R) * (1 - 
            delta_C) + chan[in2_ind] * (delta_R) * (1 - delta_C) + 
            chan[in3_ind] * (1 - delta_R) * (delta_C) + chan[in4_ind] * 
            (delta_R) * (delta_C)
    }
  }

  png::writePNG(out)
}

