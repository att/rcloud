rcloud.get.notebook.cryptgroup <- function(notebookid) { # : list(id, name)
    groupid <- rcs.get(rcs.key('.notebook', notebookid, 'cryptgroup'))
    if (is.null(groupid)) NULL else list(id=groupid, name=rcs.get(rcs.key('.cryptgroup', groupid, 'name')))
}

rcloud.set.notebook.cryptgroup <- function(notebookid, groupid, modify=TRUE) { # or NULL to decrypt/make public
    ulog("rcloud.set.notebook.cryptgroup: ", notebookid, " to ", groupid, " (modify=", modify, ")")
    if(!notebook.is.mine(notebookid))
        stop(paste0("can't set protection group of someone else's notebook for user ", .session$username))
    key <- rcs.key('.notebook', notebookid, 'cryptgroup')
    if(is.null(groupid)) {
        if (modify) {
            nb <- rcloud.get.notebook(notebookid)
            if (!isTRUE(nb$ok))
                stop("cannot retrieve notebook content")
            ## we want to keep only filename and content fields
            l <- lapply(nb$content$files, function(o) if(length(names(o))) o[names(o) %in%
                 c("filename", "content")] else o)
            ## create all assets, but remove the encrypted version
            l[.encryped.content.filename] <- list(NULL)
            tryCatch(isTRUE((res <- rcloud.update.notebook(notebookid, list(files=l)))$ok) ||
                     stop("Gist update error in rcloud.update.notebook on behalf of rcloud.set.notebook.cryptgroup: ", paste(unlist(res$content), collapse=', ')),
                     error=function(e) {
                         ulog("rcloud.update.notebook failed in rcloud.set.notebook.cryptgroup(make public) with: ", paste(as.character(e), collapse=" "))
                         stop(e) })
        }
        rcs.rm(key)
    } else {
        prev <- rcs.get(key)
        rcs.set(key, groupid)
        if (modify) {
            ## this is a neat trick: since the encyption is transparent,
            ## issuing an empty update request *after* setting the group id
            ## will simply re-save the content in encrypted form
            ## And the corresponding fetch will work since it
            ## ignores the RCS setting
            tryCatch(isTRUE((res <- rcloud.update.notebook(notebookid, list(files=list())))$ok) ||
                     stop("Gist update error in rcloud.update.notebook on behalf of rcloud.set.notebook.cryptgroup: ", paste(unlist(res$content), collapse=', ')),
                     error=function(e) {
                         ulog("rcloud.update.notebook failed in rcloud.set.notebook.cryptgroup with: ", paste(as.character(e), collapse=" "))
                         if (is.null(prev)) rcs.rm(key) else rcs.set(key, prev)
                         stop(e) })
        }
    }
    ## Remove notebook from SOLR Caching notebook was successfully assigned a crypto group
    if(is.notebook.encrypted(notebookid)) resp <- rcloud.solr:::.solr.delete.doc(notebookid)
    ## If group change is set back to Public update the solr index
    if(!is.notebook.encrypted(notebookid)) resp <- update.solr(rcloud.get.notebook(notebookid,raw=TRUE),rcloud.notebook.star.count(notebookid))
    invisible(TRUE)
}

is.notebook.encrypted <- function(id)
  sapply(property.multiple.notebooks(id, "cryptgroup"), function(x) !is.null(x))

rcloud.get.cryptgroup.users <- function(groupid) { # : list(user -> is.admin)
  keys <- rcs.list(rcs.key('.cryptgroup', groupid, 'users', '*'))
  if(length(keys)==0) return(list())
  is.admin <- rcs.get(keys, list=TRUE)
  names(is.admin) <- gsub(".*/", "", names(is.admin))
  is.admin
}

rcloud.get.user.cryptgroups <- function(user) { # : list(groupid -> list(groupname, is.admin))
  keys <- rcs.list(rcs.key(user, 'system', 'cryptgroups', '*'))
  if(length(keys)==0) return(list())
  is.admin <- rcs.get(keys, list=TRUE)
  names(is.admin) <- gsub(".*/", "", names(is.admin))
  res <- mapply(list, rcs.get(rcs.key('.cryptgroup',names(is.admin),'name'), list=TRUE), is.admin, SIMPLIFY=FALSE)
  names(res) <- names(is.admin)
  res
}

