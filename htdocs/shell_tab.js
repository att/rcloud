// FIXME this is about to become the most important object, 
// so lots of little things are temporarily being moved here
//////////////////////////////////////////////////////////////////////////////

var shell = (function() {
    var terminal = $('#term_demo').terminal(function(command, term) {
        if (command !== '') {
            term.clear();
            result.new_interactive_cell(command).execute();
        }
    }, {
        exit: false,
        greetings: false
    });
    
    // hacky workaround, but whatever.
    $('#output').click(function(x) {
        terminal.disable();
    });
    $("#term_demo").click(function(x) {
        d3.select("#term_helper")
            .transition()
            .duration(1000)
            .style("opacity", "0")
            .each("end", function() {
                d3.select(this).style("display", "none");
            });
    });


    function handle_scatterplot(data) {
        function transpose(ar) {
            return _.map(_.range(ar[0].length), function(i) {
                return _.map(ar, function(lst) { return lst[i]; });
            });
        }

        var opts = {
            x: function(d) { return d[0]; },
            y: function(d) { return d[1]; }
        };
        var row_based_data, group;

        if (data.length === 6) {
            row_based_data = transpose([data[1], data[2], data[3]]);
            var color = d3.scale.category10();
            opts.fill = function(d) { return color(d[2]); };
            opts.width = data[4][0];
            opts.height = data[4][1];
            group = data[5];
        } else {
            row_based_data = transpose([data[1], data[2]]);
            opts.width = data[3][0];
            opts.height = data[3][1];
            group = data[4];
        }
        var data_model = Chart.data_model(row_based_data, group);
        opts.data = data_model;

        var plot = Chart.scatterplot(opts);
        // FIXME deleted plot observers need to be notified
        // 
        // var detachable_div = this.post_div(plot.plot);
        // detachable_div.on_remove(function() {
        //     plot.deleted();
        // });

        return plot.plot;
    }

    function handle_iframe(data) {
        var div = $("<iframe src='"
                    + data[1] + "' width='" 
                    + data[2][0] + "' height='"
                    + data[2][1] + "' frameborder=0></iframe>");
        return div;
    }

    function handle_lux_osm_plot(data) {
        var lats = data[1],
            lons = data[2],
            color = data[3],
            width = data[4][0],
            height = data[4][1];
        return LuxChart.lux_osm_plot(lats, lons, color, width, height);
    }

    function handle_lux_tour_plot(data) {
        var lst = data[1];
        return LuxChart.lux_tour_plot(lst);
    }

    function handle_select(data) {
        var group = data[1];
        var sel = data[2];
        Chart.set_selections(group, sel);
    }

    function handle_dcchart(data) {
        var charts;
        try {
            charts = dcrchart.translate(data[2]);
        }
        catch(e) {
            return $('<p/>').append("Exception creating dc code: " + e);
        }
        var rdata = data[1];
        setTimeout(function() { charts.dcfunc(rdata); }, 10);
        return charts.elem;
    }                

    var handlers = {
        "scatterplot": handle_scatterplot,
        "iframe": handle_iframe,
        "lux_osm_plot": handle_lux_osm_plot,
        "lux_tour_plot": handle_lux_tour_plot,
        "select": handle_select,
        "dcchart": handle_dcchart
    };

    var notebook_model = Notebook.create_model();
    var notebook_view = Notebook.create_html_view(notebook_model, $("#output"));
    var notebook_controller = Notebook.create_controller(notebook_model);

    var result = {
        notebook: {
            // very convenient for debugging
            model: notebook_model,
            view: notebook_view,
            controller: notebook_controller
        },
        terminal: terminal,
        user: undefined,
        filename: undefined,
        detachable_div: function(div) {
            var on_remove = function() {};
            var on_detach = function() {};
            var result = $("<div class='detachable' style='position: relative; z-index: 0;'></div>");
            var inner_div = $("<div style='float: right'></div>");
            result.append(inner_div);
            result.append(div);
            var sign_out = $("<i class='icon-signout figure-icon' style='position: absolute; right: 5px; top: 25px'>");
            sign_out.click(function(){
                $(result).detach().draggable();
                $("#output").append(result);
                make_fixed_menu(result[0], true);
                $(sign_out).remove();
                on_detach();
            });
            var trash = $("<i class='icon-trash figure-icon' style='position: absolute; right: 5px; top: 5px'>");
            trash.click(function() {
                $(result).remove();
                on_remove();
            });
            inner_div.append(sign_out);
            inner_div.append(trash);

            result[0].on_remove = function(callback) { on_remove = callback; };
            result[0].on_detach = function(callback) { on_detach = callback; };
            
            return result[0];
        }, handle: function(objtype, data) {
            if (_.isUndefined(handlers[objtype])) {
                console.log("Shell can't handle object of type", objtype);
                return undefined;
            } else
                return handlers[objtype].call(this, data);
        }, new_markdown_cell: function(content) {
            return notebook_controller.append_cell(content, "Markdown");
        }, new_interactive_cell: function(content) {
            return notebook_controller.append_cell(content, "R");
        }, insert_markdown_cell_before: function(index) {
            return notebook_controller.insert_cell("", "Markdown", index);
        }, load_notebook: function(user, filename, k) {
            var that = this;
            this.notebook.controller.load_notebook(user, filename, function() {
                $("#file_title").text(filename);
                _.each(that.notebook.view.sub_views, function(cell_view) {
                    cell_view.show_source();
                });
                that.user = user;
                that.filename = filename;
                k && k();
            });
        }, new_notebook: function() {
            function validate_filename(n) {
                if (/\.\./.test(n))
                    return false;
                if (/[^0-9a-zA-Z_.]/.test(n))
                    return false;
                return true;
            }
            var filename = prompt("please enter a description", "[new notebook]");
            if (!validate_filename(filename)) {
                alert("Invalid filename");
                return;
            }
            this.create_file(filename);
        }, create_file: function(filename) {
            var that = this;
            rcloud.create_user_file(filename, function(result) {
                if (result) {
                    editor.populate_file_list();
                    that.load_notebook(rcloud.username(), filename);
                }
            });
        }
    };

    $("#run-notebook").click(function() {
        result.notebook.controller.run_all();
    });
    return result;
})();
