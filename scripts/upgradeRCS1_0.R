#!/usr/bin/Rscript
#
# This script upgrades RCS keys from RCloud 0.9 to 1.0
# In particular it copies all notebook/* to .notebook/*
# and extracts all notebook lists and user configuration
# from <user>/system/config.json
# It skips any notebooks that have already been migrated

# to invoke, run
# ROOT=<rcloud-root-dir> R -f upgradeRCS1_0.R

root <- Sys.getenv("ROOT")
if (!nzchar(root)) {
  if (file.exists("/data/rcloud/conf/rcloud.conf")) {
    root <- "/data/rcloud"
    Sys.setenv(ROOT=root)
  } else stop("ERROR: ROOT not set - please set ROOT first before using")
}
if (!file.exists(file.path(root, "conf", "rcloud.conf")))
  stop("ERROR: ROOT is invalid - it must point to the root of the RCloud installation")

Sys.setenv(RCS_SILENCE_LOADCHECK=1)
require('rcloud.support')
rcloud.support:::configure.rcloud()
rcloud.support:::start.rcloud.anonymously()

rcs.key <- rcloud.support:::rcs.key

id_part <- function(x) gsub("\\.?notebook/([^/]*).*", "\\1", x)

# find out what has already been migrated
get.migrated.notebooks <- function() {
  migrated <- list()
  migrated[unique(id_part(rcs.list(".notebook/*/*")))] <- TRUE
  migrated
}

# migrate notebooks from notebook/ to .notebook/
migrate.notebook.keys <- function(keep) {
  nb_migrate <- function(keys) {
    fk <- Filter(function(k) keep(id_part(k)), keys)
    if(length(fk)) {
      cat("migrating new keys:\n");
      str(fk)
      Map(function(src, dest) {
        val <- rcs.get(src)
        rcs.set(dest, val)
      }, fk, gsub("notebook", ".notebook", fk))
    }
  }
  nb_migrate(rcs.list("notebook/*/*/*"))
  nb_migrate(rcs.list("notebook/*/*"))

  # migrate any new stars (old notebooks, new stars)
  oldstarred <- Filter(function(k) !keep(id_part(k)), rcs.list("notebook/*/stars/*"))
  Map(function(dest) {
    if(is.null(rcs.get(dest))) {
      rcs.set(dest, 1)
      count <- rcs.incr(usr.key(user = ".notebook", notebook = id_part(dest), "starcount"))
      cat("Star notebook", id_part(dest), "to count", count, "\n", sep=' ')
    }
  }, gsub("notebook", ".notebook", oldstarred))
}

# notebook metadata now gets stored globally under .notebook
pull.notebook.metadata <- function(user, entries)
  lapply(names(entries), function(notebook) {
    info <- entries[[notebook]]
    book <- usr.key(user = ".notebook", notebook = notebook)
    date <- rcs.get(rcs.key(book, 'last_commit'))
    if(length(date) == 0 || info$last_commit > date) {
      cat(paste("Writing notebook", notebook, ":",
                "user", user,
                "description", info$description,
                "last_commit", info$last_commit,
                "visibility", info$visibility,
                "\n", sep=' '))
      rcs.set(rcs.key(book, 'username'), user)
      rcs.set(rcs.key(book, 'description'), info$description)
      rcs.set(rcs.key(book, 'last_commit'), info$last_commit)
      if('visibility' %in% names(info))
        rcs.set(rcs.key(book, 'visible'), info$visibility == "public")
    }
  })

# pull notebook lists and user options out of the
# individual user config files
explode.user.configs <- function(keep) {
  configs <- rcs.list("*/system/config.json")
  users <- gsub("/.*", "", configs)
  timestamp <- format(Sys.time(),"%Y-%m-%dT%H:%M:%SZ","GMT");
  currbooks <-
    Map(function(username, key) {
      config <- rjson::fromJSON(rcs.get(key))

      # notebook metadata
      pull.notebook.metadata(username, config$all_books[Filter(keep, names(config$all_books))])
      lapply(names(config$interests),
             function(friend) {
               fi <- config$interests[[friend]]
               pull.notebook.metadata(friend, fi[Filter(keep, names(fi))])
             })

      # options
      opts <- usr.key(user = username, notebook = "system", "config");

      # add any new notebooks created in old RCloud
      newbooks <- Filter(keep, names(config$all_books))
      if(length(newbooks)) {
        lapply(rcs.key(opts, "notebooks", newbooks),
               function(key) rcs.set(key, 1))
      }

      # import ordinary options only once
      if(length(rcs.list(rcs.key(opts, "current", "notebook"))) == 0) {
        rcs.set(rcs.key(opts, "current", "notebook"), config$currbook)
        rcs.set(rcs.key(opts, "current", "version"), config$currversion)
        rcs.set(rcs.key(opts, "config_version"), config$config_version)
        # seed recently-opened list with current notebook and current time
        rcs.set(rcs.key(opts, "recent", config$currbook), timestamp);
      }

      # but keep max notebook number ;-)
      nxt <- rcs.get(rcs.key(opts, "nextwork"))
      if(is.null(nxt) || any(is.na(nxt)) || as.integer(nxt) < config$nextwork) {
        cat("Bump user", username, "notebook # to", config$nextwork, "\n", sep=' ')
        rcs.set(rcs.key(opts, "nextwork"), config$nextwork, counter=TRUE)
      }

      config$currbook
    }, users, configs)
}

rcloud.upgrade.notebook.lists <- function() {
  already <- get.migrated.notebooks()
  keep <- function(id) is.null(already[[id]])
  cat("Already migrated:\n")
  str(names(already))
  migrate.notebook.keys(keep)
  explode.user.configs(keep);

  invisible(TRUE)
}

rcloud.upgrade.notebook.lists()
warnings()
