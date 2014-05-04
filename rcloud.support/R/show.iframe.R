# FIXME rename
show.iframe <- function(url, width=960, height=600)
{
  path <- system.file("javascript", "show_iframe.js", package="rcloud.support");
  caps <- rcloud.install.js.module("show_iframe",
                                   paste(readLines(path), collapse='\n'))
  deferred.rcloud.result(function() caps$handle(url, width, height))
}
