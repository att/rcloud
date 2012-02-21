var socket = new WebSocket("ws://localhost:7681", "chat");
socket.binaryType = 'arraybuffer';

var n_messages = 0;

socket.onmessage = function(msg) {
    if (n_messages++ < 2) {
        var x = "";
        var view = new Uint8Array(msg.data);
        for (var i =0; i< view.length; ++i)
            x += String.fromCharCode(view[i]);
        post_response(x);
    } else {
        var view = new Uint8Array(msg.data);
        var x = Array.prototype.join.call(view, ",");
        post_response(x);
    }
};

function post_sent_command(msg)
{
    var d = $("<pre></pre>").html('> ' + msg);
    $("#output").append(d);
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
        socket.send(command);
    }
});
