RCloud.UI.notebook_title = {
    last_editable_: null,
    set: function (text) {
        var is_read_only = shell.notebook.model.read_only();
        $("#notebook-title")
            .text(text)
            .data('restore_edit', text);
        var ellipt_start = false, ellipt_end = false;
        while(window.innerWidth - $("#notebook-title").width() < 505) {
            var slash = text.search('/');
            if(slash >= 0) {
                ellipt_start = true;
                text = text.slice(slash+1);
            }
            else {
                ellipt_end = true;
                text = text.substr(0, text.length - 2);
            }
            $("#notebook-title").text((ellipt_start ? '.../' : '')
                                      + text +
                                      (ellipt_end ? '...' : ''));
        }
        var title = $('#notebook-title');
        ui_utils.make_editable(title, !is_read_only, function(text) {
            if(editor.rename_notebook(shell.gistname(), text)) {
                $("#notebook-title")
                    .text(text)
                    .data('restore_edit', text);
                return true;
            } else {
                return false;
            }
        });
    }, make_editable: function(node_title, gistname, editable) {
        if(this.last_editable_ && (!node_title || this.last_editable_[0] !== node_title[0]))
            ui_utils.make_editable(this.last_editable_, false);
        if(node_title)
            ui_utils.make_editable(node_title, editable, function(text) {
                if(editor.rename_notebook(gistname, text)) {
                    $("#notebook-title")
                        .text(text)
                        .data('restore_edit', text);
                    return true;
                } else {
                    return false;
                }
            });
        this.last_editable_ = node_title;
    }
};
