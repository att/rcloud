function main() {
    
    Promise.longStackTraces();

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    shell.is_view_mode(true);
    RCloud.UI.session_pane.init(); // really should be error logger which detects if there is a pane
    RCloud.UI.init();
    var notebook, version;

    RCloud.session.init(true).then(function() {
        return Promise.all([
            RCloud.UI.navbar.load(),
            (rcloud.config ?
             rcloud.config.get_user_option('show-cell-numbers') :
             Promise.resolve(true)).then(function(whether) {
                 if(whether === null) whether = true;
                 return shell.notebook.controller.show_cell_numbers(whether);
             })
        ]);
    }).then(function() {

        shell.init();
        RCloud.UI.advanced_menu.init();
        RCloud.UI.menus.load();
        RCloud.UI.shortcut_manager.load();
        notebook = getURLParameter("notebook");
        version = getURLParameter("version");
        var quiet = getURLParameter("quiet");

        var promise = Promise.resolve(true);

        if (Number(quiet)) {
            promise = promise.then(function() {
                $(".navbar").hide();
                $("body").css("padding-top", "0");
                $("<style type = 'text/css'>.cell-status { display: none; } .code-div pre { padding: 0; } </style>")
                    .appendTo('head');
                rcloud.api.disable_echo();
            });
        }

        if (notebook === null && getURLParameter("user")) {
            promise = promise.then(function() {
                return rcloud.get_notebook_by_name(getURLParameter("path"), getURLParameter("user"));
            }).then(function(result) {
                notebook = result[0];
            });
        }

        var tag = getURLParameter("tag");
        if(!version && tag) {
            promise = promise.then(function() {
                return rcloud.get_version_by_tag(notebook, tag)
                    .then(function(v) {
                        version = v;
                    });
            });
        };

        editor.load_everything().then(function(){
            RCloud.UI.discovery_page.init();
        });

        return promise;

    }).catch(function(err) {
        console.log(err.stack);
        shell.improve_load_error(err, notebook, version).then(function(msg) {
            if(/Notebook does not exist or has not been published/.test(msg))
                msg = ui_utils.disconnection_error("Could not load notebook. You may need to login to see it.", "Login");
            RCloud.UI.session_pane.post_error(msg);
        });
    });
}
