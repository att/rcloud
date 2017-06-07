.renderPage <- function(ui) {
  textConn <- textConnection(NULL, "w")
  on.exit(close(textConn))
  shiny:::renderPage(ui, textConn, FALSE)
  gsub('"shared/', '"../../shared.R/', paste(textConnectionValue(textConn), collapse="\n"), fixed=TRUE)
}

rcloud.shinyAppExp <- function(ui, server){
    require(shiny)

    rcloud.shiny.capsExp <- NULL
    path <- system.file("javascript", "rcloud.shinyExp.js", package="rcloud.shinyExp")
    rcloud.shiny.capsExp <- rcloud.install.js.module("rcloud.shinyExp", paste(readLines(path), collapse='\n'))

    if(!is.null(rcloud.shiny.capsExp)) {

      appHandlers <- NULL
      onMessageHandler <- NULL
      onCloseHandler <- NULL

      fakeWebSocket <- function(id) {
        list(
          send = function(msg) {
            rcloud.shiny.capsExp$on_message(id, msg);
          },
          onMessage = function(h) {
            onMessageHandler <<- h
          },
          onClose = function(h) {
            onCloseHandler <<- h
          })
      }

      connect <- function(id) {
        fws <- fakeWebSocket(id)
        appHandlers$ws(fws)
      }

      receive <- function(id, msg) {
        onMessageHandler(FALSE, msg)
      }

      ocaps <- list(
        connect = rcloud.support:::make.oc(connect),
        send = rcloud.support:::make.oc(receive)
      );

      serverFuncSource <- function() {
        server
      }

      rcloud.shiny.capsExp$init(ocaps);
      appHandlers <- shiny:::createAppHandlers(NULL, serverFuncSource)
      list(ok=TRUE)
    }
    else {
      function(...){
        out(.renderPage(ui))
        out("<script type=\"text/javascript\" data-main=\"/lib/js/require-shinyExp.js\" src=\"/lib/js/require.js\"></script>")
      }
    }
}
