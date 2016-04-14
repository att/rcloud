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
                category: 'Cell editor',
                id: 'cell_editor_execute',
                description: 'Execute code',
                keys: { 
                    win_mac: [
                        ['alt', 'return']
                    ]
                }
            }, {
                category: 'Cell editor',
                id: 'cell_editor_autocomplete',
                description: 'Suggest autocompletion',
                keys: { 
                    win_mac: [
                        ['ctrl', '.'], ['tab']
                    ]
                },
                modes: ['writeable']
            }, {
                category: 'Cell editor',
                id: 'cell_editor_disable_gotoline',
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
                category: 'Cell editor',
                id: 'cell_editor_execute_selection_or_line',
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
                category: 'Cell editor',
                id: 'cell_editor_cursor_start_of_line',
                description: 'Cursor at beginning of line',
                keys: { 
                    mac: [
                        ['ctrl', 'a'] 
                    ]
                },
            }, {
                category: 'Cell editor',
                id: 'cell_editor_cursor_end_of_line',
                description: 'Cursor at end of line',
                keys: { 
                    mac: [
                        ['ctrl', 'e'] 
                    ]
                },
                modes: ['writeable']
            }];

            _.each(ace_shortcuts, function(s) { s.ignore_clash = true; });

            RCloud.UI.shortcut_manager.add(ace_shortcuts);

        }
    };

    return result;

})();