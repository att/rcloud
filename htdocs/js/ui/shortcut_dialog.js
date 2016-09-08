RCloud.UI.shortcut_dialog = (function() {

    var shortcuts_by_category_ = [];

    var result = {

        show: function() {

            $('#loading-animation').hide();

            var template_data = [];

            if(shortcuts_by_category_) {
                shortcuts_by_category_ = RCloud.UI.shortcut_manager.get_registered_shortcuts_by_category([
                'Code Editor',
                'Code Prompt',
                'Cell Management',
                'Notebook Management',
                'General']);
            }

            var get_key = function(key) {
                var replacement =  _.findWhere([
                    { initial: 'option', replace_with: 'opt' },
                    { initial: 'command', replace_with: 'cmd' }
                ], { initial : key });
              
                return replacement ? replacement.replace_with : key;
            };

            _.each(shortcuts_by_category_, function(group) {

                var key_group = {
                    name: group.category,
                    shortcuts: []
                };

                _.each(group.shortcuts, function(shortcut) {

                    var current_shortcut = {
                        description : shortcut.description,
                        keys: []
                    };
 
                    _.each(shortcut.bind_keys, function(keys) {
                        keys = _.map(keys, function(key) { 
                            return get_key(key);
                        });
                        current_shortcut.keys.push(keys.join(' '));
                    });

                    // are there any 'click +' shortcuts?
                    if(shortcut.click_keys) {
                        current_shortcut.keys.push({
                            keys: _.map(shortcut.click_keys.keys, function(key) { return get_key(key); }).join(' '),
                            target: shortcut.click_keys.target
                        });
                    }

                    key_group.shortcuts.push(current_shortcut);

                });

                template_data.push(key_group);
            });

            // generate dynamic content:
            var content_template = _.template(
                $("#shortcut_dialog_content_template").html()
            );

            var dialog_content = content_template({
                categories : template_data
            });

            $('#shortcut-content').html(dialog_content);
       
            $('#shortcut-dialog').modal({
                keyboard: false
            });
        }
    };

    return result;

})();
