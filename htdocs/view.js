function init_github_buttons() {
    $("#open-in-github").click(function() {
        shell.open_in_github();
    });
}

function view_init() {
    init_github_buttons();
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    rclient = RClient.create({
        debug: false,
        host: (location.protocol == "https:") ? ("wss://"+location.hostname+":8083/") : ("ws://"+location.hostname+":8081/"),
        on_connect: function(ocaps) {
            rcloud = RCloud.create(ocaps.rcloud);
            if (rcloud.authenticated) {
                rcloud.session_init(rcloud.username(), rcloud.github_token(), function(hello) {
                    rclient.post_response(hello);
                });
            } else {
                rcloud.anonymous_session_init(function(hello) {
                    rclient.post_response(hello);
                });
            }
            rcloud.display.set_device_pixel_ratio();
            $("#edit-notebook").click(function() {
                window.location = "main.html?notebook=" + shell.gistname();
            });
            rcloud.init_client_side_data();
            shell.init();
            var notebook = getURLParameter("notebook"),
                version = getURLParameter("version"),
                quiet = getURLParameter("quiet");
            if (Number(quiet)) {
                $(".navbar").hide();
                $("body").css("padding-top", "0");
            }
            shell.load_notebook(notebook, version, function() {
                if (Number(quiet)) {
                    $("#output > pre").first().hide();
                }
                rcloud.install_notebook_stylesheets(function() {
                    shell.notebook.controller.run_all(function() {
                        shell.notebook.controller.hide_r_source();
                    });
                    _.each(shell.notebook.view.sub_views, function(cell_view) {
                        cell_view.hide_buttons();
                    });
                });
            });
        }, on_error: function(msg, status_code) {
            debugger;
            if (msg == 'Login failed. Shutting down!') {
                window.location =
                    (window.location.protocol +
                     '//' + window.location.host +
                     '/login.R?redirect=' +
                     encodeURIComponent(window.location.pathname + window.location.search));
                return true;
            } else
                return false;
        }
    });
}

window.onload = view_init;
