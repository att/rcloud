client = RClient.create("ws://localhost:8080/");

var terminal = $('#term_demo').terminal(function(command, term) {
    if (command !== '') {
        term.clear();
        // $("#output").append($("<div></div>").text(command));
        client.post_sent_command(command);
        interpret_command(command);
    }
}, {
    exit: false,
    greetings: false
});

// hacky workaround, but whatever.
$('#output').click(function(x) {
    terminal.disable();
});
