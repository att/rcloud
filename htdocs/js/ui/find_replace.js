RCloud.UI.find_replace = (function() {
    var find_dialog_ = null,
        find_input_, replace_desc_, replace_input_, replace_stuff_,
        find_next_, replace_all_,
        shown_ = false, replace_mode_ = false,
        nextReplace_ = null, nextFind_ = null,
        matches_ = {}, currentCell_, currentMatch_;
    function toggle_find_replace(replace) {
        if(!find_dialog_) {
            find_dialog_ = $('<div id="find-dialog"></div>');
            var find_form = $('<form></form>');
            find_input_ = $('<input id="find-input" class="form-control-ext"></input>');
            replace_desc_ = $('<span id="replace">&nbsp;Replace with: </span>');
            replace_input_ = $('<input id="replace-input" class="form-control-ext"></input>');
            find_next_ = $('<button id="find-next" class="btn btn-primary">Find Next</button>');
            replace_all_ = $('<button id="replace-all" class="btn">Replace All</button>');
            replace_stuff_ = replace_desc_.add(replace_input_).add(replace_all_);
            var close = $('<span id="close" style="float: right; cursor: pointer"><i class="icon-remove"></i></span>');
            find_form.append('Find: ', find_input_, replace_desc_, replace_input_, find_next_, replace_all_, close);
            find_dialog_.append(find_form);
            $('#middle-column').prepend(find_dialog_);

            find_input_.on('input', function(val) {
                currentCell_ = currentMatch_ = undefined;
                highlight_all(find_input_.val());
            });
            replace_all_.click(function() {
                replace_all(find_input_.val(), replace_input_.val());
                return false;
            });

            nextFind_ = {
                'find-input': find_next_,
                'find-next': find_input_
            };

            nextReplace_ = {
                'find-input': replace_input_,
                'replace-input': find_next_,
                'find-next': replace_all_,
                'replace-all': find_input_
            };

            var click_find_next = function(e) {
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
                    (replace_mode_ ? nextReplace_ : nextFind_)[e.target.id].focus();
                    return false;
                case 13: // cr: don't do default anything
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
        highlight_all(find_input_.val());
        shown_ = true;
        replace_mode_ = replace;
    }
    function hide_dialog() {
        highlight_all(null);
        find_dialog_.hide();
        shown_ = false;
    }
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    function escapeRegExp(string) {
        // regex option will skip this
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function highlight_all(find) {
        var regex = find && find.length ? new RegExp(escapeRegExp(find), 'g') : null;
        shell.notebook.model.cells.forEach(function(cell) {
            var matches = [];
            if(regex) {
                var content = cell.content(), match;
                while((match = regex.exec(content))) {
                    matches.push({
                        begin: match.index,
                        end: match.index+match[0].length
                    });
                    if(match.index === regex.lastIndex) ++regex.lastIndex;
                }
            }
            cell.notify_views(function(view) {
                view.change_highlights(matches);
            });
            matches_[cell.filename()] = matches;
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
