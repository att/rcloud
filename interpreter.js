var interpreter = {
    'plot': function(x, y) {
    }
};

function interpret_command(command)
{
    if (command[0] === '@') {
        var cmd = parser.parse(command);
        capture_answers(cmd.ps.length, function(result) {
            console.log(result);
        });
        for (var i=0; i<cmd.ps.length; ++i) {
            socket.send(cmd.ps[i]);
        }
    } else {
        socket.send(command);
    }
}

// @plot {{1:10}} {{c(1,2,3)}}
