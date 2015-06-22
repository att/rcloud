rcloud.get.notebook.cryptgroup <- function(notebookid) { # : pair(groupid, groupname)
  groupid <- rcs.get(rcs.key('.notebook', notebookid, 'cryptgroup'))
  list(groupid, rcs.get(rcs.key('.cryptgroup', groupid, 'name')))
}

rcloud.set.notebook.cryptgroup <- function(notebookid, groupid) { # or NULL to decrypt/make public
  if(!notebook.is.mine(notebookid))
    stop(paste0("can't set protection group of someone else's notebook for user ", .session$username))
  key <- rcs.key('.notebook', notebookid, 'cryptgroup')
  if(is.null(groupid))
    rcs.rm(key)
  else {
    if(groupid != "private") {
      users <- rcloud.get.cryptgroup.users(groupid)
      if(!.session$username %in% names(users))
        stop(paste0(.session$username, " is not a member of protection group ", groupid))
    }
    rcs.set(key, groupid)
  }
}

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

rcloud.create.cryptgroup <- function(groupname) { # : groupid; current user is admin
  keys <- rcs.list(rcs.key('.cryptgroup', '*', 'name'))
  groupnames <- if(length(keys)) rcs.get(keys, list=TRUE) else list()
  if(groupname %in% groupnames)
    stop(paste0("protection group name ", groupname, " already exists"))
  groupid <- generate.uuid()
  if (!isTRUE(session.server.create.group("rcloud", .session$token, groupid)[1L] == "OK"))
      stop("unable to register a new group (possibly your authentication expired?)")
  rcs.set(rcs.key('.cryptgroup', groupid, 'name'), groupname)
  rcs.set(rcs.key('.cryptgroup', groupid, 'users', .session$username), TRUE)
  rcs.set(rcs.key(.session$username, 'system', 'cryptgroups', groupid), TRUE)
  groupid
}

rcloud.set.cryptgroup.name <- function(groupid, groupname) { # must be unique
  if(!is.cryptgroup.admin(groupid, .session$username))
    stop(paste0("user ", .session$username, " is not an admin for group ", groupid))
  rcs.set(rcs.key('.cryptgroup', groupid, 'name'), groupname)
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
}

rcloud.remove.cryptgroup.user <- function(groupid, user) {
  if(!is.cryptgroup.admin(groupid, .session$username))
    stop(paste0("user ", .session$username, " is not an admin for group ", groupid))
  myself <- !is.na(match(user, .session$username))
  if (any(myself)) warning("you cannot remove yourself as an admin")
  session.server.modify.group("rcloud", .session$token, groupid, remove=user)
  user <- user[!myself]
  if (length(user)) {
      rcs.rm(rcs.key('.cryptgroup', groupid, 'users', user))
      rcs.rm(rcs.key(user, 'system', 'cryptgroups', groupid))
  }
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
}
