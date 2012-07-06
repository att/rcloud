var shell = (function() {
    var terminal = $('#term_demo').terminal(function(command, term) {
        if (command !== '') {
            term.clear();
            // $("#output").append($("<div></div>").text(command));
            rclient.send_as_interactive_cell(command, "interactive");
            // rclient.post_sent_command(command);
            // interpret_command(command);
        }
    }, {
        exit: false,
        greetings: false
    });
    
    // hacky workaround, but whatever.
    $('#output').click(function(x) {
        terminal.disable();
    });

    function handle_scatterplot(data) {
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
                    + data.value[1].value[0] + "' width='" 
                    + data.value[2].value[0] + "' height='"
                    + data.value[2].value[1] + "' frameborder=0></iframe>");
        return div;
        this.post_div(div);
    }

    function handle_facet_osm_plot(data) {
        var lats = data.value[1].value,
            lons = data.value[2].value,
            color = data.value[3].value,
            width = data.value[4].value[0],
            height = data.value[4].value[1];
        return FacetChart.facet_osm_plot(lats, lons, color, width, height);
        // this.post_div();
    }

    function handle_facet_tour_plot(data) {
        var lst = data.value[1];
        return FacetChart.facet_tour_plot(lst);
        // this.post_div();
    }

    function handle_select(data) {
        var group = data.value[1].value[0];
        var sel = data.value[2].value;
        Chart.set_selections(group, sel);
    }

    var handlers = {
        "scatterplot": handle_scatterplot,
        "iframe": handle_iframe,
        "facet_osm_plot": handle_facet_osm_plot,
        "facet_tour_plot": handle_facet_tour_plot,
	"select": handle_select
    };

    return {
        terminal: terminal,
        post_div: function(msg) {
            var div = this.detachable_div(msg);
            $("#output").append(div);
            window.scrollTo(0, document.body.scrollHeight);
            return div;
        },
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
        }
    };
})();
