## proxy.R/<user>/<session>[:<port>]/[<path>]
##
## forwards HTTP request to the server running <session>
## at <port> with the URL http://<session-host>:<port>/<path>
##
## If <port> is missing, it defaults to 8080
##
## Currently, redirects are processed internally, i.e., the
## result will be that of the final request if multiple re-directs
## are involved.
##

## this is a bit annoying, but httr doesn't accept raw headers
## so we have to parse them
parse.headers <- function(o) .Call(rcloud.support:::parse_headers, o)

run <- function(url, query, body, headers) {
    tryCatch({
#   saveRDS(list(url=url, query=query, body=body, headers=headers), file=paste0("/tmp/proxy-",as.numeric(Sys.time()),"-",rnorm(1)))
    p <- strsplit(gsub("^/+","",url), "/", TRUE)[[1]]
    if (length(p) < 3) return(list("Invalid URL", "text/plain", character(), 404L))
    user <- p[2]
    id <- p[3]
    port <- 8080L
    if (grepl(":", id)) {
        port <- gsub(".*:", "", id)
        id <- gsub(":.*", "", id)
    }
    ## FIXME: this is a hack for testing ...
    rcloud.support:::session.init.rcs()
    info <- rcloud.session.info(id, user)
    if (is.null(info))
        return(list("Non-existent session", "text/plain", character(), 404L))
    fwd <- paste(p[-(1:3)], collapse='/')
    url <- paste0("http://", info$host, ":", port, "/", fwd)
    if (isTRUE(any(nzchar(query)))) url <- paste0(url, "?", paste(URIencode(names(query)), "=", URIencode(query), sep='', collapse='&'))
    headers <- parse.headers(headers)

    ## this is awful - if it's a form, it gets parsed and we have to piece it back - we need a way to disable that!
    if (is.character(body) && !is.null(names(body))) body <- charToRaw(paste(names(body), URIencode(body), sep='=', collapse='&'))

    res <- if (!length(body)) httr::GET(url, config=add_headers(headers)) else httr::POST(url, body=body, config=add_headers(headers))
    # saveRDS(list(url=url, query=query, body=body, headers=headers, res=res), file=paste0("/tmp/proxy-res-",as.numeric(Sys.time()),"-",rnorm(1)))
    # paste(capture.output(str(list(url=url, query=query, body=body, headers=headers, res=res))), collapse='\n')

    ## FIXME: we don't pass any headers other than content-type through.
    ## This is intentional as to avoid parsing/deparsing and duplication
    ## and they are not really relevant to the orignal request (since
    ## things like encoding, connection, compression do not reflect the
    ## actual proxy request). That said, we may want to keep an eye out for
    ## any additional headers that may be important for the client side and
    ## thus may need to be passed through.
    ct <- res$headers$`content-type`
    if (is.null(ct)) ct <- 'text/plain'
    list(res$content, ct, character(), res$status_code)
    }, error=function(e) {
        list(paste0("ERROR: ",paste(e$message, collapse="\n"),"\n",
                    paste(capture.output({print(url); str(list(url=url,body=body,headers=headers))}),collapse="\n")),
             "text/plain", 504)
    })
}
