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

# notebook metadata now gets stored globally under .notebook
pull.notebook.metadata <- function(user, entries)
  lapply(names(entries), function(notebook) {
    book <- usr.key(user = ".notebook", notebook = notebook);
    rcs.set(rcs.key(book, 'username'), user);
    rcs.set(rcs.key(book, 'description'), entries[notebook]$description);
    rcs.set(rcs.key(book, 'last_commit'), entries[notebook]$last_commit);
    if('visibility' %in% names(entries[notebook]))
      rcs.set(rcs.key(book, 'visibility'), entries[notebook]$visibility);
  })

# pull notebook lists and user options out of the
# individual user config files
explode.user.configs <- function() {
  configs <- rcs.list("*/system/config.json")
  users <- gsub("/.*", "", configs)
  timestamp <- format(Sys.time(),"%Y-%m-%dT%H:%M:%SZ","GMT");
  currbooks <-
    Map(users, configs, function(username, key) {
      config <- rjson::fromJSON(rcs.get(key))
      
      pull.notebook.metadata(username, config$all_books)
      lapply(names(config$interests),
             function(friend) pull.notebook.metadata(friend, config$interests[[friend]]))

      #options
      opts <- usr.key(user = username, notebook = "system", "config");

      rcs.set(rcs.key(opts, "current", "notebook"), config$currbook)
      rcs.set(rcs.key(opts, "current", "version"), config$currversion)
      rcs.set(rcs.key(opts, "nextwork"), config$nextwork)
      rcs.set(rcs.key(opts, "config_version"), config$config_version)

      # seed recently-opened list with current notebook and current time
      rcs.set(rcs.key(opts, "recent", currbooks[[username]]), timestamp);

      # remove config.json
      rcs.rm(key)
    })
}



rcloud.migrate.notebook.lists <- function() {
  rename.notebook.keys()
  explode.user.configs();
  
  invisible(TRUE)
}
