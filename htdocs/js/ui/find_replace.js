RCloud.UI.find_replace = (function() {

    var find_dialog_ = null, regex_,
        find_form_, find_details_,
        find_input_, find_match_, match_index_, match_total_, replace_input_, replace_stuff_,
        find_next_, find_last_, replace_next_, replace_all_, close_,
        highlights_shown_ = false, replace_mode_ = false,
        find_cycle_ = null, replace_cycle_ = null,
        has_focus_ = false,
        matches_ = [], active_match_,
        change_interval_,
        replace_shown_ = false;

    function toggle_find_replace(replace, opts) {
        if(_.isUndefined(opts)) {
            opts = {};
        }

        function find_next_on_keycode(e) {
            if(e.keyCode===$.ui.keyCode.ENTER || (!ui_utils.is_a_mac() && e.keyCode === 114 /* f3 */)) {
                e.preventDefault();
                e.stopPropagation();
                if(e.shiftKey)
                    find_previous();
                else
                    find_next();
                return false;
            }
            return undefined;
        }
        replace_shown_ = replace;

        var dialog_was_shown = find_dialog_ && find_dialog_.css("display") !== 'none';
        if(!find_dialog_) {

            var markup = $(_.template(
                $("#find-in-notebook-snippet").html()
            )({}));

            $('#middle-column').prepend(markup);

            find_dialog_ = $(markup.get(0));
            find_form_ = markup.find('#find-form');
            find_details_ = markup.find('#find-details');
            find_input_ = markup.find('#find-input');
            find_match_ = markup.find('#match-status');
            match_index_ = markup.find('#match-index');
            match_total_ = markup.find('#match-total');
            find_next_ = markup.find('#find-next');
            find_last_ = markup.find('#find-last');
            replace_input_ = markup.find('#replace-input');
            replace_next_ = markup.find('#replace');
            replace_all_ = markup.find('#replace-all');
            replace_stuff_ = markup.find('.replace');
            close_ = markup.find('#find-close');

            find_input_.on('change', function(e) {
                e.preventDefault();
                e.stopPropagation();
                generate_matches();
            });

            find_details_.click(function() { find_input_.focus(); });
            find_input_.click(function(e) { e.stopPropagation(); }); // click cursor

            // disabling clear results on blur for firefox, since its implementation
            // is either the only unbroken one or the only broken one (unclear)
            if(navigator.userAgent.toLowerCase().indexOf('firefox') === -1) {
                find_form_.on('focusout', function(e) {
                    setTimeout(function() {

                        if($(document.activeElement).closest(find_form_).length === 0) {
                            has_focus_ = false;
                            clear_highlights();
                        }
                    }, 100);
                });

                find_form_.on('focusin', function(e) {
                    if(!has_focus_) {
                        // save so that any new content since last save is matched:
                        shell.save_notebook();

                        generate_matches(find_input_.data('searchagain') ? active_match_ : undefined);

                    }

                    has_focus_ = true;
                });
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
                find_previous();
                return false;
            });

            replace_next_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                replace_next();
            });

            replace_all_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                replace_all();
                return false;
            });

            find_cycle_ = ['find-input', 'find-last', 'find-next'];
            replace_cycle_ = ['find-input', 'find-last', 'find-next', 'replace-input', 'replace', 'replace-all'];

            find_cycle_.push('find-close');
            replace_cycle_.push('find-close');

            find_input_.keydown(find_next_on_keycode);
            replace_input_.keydown(find_next_on_keycode);

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
                    hide_dialog();
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

        if(replace)
            replace_stuff_.show();
        else
            replace_stuff_.hide();

        if(_.isUndefined(change_interval_)) {
            change_interval_ = setInterval(function() {
                // get the value:
                var old_value = find_input_.data('value'),
                    new_value = find_input_.val();

                if(new_value !== old_value) {
                    generate_matches();
                    find_input_.data('value', new_value);
                }
            }, 250);
        }

        generate_matches(opts.search_again ? active_match_ : undefined);

        if(opts && opts.search_again) {

            // get the cursor index:
            var cursor_details = get_active_cell_cursor_details();

            if(matches_.length && cursor_details) {

                var match_index, found_match;

                found_match = _.find(matches_, function(match) {
                    return (match.index === cursor_details.cell_index && match.begin >= cursor_details.cursor_index) ||
                        match.index > cursor_details.cell_index;

                });

                if(found_match) {
                    match_index = matches_.findIndex(function(match) {
                        return match.begin === found_match.begin &&
                            match.end === found_match.end &&
                            match.index === found_match.index;
                    });

                    if(opts.previous) {
                        match_index = match_index - 1;

                        if(match_index < 0) {
                            match_index = matches_.length - 1;
                        }
                    }

                } else if(matches_.length) {
                    // no match from this point on:
                    if(opts.next) {
                        match_index = 0;
                    } else {
                        match_index = matches_.length - 1;
                    }
                }

                generate_matches(match_index);
            }

        }

        if(opts.next) {
            if(highlights_shown_)
                find_next();
        } else if(opts.previous) {
            if(highlights_shown_)
                find_previous();
        }
        else {
            var active_cell_selection = get_active_cell_selection();
            if(active_cell_selection !== null) {
                find_input_.val(active_cell_selection);
            } else {
                ui_utils.select_allowed_elements();
                var text = window.getSelection().toString();

                if(text) {
                    find_input_.val(text);
                }
            }
        }

        if(replace && dialog_was_shown) {
            replace_input_.focus();
        } else {
            find_input_.focus();
        }

        highlights_shown_ = true;
        replace_mode_ = replace;
    }

    function generate_matches(match_index) {
        active_match_ = undefined;
        build_regex(find_input_.val());
        highlight_all();

        if(find_input_.val().length) {
            active_match_ = _.isUndefined(match_index) ? 0 : match_index;
            show_matches();
            active_transition('activate');
        } else {
            active_match_ = undefined;
            hide_matches();
        }

        var current_match;

        if(matches_.length === 0) {
            current_match = '0';
        } else if(!_.isUndefined(match_index)) {
            current_match = (match_index + 1).toString();
        } else {
            current_match = '1';
        }

        // matches_
        find_match_[matches_.length === 0 ? 'addClass' : 'removeClass']('no-matches');
        show_match_details(current_match, matches_.length);
    }

    function matches_exist() {
        return matches_.length !== 0 && !isNaN(active_match_);
    }

    function hide_matches() {
        find_match_.css('visibility', 'hidden');
    }

    function show_matches() {
        find_match_.css('visibility', 'visible');
    }

    function show_match_details(match_index, match_total) {
        match_index_.text(match_index);
        match_total_.text(match_total);
    }

    function clear_highlights() {
        hide_matches();
        active_match_ = undefined;
        build_regex(null);
        highlight_all();
        highlights_shown_ = false;
    }
    function hide_dialog() {

        if(!shell.notebook.model.read_only()) {
            var current_match = matches_[active_match_];

            if(current_match && shell.notebook.model.cells[current_match.index]) {
                var view = shell.notebook.model.cells[current_match.index].views[0];
                view.select_highlight_range(current_match.begin, current_match.end);
            }
        }

        // if search again is invoked after the dialog is hidden:
        find_input_.data('searchagain', find_input_.val());

        clearInterval(change_interval_);
        clear_highlights();
        find_dialog_.hide();
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
    function get_focussed_cell() {
        var focussed_cell = _.find(shell.notebook.model.cells, function(cell) {
            return !_.isUndefined(cell.views[0].ace_widget()) && cell.views[0].ace_widget().textInput.isFocused();
        });

        if(focussed_cell) {
            // find the index of the cell:
            for(var loop = 0; shell.notebook.model.cells.length; loop++) {
                if(shell.notebook.model.cells[loop].filename() === focussed_cell.filename()) {
                    focussed_cell.index = loop;
                    break;
                }
            }
        }

        return focussed_cell;
    }
    function get_active_cell_cursor_details() {
        var focussed_cell = get_focussed_cell();

        if(!focussed_cell) {
            return undefined;
        }

        var widget = focussed_cell.views[0].ace_widget();

        return {
            cell_index: focussed_cell.index,
            cursor_index: widget.session.doc.positionToIndex(widget.getCursorPosition())
        };
    }
    function get_active_cell_selection() {
        var focussed_cell = get_focussed_cell();

        if(focussed_cell) {
            return focussed_cell.views[0].get_selection();
        }

        // command prompt inactive for view:
        if(RCloud.UI.command_prompt.ace_widget() && RCloud.UI.command_prompt.ace_widget().textInput.isFocused())
            return RCloud.UI.command_prompt.get_selection();

        return null;
    }
    function active_transition(transition) {
        if(matches_exist()) {
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
    function find_next(reason) {
        active_transition(reason || 'deactivate');

        if(matches_exist()) {
            active_match_ = (active_match_ + matches_.length + 1) % matches_.length;
            show_match_details(active_match_ + 1, matches_.length);
        } else {
            active_match_ = 0;
        }

        active_transition('activate');
    };
    function find_previous() {
        active_transition('deactivate');

        if(matches_exist()) {
            active_match_ = (active_match_ + matches_.length - 1) % matches_.length;
            show_match_details(active_match_ + 1, matches_.length);
        } else {
            active_match_ = 0;
        }

        active_transition('activate');
    };
    function replace_next() {
        if(matches_exist()) {
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
    };
    function replace_current() {
        if(!matches_exist())
            return null;

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
    function replace_all() {
        if(matches_exist()) {
            active_transition('deactivate');
            replace_rest();
        }
        else
            replace_everywhere(find_input_.val(), replace_input_.val());
        return false;
    };
    function replace_everywhere(find, replace) {
        // gw: I can't figure out how this will ever get hit (how would we not have
        // matches?), but I obviously thought we needed completely different logic for this
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
                category: 'Search/Replace',
                id: 'notebook_find',
                description: 'Find text',
                keys: {
                    mac: [
                        ['command', 'f']
                    ],
                    win: [
                        ['ctrl', 'f']
                    ]
                },
                action: function() {
                    toggle_find_replace(false);
                }
            }, {
                category: 'Search/Replace',
                id: 'notebook_find_next',
                description: 'Find text (next)',
                keys: {
                    mac: [
                        ['command', 'g']
                    ],
                    win: [
                        ['ctrl', 'g'],
                        ['f3']
                    ]
                },
                action: function() {
                    toggle_find_replace(false, {
                        next: true,
                        search_again: true
                    });
                }
            }, {
                category: 'Search/Replace',
                id: 'notebook_find_previous',
                description: 'Find text (previous)',
                keys: {
                    mac: [
                        ['command', 'shift', 'g']
                    ],
                    win: [
                        ['ctrl', 'shift', 'g'],
                        ['shift', 'f3']
                    ]
                },
                action: function() {
                   toggle_find_replace(false, {
                        previous: true,
                        search_again: true
                   });
                }
            }, {
                category: 'Search/Replace',
                id: 'notebook_replace',
                description: 'Replace text',
                keys: {
                    mac: [
                        ['command', 'option', 'f']
                    ],
                    win: [
                        ['ctrl', 'h']
                    ]
                },
                modes: ['writeable'],
                action: function() { toggle_find_replace(!shell.notebook.model.read_only()); }
            }, {
                category: 'Search/Replace',
                id: 'notebook_replace_text_match',
                description: 'Replace next match',
                keys: {
                    win_mac: [
                        ['alt', 'r']
                    ]
                },
                modes: ['writeable'],
                element_scope: '#find-form',
                action: function() {
                    if(replace_shown_) {
                        replace_next();
                    }
                }
            }, {
                category: 'Search/Replace',
                id: 'notebook_replace_text_all',
                description: 'Replace all matches',
                keys: {
                    win_mac: [
                        ['alt', 'a']
                    ]
                },
                modes: ['writeable'],
                element_scope: '#find-form',
                action: function() {
                    if(replace_shown_) {
                        replace_all();
                    }
                }
            }, {
                category: 'Search/Replace',
                id: 'notebook_goto_previous_match',
                description: 'Go to previous search match',
                keys: {
                    mac: [
                        ['shift', 'enter']
                    ],
                    win: [
                        ['shift', 'enter'],
                        ['shift', 'f3']
                    ]
                }
            }, {
                category: 'Search/Replace',
                id: 'notebook_goto_next_match',
                description: 'Go to next search match',
                keys: {
                    mac: [
                        ['enter']
                    ],
                    win: [
                        ['enter'],
                        ['f3']
                    ]
                }
            }]);
        },
        hide_replace: function() {
            if(replace_stuff_) {
                replace_stuff_.hide();
            }
        },
        clear_highlights: function() {
            clear_highlights();
        }
    };
    return result;
})();
