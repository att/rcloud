var interpreter = {
    'plot': function(x, y) {
        client.post_div(create_scatterplot(x, y));
    },
    'logout': function(x, y) {
        
    }
};

function interpret_command(command)
{
    if (command[0] === '@') {
        var cmd = parser.parse(command);
        client.capture_answers(cmd.ps.length, function(result) {
            interpreter[cmd.id].apply(interpreter, result);
        });
        for (var i=0; i<cmd.ps.length; ++i) {
            client.binary_send(cmd.ps[i]);
        }
    } else {
        client.binary_send(command);
    }
}
