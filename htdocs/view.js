function main() {
    Promise.longStackTraces();

    RCloud.UI.init();
    RCloud.session.init(true).then(function() {
        shell.init();
        var notebook = ui_utils.getURLParameter("notebook"),
            version = ui_utils.getURLParameter("version"),
            quiet = ui_utils.getURLParameter("quiet"),
            tag = ui_utils.getURLParameter("tag"),
            user = ui_utils.getURLParameter("user"),
            path = ui_utils.getURLParameter("path");

        var promise = Promise.resolve(true);
        if (Number(quiet)) {
            promise = promise.then(function() {
                $(".navbar").hide();
                $("body").css("padding-top", "0");
                rcloud.api.disable_echo();
            });
        }
        if(notebook === null && user) {
            promise = promise.then(function() {
                return rcloud.get_notebook_by_name(path, user);
            }).then(function(result) {
                notebook = result[0];
            });
        }

        if(!version && tag)
            return ui_utils.check_tag_exists('view.html', promise);

        promise = promise.then(function() {
            return shell.load_notebook(notebook, version).then(
                function(result) {
                    document.title = result.description + " - RCloud";
                }
            );
        }).then(function() {
            if (Number(quiet)) {
                $("#output > pre").first().hide();
            }
            rcloud.install_notebook_stylesheets().then(function() {
                shell.notebook.controller.run_all().then(function() {
                    shell.notebook.controller.hide_r_source();
                });
                _.each(shell.notebook.view.sub_views, function(cell_view) {
                    cell_view.hide_buttons();
                });
            });
        });
        return promise;
    }).catch(function(err) {
        console.log(err.stack);
        RCloud.UI.session_pane.post_error(ui_utils.disconnection_error("Could not load notebook. You may need to login to see it.", "Login"));
    });
}
