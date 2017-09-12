
RCloud.UI.incremental_search = (function() { 
    
    var _template = _.template($('#incremental_search_template').html()),
        _elementSelector = '#incremental_search';

    function toggle_incremental_search() {
        var $el = $(_elementSelector);
        if($el.length) {
            $el.remove();
        } else {
            $('body').append(_template({
                // pass data in here
            }));
        }
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
        }
    };

    return result;
})();
    