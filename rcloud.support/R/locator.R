rcloud.locator <- function(device, page) {
  path <- system.file("javascript", "locator.js", package="rcloud.support")
  caps <- rcloud.install.js.module("locator", paste(readLines(path), collapse='\n'))

  caps$locate(device, page)
}

