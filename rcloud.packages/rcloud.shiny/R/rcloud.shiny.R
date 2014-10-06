.renderPage <- function(ui) {
  textConn <- textConnection(NULL, "w")
  on.exit(close(textConn))
  shiny:::renderPage(ui, textConn, FALSE)
  gsub('"shared/', '"/shared/', paste(textConnectionValue(textConn), collapse="\n"), fixed=TRUE)
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

