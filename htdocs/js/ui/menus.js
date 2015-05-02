RCloud.UI.menu = (function() {
    var mode_sections_, ui_mode_;
    return {
        filter_mode: function(mode) {
            return function(entry) {
                return entry.modes.indexOf(mode)>=0;
            };
        },
        mode_sections: function(_) {
            if(!arguments.length) {
                if(!mode_sections_)
                    mode_sections_ = {
                        view: {
                            filter: RCloud.UI.menu.filter_mode('view')
                        },
                        edit: {
                            filter: RCloud.UI.menu.filter_mode('edit')
                        }
                    };
                return mode_sections_;
            }
            mode_sections_ = _;
            return this;
        },
        ui_mode: function(_) {
            // this doesn't really belong here but the rest of RCloud doesn't
            // support modes beyond a bool right now anyway.
            if(!arguments.length)
                return ui_mode_ || (shell.is_view_mode() ? 'view' : 'edit');
            ui_mode_ = _;
            return this;
        },
        create: function() {
            var extension_;
            return {
                init: function() {
                    extension_ = RCloud.extension.create({
                        sections: RCloud.UI.menu.mode_sections()
                    });
                },
                add: function(menu_items) {
                    if(extension_)
                        extension_.add(menu_items);
                    return this;
                },
                remove: function(menu_item) {
                    extension_.remove(menu_item);
                    return this;
                },
                check: function(menu_item, check) {
                    var item = extension_.get(menu_item);
                    if(!item || !item.checkbox || !item.checkbox_widget)
                        throw new Error('menu check fail on ' + menu_item);
                    item.checkbox_widget.set_state(check);
                    return this;
                },
                enable: function(menu_item, enable) {
                    var item = extension_.get(menu_item);
                    if(!item || !item.$li)
                        throw new Error('menu disable fail on ' + menu_item);
                    item.$li.toggleClass('disabled', !enable);
                    return this;
                },
                create_checkbox: function(item) {
                    // this is a mess. but it's a contained mess, right? (right?)
                    var ret = $.el.li($.el.a({href: '#', id: item.key}, $.el.i({class: 'icon-check'}), '\xa0', item.text));
                    item.checkbox_widget = ui_utils.checkbox_menu_item($(ret), function() {
                        item.action(true);
                    }, function() {
                        item.action(false);
                    });
                    if(item.value)
                        item.checkbox_widget.set_state(item.value);
                    return ret;
                },
                create_link: function(item) {
                    var ret = $.el.li($.el.a({href: '#', id: item.key}, item.text));
                    return ret;
                },
                create: function(elem) {
                    var that = this;
                    var menu = $('<ul class="dropdown-menu"></ul>');
                    elem.append(menu);
                    var items = extension_.entries(RCloud.UI.menu.ui_mode());
                    menu.append($(items.map(function(item) {
                        var elem;
                        if(item.checkbox)
                            elem = that.create_checkbox(item);
                        else
                            elem = that.create_link(item);
                        item.$li = $(elem);
                        return elem;
                    })));
                    menu.find('li a').click(function() {
                        var item = extension_.get(this.id);
                        if(!item)
                            throw new Error('bad id in advanced menu');
                        if(!item.checkbox)
                            item.action();
                    });
                    return this;
                }
            };
        }
    };
})();

RCloud.UI.menus = (function() {
    var extension_;
    return {
        init: function() {
            extension_ = RCloud.extension.create({
                sections: RCloud.UI.menu.mode_sections()
            });
            this.add({
                logout_divider: {
                    sort: 10000,
                    type: 'divider',
                    modes: ['edit']
                },
                logout: {
                    sort: 12000,
                    type: 'link',
                    href: '/logout.R',
                    text: 'Logout',
                    modes: ['edit']
                }
            });        },
        add: function(items) {
            extension_.add(items);
            return this;
        },
        remove: function(key) {
            extension_.remove(key);
            return this;
        },
        create_menu: function(item) {
            var ret = $.el.li({class: 'dropdown'},
                              $.el.a({href: '#', class: 'dropdown-toggle', 'data-toggle': 'dropdown'},
                                     item.title + ' ',
                                     $.el.b({class:"caret"})));
            item.menu.create($(ret));
            return ret;
        },
        create_link: function(item) {
            var ret = $.el.li($.el.a({href: item.href}, item.text));
            return ret;
        },
        create_divider: function(item) {
            return $.el.li({class: 'divider-vertical'});
        },
        load: function(mode) {
            var that = this;
            var where = $('#rcloud-navbar-menu');
            var entries = extension_.entries(RCloud.UI.menu.ui_mode());
            var items = $(entries.map(function(item) {
                switch(item.type) {
                case 'divider': return that.create_divider();
                case 'menu': return that.create_menu(item);
                case 'link': return that.create_link(item);
                default: throw new Error('unknown navbar menu entry type ' + item.type);
                }
            }));
            where.append(items);
            return this;
        }
    };
})();


