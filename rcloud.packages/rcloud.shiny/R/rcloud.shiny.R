.renderPage <- function(ui) {
  textConn <- textConnection(NULL, "w")
  on.exit(close(textConn))
  shiny:::renderPage(ui, textConn, FALSE)

  shinyHtml <- gsub('"shared/', '"../../shared.R/shiny/shared/', paste(textConnectionValue(textConn), collapse="\n"), fixed=TRUE)

  prefixList <- shiny:::.globals$resources

  patternStr <- rep(NA, length(prefixList))
  replacementStr <- rep(NA, length(prefixList))

  for(j in 1:length(prefixList)){
      patternVar <- paste('"', names(prefixList[j]), '/', sep="")
      patternStr[j] <- c(patternVar)
      splitDirPath <- strsplit(prefixList[[j]]$directoryPath, "/+")[[1]]
      replacementVar <- paste('"../../shared.R/', splitDirPath[length(splitDirPath)-1], '/', sep="")
      replacementStr[j] <- c(replacementVar)
  }

  shinyHtml <- mapply(gsub, patternStr, replacementStr, shinyHtml)

  finalHtml <- gsub('shared/shiny/jquery.js', '../../disabled.js', shinyHtml, fixed=TRUE)
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

