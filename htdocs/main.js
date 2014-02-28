Promise.longStackTraces();

window.onload = function() {
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    RCloud.UI.init();
    RCloud.session.init().then(function() {
        var notebook = null, version = null;
        if (location.search.length > 0) {
            notebook = getURLParameter("notebook");
            version = getURLParameter("version");
        }
        shell.init();
        editor.init(notebook, version);
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
