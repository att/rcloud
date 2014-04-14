Promise.longStackTraces();

window.onload = function() {
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    RCloud.UI.init();
    RCloud.session.init().then(function() {
        RCloud.UI.load();
        if(!rcloud.search)
            $("#search").text("Search engine not enabled on server");
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
        promise.then(function() {
            shell.init();
            editor.init(opts);
        });
        /*
         // disabling navigation for now - concurrency issues
         window.addEventListener("popstate", function(e) {
         if(e.state === "rcloud.notebook") {
         var notebook2 = getURLParameter("notebook");
         var version2 = getURLParameter("version");
         editor.load_notebook(notebook2, version2, true, false);
         }
         });
         */
    });
};
