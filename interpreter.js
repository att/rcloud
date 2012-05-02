var interpreter = {
    'plot': function(cmd) {
        client.capture_answers(cmd.ps.length, function(result) {
            client.post_div(create_scatterplot.apply(result));
        });
        for (var i=0; i<cmd.ps.length; ++i) {
            client.binary_send(cmd.ps[i]);
        }
    },
    'logout': function(cmd) {
        $.cookies.set('user', null);
        $.cookies.set('sessid', null);
        window.location.href = '/login.html';
    }
};

function interpret_command(command)
{
    if (command[0] === '@') {
        var cmd = parser.parse(command);
        interpreter[cmd.id](cmd);
    } else {
        client.binary_send(command);
    }
}
