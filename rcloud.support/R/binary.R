## decode b64 format to raw object possibly with attributes
## we may want to expose this as user API as well
decode.b64 <- function(text) {
   # has header?
   attr <- NULL
   if (length(text) == 1L && length(grep("\n", text, fixed=TRUE)))
       text <- strsplit(text, "\n", TRUE)[[1]]
   if (length(text) && length(grep("^## ", text[1L]))) {
      q <- strsplit(gsub("^##[ \t]+","",text[1L]), "[ \t]*,[ \t]*")[[1]]
      valid <- grep(":", q, TRUE)
      if (length(valid)) {
	 val <- gsub("^[^:]*:[ \t]*", "", q)
	 names(val) <- gsub(":.*", "", q)
	 attr <- lapply(val, type.convert, as.is=TRUE)
      }
   }
   comm <- grep("^#", text)
   if (length(comm)) text <- text[-comm]
   bin <- base64decode(text)
   if (!is.null(attr)) attr(bin, "metadata") <- attr
   bin
}

.b64.to.binary.file <- function(fspec) {
    if (!is.null(fspec$content)) fspec$content <- decode.b64(fspec$content)
    if (!is.null(fspec$filename)) fspec$filename <- gsub("\\.b64$", "", fspec$filename)
    fspec
}

encode.b64 <- function(what, meta=attr(what, "metadata")) {
   mstr <- character(0)
   if (!is.null(meta) && !is.null(names(meta))) {
      .san <- function(x) gsub("%", "%25", gsub(":", "%3a", gsub(",", "%2c", x)))
      l <- unlist(lapply(meta, as.character))
      mstr <- paste0("## ", paste(.san(names(l)), .san(l), sep=":", collapse=", "))
   }
   b64 <- base64encode(what)
   if (length(mstr)) paste0(mstr, "\n", b64) else b64
}

.encryped.content.filename <- "encrypted.notebook.content.bin.b64"

.gist.binary.process.incoming <- function(content) {
    # ulog(".gist.binary.process.incoming: ", paste(capture.output(str(content)),collapse='\n'))
    if (!length(content$files)) return(content)

    ## decrypt encrypted content
    if (.encryped.content.filename %in% names(content$files)) {
        ec <- .b64.to.binary.file(content$files[[.encryped.content.filename]])$content
        meta <- attr(ec, "metadata")
        # ulog(".gist.binary.process.incoming: encrypted content (",paste(names(meta),collapse=","),")")

        ## all the leg-work is in rcloud.decrypt() now, but we do extra sanity checking
        if (is.null(meta$cipher) || is.null(meta$sha1) || is.null(meta$key.type))
            stop("Notebook contains incomplete encrypted content (missing required metadata)")
        if (meta$key.type == "group-hash") {
            enc.content <- rcloud.decrypt(ec)
            content$groupid <- meta$group
        } else if (meta$key.type == "user-key") {
            enc.content <- rcloud.decrypt(ec)
            content$groupid <- "private" ## for compatibility
        } else
            stop("Unsupported encryption type: ", meta$key.type)
        ## we have to keep everything but the files
        content$files <- enc.content$files
        content$is.encrypted <- TRUE
        content$key.type <- meta$key.type
        ## NOTE: we return right here, because encrypted notebooks don't need b64 encoding of the payload
        return(content)
    }

    ## convert any binary contents stored in .b64 files
    fn <- names(content$files)
    bin <- grep("\\.b64$", fn)
    if (length(bin)) {
	nf <- content$files[-bin]
	for (i in bin) {
	   nn <- gsub("\\.b64$", "", fn[i])
	   ## only use binary if there is no text version
	   if (is.null(nf[[nn]])) nf[[nn]] <- .b64.to.binary.file(content$files[[i]])
	}
	content$files <- nf
    }
    content
}

.zlist <- function(names) {
    l <- rep(list(NULL), length(names))
    names(l) <- names
    l
}

## FWIW .salted.usr.key and .encrypt.by.group have moved to crypt.R

