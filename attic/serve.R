library("websockets");

server = create_server()

f = function(WS) {
  websocket_write("Connection established!", WS)
  websocket_write(R.version.string, WS)
}
set_callback("established", f, server)

g = function(DATA, WS, ...) {
  websocket_write(DATA, WS)
  websocket_write("Yes, this came from R.", WS)
}
setCallback("receive", g, server)

while(TRUE)
{
  service(server)
}
