RCloud.UI.advanced_menu = (function() {
    var menu_items_ = {};
    return {
        init: function() {
            this.add({
                open_in_github: {
                    sort: 1000,
                    text: "Open in GitHub",
                    modes: ['view', 'edit'],
                    action: function() {
                        window.open(shell.github_url(), "_blank");
                    }
                },
                open_from_github: {
                    sort: 2000,
                    text: "Load Notebook by ID",
                    modes: ['edit'],
                    action: function() {
                        var result = prompt("Enter notebook ID or github URL:");
                        if(result !== null)
                            shell.open_from_github(result);
                    }
                },
                show_source: { // just here temporarily for refactoring
                    sort: 9000,
                    text: "Show Source",
                    checkbox: true,
                    value: true,
                    modes: ['view'],
                    action: function(value) {
                        if(value)
                            shell.notebook.controller.show_r_source();
                        else
                            shell.notebook.controller.hide_r_source();
                    }
                },
                publish_notebook: {
                    sort: 10000,
                    text: "Publish Notebook",
                    checkbox: true,
                    modes: ['edit'],
                    action: function(value) {
                        function publish_success(gistname, un) {
                            return function(val) {
                                if(!val)
                                    console.log("Failed to " + (un ? "un" : "") + "publish notebook " + gistname);
                            };
                        }
                        if(value) {
                            rcloud.publish_notebook(editor.current().notebook)
                                .then(publish_success(editor.current().notebook, false));
                        }
                        else {
                            rcloud.unpublish_notebook(editor.current().notebook)
                                .then(publish_success(editor.current().notebook, true));
                        }
                    }
                }
            });
            return this;
        },
        add: function(menu_items) {
            _.extend(menu_items_, menu_items);
            return this;
        },
        remove: function(menu_item) {
            delete menu_items_[menu_item];
        },
        check: function(menu_item, check) {
            if(!menu_items_[menu_item] || !menu_items_[menu_item].checkbox || !menu_items_[menu_item].checkbox_widget)
                throw new Error('advanced menu check fail on ' + menu_item);
            menu_items_[menu_item].checkbox_widget.set_state(check);
        },
        enable: function(menu_item, enable) {
            if(!menu_items_[menu_item] || !menu_items_[menu_item].$li)
                throw new Error('advanced menu disable fail on ' + menu_item);
            menu_items_[menu_item].$li.toggleClass('disabled', !enable);
        },
        load: function(mode) {
            var that = this;
            // copy in, because we need extra fields
            for(var key in menu_items_)
                menu_items_[key] = _.extend({id: key}, menu_items_[key]);
            mode = mode || (shell.is_view_mode() ? 'view' : 'edit');
            var items = _.filter(menu_items_, function(item) { return item.modes.indexOf(mode)>=0; });
            items.sort(function(a, b) { return a.sort - b.sort; });
            // this is a mess. but it's a contained mess, right? (right?)
            $('#advanced-menu').append($(items.map(function(item) {
                var ret, $ret;
                if(item.checkbox) {
                    $ret = $(ret = $.el.li($.el.a({href: '#', id: item.id}, $.el.i({class: 'icon-check'}), '\xa0', item.text)));
                    item.checkbox_widget = ui_utils.checkbox_menu_item($ret, function() {
                        item.action(true);
                    }, function() {
                        item.action(false);
                    });
                    if(item.value)
                        item.checkbox_widget.set_state(item.value);
                }
                else $ret = $(ret = $.el.li($.el.a({href: '#', id: item.id}, item.text)));
                item.$li = $ret;
                return ret;
            })));
            $('#advanced-menu li a').click(function() {
                var item = menu_items_[this.id];
                if(!item)
                    throw new Error('bad id in advanced menu');
                if(!item.checkbox)
                    item.action();
            });
            return this;
        },
        update_link: function() {
            return rcloud.get_notebook_property(shell.gistname(), "view-type")
                .then(set_page);
        }
    };
})();
