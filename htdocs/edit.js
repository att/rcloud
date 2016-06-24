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
                    opts.new_notebook = true;
                var source = getURLParameter("source");
                if(source) {
                    if(opts.notebook)
                        opts.source = source;
                    // otherwise, we can't do much - and we don't support user/path/tag yet
                }
                else {
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
                                });
                        });
                    };
                }
                return promise;
            }
            return undefined;
        }).then(shell.init.bind(shell))
            .then(editor.init.bind(editor, opts));
    }).catch(function(error) {

        RCloud.UI.shortcut_manager.disable_all();

        if (error.message === "Authentication required") {
            RCloud.UI.session_pane.post_error("Please login first!");
        } else
            RCloud.UI.session_pane.post_rejection(error);
    });
}
