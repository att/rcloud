
function shell_tab()
{
    terminal.enable();
}

function editor_tab()
{
    terminal.disable();
}

function internals_tab()
{
    terminal.disable();
}

function main_init() {
    rclient = RClient.create("ws://localhost:8081/", function() {
        rcloud.init_client_side_data();
        rclient.register_handler("scatterplot", function(data) {
            this.post_div(create_scatterplot(data.value[1], data.value[2], data.value[3].value[0], data.value[3].value[1]));
        });
    editor.init();

    // tabs navigation
    var map = {
        0: shell_tab,
        1: editor_tab,
        2: internals_tab
    };
    $("#tabs").tabs({
        select: function(event, ui) {
            if (map[ui.index] === undefined)
                throw "bad select??";
            map[ui.index]();
        }
    });
    $("#tabs").tabs("select", "#tabs-1");
    });
}

window.onload = main_init;
