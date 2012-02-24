var interpreter = {
    'plot': function(x, y) {
        post_div(create_scatterplot(x, y));
    }
};

function binary_send(command)
{
    var buffer = new ArrayBuffer(command.length + 21);
    var view = new DataView(buffer);
    view.setInt32(0,  3, _is_little_endian);
    view.setInt32(4,  5 + command.length, _is_little_endian);
    view.setInt32(8,  0, _is_little_endian);
    view.setInt32(12, 0, _is_little_endian);
    view.setInt32(16, 4 + ((1 + command.length) << 8), _is_little_endian);
    for (var i=0; i<command.length; ++i) {
        view.setUint8(20 + i, command.charCodeAt(i));
    }
    view.setUint8(buffer.byteLength - 1, 0);

    if (_debug) {
        post_debug_message(buffer);
    }
    socket.send(buffer);
}

function interpret_command(command)
{
    if (command[0] === '@') {
        var cmd = parser.parse(command);
        capture_answers(cmd.ps.length, function(result) {
            interpreter[cmd.id].apply(interpreter, result);
        });
        for (var i=0; i<cmd.ps.length; ++i) {
            binary_send(cmd.ps[i]);
            // socket.send(cmd.ps[i]);
        }
    } else {
        // socket.send(command);
        binary_send(command);
    }
}

// @plot {{1:10}} {{c(1,2,3)}}
