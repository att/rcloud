var interpreter = {
    'plot': function(cmd) {
        rclient.capture_answers(cmd.ps.length, function(result) {
            rclient.post_div(create_scatterplot.apply(result));
        });
        for (var i=0; i<cmd.ps.length; ++i) {
            rclient.send(cmd.ps[i]);
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
        rclient.send_markdown(command);
    }
}

function shell_tab()
{
    shell.terminal.enable();
}

function editor_tab()
{
    shell.terminal.disable();
}

function internals_tab()
{
    shell.terminal.disable();
}

function transpose(ar) {
    return _.map(_.range(ar[0].length), function(i) {
        return _.map(ar, function(lst) { return lst[i]; });
    });
}

function main_init() {
    rclient = RClient.create("ws://"+location.hostname+":8081/", function() {
        rcloud.init_client_side_data();
        var that = this;
        var shell_objtypes = ["scatterplot", "iframe", "facet_osm_plot", "facet_tour_plot"];
        for (var i=0; i<shell_objtypes.length; ++i) {
            (function(objtype) {
                that.register_handler(objtype, function(data) {
                    shell.handle(objtype, data);
                });
            })(shell_objtypes[i]);
        }

        editor.init();

        // tabs navigation
        var map = {
            0: shell_tab,
            1: editor_tab,
            2: internals_tab
        };
        $("#tabs").tabs({
            select: function(event, ui) {
                if (map[ui.index] === undefined)
                    throw "bad select??";
                map[ui.index]();
            }
        });
        $("#tabs").tabs("select", "#tabs-1");
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
