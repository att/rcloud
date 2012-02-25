client = RClient.create("ws://localhost:8080/");

$('#term_demo').terminal(function(command, term) {
    if (command !== '') {
        term.clear();
        client.post_sent_command(command);
        interpret_command(command);
    }
}, {
    exit: false,
    greetings: false
});
