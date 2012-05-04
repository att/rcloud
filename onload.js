window.onload = function() {
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
};

//////////////////////////////////////////////////////////////////////////////

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
