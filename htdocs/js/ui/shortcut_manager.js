RCloud.UI.shortcut_manager = (function() {

    var extension_;

    function get_by_id(id) {
        return _.find(extension_.sections.all.entries, function(s) {
            return s.id === id;
        });
    };

    function modify(ids, func) {
        if (!_.isArray(ids)) {
            ids = [ids];
        }

        _.each(ids, function(id) {
            var shortcut = get_by_id(id);
            if (shortcut) {
                func(shortcut);
            }
        });
    };

    function is_active(shortcut) {
        return shortcut.enabled && _.contains(shortcut.modes, shell.notebook.model.read_only() ? 'readonly' : 'writeable');
    }

    function convert_extension(shortcuts) {
        var shortcuts_to_add, obj = {};
        var existing_shortcuts = extension_.sections.all.entries;

        if (!_.isArray(shortcuts)) {
            shortcuts_to_add = [shortcuts];
        } else {
            shortcuts_to_add = shortcuts;
        }

        _.each(shortcuts_to_add, function(shortcut) {

            var can_add = true;

            var shortcut_to_add = _.defaults(shortcut, {
                category: 'General',
                modes: ['writeable', 'readonly'],
                ignore_clash: false,
                enable_in_dialogs: false,
                enabled: true
            });

            // clean-up:
            var is_mac = true; //ui_utils.is_a_mac();

            if (shortcut.keys.hasOwnProperty('win_mac')) {
                shortcut.bind_keys = shortcut.keys.win_mac;
            } else {
                shortcut.bind_keys = shortcut.keys[is_mac ? 'mac' : 'win'];
            }

            // if this is a shortcut that needs to be added:
            if (shortcut.bind_keys && shortcut.bind_keys.length) {

                shortcut_to_add.key_desc = [];

                // construct the key bindings:
                for (var i = 0; i < shortcut.bind_keys.length; i++) {

                    // ensure consistent order across definitions:
                    var bind_keys = _
                        .chain(shortcut.bind_keys[i])
                        .map(function(element) {
                            return element.toLowerCase(); })
                        .sortBy(function(element) {
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
                if (!shortcut_to_add.ignore_clash) {
                    for (var loop = 0; loop < existing_shortcuts.length; loop++) {

                        if (existing_shortcuts[loop].ignore_clash)
                            continue;

                        if (_.intersection(existing_shortcuts[loop].key_desc, shortcut_to_add.key_desc).length > 0) {
                            console.warn('Keyboard shortcut "' + shortcut_to_add.description +
                                '" cannot be registered because its keycode clashes with an existing shortcut id "' +
                                existing_shortcuts[loop].id + '" in the "' + existing_shortcuts[loop].category + '" category.');
                            can_add = false;
                            break;
                        }
                    }
                }

                if (can_add) {

                    if (_.isUndefined(shortcut.action)) {
                        shortcut_to_add.create = function() {};
                    } else {
                        shortcut_to_add.create = function() {
                            _.each(shortcut_to_add.key_desc, function(binding) {

                                var func_to_bind = function(e) {

                                    if (is_active(get_by_id(shortcut_to_add.id))) {
                                        e.preventDefault();

                                        // invoke if conditions are met:
                                        if ((shortcut.enable_in_dialogs && $('.modal').is(':visible')) ||
                                            !$('.modal').is(':visible')) {
                                            shortcut.action(e);
                                        }

                                    }
                                };

                                if (shortcut_to_add.global) {
                                    window.Mousetrap.bindGlobal(binding, func_to_bind);
                                } else {
                                    window.Mousetrap().bind(binding, func_to_bind);
                                }

                            });
                        }
                    }

                    if (can_add) {
                        obj[shortcut.id] = shortcut_to_add;

                        // add to the existing shortcuts so that it can be compared:
                        existing_shortcuts.push(shortcut_to_add);
                    }

                }
            }
        });

        return obj;
    };

    var result = {

        init: function() {

            // based on https://craig.is/killing/mice#api.stopCallback
            window.Mousetrap.prototype.stopCallback = function(e, element, combo) {

                // this only executes if the shortcut is *not* defined as global
                var search_values = ['mousetrap', 'ace_text-input'],
                    has_modifier = e.metaKey || e.ctrlKey || e.altKey;

                // allow the event to be handled:
                if (has_modifier && search_values.some(function(v) {
                        return (' ' + element.className + ' ').indexOf(' ' + v + ' ') > -1;
                    }))
                    return false;

                // prevent on form fields and content editables:
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
            if (extension_) {
                extension_.add(convert_extension(s));
            }

            return this;
        },
        load: function() {
            if (extension_) {
                extension_.create('all');
            }
        },
        disable: function(ids) {
            modify(ids, function(s) {
                s.enabled = false;
            });
        },
        enable: function(ids) {
            modify(ids, function(s) {
                s.enabled = true;
            });
        },
        get_registered_shortcuts_by_category: function(sort_items) {

            //console.log(extension_.sections.all.entries);

            var rank = _.map(sort_items, (function(item, index) {
                return { key: item, value: index + 1 } }));
            rank = _.object(_.pluck(rank, 'key'), _.pluck(rank, 'value'));

            var available_shortcuts = _.filter(_.sortBy(extension_.sections.all.entries, function(shortcut) {
                    return shortcut.category + shortcut.description; }),
                function(s) {
                    return is_active(s); });

            return _.sortBy(_.map(_.chain(available_shortcuts).groupBy('category').value(), function(item, key) {
                return { category: key, shortcuts: item };
            }), function(group) {
                return rank[group.category];
            });
        }
    };

    return result;
})();
