function main() {
    Promise.longStackTraces();

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    RCloud.UI.init();
    RCloud.session.init().then(function() {
        if(!rcloud.search)
            $("#search-wrapper").text("Search engine not enabled on server");
        var opts = {};
        var promise = Promise.cast(true);
        if (location.search.length > 0) {
            opts.notebook = getURLParameter("notebook");
            opts.version = getURLParameter("version");
            if (opts.notebook === null && getURLParameter("new_notebook"))
                opts = {new_notebook: true};
            if (opts.notebook === null && getURLParameter("user")) {
                 promise = promise.then(function() {
                     return rcloud.get_notebook_by_name(getURLParameter("path"), getURLParameter("user"));
                 }).then(function(result) {
                     opts.notebook = result[0];
                 });
            }
        }
        promise = promise.then(shell.init.bind(shell))
            .then(editor.init.bind(editor, opts));
        RCloud.UI.load(promise);
    }).catch(function(error) {
        if (error.message === "Authentication required") {
            RCloud.UI.session_pane.post_error(ui_utils.disconnection_error("Please login first!"));
        } else
            throw error;
    });
}
