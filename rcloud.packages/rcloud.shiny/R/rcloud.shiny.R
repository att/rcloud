.renderPage <- function(ui) {
  textConn <- textConnection(NULL, "w")
  on.exit(close(textConn))
  shiny:::renderPage(ui, textConn, FALSE)

  shinyHtml <- gsub('"shared/', '"../../shared.R/shiny/shared/', paste(textConnectionValue(textConn), collapse="\n"), fixed=TRUE)

  prefixList <- shiny:::.globals$resources

  if(length(prefixList) > 0){
    patternStr <- lapply(names(prefixList), function(pn) { paste('"', pn, '/', sep='') })
    replacementStr <- lapply(prefixList, function(p) {
        splitDirPath <- strsplit(p$directoryPath, "/+")[[1]]
        paste('"../../shared.R/', splitDirPath[length(splitDirPath)-1], '/', sep="")
    })
    mapply(FUN= function(...) {
         shinyHtml <<- gsub(...,x=shinyHtml)},
         pattern=patternStr, replacement=replacementStr)
  }

  finalHtml <- gsub('shiny/shared/jquery.js', '../../disabled.js', shinyHtml, fixed=TRUE)
  finalHtml
}

rcloud.shinyApp <- function(ui, server, options) {
  require(rcloud.web)
  require(shiny)

  appHandlers <- NULL
  onMessageHandler <- NULL
  onCloseHandler <- NULL

  fakeWebSocket <- function(id) {
    list(
      send = function(msg) {
        rcloud.shiny.caps$on_message(id, msg);
      },
      onMessage = function(h) {
        onMessageHandler <<- h
      },
      onClose = function(h) {
        onCloseHandler <<- h
      })
  }

  connect <- function(id) {
    #rcloud.print("shiny connected")
    fws <- fakeWebSocket(id)
    appHandlers$ws(fws)
  }

  receive <- function(id, msg) {
    #rcloud.print(paste("shiny message ", msg))
    onMessageHandler(FALSE, msg)
  }

  ocaps <- list(
    connect = rcloud.support:::make.oc(connect),
    send = rcloud.support:::make.oc(receive)
  );

  rcloud.shiny.caps$init(ocaps);
  serverFuncSource <- function() {
    server
  }
  appHandlers <- shiny:::createAppHandlers(NULL, serverFuncSource)
  rcw.result(body = .renderPage(ui))
}

