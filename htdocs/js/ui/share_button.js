RCloud.UI.share_button = (function() {
    var type_;

    return {
        init: function() {
            var that = this;
            $('.view-menu li a').click(function() {
                type_ = $(this).text();
                rcloud.set_notebook_property(shell.gistname(), "view-type", type_);
                that.type(type_);
            });
        },
        type: function(val) {
            if(!arguments.length) return type_;
            type_ = val || "view.html";
            $("#view-type li a").css("font-weight", function() {
                return $(this).text() === type_ ? "bold" : "normal";
            });
            this.update_link();
            return this;
        },
        update_link: function() {
            var link = window.location.protocol + '//' + window.location.host + '/';
            var suffix, query_started = true;
            switch(type_) {
            case 'notebook.R':
                suffix = type_ + '/' + shell.gistname();
                query_started = false;
                break;
            case 'mini.html':
                suffix = type_ + '?notebook=' + shell.gistname();
                break;
            case 'shiny.html':
                suffix = type_ + '?notebook=' + shell.gistname();
                break;
            case 'view.html':
            default:
                suffix = 'view.html?notebook=' + shell.gistname();
            }
            link += suffix;
            var v = shell.version();
            rcloud.get_tag_by_version(shell.gistname(),shell.version())
                .then(function(t){
                    if(t)
                        link += (query_started?'&':'?') + 'tag=' + t;
                    else if(v)
                        link += (query_started?'&':'?') + 'version=' + v;
                    $("#share-link").attr("href", link);
                });
        }
    };
})();
