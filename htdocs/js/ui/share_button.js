RCloud.UI.share_button = (function() {
    function set_page(page) {
        page = page || "view.html";
        $("#view-type li a").css("font-weight", function() {
            return $(this).text() === page ? "bold" : "normal";
        });
        var opts = {notebook: shell.gistname(),
                    do_path: page === 'notebook.R',
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
            var that = this;
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
