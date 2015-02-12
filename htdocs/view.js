function main() {
    Promise.longStackTraces();

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    shell.is_view_mode(true);
    RCloud.UI.init();
    RCloud.session.init(true).then(function() {
        shell.init();
        RCloud.UI.advanced_menu.load();
        var notebook = getURLParameter("notebook"),
            version = getURLParameter("version"),
            quiet = getURLParameter("quiet");

        var promise = Promise.resolve(true);
        if (Number(quiet)) {
            promise = promise.then(function() {
                $(".navbar").hide();
                $("body").css("padding-top", "0");
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
            });
        });
        return promise;
    }).catch(function(err) {
        console.log(err.stack);
        RCloud.UI.session_pane.post_error(ui_utils.disconnection_error("Could not load notebook. You may need to login to see it.", "Login"));
    });
}
