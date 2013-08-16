function view_init() {
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    rclient = RClient.create({
        debug: false,
        host: (location.protocol == "https:") ? ("wss://"+location.hostname+":8083/") : ("ws://"+location.hostname+":8081/"),
        on_connect: function() {
            $("#view-source").click(function() {
                window.location = "main.html?notebook=" + shell.gistname();
            });
            rcloud.init_client_side_data();
            var notebook = getURLParameter("notebook"),
                version = getURLParameter("version");
            shell.load_notebook(notebook, version, function() {
                shell.notebook.controller.run_all();
                _.each(shell.notebook.view.sub_views, function(cell_view) {
                    cell_view.hide_buttons();
                });
            });
        }
    });
}

window.onload = view_init;
