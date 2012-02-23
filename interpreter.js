var interpreter = {
    'plot': function(x, y) {
        
    }
}

function interpret_command(command)
{
    if (command[0] === '@') {
        var cmd = parser.parse(command);
        
    } else {
        socket.send(command);
    }
}

// @plot {{1:10}} {{c(1,2,3)}}
