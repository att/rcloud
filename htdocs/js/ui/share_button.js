RCloud.UI.share_button = (function() {
    var view_types_ = {};
    var default_item_ = null;
    function set_page(title) {
        title = (title && view_types_[title]) ? title : default_item_;
        if(!title)
            return Promise.reject(new Error('share button view types set up wrong'));
        var page = view_types_[title].page;
        $("#view-type li a").css("font-weight", function() {
            return $(this).text() === title ? "bold" : "normal";
        });
        var opts = {notebook: shell.gistname(),
                    do_path: view_types_[title].do_path,
                    version: shell.version()};
        if(!opts.version) {
            $("#share-link").attr("href", ui_utils.make_url(page, opts));
            return Promise.resolve(undefined);
        }
        else return rcloud.get_tag_by_version(shell.gistname(), opts.version)
            .then(function(t) {
                if(t)
                    opts.tag = t;
                $("#share-link").attr("href", ui_utils.make_url(page, opts));
            });
    }

    return {
        init: function() {
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
            for(var vt in view_types) {
                view_types_[vt] = _.extend({title: vt}, view_types[vt]);
            }
            return this;
        },
        remove: function(view_type) {
            delete view_types_[view_type];
        },
        load: function() {
            var that = this;
            var items = _.values(view_types_).sort(function(a, b) { return a.sort - b.sort; });
            default_item_ = items.length ? items[0].title : null;
            $('#view-type').append($(items.map(function(item) {
                var a = $.el.a({href: '#'}, item.title);
                $(a).click(function() {
                    rcloud.set_notebook_property(shell.gistname(), "view-type", item.title);
                    set_page(item.title);
                });
                return $.el.li(a);
            })));
            return this;
        },
        update_link: function() {
            return rcloud.get_notebook_property(shell.gistname(), "view-type")
                .then(set_page);
        }
    };
})();
