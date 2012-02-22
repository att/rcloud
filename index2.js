var socket = new WebSocket("ws://localhost:9999/rtalk");
socket.binaryType = 'arraybuffer';

socket.onmessage = function(msg) {
    if (typeof msg.data === 'string') {
        post_response(msg.data);
    } else {
        post_binary_response(msg.data);
    }
};

socket.onclose = function() {
    post_response("Socket was closed. Goodbye!");
}

function post_sent_command(msg)
{
    var d = $("<pre></pre>").html('> ' + msg);
    $("#output").append(d);
}

function post_binary_response(msg)
{
    var view = new Uint8Array(msg);
    // var x = Array.prototype.join.call(view, ",");
    // post_response(x);

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

function element_from_response(obj)
{
    return obj.html_element();

    // var result = $("<div class='obj'></div>");

    // if (obj.type === 'double_array') {
    //     var div = $("<div class='string-value'></div>");
    //     var v = obj.value;
    //     var s;
    //     if (v.length === 0) {
    //         s = "[]";
    //     } else if (v.length <= 10) {
    //         s = "[" + String(v[0]);
    //         for (var i=1; i<v.length; ++i) {
    //             s = s + ", " + v[i];
    //         }
    //         s = s + "]";
    //     } else {
    //         s = "[" + String(v[0]);
    //         for (var i=1; i<5; ++i) {
    //             s = s + ", " + v[i];
    //         }
    //         s = s + ", ... ";
    //         for (i=v.length-5; i<v.length; ++i)
    //             s = s + ", " + v[i];
    //         s = s + "]";
    //     }
    //     div.html(s);
    //     result.append(div);
    //     return result;
    // } else {
    //     for (var key in obj) {
    //         var pair = $("<div></div>");
    //         result.append(pair);
    //         pair.append($("<div class='key'></div>").html(key+ ": "));
    //         var v = obj[key];
    //         if (typeof v === 'string')
    //             pair.append($("<div class='string-value'></div>").html(v));
    //         else if (v.constructor) {
    //             var n = v.constructor.name;
    //             switch (n) {
    //             case "Float32Array":
    //             case "Float64Array":
    //             case "Int32Array":
    //             case "Int64Array":
    //                 result.append($("<div class='string-value'></div>").html(n + ": " + Array.prototype.join.call(v, ", ")));
    //                 break;
    //             case "Object":
    //                 pair.append(element_from_response(v));
    //                 break;
    //             case "Array":
    //                 for (var i=0; i<v.length; ++i)
    //                     pair.append(element_from_response(v[i]));
    //                 break;
    //             default:
    //                 console.log("Unrecognized object: ", n);
    //             }
    //         } else
    //             console.log("Unrecognized object: ", n);
    //     }
    // }

    // return result;
}

function display_response(result)
{
    $("#output").append(element_from_response(result));
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
        socket.send(command);
    }
}, {
    exit: false,
    greetings: false
});
