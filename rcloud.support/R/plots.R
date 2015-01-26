# ocapable version of .render.plot
rcloud.render.plot <- function(device.id, page, options)
  do.call(.render.plot, c(list(device.id=device.id, page=page), options))

# there should be an extension mechanism here
rcloud.available.render.formats <- function() {
  possible.formats <- c('png', 'svg', 'jpeg', 'tiff', 'pdf')
  capabilities <- Cairo.capabilities()
  Filter(function(f) capabilities[[f]], possible.formats)
}
