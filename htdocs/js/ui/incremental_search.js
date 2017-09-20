
RCloud.UI.incremental_search = (function() { 
    
    var _template = _.template($('#tree-finder-template').html()),
        _elementSelector = '#tree-finder-dialog';
        _inputsSelector = _elementSelector + ' input',
        _dialogVisible = false,
        _dialog = undefined;

    function toggle_incremental_search() {
        if(!_dialogVisible) {
            _dialog.modal({keyboard: true});
        }

        _dialogVisible = true;
    }
    
    var result = {
        init: function() {
            
            RCloud.UI.shortcut_manager.add([{
                category: 'Incremental Search',
                id: 'incremental_search',
                description: 'Show incremental search',
                keys: {
                    mac: [
                        ['command', 'p']
                    ],
                    win: [
                        ['ctrl', 'p']
                    ]
                },
                action: function() {
                    toggle_incremental_search();
                }
            }]);
            
            $('body').append(_template({
                // pass data in here
            }));

            _dialog = $(_elementSelector);

            $(_dialog).on('shown.bs.modal', function() {
                $($(_inputsSelector)[0]).focus();
            });

            $(_dialog).on('hidden.bs.modal', function () {
                $(_elementSelector).modal('hide');
                $('.results p', _elementSelector).show();
                $(_inputsSelector).val('');
                $('.results_list', _elementSelector).html('');
                _dialogVisible = false;
            });

            // events:
            var entries = [];
            $(_inputsSelector).on('keyup', function(e) {
                $(_inputsSelector).map(function(index) {
                    entries.push($(this).val());
                });

                // eventually, do a search with these params:
                console.log({
                    username: entries[0],
                    // parentFolderName: entries[1],
                    // name: entries[2]
                    name: entries[1]
                });
            });

            console.log('notebook_tree_controller: ', notebook_tree_controller);
            //console.log('tree data: ', notebook_tree_controller.get_tree_data());
            console.log('tree data: ', editor);
            console.log('event: ', event);
        }
    };

    return result;
})();
    