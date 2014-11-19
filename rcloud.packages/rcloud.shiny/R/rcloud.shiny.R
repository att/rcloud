.createWebDependency <- function (dependency)
{
     if (is.null(dependency))
         return(NULL)
     if (!inherits(dependency, "html_dependency"))
         stop("Unexpected non-html_dependency type")
     if (is.null(dependency$src$href)) {
         prefix <- paste(dependency$name, "-", dependency$version,
             sep = "")
         addResourcePath(prefix, dependency$src$file)
         modPrefix <- strsplit(dependency$src$file, "www/")[[1]][2]
         dependency$src$href <- modPrefix
     }
     return(dependency)
}

.renderDependencies <- function (dependencies, srcType = c("href", "file"), encodeFunc = urlEncodePath,
     hrefFilter = identity)
{
     html <- c()
     for (dep in dependencies) {
         usableType <- srcType[which(srcType %in% names(dep$src))]
         if (length(usableType) == 0)
             stop("Dependency ", dep$name, " ", dep$version, " does not have a usable source")
         dir <- dep$src[head(usableType, 1)]
         srcpath <- if (usableType == "file") {
             encodeFunc(dir)
         }
         else {
             htmltools:::href_path(dep)
         }
         srcpath <- sub("/$", "\\1", srcpath)
         srcpath <- paste("../../shared.R", srcpath, sep="/")
         if (length(dep$meta) > 0) {
             html <- c(html, paste("<meta name=\"", htmlEscape(names(dep$meta)),
                 "\" content=\"", htmlEscape(dep$meta), "\" />",
                 sep = ""))
         }
         if (length(dep$stylesheet) > 0) {
             html <- c(html, paste("<link href=\"", htmlEscape(hrefFilter(file.path(srcpath,
                 encodeFunc(dep$stylesheet)))), "\" rel=\"stylesheet\" />",
                 sep = ""))
         }
         if (length(dep$script) > 0) {
             html <- c(html, paste("<script src=\"", htmlEscape(hrefFilter(file.path(srcpath,
                 encodeFunc(dep$script)))), "\"></script>", sep = ""))
         }
         if (length(dep$attachment) > 0) {
             if (is.null(names(dep$attachment)))
                 names(dep$attachment) <- as.character(1:length(dep$attachment))
             html <- c(html, sprintf("<link id=\"%s-%s-attachment\" rel=\"attachment\" href=\"%s\"/>",
                 htmlEscape(dep$name), htmlEscape(names(dep$attachment)),
                 htmlEscape(hrefFilter(file.path(srcpath, encodeFunc(dep$attachment))))))
         }
         html <- c(html, gsub('"shared/', '"../../shared.R/shared/', dep$head))
     }
     HTML(paste(html, collapse = "\n"))
}

.shinyRenderPage <- function (ui, connection, showcase = 0)
{
     require(htmltools)
     if (showcase > 0)
         ui <- tagList(tags$head(showcaseHead()), ui)
     result <- renderTags(ui)
     deps <- c(list(htmlDependency("json2", "2014.02.04", c(href = "shared"),
         script = "json2-min.js"), htmlDependency("jquery", "1.11.0",
         c(href = "shared"), script = "jquery.js"), htmlDependency("shiny",
         packageVersion("shiny"), c(href = "shared"), script = "shiny.js",
         stylesheet = "shiny.css")), result$dependencies)
     deps <- resolveDependencies(deps)
     deps <- lapply(deps, .createWebDependency)
     depStr <- paste(sapply(deps, function(dep) {
         sprintf("%s[%s]", dep$name, dep$version)
     }), collapse = ";")
     depHtml <- .renderDependencies(deps, "href")
     writeLines(c("<!DOCTYPE html>", "<html>", "<head>", "  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"/>",
         sprintf("  <script type=\"application/shiny-singletons\">%s</script>",
             paste(result$singletons, collapse = ",")), sprintf("  <script type=\"application/html-dependencies\">%s</script>",
             depStr), depHtml), con = connection)
     writeLines(c(gsub('"shared/', '"../../shared.R/shared/', result$head), "</head>", "<body>", recursive = TRUE),
         con = connection)
     if (showcase > 0) {
         writeLines(as.character(showcaseBody(result$html)), con = connection)
     }
     else {
         writeLines(result$html, con = connection)
     }
     writeLines(c("</body>", "</html>"), con = connection)
}

.renderHtml <- function(ui){
     require(htmltools)
     result <- renderTags(ui)
     deps <- c(list(htmlDependency("json2", "2014.02.04", c(href = "shared"),
         script = "json2-min.js"), htmlDependency("jquery", "1.11.0",
         c(href = "shared"), script = "jquery.js"), htmlDependency("shiny",
         packageVersion("shiny"), c(href = "shared"), script = "shiny.js",
         stylesheet = "shiny.css")), result$dependencies)
     deps <- resolveDependencies(deps)
     deps <- lapply(deps, .createWebDependency)
     depStr <- paste(sapply(deps, function(dep) {
         sprintf("%s[%s]", dep$name, dep$version)
     }), collapse = ";")
     depHtml <- .renderDependencies(deps, "href")
       head <- c("  <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"/>",
           sprintf("  <script type=\"application/shiny-singletons\">%s</script>",
               paste(result$singletons, collapse = ",")), sprintf("  <script type=\"application/html-dependencies\">%s</script>",
               depStr), depHtml, gsub('"shared/', '"../../shared.R/shared/', result$head))
#       head <- gsub('shared/jquery.js', '../disabled.js', head)
       return(list(head = head, body = result$html))
}

.renderPage <- function(ui) {
  textConn <- textConnection(NULL, "w")
  on.exit(close(textConn))
  .shinyRenderPage(ui, textConn, FALSE)
#  gsub('jquery.js', '../disabled.js', gsub('"shared/', '"../../shared.R/', paste(textConnectionValue(textConn), collapse="\n"), fixed=TRUE), fixed=TRUE)
  gsub('shared/jquery.js', '../disabled.js', paste(textConnectionValue(textConn), collapse="\n"), fixed=TRUE)
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
  rcw.result(
    run=function(...) {
       res <- .renderHtml(ui)
       rcw.set("head", res$head)
       rcw.set("body", res$body)
    }
#    ,
#  body = .renderPage(ui)
#  )
}

