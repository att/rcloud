(function(global) {
    if (global.WebSocket === undefined) {
        if (global.MozWebSocket)
            global.WebSocket = global.MozWebSocket;
        else {
            throw "WebSocket support not found";
        }
    }
})(this);
