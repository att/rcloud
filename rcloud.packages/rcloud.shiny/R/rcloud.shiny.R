.renderPage <- function(ui) {
  textConn <- textConnection(NULL, "w")
  on.exit(close(textConn))
  shiny:::renderPage(ui, textConn, FALSE)

  replaceScript <- gsub('src="', 'src="../../shared.R/', paste(textConnectionValue(textConn), collapse="\n"), fixed=TRUE)
  replaceLink <- gsub('href="', 'href="../../shared.R/', replaceScript, fixed=TRUE)

  packageVar <- .packages()
  remove <- c('rcloud.web','rcloud.shiny','rcloud.enviewer','rcloud.viewer','githubgist','rediscc','RCurl','bitops','httr','markdown','knitr','png','Rserve','FastRWeb','Cairo','parallel','rjson','base64enc','stats','graphics','grDevices','utils','datasets','methods','base')
  packageVar <- packageVar [! packageVar %in% remove]
  appendVar <- paste(packageVar, collapse = ',')

  jsAppend <- paste('.js&searchPackages=', appendVar, '"', sep="")
  replaceJs <- gsub('.js"', jsAppend, replaceLink, fixed=TRUE)

  cssAppend <- paste('.css&searchPackages=', appendVar, '"', sep="")
  replaceCss <- gsub('.css"', cssAppend, replaceJs, fixed=TRUE)

  jqueryAppend <- paste('shared/jquery.js', '&searchPackages=', appendVar, sep="")
  finalStr <- gsub(jqueryAppend, '../disabled.js', replaceCss, fixed=TRUE)
  finalStr
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

