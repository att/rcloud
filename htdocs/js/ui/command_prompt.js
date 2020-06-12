RCloud.UI.command_prompt = (function() {
    var show_prompt_ = false, // start hidden so it won't flash if user has it turned off
        readonly_ = true,
        history_ = null,
        entry_ = null,
        language_ = null,
        command_bar_ = null,
        ace_widget_,
        ace_session_;

    function setup_command_entry() {
        var prompt_div = $("#command-prompt");
        if (!prompt_div.length)
            return null;
        function set_ace_height() {
            var EXTRA_HEIGHT = 6;
            prompt_div.css({'height': (ui_utils.ace_editor_height(widget, 5) + EXTRA_HEIGHT) + "px"});
            widget.resize();
            shell.scroll_to_end(0);
        }
        prompt_div.css({'background-color': "#fff"});
        prompt_div.addClass("r-language-pseudo");
        ace.require("ace/ext/language_tools");
        var widget = ace.edit(prompt_div[0]);
        widget.$blockScrolling = Infinity;
        ace_widget_ = widget;
        set_ace_height();
        var RMode = ace.require("ace/mode/r").Mode;
        var session = widget.getSession();
        ace_session_ = session;
        var doc = session.doc;
        widget.setOptions({
            enableBasicAutocompletion: true
        });
        session.on('change', set_ace_height);

        widget.setTheme("ace/theme/chrome");
        session.setNewLineMode('unix');
        session.setOption('indentedSoftWrap', false);
        session.setUseWrapMode(true);
        widget.resize();
        var change_prompt = ui_utils.ignore_programmatic_changes(widget, history_.change.bind(history_));
        function execute(widget, args, request) {
            var code = session.getValue();
            if(code.length) {
                RCloud.UI.command_prompt.history().add_entry(code);
                var append = shell.new_cell(code, language_);
                shell.scroll_to_end();
                append.controller.enqueue_execution_snapshot(append.updatePromise);
                change_prompt('');
            }
        }

        function last_row(widget) {
            var doc = widget.getSession().getDocument();
            return doc.getLength()-1;
        }

        function last_col(widget, row) {
            var doc = widget.getSession().getDocument();
            return doc.getLine(row).length;
        }

        function restore_prompt() {
            var prop = history_.init(shell.gistname());
            if(!_.contains(RCloud.language.available_languages(), prop.lang)) {
              var default_lang = RCloud.language.available_languages()[0];
              console.error("Language " + prop.lang + " is not available. Using " + default_lang + " to restore prompt widget.");
              prop = {cmd: '', lang: default_lang};
            }
            change_prompt(prop.cmd);
            result.language(prop.lang);
            var r = last_row(widget);
            ui_utils.ace_set_pos(widget, r, last_col(widget, r));
        }

        function set_language(language) {
            var LangMode = RCloud.language.ace_mode(language);
            session.setMode(new LangMode({ suppressHighlighting : false, doc : session.doc, session : session, language : language }));
            widget.focus();
        }

        ui_utils.install_common_ace_key_bindings(widget, result.language.bind(result));

        var up_handler = widget.commands.commandKeyBinding.up,
            down_handler = widget.commands.commandKeyBinding.down;
        widget.commands.addCommands([
            {
                name: 'execute',
                bindKey: {
                    win: 'Return',
                    mac: 'Return',
                    sender: 'editor'
                },
                exec: execute
            }, {
                name: 'execute-2',
                bindKey: {
                    win: 'Alt-Return',
                    mac: 'Alt-Return',
                    sender: 'editor'
                },
                exec: execute
            }, {
                name: 'up-with-history',
                bindKey: 'up',
                exec: function(widget, args, request) {
                    var pos = widget.getCursorPositionScreen();
                    if(pos.row > 0)
                        up_handler.exec(widget, args, request);
                    else {
                        if(history_.has_last()) {
                            change_prompt(history_.last());
                            var r = widget.getSession().getScreenLength();
                            ui_utils.ace_set_pos(widget, r, pos.column);
                        }
                        else
                            ui_utils.ace_set_pos(widget, 0, 0);
                    }
                }
            }, {
                name: 'down-with-history',
                bindKey: 'down',
                exec: function(widget, args, request) {
                    var pos = widget.getCursorPositionScreen();
                    var r = widget.getSession().getScreenLength();
                    if(pos.row < r-1)
                        down_handler.exec(widget, args, request);
                    else {
                        if(history_.has_next()) {
                            change_prompt(history_.next());
                            ui_utils.ace_set_pos(widget, 0, pos.column);
                        }
                        else {
                            r = last_row(widget);
                            ui_utils.ace_set_pos(widget, r, last_col(widget, r));
                        }
                    }
                }
            }, {
            name: 'blurCell',
                bindKey: {
                    win: 'Escape',
                    mac: 'Escape'
                },
                exec: function() {
                    ace_widget_.blur();
                }
            }
        ]);
        widget.commands.removeCommands(['find', 'replace']);
        ui_utils.customize_ace_gutter(widget, function(i) {
            return i===0 ? '&gt;' : '+';
        });

        return {
            widget: widget,
            restore: restore_prompt,
            set_language: set_language
        };
    }

    function show_or_hide() {
        var prompt_area = $('#prompt-area'),
            prompt = $('#command-prompt'),
            controls = $('#prompt-area .cell-status .cell-control-bar');
        if(readonly_)
            prompt_area.hide();
        else {
            prompt_area.show();
            if(show_prompt_) {
                prompt.show();
                controls.removeClass('flipped');
            }
            else {
                prompt.hide();
                controls.addClass('flipped');
            }
        }
    }

    var result = {
        init: function() {
            var that = this;

            RCloud.UI.cell_commands.add({
                insert_prompt: {
                    area: 'prompt',
                    modifying: true,
                    sort: 1000,
                    create: function() {
                        return RCloud.UI.cell_commands.create_button('icon-plus', 'insert new cell', function() {
                            var append = shell.new_cell("", language_);
                            append.updatePromise.then(function() {
                                append.controller.edit_source(true);
                            });
                        });
                    }
                },
                language_prompt: {
                    area: 'prompt',
                    modifying: true,
                    sort: 2000,
                    create: function() {
                        return RCloud.UI.cell_commands.create_select(RCloud.language.available_languages(), function(language) {
                            window.localStorage["last_cell_lang"] = language;
                            RCloud.UI.command_prompt.language(language, true);
                        });
                    }
                }
            });
            var prompt_div = $(RCloud.UI.panel_loader.load_snippet('command-prompt-snippet'));
            $('#rcloud-cellarea').append(prompt_div);
            var prompt_command_bar = $('#prompt-area .cell-control-bar');
            command_bar_ = RCloud.UI.cell_commands.decorate('prompt', prompt_command_bar);
            history_ = RCloud.UI.prompt_history();
            entry_ = setup_command_entry();
        },
        history: function() {
            return history_;
        },
        show_prompt: function(val) {
            if(!arguments.length)
                return show_prompt_;
            show_prompt_ = val;
            show_or_hide();
            return this;
        },
        readonly: function(val) {
            if(!arguments.length)
                return readonly_;
            readonly_ = val;
            show_or_hide();
            return this;
        },
        language: function(val, skip_ui) {
            if(val === undefined)
                return language_;
            language_ = val;
            if(!skip_ui)
                command_bar_.controls['language_prompt'].set(language_);
            entry_.set_language(language_);
            return this;
        },
        focus: function() {
            // surely not the right way to do this
            if (!entry_)
                return;
            entry_.widget.focus();
            entry_.restore();
        },
        ace_widget: function() {
            return ace_widget_;
        },
        get_selection: function() {
            if(!show_prompt_) {
                return undefined;
            } else {
                return ace_session_.doc.getTextRange(ace_widget_.selection.getRange());
            }
        }
    };
    return result;
})();
