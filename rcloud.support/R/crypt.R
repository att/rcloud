rcloud.encrypt <- function(x, key=get.user.key(), cipher="AES-256") {
    direct <- TRUE
    if (!is.raw(x)) {
        x <- serialize(x, NULL, FALSE)
        direct <- FALSE
    }
    meta <- list(sha1=raw2hex(PKI.digest(x, "SHA1"),""), cipher=cipher)
    if (!direct) meta$encoding <- "rds"
    x <- PKI.encrypt(x, key, cipher)
    attr(x, "metadata") <- meta
    x
}

rcloud.decrypt <- function(x, key=get.user.key(), cipher=attr(x, "metadata")$cipher) {
    if (!is.character(cipher) || length(cipher) != 1L)
        stop("invalid cipher")
    if (!is.raw(x))
        stop("invalid object to decrypt - must be a raw vector")
    y <- PKI.decrypt(x, key, cipher)
    if (!is.null(attr(x, "metadata")$sha1)) {
        sha1 <- raw2hex(PKI.digest(y, "SHA1"),"")
        if (!isTRUE(attr(x,"metadata")$sha1 == sha1))
            stop("checksum mismatch - probably wrong key or cipher")
    }
    enc <- attr(x, "metadata")$encoding
    if (!is.null(enc) && isTRUE(enc == "rds"))
        y <- unserialize(y)
    y
}
