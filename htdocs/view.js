function main() {
    Promise.longStackTraces();

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    RCloud.UI.init();
    RCloud.session.init(true).then(function() {
        shell.init();
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
        var versiontotag = false;
        if(!version && tag) {
            promise = promise.then(function() {
                return rcloud.get_version_by_tag(notebook, tag)
                    .then(function(v) {
                        version = v;
                    });
            });
        }
        else if(version && !tag) {
            promise = promise.then(function() {
                return rcloud.get_tag_by_version(notebook, version)
                    .then(function(t) {
                        tag = t;
                        if(tag)
                            versiontotag = true;
                    });
            });
        };
        promise = promise.then(function() {
            if(versiontotag) {
                var opts = {notebook: notebook, version: version, tag: tag};
                update_view_url(opts);
            }
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
    var make_view_url = ui_utils.url_maker('view.html');
    function update_view_url(opts) {
        var url = make_view_url(opts);
        window.history.replaceState("rcloud.notebook", null, url);
        rcloud.api.set_url(url);
    }
}
