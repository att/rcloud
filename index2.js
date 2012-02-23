var socket = new WebSocket("ws://localhost:9999/rtalk");
socket.binaryType = 'arraybuffer';
_debug = true;

socket.onmessage = function(msg) {
    if (typeof msg.data === 'string') {
        post_response(msg.data);
    } else {
        post_binary_response(msg.data);
    }
};

socket.onclose = function() {
    post_response("Socket was closed. Goodbye!");
};

function post_sent_command(msg)
{
    var d = $("<pre></pre>").html('> ' + msg);
    $("#output").append(d);
}

function post_binary_response(msg)
{
    var view = new Uint8Array(msg);
    if (_debug) {
        var x = Array.prototype.join.call(view, ",");
        post_response(x);
    }

    var header = new Int32Array(msg, 0, 4);
    if (header[0] !== Rsrv.RESP_OK) {
        var status_code = header[0] >> 24;
        post_error("ERROR FROM R SERVER: " + (Rsrv.status_codes[status_code] || 
                                              status_code)); // not too helpful, but better than undefined
        return;
    }
    
    var payload = my_ArrayBufferView(msg, 16, msg.byteLength - 16);
    var result = parse(buffer_from_msg(payload));

    if (result.type !== "sexp") {
        post_error("Bogus reply from RServe for eval, type not sexp");
        return;
    }
    display_response(result.value);
}

function display_response(result)
{
    $("#output").append(result.html_element());
    window.scrollTo(0, document.body.scrollHeight);
}

function post_error(msg)
{
    var d = $("<div class='error-message'></div>").html(msg);
    $("#output").append(d);
    window.scrollTo(0, document.body.scrollHeight);
}

function post_response(msg)
{
    var d = $("<pre></pre>").html(msg);
    $("#output").append(d);
    window.scrollTo(0, document.body.scrollHeight);
}

$('#term_demo').terminal(function(command, term) {
    if (command !== '') {
        term.clear();
        post_sent_command(command);
        interpret_command(command);
    }
}, {
    exit: false,
    greetings: false
});
