RCloud.UI.incremental_search = (function() { 
    
    var _template,
        _resultsTemplate,
        _elementSelector,
        _inputsSelector,
        _resultsSelector,
        _resultItemSelector,
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

            _template = _.template($('#tree-finder-template').html()),
            _resultsTemplate = _.template($('#tree-finder-result-template').html()),
            _elementSelector = '#tree-finder-dialog',
            _inputsSelector = _elementSelector + ' input',
            _resultsSelector = _elementSelector + ' .results',
            _resultItemSelector = _resultsSelector + '> p';
            _search_service = new notebook_tree_search_service();

            if(RCloud.search) {
                RCloud.UI.shortcut_manager.add([{
                    category: 'Incremental Search',
                    id: 'incremental_search',
                    description: 'Show incremental search',
                    keys: {
                        win_mac: [
                            ['alt', 's']
                        ]
                    },
                    action: function() {
                        toggle_incremental_search();
                    }
                }]);
            }
            
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

            $(_inputsSelector).on('keyup', function() {
                var entries = [];
                
                $(_inputsSelector).map(function(index) {
                    entries.push($(this).val());
                });

                if(_.any(entries, function(entry) { return entry.length; })) {
                    _search_service.get_results({
                        notebook: entries[0],
                        username: entries[1]                        
                    }).then(function(results) {
                        $(_resultsSelector).html(_resultsTemplate({
                            notebooks: results
                        }));
                    });
                } else {
                    $(_resultsSelector).html('');
                }
            });

            $(_resultsSelector).on('click', 'p', function() {

                var selected_id = $(this).data('id');

                rcloud.config.get_current_notebook().then(function(res) {
                    if(res.notebook !== selected_id) {
                        // todo: open notebook,
                        // (if it's a different ID from the current open notebook)
                        editor.load_notebook(selected_id);
                    }

                    $(_elementSelector).modal('hide');
                });

                
            })
        }
    };

    return result;
})();
    