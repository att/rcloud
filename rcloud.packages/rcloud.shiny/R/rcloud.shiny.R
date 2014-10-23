.renderPage <- function(ui) {
  textConn <- textConnection(NULL, "w")
  on.exit(close(textConn))
  shiny:::renderPage(ui, textConn, FALSE)
  gsub('jquery.js', '../disabled.js', gsub('"shared/', '"../../shared.R/', paste(textConnectionValue(textConn), collapse="\n"), fixed=TRUE), fixed=TRUE)
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
  
  file_upload = list(
	create = rcloud.support:::make.oc(rcloud.upload.create.file),
	write = rcloud.support:::make.oc(rcloud.upload.write.file),
	close = rcloud.support:::make.oc(rcloud.upload.close.file),
	upload_path = rcloud.support:::make.oc(rcloud.upload.path)
  )  

  rcloud.shiny.caps$init(ocaps);
  
  rcloud.shiny.caps$setup_upload_ocaps(file_upload)
  
  serverFuncSource <- function() {
    server
  }
  appHandlers <- shiny:::createAppHandlers(NULL, serverFuncSource)
  rcw.result(body = .renderPage(ui))
}

