.salted.usr.key <- function(salt, key=get.user.key())
    PKI::PKI.digest(c(charToRaw(salt), as.raw(10), key), "SHA256")

## this is now deprecated, folded into rcloud.encrypt()
.encrypt.by.group <- function(content, groupid, cipher="AES-256")
    rcloud.encrypt(content, group=groupid, cipher=cipher)

## 1) if key is specified it is used (and key.type meta is not set) and group is ignored
## 2) if group is TRUE and the notebook is group-encrypted, that group is used
## 3) if group is TRUE, the notebook is encrypted with the first group that the user
##    is part of. A warning is issued if the user belongs to more than one group
##    and an error if the user doesn't belong to any groups.
## 4) if group is set, it is resolved (checked for existence) both as a) id or b) name
##    A special value group="private" results in salted user-key encryption
##
rcloud.encrypt <- function(x, key, group, cipher="AES-256") {
    meta <- list(cipher=cipher)
    if (missing(key)) {
	if (missing(group) || identical(group, FALSE)) { # neither group nor key -> user key
            key <- get.user.key()
        } else {
            if (length(group) != 1)
                stop("If specified, group must be exactly of length one")
            if (isTRUE(group)) {
                nid <- rcloud.session.notebook.id()
                if (length(nid) || !is.na(nid)) {
                    cg <- rcloud.get.notebook.cryptgroup(nid)
                    if (!is.null(cg$id)) # use notebook's grypt group
                        group <- cg$id
                }
            }
            if (isTRUE(group)) { ## still group=TRUE and no notebook group, use user's groups
                usr <- rcloud.session.info()$user
                ucg <- rcloud.get.user.cryptgroups(usr)
                if (length(ucg) < 1)
                    stop("user `", usr, "' has no crypto groups, cannot encrypt")
                if (length(ucg) > 1)
                    warning("user `", usr, "' has multiple crypto groups, encrypting with `", ucg[[1]][[1]], "'")
                group <- names(ucg)[1]
            }
            if (group != "private") {
                groupid <- rcloud.cryptgroups(group)
                if (any(is.na(groupid)))
                    stop("protection group `", group, "' does not exist")
            } else groupid <- group

            meta$salt <- generate.uuid()
            key <- if (groupid == "private") {
                meta$key.type <- "user-key"
                .salted.usr.key(meta$salt)
            } else {
                meta$group <- groupid
                meta$key.type <- "group-hash"
                key <- session.server.group.hash("rcloud", .session$token, groupid, meta$salt)
                if (!isTRUE(nchar(key) >= 64))
                    stop("unable to use group key - likely access denied")
                .Call(hex2raw, key)
            }
        }
    }
    direct <- TRUE
    if (!is.raw(x)) {
        x <- serialize(x, NULL, FALSE)
        direct <- FALSE
    }
    meta$sha1=raw2hex(PKI.digest(x, "SHA1"),"")
    if (!direct) meta$encoding <- "rds"
    x <- PKI.encrypt(x, key, cipher)

    attr(x, "metadata") <- meta
    x
}

rcloud.decrypt <- function(x, key=get.user.key(), cipher) {
    meta <- attr(x, "metadata")
    if (missing(cipher)) {
        cipher <- meta$cipher
        if (is.null(cipher))
            cipher <- "AES-256"
    }
    if (!is.character(cipher) || length(cipher) != 1L)
        stop("invalid cipher")
    if (!is.raw(x))
        stop("invalid object to decrypt - must be a raw vector")
    if (isTRUE(meta$key.type == "group-hash")) {
        if (is.null(meta$salt) || is.null(meta$group))
            stop("Incomplete encrypted metadata, group-enrcypted content must have salt and group entries")
        key <- session.server.group.hash("rcloud", .session$token, meta$group, meta$salt)
        if (!isTRUE(nchar(key) >= 64))
            stop("unable to access group key for an encrypted content, likely access denied")
        key <- .Call(hex2raw, key)
    } else if (isTRUE(meta$key.type == "user-key")) {
        salt <- as.character(meta$salt)
        if (length(salt) < 1) salt <- ""
        key <- .salted.usr.key(salt[1])
    }
    y <- PKI.decrypt(x, key, cipher)
    if (!is.null(meta$sha1)) {
        sha1 <- raw2hex(PKI.digest(y, "SHA1"),"")
        if (!isTRUE(meta$sha1 == sha1))
            stop("checksum mismatch - probably wrong key or cipher")
    }
    enc <- meta$encoding
    if (!is.null(enc) && isTRUE(enc == "rds"))
        y <- unserialize(y)
    y
}
