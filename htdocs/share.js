function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

function transpose(ar) {
    return _.map(_.range(ar[0].length), function(i) {
        return _.map(ar, function(lst) { return lst[i]; });
    });
}

// FIXME shell has a ton of repeated code... this is horribly horribly ugly
function share_init() {
    $("#instashare-view-source").click(function() {
        document.location = "main.html" + location.search;
    });
    rclient = RClient.create("ws://"+location.hostname+":8081/", function() {
        rcloud.init_client_side_data();
        var that = this;
        var shell_objtypes = ["scatterplot", "iframe", "facet_osm_plot", "facet_tour_plot"];
        for (var i=0; i<shell_objtypes.length; ++i) {
            (function(objtype) {
                that.register_handler(objtype, function(data) {
                    var div = shell.handle(objtype, data);
                    shell.post_div(div);
                    // shell.handle(objtype, data);
                });
            })(shell_objtypes[i]);
        }
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
