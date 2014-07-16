RCloud.UI.notebook_title = (function() {
    var last_editable_ =  null;
    function rename_current_notebook(name) {
        editor.rename_notebook(name)
            .then(function() {
                result.set(name);
            });
    }
    // always select all text after last slash, or all text
    function select(el) {
        if(el.childNodes.length !== 1 || el.firstChild.nodeType != el.TEXT_NODE)
            throw new Error('expecting simple element with child text');
        var text = el.firstChild.textContent;
        var range = document.createRange();
        range.setStart(el.firstChild, text.lastIndexOf('/') + 1);
        range.setEnd(el.firstChild, text.length);
        return range;
    }
    var editable_opts = {
        change: rename_current_notebook,
        select: select,
        validate: function(name) { return editor.validate_name(name); }
    };

    var result = {
        set: function (text) {
            $("#notebook-author").text(shell.notebook.model.user());
            $('#author-title-dash').show();

            var is_read_only = shell.notebook.model.read_only();
            var active_text = text;
            var ellipt_start = false, ellipt_end = false;
            var title = $('#notebook-title');
            title.text(text);
            while(window.innerWidth - title.width() < 505) {
                var slash = text.search('/');
                if(slash >= 0) {
                    ellipt_start = true;
                    text = text.slice(slash+1);
                }
                else {
                    ellipt_end = true;
                    text = text.substr(0, text.length - 2);
                }
                title.text((ellipt_start ? '.../' : '') +
                           text +
                           (ellipt_end ? '...' : ''));
            }
            ui_utils.editable(title, $.extend({allow_edit: !is_read_only,
                                               inactive_text: title.text(),
                                               active_text: active_text},
                                              editable_opts));
        }, make_editable: function(node, editable) {
            function get_title(node) {
                return $('.jqtree-title:not(.history)', node.element);
            }
            if(last_editable_ && (!node || last_editable_ !== node))
                ui_utils.editable(get_title(last_editable_), 'destroy');
            if(node) {
                ui_utils.editable(get_title(node),
                                  $.extend({allow_edit: editable,
                                            inactive_text: node.name,
                                            active_text: node.full_name},
                                           editable_opts));
            }
            last_editable_ = node;
        }
    };
    return result;
})();
