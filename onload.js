// given a selection object, returns the contents of the selection as a string.
function ace_selection_text(selection)
{
    var mn, mx;
    if (selection.isBackwards()) {
        mn = selection.selectionLead;
        mx = selection.selectionAnchor;
    } else {
        mn = selection.selectionAnchor;
        mx = selection.selectionLead;
    }
    var result = [selection.doc.$lines[mn.row].substr(mn.column)];
    for (var i=mn.row+1; i<mx.row; ++i) {
        result.push(selection.doc.$lines[i]);
    }
    result.push(selection.doc.$lines[mx.row].substr(0, mx.column));
    return result.join("\n");
}

window.onload = function() {
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/twilight");
    editor.commands.addCommand({
        name: 'sendToR',
        bindKey: {
            win: 'Shift-Return',
            mac: 'Shift-Return',
            sender: 'editor'
        },
        exec: function(editor, args, request) {
            var selection = editor.getSelection();
            var text = ace_selection_text(selection);
            rclient.post_sent_command(text);
            interpret_command(text);
        }
    });
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
