// client = RClient.create("ws://gis.research.att.com:8081/");

client = RClient.create("ws://localhost:8081/");
client.register_handler("scatterplot", function(data) {
    this.post_div(create_scatterplot(data.value[1], data.value[2], data.value[3].value[0], data.value[3].value[1]));
});

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

//////////////////////////////////////////////////////////////////////////////

function cookie_float(container)
{
    var cookie_div = container.append("div").attr("class", "internals-float");
    cookie_div.append("h3").text("Cookie info");
    cookie_div.append("ul")
        .selectAll("li")
        .data(['user', 'sessid'])
        .enter()
        .append("li").text(function (i) { return i + ": " + $.cookies.get(i); });
}

function init_debug_internals()
{
    var container = d3.select("#internals-infocontainer");
    cookie_float(container);
}

init_debug_internals();
