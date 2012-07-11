var interpreter = {
    'plot': function(cmd) {
        rclient.capture_answers(cmd.ps.length, function(result) {
            rclient.post_div(create_scatterplot.apply(result));
        });
        for (var i=0; i<cmd.ps.length; ++i) {
            rclient.send(cmd.ps[i], rclient.wrap_command);
        }
    },
    'logout': function(cmd) {
        $.cookies.set('user', null);
        $.cookies.set('sessid', null);
        window.location.href = '/login.html';
    }
};

function interpret_command(command)
{
    if (command[0] === '@') {
        var cmd = parser.parse(command);
        interpreter[cmd.id](cmd);
    } else {
        // rclient.log(command);
        rclient.send(command, rclient.markdown_wrap_command);
    }
}

function transpose(ar) {
    return _.map(_.range(ar[0].length), function(i) {
        return _.map(ar, function(lst) { return lst[i]; });
    });
}

function main_init() {
    rclient = RClient.create("ws://"+location.hostname+":8081/", function() {
        $("#new-md-cell-button").click(function() {
            shell.terminal.disable();
            shell.new_markdown_cell("", "markdown");
            var vs = shell.notebook.view.sub_views;
            vs[vs.length-1].show_source();
        });
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

        editor.init();

        if (location.search.length > 0) {
            function getURLParameter(name) {
                return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
            }
            editor.load_file(getURLParameter("user"), getURLParameter("filename"));
            $("#tabs").tabs("select", "#tabs-2");
        }
    });
}

window.onload = main_init;
