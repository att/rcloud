function main() {
    Promise.longStackTraces();

    RCloud.UI.init();
    RCloud.session.init().then(function() {
        var opts = {};
        return RCloud.UI.load_options().then(function() {
            if(location.search.length > 0) {
                var notebook = ui_utils.getURLParameter("notebook"),
                    new_notebook = ui_utils.getURLParameter("new_notebook"),
                    version = ui_utils.getURLParameter("version"),
                    quiet = ui_utils.getURLParameter("quiet"),
                    tag = ui_utils.getURLParameter("tag"),
                    user = ui_utils.getURLParameter("user"),
                    path = ui_utils.getURLParameter("path");

                opts.notebook = notebook;
                opts.version = version;
                if(opts.notebook === null && new_notebook)
                    opts = {new_notebook: true};
                var promise = Promise.resolve(undefined);
                if(opts.notebook === null && user) {
                    promise = rcloud.get_notebook_by_name(path, user)
                        .then(function(result) {
                            opts.notebook = result[0];
                        });
                }
                if(!opts.version && tag) {
                    promise = promise.then(function() {
                        return rcloud.get_version_by_tag(opts.notebook, tag)
                            .then(function(v) {
                                if(v === null) {
                                    ui_utils.check_tag_exists('edit.html', opts.notebook);
                                    return Promise.reject(new Error("Attempt to load a notebook with tag which does not exist."));
                                } else {
                                    opts.version = v;
                                }
                            });
                    });
                };
                return promise;
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