is.cryptgroup.admin <- function(groupid, user) {
  users <- rcloud.get.cryptgroup.users(groupid)
  if(!.session$username %in% names(users))
    stop(paste0(.session$username, " is not a member of protection group ", groupid))
  users[[.session$username]]
}

.check.cryptgroup.name <- function(groupname) {
  if(nchar(groupname) > 80)
    stop("protection group name must be less than 80 characters")
  if(length(grep('^[[:space:]]*$', groupname))!=0)
    stop("protection group name must not be empty or consist only of spaces")
  keys <- rcs.list(rcs.key('.cryptgroup', '*', 'name'))
  groupnames <- if(length(keys)) rcs.get(keys, list=TRUE) else list()
  if(groupname %in% groupnames)
    stop(paste0("protection group name ", groupname, " already exists"))
}

rcloud.create.cryptgroup <- function(groupname) { # : groupid; current user is admin
  .check.cryptgroup.name(groupname)
  groupid <- generate.uuid()
  if (!isTRUE(session.server.create.group("rcloud", .session$token, groupid)[1L] == "OK"))
      stop("unable to register a new group (possibly your authentication expired?)")
  rcs.set(rcs.key('.cryptgroup', groupid, 'name'), groupname)
  rcs.set(rcs.key('.cryptgroup', groupid, 'users', .session$username), TRUE)
  rcs.set(rcs.key(.session$username, 'system', 'cryptgroups', groupid), TRUE)
  groupid
}

rcloud.set.cryptgroup.name <- function(groupid, groupname) { # must be unique
  .check.cryptgroup.name(groupname)
  if(!is.cryptgroup.admin(groupid, .session$username))
    stop(paste0("user ", .session$username, " is not an admin for group ", groupid))
  rcs.set(rcs.key('.cryptgroup', groupid, 'name'), groupname)
  invisible(groupid)
}

# we might want a combined api for these to minimize roundtrips
rcloud.add.cryptgroup.user <- function(groupid, user, is.admin) {
  if(!is.cryptgroup.admin(groupid, .session$username))
    stop(paste0("user ", .session$username, " is not an admin for group ", groupid))
  is.admin <- rep(as.logical(is.admin), length.out=length(user))
  admins <- user[is.admin]
  members <- user[!is.admin]
  session.server.modify.group("rcloud", .session$token, groupid, new.admins=admins, new.members=members)
  if (length(user) > 1) is.admin <- as.list(is.admin)
  rcs.set(rcs.key('.cryptgroup', groupid, 'users', user), is.admin)
  rcs.set(rcs.key(user, 'system', 'cryptgroups', groupid), is.admin)
  invisible(TRUE)
}

rcloud.remove.cryptgroup.user <- function(groupid, user) {
  if(!is.cryptgroup.admin(groupid, .session$username))
    stop(paste0("user ", .session$username, " is not an admin for group ", groupid))
  myself <- !is.na(match(user, .session$username))
  if (any(myself)) stop("you cannot remove yourself as an admin")
  session.server.modify.group("rcloud", .session$token, groupid, remove=user)
  user <- user[!myself]
  if (length(user)) {
      rcs.rm(rcs.key('.cryptgroup', groupid, 'users', user))
      rcs.rm(rcs.key(user, 'system', 'cryptgroups', groupid))
  }
  invisible(TRUE)
}

rcloud.delete.cryptgroup <- function(groupid) {
  if(!is.cryptgroup.admin(groupid, .session$username))
    stop(paste0("user ", .session$username, " is not an admin for group ", groupid));
  # remove all users from group, current user last (so they're still admin ;)
  users <- rcloud.get.cryptgroup.users(groupid)
  users <- names(users)
  ## the admin cannot remove him/herself
  users <- users[users != .session$username]
  rcloud.remove.cryptgroup.user(groupid, users)
  rcs.rm(rcs.key('.cryptgroup', groupid, 'name'))
  invisible(TRUE)
}

# could be supported other ways, or disabled through another key
rcloud.has.notebook.protection <- function()
  !is.null(rcloud.support:::getConf('session.server')) &&
  is.null(rcloud.support:::getConf('disable.notebook.protection'))
