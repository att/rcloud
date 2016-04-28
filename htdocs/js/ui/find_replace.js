RCloud.UI.find_replace = (function() {
    var find_dialog_ = null, regex_,
        find_form_,
        /*find_desc_,*/ find_input_, /*replace_desc_,*/ replace_input_, replace_stuff_,
        find_next_, find_last_, replace_next_, replace_all_, close_,
        shown_ = false, replace_mode_ = false,
        find_cycle_ = null, replace_cycle_ = null,
        matches_ = [], active_match_;
    function toggle_find_replace(replace) {
        if(!find_dialog_) {

            var markup = $(_.template(
                $("#find-in-notebook-snippet").html()
            )({}));

            $('#middle-column').prepend(markup);

            find_dialog_ = $(markup.get(0));
            find_form_ = markup.find('#find-form');
            find_input_ = markup.find('#find-input');
            find_next_ = markup.find('#find-next');
            find_last_ = markup.find('#find-last');
            replace_input_ = markup.find('#replace-input');
            replace_next_ = markup.find('#replace');
            replace_all_ = markup.find('#replace-all');
            replace_stuff_ = markup.find('.replace');
            close_ = markup.find('#find-close');

            find_input_.on('input', function(e) {
                e.preventDefault();
                e.stopPropagation();
                active_match_ = undefined;
                build_regex(find_input_.val());
                highlight_all();
            });

            function find_next(reason) {
                active_transition(reason || 'deactivate');
                if(active_match_ !== undefined)
                    active_match_ = (active_match_ + 1) % matches_.length;
                else
                    active_match_ = 0;
                active_transition('activate');
            }

            find_next_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                find_next();
                return false;
            });

            find_last_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                active_transition('deactivate');
                if(active_match_ !== undefined)
                    active_match_ = (active_match_ + matches_.length - 1) % matches_.length;
                else
                    active_match_ = 0;
                active_transition('activate');
                return false;
            });

            replace_next_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                if(active_match_ !== undefined) {
                    var cell = replace_current();
                    if(cell) {
                        shell.notebook.controller.update_cell(cell)
                            .then(function() {
                                find_next('replace');
                            });
                    }
                }
                else
                    find_next();
                return false;
            });

            replace_all_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                if(active_match_ !== undefined) {
                    active_transition('deactivate');
                    replace_rest();
                }
                else
                    replace_all(find_input_.val(), replace_input_.val());
                return false;
            });

            find_cycle_ = ['find-input', 'find-next', 'find-last'];
            replace_cycle_ = ['find-input', 'replace-input', 'find-next', 'find-last', 'replace-all'];

            function click_find_next(e) {
                if(e.keyCode===$.ui.keyCode.ENTER) {
                    e.preventDefault();
                    e.stopPropagation();
                    find_next_.click();
                    return false;
                }
                return undefined;
            }

            find_input_.keydown(click_find_next);
            replace_input_.keydown(click_find_next);

            find_form_.keydown(function(e) {
                switch(e.keyCode) {
                case $.ui.keyCode.TAB:
                    e.preventDefault();
                    e.stopPropagation();
                    var cycle = replace_mode_ ? replace_cycle_ : find_cycle_;
                    var i = cycle.indexOf(e.target.id) + cycle.length;
                    if(e.shiftKey) --i; else ++i;
                    i = i % cycle.length;
                    $('#' + cycle[i]).focus();
                    return false;
                case $.ui.keyCode.ESCAPE:
                    e.preventDefault();
                    e.stopPropagation();
                    hide_dialog();
                    return false;
                }
                return undefined;
            });

            find_form_.find('input').focus(function() {
                window.setTimeout(function() {
                    this.select();
                }.bind(this), 0);
            });

            close_.click(function() {
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
        active_match_ = undefined;
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
    function update_match_cell(match) {
        var matches = matches_.filter(function(m) { return m.filename === match.filename; });
        shell.notebook.model.cells[match.index].notify_views(function(view) {
            view.change_highlights(matches);
        });
    }
    function active_transition(transition) {
        if(active_match_ !== undefined) {
            var match = matches_[active_match_];

            if(match) {
                switch(transition) {
                    case 'replace': match.kind = 'replaced';
                        break;
                    case 'activate': match.kind = match.kind === 'replaced' ? 'activereplaced' : 'active';
                        break;
                    case 'deactivate': match.kind = match.kind === 'activereplaced' ? 'replaced' : 'normal';
                        break;
                }
                update_match_cell(match);
            }
        }
    }
    function highlight_cell(cell) {
        var matches = [];
        if(regex_) {
            var content = cell.content(), match;
            while((match = regex_.exec(content))) {
                matches.push({
                    begin: match.index,
                    end: match.index+match[0].length,
                    kind: matches.length === active_match_ ? 'active' : 'normal'
                });
                if(match.index === regex_.lastIndex) ++regex_.lastIndex;
            }
        }
        cell.notify_views(function(view) {
            view.change_highlights(matches);
        });
        return matches;
    }
    function annotate_matches(matches, cell, n) {
        return matches.map(function(match) {
            return _.extend({index: n, filename: cell.filename()}, match);
        });
    }
    function highlight_all() {
        if(shell.is_view_mode())
            shell.notebook.controller.show_r_source();
        matches_ = [];
        shell.notebook.model.cells.forEach(function(cell, n) {
            var matches = highlight_cell(cell);
            matches_.push.apply(matches_, annotate_matches(matches, cell, n));
        });
    }
    function replace_current() {
        function findIndex(a, f, i) {
            if(i===undefined) i = 0;
            for(; i < a.length && !f(a[i]); ++i);
            return i === a.length ? -1 : i;
        }
        var match = matches_[active_match_];
        var cell = shell.notebook.model.cells[match.index];
        var content = cell.content();
        var before = content.substring(0, match.begin),
            after = content.substring(match.end);
        var replacement =  replace_input_.val();
        var dlen = replacement.length + match.begin - match.end;
        match.begin = before.length;
        match.end = before.length + replacement.length;
        for(var i = active_match_+1; i < matches_.length && matches_[i].filename === match.filename; ++i) {
            matches_[i].begin += dlen;
            matches_[i].end += dlen;
        }
        return cell.content(before + replacement + after) ? cell : null;
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
    function replace_rest() {
        var changes = shell.notebook.model.reread_buffers();
        while(active_match_ < matches_.length) {
            var cell = replace_current();
            active_transition('replace');
            if(cell)
                changes.push.apply(changes, shell.notebook.model.update_cell(cell));
            ++active_match_;
        }
        active_match_ = undefined;
        shell.notebook.controller.apply_changes(changes);
    }
    var result = {
        init: function() {
            RCloud.UI.shortcut_manager.add([{
                category: 'Notebook Management',
                id: 'notebook_find',
                description: 'Find text',
                keys: [
                    ['command', 'f'],
                    ['ctrl', 'f']
                ],
                modes: ['writeable', 'readonly'],
                action: function() { toggle_find_replace(false); }
            }, {
                category: 'Notebook Management',
                id: 'notebook_replace',
                description: 'Replace text',
                keys: [
                    ['command', 'option', 'f'],
                    ['ctrl', 'h']
                ],
                modes: ['writeable'],
                action: function() { toggle_find_replace(!shell.notebook.model.read_only()); }
            }]);
        }
    };
    return result;
})();
