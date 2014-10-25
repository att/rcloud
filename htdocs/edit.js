function main() {
    Promise.longStackTraces();

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    RCloud.UI.init();
    RCloud.session.init().then(function() {
        var opts = {};
        return RCloud.UI.load_options().then(function() {
            if (location.search.length > 0) {
                opts.notebook = getURLParameter("notebook");
                opts.version = getURLParameter("version");
                opts.tag = getURLParameter("tag");
                if (opts.notebook === null && getURLParameter("new_notebook"))
                    opts = {new_notebook: true};
                if (opts.notebook === null && getURLParameter("user")) {
                    return rcloud.get_notebook_by_name(getURLParameter("path"), getURLParameter("user"))
                        .then(function(result) {
                            opts.notebook = result[0];
                        });
                }
            }
            return undefined;
        }).then(shell.init.bind(shell))
            .then(editor.init.bind(editor, opts));
    }).catch(function(error) {
        if (error.message === "Authentication required") {
            RCloud.UI.session_pane.post_error(ui_utils.disconnection_error("Please login first!"));
        } else
            RCloud.UI.session_pane.post_rejection(error);
    });
}
