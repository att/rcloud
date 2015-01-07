RCloud.UI.find_replace = (function() {
    var find_dialog_ = null,
        find_input_, replace_input_, replace_stuff_,
        replace_all_,
        shown_ = false, replace_mode_ = false,
        nextReplace_ = null, nextFind_ = null;
    function toggle_find_replace(replace) {
        if(!find_dialog_) {
            find_dialog_ = $('<div id="find-dialog"></div>');
            var find_form = $('<form></form>');
            find_input_ = $('<input id="find-input" class="form-control-ext"></input>');
            replace_input_ = $('<input id="replace-input" class="form-control-ext"></input>');
            replace_all_ = $('<button id="replace-all" class="btn btn-primary">Replace All</button>');
            replace_stuff_ = $('<span id="replace"></span>')
                .append('&nbsp;Replace with: ', replace_input_, replace_all_);
            find_form.append('Find: ', find_input_, replace_stuff_);
            find_dialog_.append(find_form);
            $('#middle-column').prepend(find_dialog_);

            find_input_.on('input', function(val) {
                highlight_all(find_input_.val());
            });
            replace_all_.click(function() {
                replace_all(find_input_.val(), replace_input_.val());
                return false;
            });

            nextFind_ = {
                'find-input': find_input_
            };

            nextReplace_ = {
                'find-input': replace_input_,
                'replace-input': replace_all_,
                'replace-all': find_input_
            };

            find_form.keydown(function(e) {
                switch(e.keyCode) {
                case 9:
                    (replace_mode_ ? nextReplace_ : nextFind_)[e.target.id].focus();
                    return false;
                case 27:
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
        }
        if(shown_ && replace_mode_ === replace)
            hide_dialog();
        else {
            find_dialog_.show();
            find_input_.focus();
            if(replace)
                replace_stuff_.show();
            else
                replace_stuff_.hide();
            shown_ = true;
            replace_mode_ = replace;
        }
    }
    function hide_dialog() {
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
