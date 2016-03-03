RCloud.UI.share_button = (function() {
    var extension_;
    var default_item_ = null;
    function set_page(title) {
        title = (title && extension_.get(title)) ? title : default_item_;
        var view_type = extension_.get(title);
        if(!title)
            return Promise.reject(new Error('share button view types set up wrong'));
        var page = view_type.page;
        $("#view-type li a").css("font-weight", function() {
            return $(this).text() === title ? "bold" : "normal";
        });
        var opts = {notebook: shell.gistname(),
                    do_path: view_type.do_path,
                    version: shell.version()};
        if(!opts.version) {
            RCloud.UI.navbar.control('shareable_link').set_url(ui_utils.make_url(page, opts));
            return Promise.resolve(undefined);
        }
        else return rcloud.get_tag_by_version(shell.gistname(), opts.version)
            .then(function(t) {
                if(t)
                    opts.tag = t;
                RCloud.UI.navbar.control('shareable_link').set_url(ui_utils.make_url(page, opts));
            });
    }

    return {
        init: function() {
            extension_ = RCloud.extension.create({
                defaults: {
                    create: function() {
                        var that = this;
                        return {
                            title: that.key,
                            handler: function() {
                                rcloud.set_notebook_property(shell.gistname(), "view-type", that.key);
                                set_page(that.key);
                            }
                        };
                    }
                }
            });
            this.add({
                'view.html': {
                    sort: 1000,
                    page: 'view.html'
                },
                'notebook.R': {
                    sort: 2000,
                    page: 'notebook.R',
                    do_path: true
                },
                'mini.html': {
                    sort: 3000,
                    page: 'mini.html'
                },
                'shiny.html': {
                    sort: 4000,
                    page: 'shiny.html'
                }
            });
            return this;
        },
        add: function(view_types) {
            if(extension_)
                extension_.add(view_types);
            return this;
        },
        remove: function(view_type) {
            if(extension_)
                extension_.remove(command_name);
            return this;
        },
        load: function() {
            var that = this;
            var items = extension_.create('all').array;
            default_item_ = items.length ? items[0].title : null;
            RCloud.UI.navbar.control('shareable_link').set_view_types(items);
            return this;
        },
        update_link: function() {
            return rcloud.get_notebook_property(shell.gistname(), "view-type")
                .then(set_page);
        }
    };
})();
