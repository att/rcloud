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
                if (opts.notebook === null && getURLParameter("new_notebook"))
                    opts = {new_notebook: true};
                var promise = Promise.resolve(undefined);
                if (opts.notebook === null && getURLParameter("user")) {
                    promise = rcloud.get_notebook_by_name(getURLParameter("path"), getURLParameter("user"))
                        .then(function(result) {
                            opts.notebook = result[0];
                        });
                }
                var tag = getURLParameter("tag");
                if(!opts.version && tag) {
                    promise = promise.then(function() {
                        return rcloud.get_version_by_tag(opts.notebook, tag)
                            .then(function(version) {
                                opts.version = version;
                                if(version === null) {
                                    var message = "Tag [" + tag + "] in url is incorrect or doesn't exist. Please click Continue to load the most recent version of the notebook";
                                    var make_edit_url = ui_utils.url_maker('edit.html');
                                    RCloud.UI.fatal_dialog(message, "Continue", make_edit_url());
                                    return Promise.reject(new Error("attempted to load a notebook with tag which does not exist"));
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
