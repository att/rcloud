library("websockets");
library("Rserve");

server = create_server(is.binary=TRUE);
rserve.connection <- RSconnect();

# This is almost an exact copy of RSeval, but we don't unserialize the
# result. The unserialization will happen in javascript
RSeval_raw <- function(c, expr) {
  r <- if (is.character(expr)) serialize(parse(text=paste("{",paste(expr,collapse="\n"),"}"))[[1]],NULL) else serialize(expr, NULL)
  writeBin(c(0xf5L, length(r), 0L, 0L), c, endian="little")
  writeBin(r, c)
  b <- readBin(c,"int",4,endian="little")
  if (length(b)<4 || b[1] != 65537L) stop("remote evaluation failed")
  readBin(c,"raw",b[2])
}

connection.established = function(WS) {
  websocket_write("Connection established!", WS)
  websocket_write(R.version.string, WS)
}
set_callback("established", connection.established, server)

connection.received.data = function(DATA, WS, ...) {
  result <- RSeval_raw(rserve.connection, DATA)
  websocket_write(result, WS)
}
set_callback("receive", connection.received.data, server)

while(TRUE)
{
  service(server)
}
