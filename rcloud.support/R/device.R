## user-visible constructor for an RCloud graphics device
## it's just a wrapper around Cairo with extra triggers
RCloudDevice <- function(width, height, ..., type='inline') {
    if (missing(width)) width <- .session$WSdev.width
    if (missing(height)) height <- .session$WSdev.height
    ## FIXME: what about retina?
    if (is.null(width)) width <- 510
    if (is.null(height)) height <- 510
    dev <- Cairo(width, height, type='raster', bg='white', ...)
    if (is.null(.session$RCloudDevice.serial)) .session$RCloudDevice.serial <- list()
    .session$RCloudDevice.serial[[dev]] <- -1L
    .session$RCloudDevice.page[[dev]] <- 0L
    did <- .session$RCloudDevice.id[[dev]] <- generate.token()
    Cairo.onSave(dev, .onSave)
    self.oobSend(list("dev.new", did, type, c(width, height)))
    class(dev) <- c("RCloudDevice", class(dev))
    invisible(dev)
}

## notify client that a plot has been finalized
.onSave <- function(dev, page, cmd="img.url.final") {
    img <- Cairo.capture(dev)
    did <- .session$RCloudDevice.id[[dev]]
    payload <- if (cmd == "img.url.final" && isTRUE(Cairo.serial(dev) == .session$RCloudDevice.serial[[dev]])) "" else dataURI(writePNG(img), "image/png")
    if (is.na(page)) ## NA = non-existing page, must be one more than the last known one
        page <- .session$RCloudDevice.page[[dev]] + 1L
    else ## last known page - record it
        .session$RCloudDevice.page[[dev]] <- page
    self.oobSend(list(cmd, payload, dim(img), did, page))
    if (dev != dev.cur()) {
        self.oobSend(list("dev.close", did))
        .session$RCloudDevice.serial[[dev]] <- NULL
    } else .session$RCloudDevice.serial[[dev]] <- Cairo.serial()
    TRUE
}


## this function needs to be called after eval() to check if the device is dirty
.post.eval <- function() {
    ## check if the device is dirty such that we need to post an update
    ## FIXME: do we need to check all active Cairo devices?
    if (.Device == "Cairo") {
        dev <- dev.cur()
        sn <- Cairo.serial()
        if (sn != .session$RCloudDevice.serial[[dev]]) {
            .session$RCloudDevice.serial[[dev]] <- sn
            .onSave(dev, NA, "img.url.update")
        }
    }
}

