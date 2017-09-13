
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

            $(_dialog).on('hidden.bs.modal', function (e) {
                $(_elementSelector).modal('hide');
                $(_elementSelector).find('> p').show();
                $(_elementSelector).find('.results_list').html('');
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
                    parentFolderName: entries[1],
                    name: entries[2]
                });
            });
        }
    };

    return result;
})();
    