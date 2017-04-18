## this is a hack for now - will move to rcloud.support once we see that it works

rcloud.support:::configure.rcloud("startup")

.GlobalEnv$oc.init <- function(...) {
    ## remove myself from the global env since my job is done
    if (identical(.GlobalEnv$oc.init, oc.init)) rm(oc.init, envir=.GlobalEnv)

    Rserve:::ocap(call.script, "call.script")
}

auto.convert.ext <- c(js = "application/javascript", css ="text/css", html = "text/html",
                      png = "image/png", jpg = "image/jpeg", jpeg = "image/jpeg",
                      tiff = "image/tiff", tif = "image/tiff", svg = "image/svg+xml",
                      pdf = "application/pdf"
                      )

ext2mime <- function(fn) {
    fn <- basename(fn)
    type <- "text/plain"
    if (length(grep(".", fn, fixed=TRUE))) {
        nt <- auto.convert.ext[tolower(gsub(".*\\.","",fn))]
        if (!any(is.na(nt))) type <- as.vector(nt)
    }
    type
}

# R's URLdecode is broken - it's neither vectorized nor does it convert + so we have to work around that
URIdecode <- function(o) sapply(o, function(o) URLdecode(gsub("+", " ", o, fixed=TRUE)))

URIparse <- function(o) {
    if (is.raw(o)) o <- rawToChar(o)
    body <- strsplit(o, "&", TRUE)[[1]]
    vals <- gsub("[^=]+=", "", body)
    if (length(vals)) vals <- URIdecode(vals)
    keys <- gsub("=.*$", "", body)
    names(vals) <- keys
    vals    
}

## to simplify the marshalling, we use packed raw vector which has
## NUL-separated strings containing url, query, headers followed
## by binary body. The parsing here is very hacky, it woudl be better
## done in C, in particular since we already have the code in http.c
call.script <- function(packed)
    tryCatch({
        w <- which(packed == as.raw(0L))[1:3]
        url <- rawToChar(packed[1L : (w[1L] - 1L)])
        query <- if (w[2L] > w[1L] + 1L) rawToChar(packed[(w[1L] + 1L):(w[2L] - 1L)]) else character()
        headers <- if (w[3L] > w[2L] + 1L) packed[(w[2L] + 1L):(w[3L] - 1L)] else raw()
        body <- if (w[3L] < length(packed)) packed[(w[3L] + 1L):length(packed)] else NULL
        cat("### request:\n")
        str(list(url, query, body, headers))
        hs <- rawToChar(headers)
        if (length(grep("Content-Type: application/x-www-form-urlencoded", hs, TRUE)))
            body <- URIparse(body)
        if (length(query))
            query <- URIparse(query)
        res <- rcloud.support:::.http.request(url, query, body, headers)
        cat("--- result:\n");
        if ("file" %in% names(res))
            res <- tryCatch(list(rawToChar(readBin(res$file, raw(), file.info(res$file)$size)),
                                 ext2mime(res$file)),
                            error=function(e) paste("cannot open", res$file))
        str(res)
        res
    }, error=function(e) list(paste0("Evaluation error: ", e), "text/plain", character(), 500L))

rcloud.support:::setConf("http.user", NULL)
