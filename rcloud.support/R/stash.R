## stashing - serialization of gists and their history into R objects
## stashes are saved in RCS and can be extracted/restored
##
## in non-R storage it is suggested to use base64-encoding of the binary serialization

stash.key <- function(stash, notebook, version, type="gist")
  usr.key(paste(version, type, sep='.'), user=paste0(".stash.", gsub("[-/]","_", stash)), notebook=notebook)

## stash the notebook into RCS such that it can ge used in non-github execution
## environment
## version can be either a version hash, NULL to stash only the last commit
## or "all" to store all versions
## Note: HEAD tag is used at retrieval time to get the version if version=NULL so it
## should be set if you want this stash to be the default version (unless changed
## this will happen for NULL and "all" versions).
rcloud.stash.notebook <- function(stash, id = .session$current.notebook$content$id, version = NULL, tag = if (is.null(version)) "HEAD" else NULL) {
  get.all <- isTRUE(version == "all")
  if (get.all) version <- NULL
  res <- rcloud.get.notebook(id, version)
  if (res$ok) {
    if (get.all) { ## get all history?
      versions <- sapply(res$content$history, function(x) x$version)[-1L]
      for (ver in versions) {
        r <- rcloud.get.notebook(id, ver)
        rcs.set(stash.key(stash, id, ver), r)
      }
    }
    if (is.null(version)) {
      force(tag) ## force tag before we mangle the version
      version <- res$content$history[[1L]]$version
    }
    rcs.set(stash.key(stash, id, version), res)
    if (!is.null(tag))
      rcs.set(stash.key(stash, id, tag, type="tag"), version)
    TRUE
  } else FALSE
}

rcloud.extract.stash <- function(stash) {
  k <- rcs.list(stash.key(stash, "*", "*", type="*"))
  l <- rcs.get(k, TRUE)
  list(content=l, stash=stash, type="stash.extract")
}

rcloud.restore.stash <- function(what) {
  if (what$type != "stash.extract") stop("invalid extract")
  stash <- what$stash
  ## FIXME: we may want to check for malicious content!
  rcs.set(what$content)
  TRUE
}

