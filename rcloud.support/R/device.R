## user-visible constructor for an RCloud graphics device
## it's just a wrapper around Cairo with extra triggers
RCloudDevice <- function(width, height, dpi=100, ..., type='inline') {
    if (missing(width)) width <- .session$WSdev.width
    if (missing(height)) height <- .session$WSdev.height
    ## FIXME: what about retina? currently it's bad mess - we should have more sane units for width/height
    if (is.null(width)) width <- 510
    if (is.null(height)) height <- 510
    ## FIXME: we should have a unified way to register JS that is core, not ad-hoc like this ...
    if (is.null(.session$.locator.cap))
        .session$.locator.cap <- rcloud.install.js.module("rcloud.locator",
                                                          paste(readLines(system.file("javascript", "locator.js", package="rcloud.support")), collapse='\n'))
    dev <- Cairo(width, height, type='raster', bg='white', dpi=dpi, locator=.locator, ...)
    if (is.null(.session$RCloudDevice)) .session$RCloudDevice <- list()
    did <- generate.token()
    .session$RCloudDevice[[dev]] <- list(serial=-1L, page=0L, id=did, pages=list(), dim=c(width, height), dpi=dpi)
    Cairo.onSave(dev, .onSave)
    .rc.oobSend("dev.new", did, type, c(width, height))
    class(dev) <- c("RCloudDevice", class(dev))
    invisible(dev)
}

dev.resize <- function(width=510, height=510, dpi=100, device=RCloudDevice) {
    ## we want to close the previous device so we're not exhausting the device space
    if (!is.null(dev.list())) dev.off()
    device(width=width, height=height, dpi=dpi)
}

## locator
.locator <- function(dev, ...) {
    if (is.null(dinfo <- .session$RCloudDevice[[dev]])) stop("non-existing RCloud device, aborting")
    rcloud.flush.plot()
    res <- .session$.locator.cap$locate(dinfo$id, dinfo$page + 1L)
    if (length(res) == 2L) as.numeric(res) else res
}

## notify client that a plot has been finalized
.onSave <- function(dev, page, cmd="img.url.final") {
    img <- Cairo.capture(dev)
    did <- .session$RCloudDevice[[dev]]$id
    payload <- if (cmd == "img.url.final" && isTRUE(Cairo.serial(dev) == .session$RCloudDevice[[dev]]$serial)) "" else dataURI(writePNG(img), "image/png")
    if (is.na(page)) ## NA = non-existing page, must be one more than the last known one
        page <- .session$RCloudDevice[[dev]]$page + 1L
    else ## last known page - record it
        .session$RCloudDevice[[dev]]$page <- page

    ## FIXME: we get page=0L in some odd situations -- we treat it as 1L (sine
    ## it would break our bookkeeping otherwise), but we should check when that
    ## happens and what it means ...
    if (page < 1L) page <- 1L
    .rc.oobSend(cmd, payload, rev(dim(img)), did, page)
    if (!is.null(payload))
        .session$RCloudDevice[[dev]]$pages[[page]] <- Cairo.snapshot(dev, NA)
    if (dev != dev.cur()) {
        .rc.oobSend("dev.close", did)
        .session$RCloudDevice[[dev]]$serial <- NULL
    } else .session$RCloudDevice[[dev]]$serial <- Cairo.serial()
    TRUE
}

## re-render a specific page
## if dim is not specified, defaults to the device's initial size, same goes for dpi
## type is one of png, jpeg, tiff, pdf, svg or raster - essentially whatever Cairo supports
## in principle we could use any device, it doesn't have to be Cairo ...
## result: NULL if page doesn't exist or list(url=...) with the dataURI
.render.plot <- function(device.id, page, dim = NULL, type='raster', dpi = NULL, ...) {
    if (!length(dev <- which(sapply(.session$RCloudDevice, function(o) identical(o$id, device.id)))))
        stop("device not found")
    d <- .session$RCloudDevice[[dev[1L]]]
    if (page < 1L || page > length(d$pages)) return(NULL)
    if (is.null(dim)) dim <- d$dim
    if (is.null(dpi)) dpi <- d$dpi
    last.dev <- dev.cur()
    file <- if (type=="raster") "" else tempfile("plot", fileext=paste0(".", type))
    dev <- Cairo(dim[1L], dim[2L], type=type, file=file, dpi=dpi, bg='white', ...)
    on.exit({ dev.off(dev); dev.set(last.dev) })
    replayPlot(d$pages[[page]])
    ## special case that behaves just like notebook devices and doesn't use files
    if (type=='raster') {
        img <- Cairo.capture(dev)
        return(list(url=dataURI(writePNG(img), "image/png")))
    }
    dev.off(dev)
    on.exit(dev.set(last.dev))
    mime <- switch(type,
                   png="image/png", jpeg="image/jpeg", tiff="image/tiff",
                   pdf="application/pdf", svg="image/svg+xml",
                   "application/octet-stream")
    sz <- file.info(file)$size
    bin <- readBin(file, raw(), sz)
    unlink(file)
    list(url=dataURI(bin, mime))
}

## this function needs to be called after eval() to check if the device is dirty
rcloud.flush.plot <- function() {
    ## check if the device is dirty such that we need to post an update
    ## FIXME: do we need to check all active Cairo devices?
    if (.Device == "Cairo") {
        dev <- dev.cur()
        sn <- Cairo.serial()
        ## NOTE: if Cairo was used outside of RCloud (and thus this is not aan RCloudDevice) then
        ## RCloudDevice[[dev]] won't have serial so ignore
        if (isTRUE(sn != .session$RCloudDevice[[dev]]$serial)) {
            .session$RCloudDevice[[dev]]$serial <- sn
            .onSave(dev, NA, "img.url.update")
        }
    }
    flush.console()
}
