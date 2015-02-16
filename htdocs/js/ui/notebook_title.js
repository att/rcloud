RCloud.UI.notebook_title = (function() {
    var last_editable_ =  null;
    function version_tagger(node) {
        return function(name) {
            return editor.tag_version(node.gistname, node.version, name)
                .then(function() {
                    return editor.show_history(node.parent, {update: true});
                });
        };
    }
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
    var fork_and_rename = function(forked_gist_name) {
        var is_mine = shell.notebook.controller.is_mine();
        var gistname = shell.gistname();
        var version = shell.version();
        editor.fork_notebook(is_mine, gistname, version)
            .then(function rename(v){
                    rename_current_notebook(forked_gist_name);
                });
    };
    var editable_opts = {
        change: rename_current_notebook,
        select: select,
        ctrl_cmd: fork_and_rename,
        validate: function(name) { return editor.validate_name(name); }
    };

    var result = {
        set: function (text) {
            $("#notebook-author").text(shell.notebook.model.user());
            $('#author-title-dash').show();
            $('#rename-notebook').show();
            $('#loading-animation').hide();
            var is_read_only = shell.notebook.model.read_only();
            var active_text = text;
            var ellipt_start = false, ellipt_end = false;
            var title = $('#notebook-title');
            title.text(text);
            while(window.innerWidth - title.width() < 650) {
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
            ui_utils.editable(title, $.extend({allow_edit: !is_read_only && !shell.is_view_mode(),
                                               inactive_text: title.text(),
                                               active_text: active_text},
                                              editable_opts));
        },
        update_fork_info: function(fork_of) {
            if(fork_of) {
                var owner = fork_of.owner ? fork_of.owner : fork_of.user;
                var fork_desc = owner.login+ " / " + fork_of.description;
                var url = ui_utils.make_url(shell.is_view_mode() ? 'view.html' : 'edit.html',
                                            {notebook: fork_of.id});
                $("#forked-from-desc").html("forked from <a href='" + url + "'>" + fork_desc + "</a>");
            }
            else
                $("#forked-from-desc").text("");
        },
        make_editable: function(node, $li, editable) {
            function get_title(node, elem) {
                if(!node.version) {
                    return $('.jqtree-title:not(.history)', elem);
                } else {
                    return $('.jqtree-title', elem);
                }
            }
            if(last_editable_ && (!node || last_editable_ !== node))
                ui_utils.editable(get_title(last_editable_, last_editable_.element), 'destroy');
            if(node) {
                var opts = editable_opts;
                if(node.version) {
                    opts = $.extend({}, editable_opts, {
                        change: version_tagger(node),
                        validate: function(name) { return true; }
                    });
                }
                ui_utils.editable(get_title(node, $li),
                                  $.extend({allow_edit: editable,
                                            inactive_text: node.name,
                                            active_text: node.version ? node.name : node.full_name},
                                           opts));
            }
            last_editable_ = node;
        }
    };
    return result;
})();
