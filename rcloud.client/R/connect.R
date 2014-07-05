connect.to.rcloud <- function(url, query, body, headers)
{
  cookies <- cookies(headers)
  et <- "Unable to connect"

  # FIXME this will have to be eventually configurable to different hosts.
  c <- RSclient::RS.connect()
  oc.init <- attr(c, "capabilities")
  caps <- RSclient::RS.eval.qap(c, as.call(list(oc.init, c(cookies$token, cookies$execToken))))

  if (!is.list(caps))
    return(list(paste0(et, "<p><!-- error: ", as.character(caps)[1], " -->"), "text/html"))

  anonymous <- FALSE
  init.cap <- caps$rcloud$session_init
  if (is.null(init.cap)) {
    init.cap <- caps$rcloud$anonymous_session_init
    anonymous <- TRUE
  }
  if (is.null(init.cap)) stop("Server refused to provide RCloud session initialization capabilites - access denied")
  
  RSclient::RS.eval.qap(c, as.call(list(init.cap, cookies$user, cookies$token)))
  list(caps=caps, rserve=c, anonymous=anonymous)
}
