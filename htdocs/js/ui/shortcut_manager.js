RCloud.UI.shortcut_manager = (function() {

    var extension_;

    function is_active(shortcut) {
        return _.contains(shortcut.modes, shell.notebook.model.read_only() ? 'readonly' : 'writeable');
    }

    function convert_extension(shortcuts) {
        var shortcuts_to_add, obj = {};
        var existing_shortcuts = extension_.sections.all.entries;

        if(!_.isArray(shortcuts)) {
            shortcuts_to_add = [shortcuts];
        } else {
            shortcuts_to_add = shortcuts;
        }

        _.each(shortcuts_to_add, function(shortcut) {

            var can_add = true;

            var shortcut_to_add = _.defaults(shortcut, {
                category: 'General',
                modes: ['writeable', 'readonly'],
                ignore_clash: false
            });

            // clean-up:
            var is_mac = ui_utils.is_a_mac();

            if(shortcut.keys.hasOwnProperty('win_mac')) {
                shortcut.bind_keys = shortcut.keys.win_mac;
            } else {
                shortcut.bind_keys = shortcut.keys[is_mac ? 'mac': 'win'];
            }

            // if this is a shortcut that needs to be added:
            if(shortcut.bind_keys && shortcut.bind_keys.length) {

                shortcut_to_add.key_desc = [];

                // construct the key bindings:
                for (var i = 0; i < shortcut.bind_keys.length; i++) {
                    
                    // ensure consistent order across definitions:
                    var bind_keys = _
                        .chain(shortcut.bind_keys[i])
                        .map(function(element) { return element.toLowerCase(); })
                        .sortBy(function(element){  
                          var rank = {
                              "command": 1,
                              "ctrl": 2,
                              "shift": 3
                          };
                          return rank[element];
                      }).value();

                    // so that they can be compared:
                    shortcut_to_add.key_desc.push(bind_keys.join('+'));
                }

                // with existing shortcuts:
                if(!shortcut_to_add.ignore_clash) {
                    for(var loop = 0; loop < existing_shortcuts.length; loop++) {

                        if(existing_shortcuts[loop].ignore_clash)
                            continue;

                        if(_.intersection(existing_shortcuts[loop].key_desc, shortcut_to_add.key_desc).length > 0) {
                            console.warn('Keyboard shortcut "' + shortcut_to_add.description + 
                                '" cannot be registered because its keycode clashes with an existing shortcut id "' + 
                                existing_shortcuts[loop].id  + '" in the "' + existing_shortcuts[loop].category + '" category.');
                            can_add = false;
                            break;
                        }
                    }
                }

                if(can_add) {

                    // update any 'command' entries to the '⌘' key:
                    /*
                    _.each(shortcut_to_add.keys, function(keys){
                        for(var keyLoop = 0; keyLoop < keys.length; keyLoop++) {
                            if(keys[keyLoop] === 'command') {
                                keys[keyLoop] = '&#8984;';
                            }
                        }
                    });*/

                    if(_.isUndefined(shortcut.action)){
                        shortcut_to_add.create = function() {};
                    }
                    else {
                        shortcut_to_add.create = function() { 
                            _.each(shortcut_to_add.key_desc, function(binding) {
                                window.Mousetrap(document.querySelector('body')).bind(binding, function(e) { 

                                    if(!is_active(shortcut_to_add)) {
                                        return;
                                    } else {
                                        e.preventDefault(); 
                                        shortcut.action();
                                    }

                                });
                            });
                        }
                    }
                }

                if(can_add) {
                    obj[shortcut.id] = shortcut_to_add;

                    // add to the existing shortcuts so that it can be compared:
                    existing_shortcuts.push(shortcut_to_add);
                }
            }
        });

        return obj;
    }

    var result = {
        init: function() {

            // based on https://craig.is/killing/mice#api.stopCallback
            window.Mousetrap.prototype.stopCallback = function(e, element, combo) {

                // if the element has the class "mousetrap" then no need to stop
                if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
                    return false;
                }

                return (element.tagName == 'INPUT' && element.type !== 'checkbox') || 
                       element.tagName == 'SELECT' || 
                       element.tagName == 'TEXTAREA' || 
                       (element.contentEditable && element.contentEditable == 'true');
            };

            extension_ = RCloud.extension.create({

            });

            this.add([]);

            return this;
        },
        add: function(s) {
            if(extension_) {
                extension_.add(convert_extension(s));
            }

            return this;
        },
        load: function() {
            if(extension_) {
                extension_.create('all');
            }
        },
        get_registered_shortcuts_by_category: function(sort_items) {

            var rank = _.map(sort_items, (function(item, index) { return { key: item, value: index + 1 }}));
            rank = _.object(_.pluck(rank, 'key'), _.pluck(rank, 'value'));   
  
            var available_shortcuts = _.filter(extension_.sections.all.entries, function(s) { return is_active(s); });

            return _.sortBy(_.map(_.chain(available_shortcuts).groupBy('category').value(), function(item, key) {
                return { category: key, shortcuts: item }
            }), function(group) {
                return rank[group.category];
            });
        }
    };

    return result;
})();