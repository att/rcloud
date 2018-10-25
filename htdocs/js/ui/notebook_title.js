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
        return editor.rename_notebook(name)
            .then(function() {
                result.set(name);
            });
    }
    function rename_notebook_folder(node) {
        return function(name) {
            editor.for_each_notebook(node, name, function(node, name) {
                if(node.gistname === shell.gistname())
                    rename_current_notebook(name);
                else {
                    rcloud.update_notebook(node.gistname, update_notebook_from_gist, {description: name}, false)
                        .then(function(notebook) {
                            editor.update_notebook_from_gist(notebook);
                        });
                }
            }, function(child, name) {
                return name + '/' + child.name;
            });
        };
    }
    function fork_rename_folder(node) {
        return function(name) {
            var match = new RegExp('^' + node.full_name);
            editor.fork_folder(node, match, name);
        };
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
    var fork_and_rename = function(forked_gist_name, is_change) {
        var is_mine = shell.notebook.controller.is_mine();
        var gistname = shell.gistname();
        var version = shell.version();
        editor.fork_notebook(is_mine, gistname, version)
            .then(function(v) {
                if(is_change)
                    return rename_current_notebook(forked_gist_name);
                else // if no change, allow default numbering to work
                    return undefined;
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
            function sum_li_width(sel) {
                return d3.sum($(sel).map(function(_, el) { return $(el).width(); }));
            }
            var header_plus_menu = $('#rcloud-navbar-header').width() + sum_li_width('#rcloud-navbar-menu li') + 50;
            title.text(text);
            while(text.length>10 && window.innerWidth < header_plus_menu + sum_li_width('#rcloud-navbar-main')) {
                var slash = text.search('/');
                if(slash >= 0) {
                    ellipt_start = true;
                    text = text.slice(slash+1);
                }
                else {
                    ellipt_end = true;
                    text = text.substr(0, text.length - 5);
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
        update_fork_info: function(fork_id) {
            var url = ui_utils.make_url(shell.is_view_mode() ? 'view.html' : 'edit.html',
                                        {notebook: fork_id});
            if(fork_id) {
                rcloud.get_notebook_info(fork_id).then(function(info) {
                    var fork_desc = (info.username || 'unknown') + " / " + (info.description || 'unknown');
                    $("#forked-from-desc").html("forked from <a href='" + url + "'>" + fork_desc + "</a>");
                }).catch(function(error) {
                    if(/does not exist or has not been published/.test(error))
                        $("#forked-from-desc").html("forked from <a href='" + url + "'>(unknown notebook)</a>");
                    else
                        $("#forked-from-desc").text("");
                });
            }
            else
                $("#forked-from-desc").text("");
        },
        make_editable: function(node, $li, editable) {
            function get_title(node, elem) {
                return $('> div > .jqtree-title', elem);
            }
            if(last_editable_ && (!node || node.gistname && last_editable_ !== node))
                ui_utils.editable(get_title(last_editable_, last_editable_.element), 'destroy');
            if(node) {
                var opts = editable_opts;
                if(node.version) {
                    opts = $.extend({}, editable_opts, {
                        change: version_tagger(node),
                        validate: function(name) { return true; }
                    });
                }
                else if(!node.gistname) {
                    opts = $.extend({}, editable_opts, {
                        change: rename_notebook_folder(node),
                        ctrl_cmd: fork_rename_folder(node),
                        validate: function(text) {
                            return editor.validate_name(text);
                        }
                    });
                }
                ui_utils.editable(get_title(node, $li),
                                  $.extend({allow_edit: editable,
                                            inactive_text: node.name,
                                            active_text: node.version ? node.name : node.full_name},
                                           opts));
            }
            if(node && node.gistname)
                last_editable_ = node;
        }
    };
    return result;
})();
