# there doesn't seem to be a lower-level way to customize View?

ENVIEWER_PAGE_SIZE <- 20

defaultEnviewerDTOptions <- function() {
  options <- list()
  options$paging <- TRUE
  options$pagingType <- "full"
  options$lengthChange <- FALSE
  options$searching <- FALSE
  options$info <- FALSE
  options$ordering <- FALSE
  options$pageLength <- ENVIEWER_PAGE_SIZE
  invisible(options)
}

View <- function (x, title, expr)
{
  # borrow pre-processing from base R, replace the final command
  
  if(!missing(expr)) {
    varName <- expr
  } else {
    varName <- deparse(substitute(x))[1]
  }
  if (missing(title))
    title <- paste("Data:", varName)
  
  if(!requireNamespace("DT", quietly = TRUE)) {
    x <- paste0('<div class="error-message"><span>DT package is not installed, dataframe viewer functionality is not available</span></div>')
  } else if(!requireNamespace("rcloud.htmlwidgets", quietly = TRUE)) {
    x <- paste0('<div class="error-message"><span>rcloud.htmlwidgets package is not installed, dataframe viewer functionality is not available</span></div>')
  } else {
    require(rcloud.htmlwidgets)
    require(DT)
    x <- renderDataFrame(varName, x, title)
  }
  # R calls invisible(.External2(C_dataviewer, x, title)) here
  invisible(rcloud.viewer.caps$view(x, title))
}

#'
#' @param name data.frame variable name
#' @param options dataTables request parameters
#' @return datatables JS result object (see datatables documentation)
rcloud.viewer.view.dataframe.page <- function(name, options) {
  val <- get(name, .GlobalEnv)
  
  result <- list(draw = options$draw)
  
  if(is.data.frame(val)) {
    records <- nrow(val)
    result$recordsTotal <- records
    result$recordsFiltered <- records 
    page <- seq(options$start,min(options$start+options$length, records))
    data <- tryCatch(jsonlite::toJSON(cbind(as.integer(rownames(val)[page]),val[page,]), dataframe = "values"))
    if(typeof(data) == "try-error") {
      result$error <- paste0("Could not marshal data.frame data. Error: ", as.character(data))
    } else {
      result$data <- data
    }
    return(result)
  } else {
    result$error <- paste0("Unsupported variable type: ", typeof(val))
  }
  return(result)
}

#' Returns HTML representation of given variable
#' If varValue is a data.frame it renders DT widget which delegates paging to the server.
#' If the varValue is of other type than data.frame, it is converted to data.frame and rendereed as 'static' DT (i.e. all variable data is sent to client) 
#' 
renderDataFrame <- function(varName, varValue, title) {
  if(is.data.frame(varValue)) {
    if(nrow(varValue) > 0 && ncol(varValue) > 0) {
      options <- defaultEnviewerDTOptions()
      options$serverSide <- TRUE
      options$paging <- (nrow(varValue) > ENVIEWER_PAGE_SIZE)
      # htmlwidget is displayed in an iframe, but data.frame paging OCAP is available on the parent page. 
      options$ajax <- JS(paste0('function(data, callback, settings) {
    if(window.parent && window.parent.RCloud && window.parent.RCloud.UI && window.parent.RCloud.UI.viewer) {
        window.parent.RCloud.UI.viewer.dataFrameCallback("', varName, '", data, callback, settings);
    }
    }'))
      data <- data.frame(matrix(ncol = ncol(varValue), nrow = 0))
      names(data) <- names(varValue)
      x <- as.character(DT::datatable(data, caption = title, options = options, style = 'default', width = "100%"))
    } else {
      x <- paste0('<div><span>Data frame "', varName, '" is empty.</span></div>')
    }
  } else {
    as.num.or.char <- function(x) {
      if (is.character(x))
        x
      else if (is.numeric(x)) {
        storage.mode(x) <- "double"
        x
      }
      else as.character(x)
    }
    x0 <- as.data.frame(varValue)
    x <- lapply(x0, as.num.or.char)
    rn <- row.names(x0)
    if (any(rn != seq_along(rn)))
      x <- c(list(row.names = rn), x)
    if (!is.list(x) || !length(x) || !all(sapply(x, is.atomic)) ||
        !max(sapply(x, length)))
      stop("invalid 'varValue' argument")
    x <- as.data.frame(x)
    options <- defaultEnviewerDTOptions()
    options$paging <- (nrow(x) > ENVIEWER_PAGE_SIZE)
    x <- as.character(datatable(x, caption = title, options = options, style = 'default', width = 400))
  }
  invisible(x)
}