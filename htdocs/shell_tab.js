// FIXME this is about to become the most important object,
// so lots of little things are temporarily being moved here
//////////////////////////////////////////////////////////////////////////////

var shell = (function() {
    function setup_command_entry(entry_div) {
        function set_ace_height() {
            entry_div.css({'height': ui_utils.ace_editor_height(widget) + "px"});
            widget.resize();
        }
        entry_div.css({'background-color': "#E8F1FA"});
        var widget = ace.edit(entry_div[0]);
        set_ace_height();
        var RMode = require("ace/mode/r").Mode;
        var session = widget.getSession();
        var doc = session.doc;

        session.setMode(new RMode(false, doc, session));
        session.on('change', set_ace_height);

        widget.setTheme("ace/theme/chrome");
        session.setUseWrapMode(true);
        widget.resize();
        input_widget = widget;

        widget.commands.addCommand({
            name: 'execute',
            bindKey: {
                win: 'Return',
                mac: 'Return',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                var code = session.getValue();
                if(code.length) {
                    result.new_interactive_cell(code).execute();
                    session.setValue('');
                }
            }
        });
    }

    var entry_div = $("#command-entry");
    var input_widget = null;
    if(entry_div.length)
        setup_command_entry(entry_div);

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

    function handle_dcplot(data) {
        var charts, elem;
        try {
            charts = wdcplot.translate.apply(null,data.slice(1));
        }
        catch(e) {
            return $('<p/>').append("Exception creating dcplot definition: " + e);
        }
        try {
            var dccharts = dcplot(charts.dataframe, charts.groupname, charts.defn);
            _.extend(window.charts, dccharts);
        }
        catch(e) {
            return wdcplot.format_error(e);
        }
        return charts.elem;
    }

    var handlers = {
        "scatterplot": handle_scatterplot,
        "iframe": handle_iframe,
        "lux_osm_plot": handle_lux_osm_plot,
        "lux_tour_plot": handle_lux_tour_plot,
        "select": handle_select,
        "dcchart": handle_dcchart,
        "dcplot": handle_dcplot
    };

    var notebook_model = Notebook.create_model();
    var notebook_view = Notebook.create_html_view(notebook_model, $("#output"));
    var notebook_controller = Notebook.create_controller(notebook_model);

    function show_fork_or_input_elements() {
        if(notebook_model.read_only) {
            $('#input-div').hide();
            $('#fork-notebook').show();
        }
        else {
            $('#input-div').show();
            $('#fork-notebook').hide();
        }
    }

    function on_new(k, notebook) {
        $("#notebook-title").text(notebook.description);
        show_fork_or_input_elements();
        this.gistname = notebook.id;
        this.input_widget.focus(); // surely not the right way to do this
        k && k(notebook);
    }

    function on_load(k, notebook) {
        $("#notebook-title").text(notebook.description);
        show_fork_or_input_elements();
        _.each(this.notebook.view.sub_views, function(cell_view) {
            cell_view.show_source();
        });
        this.input_widget.focus(); // surely not the right way to do this
        k && k(notebook);
    }

    var result = {
        notebook: {
            // very convenient for debugging
            model: notebook_model,
            view: notebook_view,
            controller: notebook_controller
        },
        input_widget: input_widget,
        gistname: undefined,
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
        }, handle: function(objtype, data, cell) {
            if (_.isUndefined(handlers[objtype])) {
                console.log("Shell can't handle object of type", objtype);
                return undefined;
            } else
                return handlers[objtype].call(this, data, cell);
        }, new_markdown_cell: function(content) {
            return notebook_controller.append_cell(content, "Markdown");
        }, new_interactive_cell: function(content) {
            return notebook_controller.append_cell(content, "R");
        }, insert_markdown_cell_before: function(index) {
            return notebook_controller.insert_cell("", "Markdown", index);
        }, load_notebook: function(gistname, k) {
            var that = this;
            // asymetrical: we know the gistname before it's loaded here,
            // but not in new.  and we have to set this here to signal
            // editor's init load config callback to override the currbook
            this.gistname = gistname;
            this.notebook.controller.load_notebook(gistname, _.bind(on_load, this, k));
        }, new_notebook: function(desc, k) {
            var content = {description: desc, public: false, files: {"scratch.R": {content:"# scratch file"}}};
            this.notebook.controller.create_notebook(content, _.bind(on_new, this, k));
        }, fork_notebook: function(gistname, k) {
            var that = this;
            notebook_model.read_only = false;
            this.notebook.controller.fork_notebook(gistname, function(notebook) {
                that.gistname = notebook.id;
                on_load.call(that, k, notebook);
            });
        }
    };

    $("#run-notebook").click(function() {
        result.notebook.controller.run_all();
        result.input_widget.focus(); // surely not the right way to do this
    });
    return result;
})();
