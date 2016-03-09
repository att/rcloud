RCloud.UI.shortcut_manager = (function() {

    var extension_, shortcuts_ = [];
    var shortcuts_changed = false;

    function convert_extension(shortcuts) {
        var shortcuts_to_add, obj = {};

        if(!_.isArray(shortcuts)) {
            shortcuts_to_add = [shortcuts];
        } else {
            shortcuts_to_add = shortcuts;
        }

        _.each(shortcuts_to_add, function(shortcut) {

            var can_add = true;

            if(!_.isUndefined(shortcut.bindings) && !_.isUndefined(shortcut.action)) {

                // verify that the shortcut doesn't already exist:
                for(var loop = 0; loop < shortcuts_.length; loop++) {
                    if(_.intersection(shortcuts_[loop].bindings, shortcut.bindings).length > 0) {
                        console.warn('Keyboard shortcut "' + shortcut.description + '" cannot be registered since it will clash with existing "' + 
                            shortcuts_[loop].description + '" shortcut.');
                        can_add = false;
                        break;
                    }
                }

                shortcut.create = function() { 
                    window.Mousetrap(document.querySelector('body')).bind(shortcut.bindings.length === 1 ? shortcut.bindings[0] : shortcut.bindings, function(e) { 
                        e.preventDefault(); 
                        shortcut.action();
                    });
                };
            } else {
                shortcut.create = function() {};    // this is a shortcut that has been created through other means and is used solely for documentation
            }

            if(can_add) {
                shortcuts_.push(shortcut);
            }

            obj[shortcut.id] = shortcut;
        });

        return obj;
    }

    var result = {
        init: function() {
            extension_ = RCloud.extension.create({

            });

            var items = [{
                category: 'Ace Editor',
                id: 'ace_do_something_or_another',
                bindings: ['^'],
                description: 'This will completely refactor your code and make it amazing'
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
            var grouped = _.chain(shortcuts_).groupBy('category').value();

            return _.map(grouped, function(item, key) {
                return { category: key, shortcuts: item }
            });
        }
    };

    return result;
})();