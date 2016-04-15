RCloud.UI.ace_shortcuts = (function() {

    var result = {
        init: function() {

            var ace_shortcuts = [{
                category: 'Code prompt',
                id: 'code_prompt_execute',
                description: 'Create cell and execute code',
                keys: { 
                    win_mac: [
                        ['enter'], ['alt', 'return']
                    ]
                },
                modes: ['writeable']
            }, {
                category: 'Code prompt',
                id: 'code_prompt_history_back',
                description: 'Go back in code history',
                keys: { 
                    win_mac: [
                        ['keyup']
                    ]
                },
                modes: ['writeable']
            }, {
                category: 'Code prompt',
                id: 'code_prompt_history_forwards',
                description: 'Go forwards in code history',
                keys: { 
                    win_mac: [
                        ['keydown']
                    ]
                },
                modes: ['writeable']
            }, {                           // !
                category: 'Code Editor',
                id: 'code_editor_execute',
                description: 'Execute code',
                keys: { 
                    win_mac: [
                        ['alt', 'return']
                    ]
                }
            }, {
                category: 'Code Editor',
                id: 'code_editor_autocomplete',
                description: 'Suggest autocompletion',
                keys: { 
                    win_mac: [
                        ['ctrl', '.'], ['tab']
                    ]
                },
                modes: ['writeable']
            }, {
                category: 'Code Editor',
                id: 'code_editor_disable_gotoline',
                description: 'Disable goto line',
                keys: { 
                    mac: [
                        ['command', 'l'] 
                    ],
                    win: [
                        ['ctrl', 'l']
                    ]
                },
                modes: ['writeable']
            }, {
                category: 'Code Editor',
                id: 'code_editor_execute_selection_or_line',
                description: 'Execute selection or line',
                keys: { 
                    mac: [
                        ['command', 'return'] 
                    ],
                    win: [
                        ['ctrl', 'return']
                    ]
                },
                modes: ['writeable']
            }, {                                                        // !
                category: 'Code Editor',
                id: 'code_editor_cursor_start_of_line',
                description: 'Cursor at beginning of line',
                keys: { 
                    mac: [
                        ['ctrl', 'a'] 
                    ]
                },
            }, {
                category: 'Code Editor',
                id: 'code_editor_cursor_end_of_line',
                description: 'Cursor at end of line',
                keys: { 
                    mac: [
                        ['ctrl', 'e'] 
                    ]
                },
                modes: ['writeable']
            },

            // line operations:
            {
                category: 'Code Editor',
                id: 'ace_remove_line',
                description: 'Remove line',
                keys: { 
                    mac: [
                        ['cmd', 'd'] 
                    ],
                    win: [
                        ['ctrl', 'd']
                    ]
                },
                modes: ['writeable']
            },          
            {
                category: 'Code Editor',
                id: 'ace_copy_lines_down',
                description: 'Copy lines down',
                keys: { 
                    mac: [
                        ['cmd', 'option', 'keydown'] 
                    ],
                    win: [
                        ['alt', 'shift', 'keydown']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_remove_line',
                description: 'Copy lines up',
                keys: { 
                    mac: [
                        ['cmd', 'option', 'keyup'] 
                    ],
                    win: [
                        ['alt', 'shift', 'keyup']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_move_lines_down',
                description: 'Move lines down',
                keys: { 
                    mac: [
                        ['option', 'keydown'] 
                    ],
                    win: [
                        ['alt', 'keydown']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_move_lines_up',
                description: 'Moves lines up',
                keys: { 
                    mac: [
                        ['option', 'keyup'] 
                    ],
                    win: [
                        ['alt', 'keyup']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_remove_to_line_end',
                description: 'Remove to line end',
                keys: { 
                    mac: [
                        ['ctrl', 'k'] 
                    ],
                    win: [
                        ['alt', 'delete']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_remove_to_line_start',
                description: 'Remove to line start',
                keys: { 
                    mac: [
                        ['cmd', 'backspace'] 
                    ],
                    win: [
                        ['alt', 'backspace']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_remove_word_left',
                description: 'Remove word left',
                keys: { 
                    mac: [
                        ['option', 'backspace'],
                        ['ctrl', 'option', 'backspace']
                    ],
                    win: [
                        ['ctrl', 'backspace']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_remove_word_right',
                description: 'Remove word right',
                keys: { 
                    mac: [
                        ['option', 'delete'] 
                    ],
                    win: [
                        ['ctrl', 'delete']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_split_line',
                description: 'Split line',
                keys: { 
                    mac: [
                        ['ctrl', 'o'] 
                    ]
                },
                modes: ['writeable']
            },

            // selection

            {
                category: 'Code Editor',
                id: 'ace_select_all',
                description: 'Select all',
                keys: { 
                    mac: [
                        ['cmd', 'a'] 
                    ],
                    win: [
                        ['ctrl', 'a']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_left',
                description: 'Select left',
                keys: { 
                    win_mac: [
                        ['shift', 'keyleft'] 
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_right',
                description: 'Select right',
                keys: { 
                    win_mac: [
                        ['shift', 'keyright'] 
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_word_left',
                description: 'Select word left',
                keys: { 
                    mac: [
                        ['option', 'shift', 'keyleft'] 
                    ],
                    win: [
                        ['ctrl', 'shift', 'keyleft']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_word_right',
                description: 'Select word right',
                keys: { 
                    mac: [
                        ['option', 'shift', 'keyright'] 
                    ],
                    win: [
                        ['ctrl', 'shift', 'keyright']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_line_start',
                description: 'Select line start',
                keys: { 
                    win_mac: [
                        ['shift', 'home'] 
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_line_end',
                description: 'Select line end',
                keys: { 
                    win_mac: [
                        ['shift', 'end'] 
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_line_end',
                description: 'Select to line end',
                keys: { 
                    mac: [
                        ['option', 'shift', 'keyright'] 
                    ],
                    win: [
                        ['alt', 'shift', 'keyright']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_line_start',
                description: 'Select to line start',
                keys: { 
                    mac: [
                        ['option', 'shift', 'keyleft'] 
                    ],
                    win: [
                        ['alt', 'shift', 'keyleft']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_up',
                description: 'Select up',
                keys: { 
                    win_mac: [
                        ['shift', 'keyup'] 
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_down',
                description: 'Select down',
                keys: { 
                    win_mac: [
                        ['shift', 'keydown'] 
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_page_up',
                description: 'Select page up',
                keys: { 
                    win_mac: [
                        ['shift', 'pageup'] 
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_page_down',
                description: 'Select page down',
                keys: { 
                    win_mac: [
                        ['shift', 'pagedown'] 
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_to_start',
                description: 'Select to start',
                keys: { 
                    mac: [
                        ['command', 'shift', 'keyup'] 
                    ],
                    win: [
                        ['ctrl', 'shift', 'home']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_to_end',
                description: 'Select to end',
                keys: { 
                    mac: [
                        ['command', 'shift', 'keydown'] 
                    ],
                    win: [
                        ['ctrl', 'shift', 'end']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_duplicate_selection',
                description: 'Duplicate selection',
                keys: { 
                    mac: [
                        ['command', 'shift', 'd'] 
                    ],
                    win: [
                        ['ctrl', 'shift', 'd']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_select_to_matching_bracket',
                description: 'Select to matching bracket',
                keys: { 
                    win: [
                        ['ctrl', 'shift', 'p']
                    ]
                },
                modes: ['writeable']
            },

            // multicursor -- ?! :(

            // go to:
            {
                category: 'Code Editor',
                id: 'ace_go_to_left',
                description: 'Go to left',
                keys: { 
                    mac: [
                        ['keyleft'],
                        ['ctrl', 'b']
                    ],
                    win: [
                        ['keyleft']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_right',
                description: 'Go to right',
                keys: { 
                    mac: [
                        ['keyright'],
                        ['ctrl', 'f']
                    ],
                    win: [
                        ['keyright']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_word_left',
                description: 'Go to word left',
                keys: { 
                    mac: [
                        ['option', 'left'] 
                    ],
                    win: [
                        ['ctrl', 'left']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_word_right',
                description: 'Go to word right',
                keys: { 
                    mac: [
                        ['option', 'right'] 
                    ],
                    win: [
                        ['ctrl', 'right']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_go_line_up',
                description: 'Go line up',
                keys: { 
                    mac: [
                        ['keyup'],
                        ['ctrl', 'p']
                    ],
                    win: [
                        ['keyup']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_go_line_down',
                description: 'Go line down',
                keys: { 
                    mac: [
                        ['keydown'],
                        ['ctrl', 'n']
                    ],
                    win: [
                        ['keydown']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_line_start',
                description: 'Go to line start',
                keys: { 
                    mac: [
                        ['command', 'keyleft'],
                        ['home'],
                        ['ctrl', 'a']
                    ],
                    win: [
                        ['alt', 'keyleft'],
                        ['home']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_line_end',
                description: 'Go to line end',
                keys: { 
                    mac: [
                        ['command', 'keyright'],
                        ['end'],
                        ['ctrl', 'e']
                    ],
                    win: [
                        ['alt', 'keyright'],
                        ['end']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_page_up',
                description: 'Go to page up',
                keys: { 
                    mac: [
                        ['option', 'pageup']
                    ],
                    win: [
                        ['pageup']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_page_down',
                description: 'Go to page down',
                keys: { 
                    mac: [
                        ['option', 'pagedown'],
                        ['ctrl', 'v']
                    ],
                    win: [
                        ['pagedown']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_start',
                description: 'Go to start',
                keys: { 
                    mac: [
                        ['command', 'home'],
                        ['command', 'keyup']
                    ],
                    win: [
                        ['ctrl', 'home']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_end',
                description: 'Go to end',
                keys: { 
                    mac: [
                        ['command', 'end'],
                        ['command', 'keydown']
                    ],
                    win: [
                        ['ctrl', 'end']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_line',
                description: 'Go to line',
                keys: { 
                    mac: [
                        ['command', 'l']
                    ],
                    win: [
                        ['ctrl', 'l']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_scroll_line_down',
                description: 'Scroll line down',
                keys: { 
                    mac: [
                        ['command', 'keydown']
                    ],
                    win: [
                        ['ctrl', 'keydown']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_scroll_line_up',
                description: 'Scroll line up',
                keys: { 
                    win: [
                        ['ctrl', 'keyup']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_matching_bracket',
                description: 'Go to matching bracket',
                keys: { 
                    win: [
                        ['ctrl', 'p']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_scroll_page_down',
                description: 'Scroll page down',
                keys: { 
                    mac: [
                        ['option', 'pagedown']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_scroll_page_up',
                description: 'Scroll page up',
                keys: { 
                    mac: [
                        ['option', 'pageup']
                    ]
                },
                modes: ['writeable']
            },

            // find/replace

            // folding

            // other:
            {
                category: 'Code Editor',
                id: 'ace_indent',
                description: 'Indent',
                keys: { 
                    win_mac: [
                        ['tab']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_outdent',
                description: 'Outdent',
                keys: { 
                    win_mac: [
                        ['shift', 'tab']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_undo',
                description: 'Undo',
                keys: { 
                    mac: [
                        ['command', 'z']
                    ],
                    win: [
                        ['ctrl', 'z']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_redo',
                description: 'Redo',
                keys: { 
                    mac: [
                        ['command', 'shift', 'z']
                        ['command', 'y']
                    ],
                    win: [
                        ['ctrl', 'y'],
                        ['ctrl', 'shift', 'z']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_toggle_comment',
                description: 'Toggle comment',
                keys: { 
                    mac: [
                        ['command', '/']
                    ],
                    win: [
                        ['ctrl', '/']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_change_to_lower_case',
                description: 'Change to lower case',
                keys: { 
                    win_mac: [
                        ['ctrl', 'shift', 'u']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_change_to_upper_case',
                description: 'Change to upper case',
                keys: { 
                    win_mac: [
                        ['ctrl', 'u']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_insert',
                description: 'Overwrite',
                keys: { 
                    win_mac: [
                        ['insert']
                    ]
                },
                modes: ['writeable']
            },
            {
                category: 'Code Editor',
                id: 'ace_delete',
                description: 'Delete',
                keys: { 
                    win_mac: [
                        ['delete']
                    ]
                },
                modes: ['writeable']
            }

            ];

            _.each(ace_shortcuts, function(s) { s.ignore_clash = true; });

            RCloud.UI.shortcut_manager.add(ace_shortcuts);

        }
    };

    return result;

})();