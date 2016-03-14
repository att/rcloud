RCloud.UI.shortcut_manager = (function() {

    var extension_, 
        shortcuts_ = [],
        shortcuts_changed = false;

    function convert_extension(shortcuts) {
        var shortcuts_to_add, obj = {};

        if(!_.isArray(shortcuts)) {
            shortcuts_to_add = [shortcuts];
        } else {
            shortcuts_to_add = shortcuts;
        }

        // if this is not a mac, filter out the command items:
        _.each(shortcuts_to_add, function(shortcut) {

            var can_add = true;

            var shortcut_to_add = _.defaults(shortcut, {
                category: 'General'
            });

            // if this is not a mac, filter out the 'command' options:
            if(!ui_utils.is_a_mac()) {
                shortcut.keys = _.reject(shortcut.keys, function(keys) {
                    return _.contains(keys, 'command');
                });
            } else {
                // this is a mac; if this shortcut has a command AND a ctrl, remove the ctrl
                if(_.contains(shortcut.keys, 'command') && _.contains(shortcut.keys, 'ctrl')) {
                    shortcut.keys = _.reject(shortcut.keys, function(keys) {
                        return _.contains(keys, 'ctrl');
                    });
                }
            }

            // if this is a shortcut that needs to be added:
            if(!_.isUndefined(shortcut.keys) && shortcut.keys.length) {

                shortcut_to_add.key_bindings = [];

                // construct the key bindings:
                for (var i = 0; i < shortcut.keys.length; i++) {
                    
                    // ensure consistent order across definitions:
                    var keys = _
                        .chain(shortcut.keys[i])
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
                    shortcut_to_add.key_bindings.push(keys.join('+'));
                }

                // with existing shortcuts:
                for(var loop = 0; loop < shortcuts_.length; loop++) {
                    if(_.intersection(shortcuts_.key_bindings, shortcut_to_add.key_bindings).length > 0) {
                        console.warn('Keyboard shortcut "' + shortcut_to_add.description + '" cannot be registered since it will clash with an existing shortcut.');
                        can_add = false;
                        break;
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
                            _.each(shortcut_to_add.key_bindings, function(binding) {
                                window.Mousetrap(document.querySelector('body')).bind(binding, function(e) { 
                                    e.preventDefault(); 
                                    shortcut.action();
                                });
                            });
                        }
                    }
                }

                if(can_add) {
                    shortcuts_.push(shortcut_to_add);
                    obj[shortcut.id] = shortcut_to_add;
                }
            }
        });

        return obj;
    }

    var result = {
        init: function() {
            extension_ = RCloud.extension.create({

            });

            var items = [{
                
            }];

            this.add(items);

            return this;

        },
        add: function(s) {
            if(extension_) {
                extension_.add(convert_extension(s));
                shortcuts_changed = true;
            }

            return this;
        },
        load: function() {
            if(extension_) {
                extension_.create('all');
            }
        },
        shortcuts_changed: function() {
            return shortcuts_changed;
        },
        get_registered_shortcuts: function() {
            shortcuts_changed = false;
            return shortcuts_;
        },
        get_registered_shortcuts_by_category: function() {
            shortcuts_changed = false;

            return _.map(_.chain(shortcuts_).groupBy('category').value(), function(item, key) {
                return { category: key, shortcuts: item }
            });
        }
    };

    return result;
})();