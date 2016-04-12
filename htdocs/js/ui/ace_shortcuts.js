RCloud.UI.ace_shortcuts = (function() {

    var result = {
        init: function() {
            console.log('shortcuts for ACE have been registered.');
        }
    };

    return result;

})();


/*

{
            name: 'another autocomplete key',
            bindKey: 'Ctrl-.',
            exec: Autocomplete.startCommand.exec
        },
        {
            name: 'the autocomplete key people want',
            bindKey: 'Tab',
            exec: function(widget, args, request) {
                //determine if there is anything but whitespace on line
                var range = widget.getSelection().getRange();
                var line = widget.getSession().getLine(range.start.row);
                var before = line.substring(0, range.start.column);
                if(before.match(/\S/))
                    Autocomplete.startCommand.exec(widget, args, request);
                else tab_handler.exec(widget, args, request);
            }
        },
        {
            name: 'disable gotoline',
            bindKey: {
                win: "Ctrl-L",
                mac: "Command-L"
            },
            exec: function() { return false; }
        }, 
        {
            name: 'execute-selection-or-line',
            bindKey: {
                win: 'Ctrl-Return',
                mac: 'Command-Return',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                if (widget.getOption("readOnly"))
                    return;
                var code = session.getTextRange(widget.getSelectionRange());
                if(code.length===0) {
                    var pos = widget.getCursorPosition();
                    var Range = ace.require('ace/range').Range;
                    var range = new Range(pos.row, 0, pos.row+1, 0);
                    code = session.getTextRange(range);
                    widget.navigateDown(1);
                    widget.navigateLineEnd();
                }
                RCloud.UI.command_prompt.history().add_entry(code);
                shell.new_cell(code, get_language())
                    .spread(function(_, controller) {
                        controller.enqueue_execution_snapshot();
                        shell.scroll_to_end();
                    });
            }
        },

        {
            name: 'cursor at beginning of line',
            ctrlACount : 0,
            lastRow: -1,
            bindKey: {
                mac: 'Ctrl-A',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                if (widget.getOption("readOnly"))
                    return;
                //row of the cursor on current line
                var row = widget.getCursorPosition().row;
                //if on a new line
                if( this.lastRow !== row) {
                    this.ctrlACount = 1;
                    widget.navigateLineStart();
                    this.lastRow = row;
                }
                else {
                    if(this.ctrlACount === 0) {
                        //make sure it appears at beginning of text
                        widget.navigateLineStart();
                        this.ctrlACount ++;
                    }
                    else if(this.ctrlACount === 1 ) {
                        //move to the beginning of that line
                        widget.navigateTo(row, 0);
                        this.ctrlACount = 0;
                    }
                    this.lastRow = row;
                }
            }
        } ,
        {
            name: 'cursor at end of line',
            bindKey: {
                mac: 'Ctrl-E',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                //row of the cursor on current line
                var row = widget.getCursorPosition().row;
                //last column of the cursor on current line
                var lastCol = ui_utils.last_col(widget, row);
                //move to the end of that line
                widget.navigateTo(row, lastCol);
            }
        }




        ace_widget_.commands.addCommands([{
            name: 'executeCell',
            bindKey: {
                win: 'Alt-Return',
                mac: 'Alt-Return',
                sender: 'editor'
            },
            exec: function(ace_widget_, args, request) {
                result.execute_cell();
            }
        }]);

        ace_widget_.commands.addCommands([{
            name: 'executeCell',
            bindKey: {
                win: 'Alt-Return',
                mac: 'Alt-Return',
                sender: 'editor'
            },
            exec: function(ace_widget_, args, request) {
                result.execute_cell();
            }
        }]);




        input_widget_.commands.addCommands([{
            name: 'enter',
            bindKey: 'Return',
            exec: function(ace_widget, args, request) {
                var input = ace_widget.getValue();
                result.add_result('code', _.unescape(prompt_text_) + input + '\n');
                if(input_kont_)
                    input_kont_(null, input);
                input_div_.hide();
                window.clearInterval(input_anim_);
                input_anim_ = null;
            }
        }]);






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
            }
        ]);

*/