RCloud.UI.share_button = (function() {
    var view_types_ = {};
    var default_page_ = null;
    function set_page(page) {
        page = (page && view_types_[page]) ? page : default_page_;
        if(!page)
            return Promise.reject(new Error('share button view types set up wrong'));
        $("#view-type li a").css("font-weight", function() {
            return $(this).text() === page ? "bold" : "normal";
        });
        var opts = {notebook: shell.gistname(),
                    do_path: view_types_[page].do_path,
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
            _.extend(view_types_, view_types);
            return this;
        },
        remove: function(view_type) {
            delete view_types_[view_type];
        },
        load: function() {
            var that = this;
            var items = _.values(view_types_).sort(function(a, b) { return a.sort - b.sort; });
            default_page_ = items.length ? items[0].page : null;
            $('#view-type').append($(items.map(function(item) {
                return $.el.li($.el.a({href: '#'}, item.page));
            })));
            $('.view-menu li a').click(function() {
                var page = $(this).text();
                rcloud.set_notebook_property(shell.gistname(), "view-type", page);
                set_page(page);
            });
            return this;
        },
        update_link: function() {
            return rcloud.get_notebook_property(shell.gistname(), "view-type")
                .then(set_page);
        }
    };
})();
