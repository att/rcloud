var socket = new WebSocket("ws://localhost:8080/");
socket.binaryType = 'arraybuffer';
_debug = false;
_capturing_answers = false;
_capturing_callback = undefined;

function capture_answers(how_many, callback)
{
    if (_capturing_answers) {
        throw "Still waiting for previous answers...";
    }
    _capturing_answers = true;
    var result = [];
    function blip(msg) {
        result.push(parse(msg));
        how_many--;
        if (how_many === 0) {
            _capturing_answers = false;
            _capturing_callback = undefined;
            callback(result);
        }
    }
    _capturing_callback = blip;
}

socket.onmessage = function(msg) {
    if (_capturing_answers) {
        try {
            _capturing_callback(msg.data);
        } catch (e) {
            _capturing_answers = false;
            _capturing_callback = undefined;
            throw e;
        }
    } else {
        if (typeof msg.data === 'string') {
            post_response(msg.data);
        } else {
            post_binary_response(msg.data);
        }
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

function post_debug_message(msg)
{
    var view = new Uint8Array(msg);
    var x = Array.prototype.join.call(view, ",");
    post_response(x);
}

function post_binary_response(msg)
{
    if (_debug) {
        post_debug_message(msg);
    }

    try {
        display_response(parse(msg));
    } catch (e) {
        post_error("Uncaught exception: " + e);
    }
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
