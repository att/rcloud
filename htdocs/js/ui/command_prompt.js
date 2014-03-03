RCloud.UI.command_prompt = {
    prompt: null,
    history: null,
    init: function() {
        this.history = this.setup_prompt_history();
        this.prompt = this.setup_command_prompt();
    },
    focus: function() {
        // surely not the right way to do this
        if (!this.prompt)
            return;
        this.prompt.widget.focus();
        this.prompt.restore();
    },
    setup_prompt_history: function() {
        var entries_ = [], alt_ = [];
        var curr_ = 0;
        function curr_cmd() {
            return alt_[curr_] || (curr_<entries_.length ? entries_[curr_] : "");
        }
        var prefix_ = null;
        var result = {
            init: function() {
                prefix_ = "rcloud.history." + shell.gistname() + ".";
                var i = 0;
                entries_ = [];
                alt_ = [];
                while(1) {
                    var cmd = window.localStorage[prefix_+i],
                        cmda = window.localStorage[prefix_+i+".alt"];
                    if(cmda !== undefined)
                        alt_[i] = cmda;
                    if(cmd === undefined)
                        break;
                    entries_.push(cmd);
                    ++i;
                }
                curr_ = entries_.length;
                return curr_cmd();
            },
            execute: function(cmd) {
                if(cmd==="") return;
                alt_[entries_.length] = null;
                entries_.push(cmd);
                alt_[curr_] = null;
                curr_ = entries_.length;
                window.localStorage[prefix_+(curr_-1)] = cmd;
            },
            last: function() {
                if(curr_>0) --curr_;
                return curr_cmd();
            },
            next: function() {
                if(curr_<entries_.length) ++curr_;
                return curr_cmd();
            },
            change: function(cmd) {
                window.localStorage[prefix_+curr_+".alt"] = alt_[curr_] = cmd;
            }
        };
        return result;
    },

    setup_command_prompt: function() {
        var that = this;
        var prompt_div = $("#command-prompt");
        if (!prompt_div.length)
            return null;
        function set_ace_height() {
            prompt_div.css({'height': ui_utils.ace_editor_height(widget) + "px"});
            widget.resize();
        }
        prompt_div.css({'background-color': "#fff"});
        prompt_div.addClass("r-language-pseudo");
        ace.require("ace/ext/language_tools");
        var widget = ace.edit(prompt_div[0]);
        set_ace_height();
        var RMode = require("ace/mode/r").Mode;
        var session = widget.getSession();
        var doc = session.doc;
        widget.setOptions({
            enableBasicAutocompletion: true
        });
        session.setMode(new RMode(false, doc, session));
        session.on('change', set_ace_height);

        widget.setTheme("ace/theme/chrome");
        session.setUseWrapMode(true);
        widget.resize();
        var change_prompt = ui_utils.ignore_programmatic_changes(widget, this.history.change.bind(this.history));
        function execute(widget, args, request) {
            var code = session.getValue();
            if(code.length) {
                var language = $("#insert-cell-language option:selected").text();
                if (language === 'Markdown') {
                    shell.new_markdown_cell(code, true);
                } else if (language === 'R') {
                    shell.new_interactive_cell(code, true);
                }
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
            var cmd = that.init();
            change_prompt(cmd);
            var r = last_row(widget);
            ui_utils.ace_set_pos(widget, r, last_col(widget, r));
        }

        ui_utils.install_common_ace_key_bindings(widget);

        // note ace.js typo which we need to correct when we update ace
        var up_handler = widget.commands.commandKeyBinding[0]["up"],
            down_handler = widget.commands.commandKeyBinding[0]["down"];
        widget.commands.addCommands([{
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
                win: 'Ctrl-Return',
                mac: 'Command-Return',
                sender: 'editor'
            },
            exec: execute
        }, {
            name: 'up-with-history',
            bindKey: 'up',
            exec: function(widget, args, request) {
                var pos = widget.getCursorPosition();
                if(pos.row > 0)
                    up_handler.exec(widget, args, request);
                else {
                    change_prompt(that.history.last());
                    var r = last_row(widget);
                    ui_utils.ace_set_pos(widget, r, last_col(widget, r));
                }
            }
        }, {
            name: 'down-with-history',
            bindKey: 'down',
            exec: function(widget, args, request) {
                var pos = widget.getCursorPosition();
                var r = last_row(widget);
                if(pos.row < r)
                    down_handler.exec(widget, args, request);
                else {
                    change_prompt(that.history.next());
                    ui_utils.ace_set_pos(widget, 0, last_col(widget, 0));
                }
            }
        }
        ]);
        ui_utils.make_prompt_chevron_gutter(widget);

        return {
            widget: widget,
            restore: restore_prompt
        };
    }
};
