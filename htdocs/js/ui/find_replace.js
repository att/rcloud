RCloud.UI.find_replace = (function() {
    var find_dialog_ = null, regex_,
        find_desc_, find_input_, replace_desc_, replace_input_, replace_stuff_,
        find_next_, find_last_, replace_next_, replace_all_,
        shown_ = false, replace_mode_ = false,
        find_cycle_ = null, replace_cycle_ = null,
        matches_ = [], active_match_;
    function toggle_find_replace(replace) {
        if(!find_dialog_) {
            find_dialog_ = $('<div id="find-dialog"></div>');
            var find_form = $('<form id="find-form"></form>');
            find_desc_ = $('<label id="find-label" for="find-input"><span>Find</span></label>');
            find_input_ = $('<input type=text id="find-input" class="form-control-ext"></input>');
            replace_desc_ = $('<label id="replace-label" for="replace-input"><span>Replace with</span></label>');
            replace_input_ = $('<input type=text id="replace-input" class="form-control-ext"></input>');
            find_next_ = $('<button id="find-next" class="btn btn-primary">Next</button>');
            find_last_ = $('<button id="find-last" class="btn">Last</button>');
            replace_next_ = $('<button id="replace" class="btn">Replace</button>');
            replace_all_ = $('<button id="replace-all" class="btn">Replace All</button>');
            replace_stuff_ = replace_desc_.add(replace_input_).add(replace_next_).add(replace_all_);
            var close = $('<span id="find-close"><i class="icon-remove"></i></span>');
            find_form.append(find_desc_.append(find_input_), replace_desc_.append(replace_input_), find_next_, find_last_, replace_next_, replace_all_, close);
            find_dialog_.append(find_form);
            $('#middle-column').prepend(find_dialog_);

            find_input_.on('input', function(val) {
                active_match_ = undefined;
                build_regex(find_input_.val());
                highlight_all();
            });

            function deactivate_match() {
                var match;
                if(active_match_ !== undefined) {
                    match = matches_[active_match_];
                    shell.notebook.model.cells[match.index].notify_views(function(view) {
                        view.change_active_highlight(null);
                    });
                }
            }
            function activate_match() {
                var match = matches_[active_match_];
                shell.notebook.model.cells[match.index].notify_views(function(view) {
                    view.change_active_highlight(match);
                });
            }

            function find_next() {
                deactivate_match();
                if(active_match_ !== undefined)
                    active_match_ = (active_match_ + 1) % matches_.length;
                else
                    active_match_ = 0;
                activate_match();
                return false;
            }
            find_next_.click(find_next);

            find_last_.click(function() {
                deactivate_match();
                if(active_match_ !== undefined)
                    active_match_ = (active_match_ + matches_.length - 1) % matches_.length;
                else
                    active_match_ = 0;
                activate_match();
                return false;
            });

            replace_next_.click(function() {
                var match = matches_[active_match_];
                if(active_match_ !== undefined) {
                    var cell = shell.notebook.model.cells[match.index];
                    var content = cell.content();
                    var before = content.substring(0, match.begin),
                        after = content.substring(match.end);
                    cell.content(before + replace_input_.val() + after);
                    cell.notify_views(function(view) {
                        view.content_updated();
                    });
                    update_cell_highlights(cell);
                }
                find_next();
                return false;
            });

            replace_all_.click(function() {
                replace_all(find_input_.val(), replace_input_.val());
                return false;
            });

            find_cycle_ = ['find-input', 'find-next', 'find-last'];
            replace_cycle_ = ['find-input', 'replace-input', 'find-next', 'find-last', 'replace-all'];

            function click_find_next(e) {
                if(e.keyCode===13) {
                    find_next_.click();
                    return false;
                }
                return undefined;
            };
            find_input_.keydown(click_find_next);
            replace_input_.keydown(click_find_next);

            find_form.keydown(function(e) {
                switch(e.keyCode) {
                case 9: // tab
                    var cycle = replace_mode_ ? replace_cycle_ : find_cycle_;
                    var i = cycle.indexOf(e.target.id) + cycle.length;
                    if(e.shiftKey) --i; else ++i;
                    i = i % cycle.length;
                    $('#' + cycle[i]).focus();
                    return false;
                case 27: // esc
                    hide_dialog();
                    return false;
                }
                return undefined;
            });

            find_form.find('input').focus(function() {
                window.setTimeout(function() {
                    this.select();
                }.bind(this), 0);
            });

            close.click(function() {
                hide_dialog();
            });
        }

        find_dialog_.show();
        find_input_.focus();
        if(replace)
            replace_stuff_.show();
        else
            replace_stuff_.hide();
        build_regex(find_input_.val());
        highlight_all();
        shown_ = true;
        replace_mode_ = replace;
    }
    function hide_dialog() {
        build_regex(null);
        highlight_all();
        find_dialog_.hide();
        shown_ = false;
    }
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    function escapeRegExp(string) {
        // regex option will skip this
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function build_regex(find) {
        regex_ = find && find.length ? new RegExp(escapeRegExp(find), 'g') : null;
    }
    function highlight_cell(cell) {
        var matches = [];
        if(regex_) {
            var content = cell.content(), match;
            while((match = regex_.exec(content))) {
                matches.push({
                    begin: match.index,
                    end: match.index+match[0].length
                });
                if(match.index === regex_.lastIndex) ++regex_.lastIndex;
            }
        }
        cell.notify_views(function(view) {
            view.change_highlights(matches);
        });
        return matches;
    }
    function update_cell_highlights(cell) {
        // inefficient: really want splice range
        matches_ = _.filter(matches_, function(m) { return m.filename != cell.filename(); })
            .concat(highlight_cell(cell)).sort(function(a,b) { return a.index-b.index; });
    }
    function highlight_all() {
        matches_ = [];
        shell.notebook.model.cells.forEach(function(cell, n) {
            var matches = highlight_cell(cell);
            matches_.push.apply(matches_, matches.map(function(match) {
                return _.extend({index: n, filename: cell.filename()}, match);
            }));
        });
    }
    function replace_all(find, replace) {
        highlight_all(null);
        if(!find || !find.length)
            return;
        find = escapeRegExp(find);
        var regex = new RegExp(find, 'g');
        var changes = shell.notebook.model.reread_buffers();
        shell.notebook.model.cells.forEach(function(cell) {
            var content = cell.content(),
                new_content = content.replace(regex, replace);
            if(cell.content(new_content))
                changes.push.apply(changes, shell.notebook.model.update_cell(cell));
        });
        shell.notebook.controller.apply_changes(changes);
    }

    var result = {
        init: function() {
            document.addEventListener("keydown", function(e) {
                if (e.keyCode == 70 && (e.ctrlKey || e.metaKey)) { // ctrl/cmd-F
                    if(e.shiftKey)
                        return; // don't capture Full Screen
                    e.preventDefault();
                    toggle_find_replace(e.altKey);
                }
            });
        }
    };
    return result;
})();
