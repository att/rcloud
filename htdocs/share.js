function share_init() {
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    $("#instashare-view-source").click(function() {
        document.location = "main.html" + location.search;
    });
    rclient = RClient.create("ws://"+location.hostname+":8081/", function() {
        rcloud.init_client_side_data();
        var user = getURLParameter("user");
        var filename = getURLParameter("filename");
        shell.load_from_file(user, filename, function() {
            $("#file_title").text(filename);
            shell.notebook.controller.run_all();
            _.each(shell.notebook.view.sub_views, function(cell_view) {
                cell_view.hide_buttons();
            });
        });
        $("#instashare-view-source").click(function() {
            window.location = "main.html?user=" + shell.user + "&filename=" + shell.filename;
        });
    });
};

window.onload = share_init;
