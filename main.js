// rclient = RClient.create("ws://gis.research.att.com:8081/");

rclient = RClient.create("ws://localhost:8081/", function() {
    rcloud.get_initial_file_list();
});

//////////////////////////////////////////////////////////////////////////////
// plotting

rclient.register_handler("scatterplot", function(data) {
    this.post_div(create_scatterplot(data.value[1], data.value[2], data.value[3].value[0], data.value[3].value[1]));
});

//////////////////////////////////////////////////////////////////////////////
// rcloud environment (file list, etc)

rclient.register_handler("rcloud_status", function(data) {
    var filenames = data.value[2].value;
    var userfiles_float = d3.select("#internals-user-files");
    userfiles_float.append("h3").text("User files");
    userfiles_float.append("ul")
        .selectAll("li")
        .data(filenames)
        .enter()
        .append("li").text(function(i) { return i; });
});

//////////////////////////////////////////////////////////////////////////////

var terminal = $('#term_demo').terminal(function(command, term) {
    if (command !== '') {
        term.clear();
        // $("#output").append($("<div></div>").text(command));
        rclient.post_sent_command(command);
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

function internal_float(container, id)
{
    return container.append("div")
        .attr("class", "internals-float")
        .attr("id", id);
}

function cookie_float(container)
{
    var cookie_div = internal_float(container, "internals-cookie-div");
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

    internal_float(container, "internals-user-files");
}

init_debug_internals();
