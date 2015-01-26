# ocapable version of .render.plot
rcloud.render.plot <- function(device.id, page, options) {
  options2 <- c(list(device.id=device.id, page=page), options)
  if('dim' %in% names(options2))
    options2$dim <- unlist(options2$dim)
  do.call(.render.plot, options2)
}

# there should be an extension mechanism here
rcloud.available.render.formats <- function() {
  possible.formats <- c('png', 'svg', 'jpeg', 'tiff', 'pdf')
  capabilities <- Cairo.capabilities()
  Filter(function(f) capabilities[[f]], possible.formats)
}
