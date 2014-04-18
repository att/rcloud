#function to request a password popup

# FIXME rename
password <- function(prompt)
{
  path <- system.file("javascript", "password.js", package="rcloud.support");
  caps <- rcloud.install.js.module("password",
                                   paste(readLines(path), collapse='\n'))
  caps$prompt(prompt)
}
