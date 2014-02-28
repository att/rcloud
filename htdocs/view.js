Promise.longStackTraces();

window.onload = function() {
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }
    RCloud.UI.init();
    RCloud.session.init(true).then(function() {
        shell.init();
        var notebook = getURLParameter("notebook"),
        version = getURLParameter("version"),
        quiet = getURLParameter("quiet");
        if (Number(quiet)) {
            $(".navbar").hide();
            $("body").css("padding-top", "0");
            rcloud.api.disable_echo();
        }
        shell.load_notebook(notebook, version).then(function() {
            if (Number(quiet)) {
                $("#output > pre").first().hide();
            }
            rcloud.install_notebook_stylesheets().then(function() {
                debugger;
                shell.notebook.controller.run_all().then(function() {
                    shell.notebook.controller.hide_r_source();
                });
                _.each(shell.notebook.view.sub_views, function(cell_view) {
                    cell_view.hide_buttons();
                });
            });
        }).catch(function(err) {
            rclient.post_error(rclient.disconnection_error("Could not load notebook. Maybe you do not have permission to see it.", "Login"));
        });
    });
};
