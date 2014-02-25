# migrate notebooks from notebook/ to .notebook/
rename.notebook.keys <- function() {
  nb_rename <- function(keys) Map(function(src, dest) {
    val <- rcs.get(src)
    rcs.set(dest, val)
    rcloud.support:::rcs.rm(src)
  }, keys, gsub("notebook", ".notebook", keys))
  nb_rename(rcs.list("notebook/*/*/*"))
  rcs.rm(rcs.list("notebook/*/stars"))
  nb_rename(rcs.list("notebook/*/*"))
  rcs.rm(rcs.list("notebook/*"))
  rcs.rm(rcs.list("notebook"))
}

# pull all the settings and notebook lists out of the
# individual user config files
explode.user.configs <- function() {
  configs <- rcs.list("*/system/config.json")
}

rcloud.migrate.notebook.lists <- function() {
  rename.notebook.keys()
  explode.user.configs();
  
  invisible(TRUE)
}
