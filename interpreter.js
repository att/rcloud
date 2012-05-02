var interpreter = {
    'plot': function(cmd) {
        rclient.capture_answers(cmd.ps.length, function(result) {
            rclient.post_div(create_scatterplot.apply(result));
        });
        for (var i=0; i<cmd.ps.length; ++i) {
            rclient.binary_send(cmd.ps[i]);
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
        rclient.binary_send(command);
    }
}
