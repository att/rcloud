RCloud.UI.menu_link = (function() {
    return {
        create: 

RCloud.UI.menu = (function() {
    return {
        create: function() {
            var extension_;
            return {
                init: function() {
                    extension_ = RCloud.extension.create({
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
                    if(!menu_items_[menu_item] || !menu_items_[menu_item].checkbox || !menu_items_[menu_item].checkbox_widget)
                        throw new Error('advanced menu check fail on ' + menu_item);
                    menu_items_[menu_item].checkbox_widget.set_state(check);
                },
                enable: function(menu_item, enable) {
                    if(!menu_items_[menu_item] || !menu_items_[menu_item].$li)
                        throw new Error('advanced menu disable fail on ' + menu_item);
                    menu_items_[menu_item].$li.toggleClass('disabled', !enable);
                },
                create: function(mode) {
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
        }
    };
})();

RCloud.UI.menus = (function() {
    var extension_;
    return {
        init: function() {
            extension_ = RCloud.extension.create({
            });
        },
        add: function(items) {
            extension_.add(items);
            return this;
        },
        remove: function(key) {
            extension_.remove(key);
            return this;
        },
        load: function(mode) {
            extension_.create(mode);
          <li class="dropdown">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown">Advanced <b class="caret"></b></a>
            <ul class="dropdown-menu" id="advanced-menu"></ul>
          </li>
            $('.navbar-right').prepend(
            for(
    }

