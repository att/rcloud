RCloud.UI.ace_shortcuts = (function() {

    var result = {
        init: function() {

            // code prompt:
            RCloud.UI.shortcut_manager.add([{
                category: 'Code prompt',
                id: 'code_prompt_execute',
                description: 'Create cell and execute code',
                keys: [
                    ['enter'],
                    ['alt', 'return']
                ],
                modes: ['writeable']
            }, {
                category: 'Code prompt',
                id: 'code_prompt_history_back',
                description: 'Go back in code history',
                keys: [
                    ['keyup'],
                ],
                modes: ['writeable']
            }, {
                category: 'Code prompt',
                id: 'code_prompt_history_forwards',
                description: 'Go forward in code history',
                keys: [
                    ['keydown'],
                ],
                modes: ['writeable']
            }]);

            // edit cells:
            RCloud.UI.shortcut_manager.add([/*{
                category: 'Cell editor',
                id: 'cell_editor_execute',
                description: 'Execute code',
                keys: [
                    ['enter'],
                    ['alt', 'return']
                ]
            },*/ {
                category: 'Cell editor',
                id: 'cell_editor_autocomplete',
                description: 'Suggest autocompletion',
                keys: [
                    ['ctrl', '.'],
                    ['tab']
                ],
                modes: ['writeable']
            }, {
                category: 'Cell editor',
                id: 'cell_editor_disable_gotoline',
                description: 'Disable goto line',
                keys: [
                    ['command', 'l'],
                    ['ctrl', 'l']
                ],
                modes: ['writeable']
            }, {
                category: 'Cell editor',
                id: 'cell_editor_execute_selection_or_line',
                description: 'Execute selection or line',
                keys: [
                    ['command', 'return'],
                    ['ctrl', 'return']
                ],
                modes: ['writeable']
            },/* {
                category: 'Cell editor',
                id: 'cell_editor_cursor_start_of_line',
                description: 'Cursor at beginning of line',
                keys: [
                    ['ctrl', 'a']       // THIS IS MAC ONLY
                ]
            }*/, {
                category: 'Cell editor',
                id: 'cell_editor_cursor_end_of_line',
                description: 'Cursor at end of line',
                keys: [
                    ['ctrl', 'e']       // THIS IS MAC ONLY
                ],
                modes: ['writeable']
            }]);

        }
    };

    return result;

})();