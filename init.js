
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
        rclient.register_handler("scatterplot", function(data) {
            var opts = {
                x: function(d) { return d[0]; },
                y: function(d) { return d[1]; }
            };
            var row_based_data, group;

            if (data.value.length === 6) {
                row_based_data = transpose([data.value[1].value, data.value[2].value, data.value[3].value]);
                var color = d3.scale.category10();
                opts.fill = function(d) { return color(d[2]); };
                opts.width = data.value[4].value[0];
                opts.height = data.value[4].value[1];
                group = data.value[5].value[0];
            } else {
                row_based_data = transpose([data.value[1].value, data.value[2].value]);
                opts.width = data.value[3].value[0];
                opts.height = data.value[3].value[1];
                group = data.value[4].value[0];
            }
            var data_model = Chart.data_model(row_based_data, group);
            opts.data = data_model;

            var plot = Chart.scatterplot(opts);
            var detachable_div = this.post_div(plot.plot);
            detachable_div.on_remove(function() {
                plot.deleted();
            });
            
        });
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
    });
}

window.onload = main_init;
