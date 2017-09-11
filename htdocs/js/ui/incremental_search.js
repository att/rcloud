
RCloud.UI.incremental_search = (function() { 
    
    function toggle_incremental_search() {
        
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
    