## called before issuing a modification request on a gist
## NB: notebook can be NULL if this is a new content in rcloud.create.notebook()
.gist.binary.process.outgoing <- function(notebook, content, autoconvert=TRUE) {
    # ulog(".gist.binary.process.outgoing: ", paste(capture.output(str(content)),collapse='\n'))

    ## convert any binary assets into .b64 files
    if (length(content$files)) {
        # ulog("UPDATE: ",paste(names(content$files),"->",c("MOD","DEL")[1L+as.integer(sapply(content$files, function(o) is.null(o$content)))],"/",c("TXT","BIN")[1L+sapply(content$files, function(o) is.list(o) && is.raw(o$content))], collapse=", "))
        nb <- NULL

        ## is this a direct update of an an encryped notebook? If so, don't do anything
        if (!is.null(content$files[[.encryped.content.filename]]$content)) return(content)

        bin <- sapply(content$files, function(o) is.list(o) && is.raw(o$content))
        if (any(bin) && autoconvert) {
            ## First, see if any of them can be interpreted as plain text
            conv <- sapply(content$files[bin], function(o) checkUTF8(o$content, quiet=TRUE, min.char=7L))
            if (any(conv)) { ## yes? Then convert
                ci <- which(bin)[conv]
                content$files[ci] <- lapply(content$files[ci],
                                            function(o) { o$content <- rawToChar(o$content); Encoding(o$content) <- "UTF-8"; o })
                ## adjust the list of binary
                bin[ci] <- FALSE
            }
        }

        ## still anything binary left after conversion?
        if (any(bin)) {
            if (is.list(notebook))
                notebook <- notebook$content$id
            nb <- if (is.null(notebook)) NULL else rcloud.get.notebook(notebook, raw=TRUE)
            if (!isTRUE(nb$ok)) nb <- NULL
            # ulog(" -- existing: ", paste(names(nb$content$files), collapse=", "))
            bin.f <- content$files[bin]
            txt.f <- content$files[!bin]
            more <- list()
            for (i in seq.int(length(bin.f))) {
                name <- names(bin.f)[i]
                if (!length(grep("\\.b64$", name))) name <- paste0(name, ".b64")
                txt.f[[name]] <- list(content=encode.b64(bin.f[[i]]$content))
                ## let's see if we also have to delete the text version
                if (!is.null(nb$content$files[[txt.name <- gsub(".b64$","",name)]]))
                    more[[txt.name]] <- TRUE
            }
            if (length(more)) txt.f <- c(txt.f, .zlist(names(more)))
            content$files <- txt.f
        }
        ## if there is a request for deletion, we have to check if that actually
        ## requests deletion of the .b64 variant
        if (any(del <- sapply(content$files, function(o) is.null(o$content)))) {
            if (is.list(notebook))
                notebook <- notebook$content$id
            if (is.null(nb)) { ## don't re-fetch it if we already did so above
                nb <- rcloud.get.notebook(notebook, raw=TRUE)
                if (!isTRUE(nb$ok)) nb <- NULL
                # ulog(" -- existing: ", paste(names(nb$content$files), collapse=", "))
            }
            dn <- names(content$files)[del]
            has.txt <- dn %in% names(nb$content$files)
            has.b64 <- paste0(dn, ".b64") %in% names(nb$content$files)
            if (!all(has.txt | has.b64))
                stop("attempt to remove non-existing cell/asset: ", paste(dn[!(has.txt | has.b64)], collapse=", "))
            ## if any of the removed are .b64, we have to re-name the elements accordingly
            if (any(has.b64)) {
                dn[has.b64] <- paste0(dn[has.b64], ".b64")
                names(content$files)[del] <- dn
            }
            ## if there happen to be both versions, remove both, i.e. add deletion of the text ones as well
            if (any(has.b64 & has.txt)) {
                both <- gsub(".b64$", "", dn[has.b64 & has.txt])
                content$files <- c(content$files, .zlist(both))
            }
        }
        # ulog("FINAL: ",paste(names(content$files),"->",c("MOD","DEL")[1L+as.integer(sapply(content$files, function(o) is.null(o$content)))],"/",c("TXT","BIN")[1L+sapply(content$files, function(o) is.list(o) && is.raw(o$content))], collapse=", "))
    }
    content
}
