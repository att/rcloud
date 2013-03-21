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

    function handle_facet_osm_plot(data) {
        var lats = data[1],
            lons = data[2],
            color = data[3],
            width = data[4][0],
            height = data[4][1];
        return FacetChart.facet_osm_plot(lats, lons, color, width, height);
    }

    function handle_facet_tour_plot(data) {
        var lst = data[1];
        return FacetChart.facet_tour_plot(lst);
    }

    function handle_select(data) {
        var group = data[1];
        var sel = data[2];
        Chart.set_selections(group, sel);
    }
    
    var dcnum=0;
    function handle_twochart(data) {
        return function(N, rows) {
            setTimeout(function() {
                var oneChart = window["oneChart"+N] = dc.pieChart("#one"+N);
                var twoChart = window["twoChart"+N] = dc.barChart("#two"+N);
                
                var ndx = crossfilter(rows);
                var all = ndx.groupAll();

                var oneDimension = ndx.dimension(function(d) {
                    return d[0];
                });
                var oneGroup = oneDimension.group().reduceCount();

                var twoDimension = ndx.dimension(function(d) {
                    return d[1];
                });
                var twoGroup = twoDimension.group().reduceCount();
                // i'm sure there's a better way to do this; why doesn't the default-uniques work?
                var twoDomain = _.map(twoDimension.group().all(), function(kv) { return kv.key; });
                
                oneChart.width(180)
                    .height(180)
                    .radius(80)
                    .dimension(oneDimension)
                    .group(oneGroup)
                ;

                twoChart.width(500)
                    .height(100)
                    .margins({top: 0, right: 50, bottom: 20, left: 40})
                    .dimension(twoDimension)
                    .group(twoGroup)
                    .centerBar(false)
                    .gap(0)
                    .x(d3.scale.ordinal().domain(twoDomain))
                    .xUnits(dc.units.ordinal)
                ;
                
                dc.renderAll();
            }, 100);
            function chartDiv(name) {
                return $('<div/>',
                         {id: name+N})
                    .append($('<a/>',
                              {class: "reset",
                               href: "javascript:"+name+"Chart"+N+".filterAll(); dc.redrawAll();",
                               style: "display: none;"})
                            .append("reset"));
            }
            return $('<div/>').append(chartDiv("one")).append(chartDiv("two"));
        }(++dcnum, data[1]);
    }                
    var handlers = {
        "scatterplot": handle_scatterplot,
        "iframe": handle_iframe,
        "facet_osm_plot": handle_facet_osm_plot,
        "facet_tour_plot": handle_facet_tour_plot,
	"select": handle_select,
        "twochart": handle_twochart
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
            return notebook_controller.append_cell(content, "markdown");
        }, new_interactive_cell: function(content) {
            return notebook_controller.append_cell(content, "interactive");
        }, insert_markdown_cell_before: function(index) {
            return notebook_controller.insert_cell("", "markdown", index);
        }, load_from_file: function(user, filename, k) {
            var that = this;
            this.notebook.controller.load_from_file(user, filename, function() {
                $("#file_title").text(filename);
                _.each(that.notebook.view.sub_views, function(cell_view) {
                    cell_view.show_source();
                });
                that.user = user;
                that.filename = filename;
                k && k();
            });
        }, save_to_file: function(user, filename, k) {
            var that = this;
            this.notebook.controller.save_file(user, filename, function() {
                $("#file_title").text(filename);
                k && k();
            });
        }, new_file: function() {
            function validate_filename(n) {
                if (/\.\./.test(n))
                    return false;
                if (/[^0-9a-zA-Z_.]/.test(n))
                    return false;
                return true;
            }
            var filename = prompt("please enter a filename", "[new filename]");
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
                    that.load_from_file(rcloud.username(), filename);
                }
            });
        }, serialize_state: function(k) {
            var that = this;
            this.notebook.view.update_model();
            if (this.filename && (this.user === rcloud.username())) {
                this.save_to_file(shell.user, shell.filename, function() {
                    editor.populate_file_list();
                    k && k();
                });
            } else {
                // FIXME what do we do with unnamed content??
                k && k();
            }
        }
    };

    $("#run-notebook").click(function() {
        result.serialize_state(function() {
            result.notebook.controller.run_all();
        });
    });
    return result;
})();
