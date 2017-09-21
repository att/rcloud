
RCloud.UI.incremental_search = (function() { 
    
    var _template = _.template($('#tree-finder-template').html()),
        _resultsTemplate = _.template($('#tree-finder-result-template').html()),
        _elementSelector = '#tree-finder-dialog',
        _inputsSelector = _elementSelector + ' input',
        _resultsSelector = _elementSelector + ' .results',
        _dialogVisible = false,
        _dialog = undefined,
        _search_service = new notebook_tree_search_service();

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
                $(_inputsSelector).val('');
                $(_resultsSelector).html('');
                _dialogVisible = false;
            });

            // events:
            $(_inputsSelector).on('keyup', function(e) {
                var entries = [];
                
                $(_inputsSelector).map(function(index) {
                    entries.push($(this).val());
                });

                if(_.any(entries, function(entry) { return entry.length; })) {
                    _search_service.get_results({
                        username: entries[0],
                        notebook: entries[1]
                    }).then(function(results) {
                        $(_resultsSelector).html(_resultsTemplate({
                            notebooks: results
                        }));
                    });
                } else {
                    $(_resultsSelector).html('');
                }
            });
        }
    };

    return result;
})();
    