var socket = new WebSocket("ws://localhost:8080/");
socket.binaryType = 'arraybuffer';
_debug = false;
_capturing_answers = false;
_capturing_callback = undefined;
_received_handshake = false;

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

function hand_shake(msg)
{
    msg = msg.data;
    // console.log(msg.data);
    // msg = _.map(new Uint8Array(msg.data), function(c) { return String.fromCharCode(c); }).join("");

    if (msg.substr(0,4) !== 'Rsrv') {
        post_error("server is not an RServe instance");
    } else if (msg.substr(4, 4) !== '0103') {
        post_error("sorry, I can only use the 0103 version of the R server protocol");
    } else if (msg.substr(8, 4) !== 'QAP1') {
        post_error("sorry, I only speak QAP1");
    } else {
        _received_handshake = true;
        post_response("Welcome to R-on-the-browser!");
    }
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
        if (!_received_handshake)
            hand_shake(msg);
        else {
            if (typeof msg.data === 'string') {
                post_response(msg.data);
            } else {
                post_binary_response(msg.data);
            }
        }
    }
};

socket.onclose = function() {
    post_response("Socket was closed. Goodbye!");
};

function post_sent_command(msg)
{
    var d = $('<pre class="r-sent-command"></pre>').html('> ' + msg);
    $("#output").append(d);
}

function post_debug_message(msg)
{
    var view = new Uint8Array(msg);
    var x = Array.prototype.join.call(view, ",");
    post_response(x);
}

function post_div(msg)
{
    $("#output").append(msg);
    window.scrollTo(0, document.body.scrollHeight);
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
