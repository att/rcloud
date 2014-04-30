((function() {

//////////////////////////////////////////////////////////////////////////////
// bare-bones d3 charting facilities

function svg_translate(dx, dy)
{
    return "translate(" + dx + "," + dy + ")";
}

Chart = {};

function array_remove(array, from, to) {
    var rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply(array, rest);
};

var models = {};
var selections = {};

function add_data_model(model, group_id)
{
    if (_.isUndefined(models[group_id])) {
        var selection = new Uint8Array(model.data().length);
        selections[group_id] = selection;
        models[group_id] = [model];
    } else {
        models[group_id].push(model);
    }
}

Chart.get_selections = function(group_id) {
    return selections[this.group_id];
}

Chart.set_selections = function(group_id, sel) {
    for (var i = 0; i < sel.length; i++)
        selections[group_id][i] = sel[i];
    _.each(models[group_id], function(model) {
        _.each(model.views, function(v) {
            v.selection_changed();
        });
    });
}

Chart.data_model = function(data, group_id)
{
    var l = data.length;
    // I use typed arrays because this might be useful in Lux eventually
    var result = {
        views: {},
        group_id: group_id,
        data: function() { return data; },
        selection: function() { return selections[this.group_id]; },

        register_view: function(v) { this.views[v._view_index] = v; },
        deregister_view: function(v) { delete this.views[v._view_index]; },
        notify: function() {
            _.each(models[this.group_id], function(model) {
                _.each(model.views, function(v) {
                    v.selection_changed();
                });
            });
        },
        clear_brushes: function(active_view) {
            _.each(models[this.group_id], function(model) {
                _.each(model.views, function(v) {
                    if (v._view_index !== active_view._view_index) {
                        v.clear_brush();
                    }
                });
            });
        }
    };
    add_data_model(result, group_id);

    return result;
};

var view_counter = 0;

function enforce_function(v)
{
    if (typeof v === "function") return v;
    return (function(val) {
        return function() { return val; };
    })(v);
}

Chart.scatterplot = function(opts)
{
    opts = _.defaults(opts, {
        width: 400,
        height: 400,
        padding: 20,
        n_xticks: 10,
        n_yticks: 10,
        stroke: "white",
        stroke_width: "1.5px",
        fill: "black",
        stroke_opacity: 1.0,
        fill_opacity: 1.0
    });

    opts.stroke = enforce_function(opts.stroke);
    opts.stroke_opacity = enforce_function(opts.stroke_opacity);
    opts.stroke_width = enforce_function(opts.stroke_width);
    opts.fill = enforce_function(opts.fill);
    opts.fill_opacity = enforce_function(opts.fill_opacity);

    var width = opts.width, height = opts.height, padding = opts.padding;
    var model = opts.data;
    var data = model.data();
    
    var x_values = _.map(data, opts.x);
    var y_values = _.map(data, opts.y);
    var x_min = _.min(x_values), x_max = _.max(x_values);
    var y_min = _.min(y_values), y_max = _.max(y_values);

    var x_scale = d3.scale.linear().domain([x_min, x_max]).range([0, width]);
    var y_scale = d3.scale.linear().domain([y_min, y_max]).range([height, 0]);

    var output_div = $("<div></div>")[0];

    var result = {
        _view_index: ++view_counter,
        opts: opts,
        plot: output_div,
        clear_brush: function() {
            vis.call(brush.clear());
        }, selection_changed: function() {
            update_selection();
        }, deleted: function() {
            model.deregister_view(this);
        }
    };

    model.register_view(result);

    var svg = d3.select(output_div)
        .append("svg")
           .attr("width", width + 2 * padding)
           .attr("height", height + 2 * padding);

    var vis = svg
        .append("g")
           .attr("transform", svg_translate(padding, padding));

    var brush = d3.svg.brush()
        .on("brushstart", brushstart)
        .on("brush", brushevt)
        .on("brushend", brushend);

    vis.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#eee");

    var xrule = vis.selectAll("g.x")
        .data(x_scale.ticks(opts.n_xticks))
        .enter().append("g")
        .attr("class", "x");

    xrule.append("line")
        .attr("x1", x_scale).attr("x2", x_scale)
        .attr("y1", 0).attr("y2", height);

    xrule.append("text")
        .attr("x", x_scale)
        .attr("y", height + 3)
        .attr("dy", ".71em")
        .attr("text-anchor", "middle")
        .attr("class", "rule-text")
        .text(x_scale.tickFormat(opts.n_xticks));

    var yrule = vis.selectAll("g.y")
        .data(y_scale.ticks(opts.n_yticks))
        .enter().append("g")
        .attr("class", "x");

    yrule.append("line")
        .attr("x1", 0).attr("x2", width)
        .attr("y1", y_scale).attr("y2", y_scale);

    yrule.append("text")
        .attr("x", -3)
        .attr("y", y_scale)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("class", "rule-text")
        .text(y_scale.tickFormat(opts.n_yticks));

    var dots = vis.selectAll("path.dot")
        .data(_.range(data.length))
        .enter().append("path");

    var selected_dots = vis.selectAll("pathasdkf.dot")
        .data(_.range(data.length))
        .enter().append("path");

    var d = function(d) { return data[d]; };

    dots.style("fill", _.compose(opts.fill, d))
        .style("stroke", _.compose(opts.stroke, d))
        .style("fill-opacity", _.compose(opts.fill_opacity, d))
        .style("stroke-opacity", _.compose(opts.stroke_opacity, d));

    vis.call(brush.x(x_scale).y(y_scale));

    var selection_fill = function() { return "red"; };
    var selection_stroke = function() { return "red"; };
    var selection_fill_opacity = function() { return 1.0; };
    var selection_stroke_opacity = function() { return 1.0; };

    selected_dots.style("fill", _.compose(selection_fill, d))
        .style("stroke", _.compose(selection_stroke, d))
        .style("fill-opacity", _.compose(selection_fill_opacity, d))
        .style("stroke-opacity", _.compose(selection_stroke_opacity, d));

    function update_selection() {
        var selection = model.selection();
        selected_dots
            .attr("display", function(d) {
                return selection[d]?null:"none"; 
            })
        ;
    };

    function place_dots(selection) {
        selection
            .attr("d", d3.svg.symbol().type("circle"))
            .attr("size", 5)
            .attr("transform", function(d) {
                d = data[d];
                return svg_translate(x_scale(opts.x(d)), 
                                     y_scale(opts.y(d))); 
            })
            .style("stroke-width", function(d) { 
                return result.opts.stroke_width(data[d]);
            });
    }

    function brushstart(p) {
        model.clear_brushes(result);
    }

    function brushevt(p) {
        var e = brush.extent();
        var selection = model.selection();
        dots.each(function(d) {
            var v = data[d];
            var b = (e[0][0] <= opts.x(v) && opts.x(v) <= e[1][0] &&
                     e[0][1] <= opts.y(v) && opts.y(v) <= e[1][1]);
            selection[d] = b;
        });
        model.notify();
    }
    function brushend() {
        if (brush.empty())
            update_selection(dots);
    }

    svg.on("keydown", function(e) {
        console.log(e);
    });

    place_dots(dots);
    place_dots(selected_dots);
    update_selection();
    return result;
};

Chart.histogram = function(opts)
{
    opts = _.defaults(opts, {
        width: 400,
        height: 400,
        padding: 20,
        n_bins: 10,
        stroke: "white",
        stroke_width: "1.5px",
        fill: "black",
        stroke_opacity: 1.0,
        fill_opacity: 1.0
    });

    opts.stroke = enforce_function(opts.stroke);
    opts.stroke_opacity = enforce_function(opts.stroke_opacity);
    opts.stroke_width = enforce_function(opts.stroke_width);
    opts.fill = enforce_function(opts.fill);
    opts.fill_opacity = enforce_function(opts.fill_opacity);

    var width = opts.width, height = opts.height, padding = opts.padding;
    var model = opts.data;
    var data = model.data();

    var x_values = _.map(data, opts.x);
    var x_min = _.min(x_values), x_max = _.max(x_values);

    var output_div = $("<div></div>")[0];
    var x_scale = d3.scale.linear().domain([x_min, x_max]).range([0, width]);

    var hist = d3.layout.histogram()
        .range([x_min, x_max])
        .bins(opts.n_bins);

    var bins = hist(opts.x);

    var result = {
        _view_index: ++view_counter,
        opts: opts,
        plot: output_div,
        clear_brush: function() {
            vis.call(brush.clear());
        }, selection_changed: function() {
            update_selection();
        }, deleted: function() {
            model.deregister_view(this);
        }
    };

    // model.register_view(result);

    // var svg = d3.select(output_div)
    //     .append("svg")
    //        .attr("width", width + 2 * padding)
    //        .attr("height", height + 2 * padding);

    // var vis = svg
    //     .append("g")
    //        .attr("transform", svg_translate(padding, padding));

    // var brush = d3.svg.brush()
    //     .on("brushstart", brushstart)
    //     .on("brush", brushevt)
    //     .on("brushend", brushend);

    // vis.append("rect")
    //     .attr("width", width)
    //     .attr("height", height)
    //     .attr("fill", "#eee");

    // var xrule = vis.selectAll("g.x")
    //     .data(x_scale.ticks(opts.n_xticks))
    //     .enter().append("g")
    //     .attr("class", "x");

    // xrule.append("line")
    //     .attr("x1", x_scale).attr("x2", x_scale)
    //     .attr("y1", 0).attr("y2", height);

    // xrule.append("text")
    //     .attr("x", x_scale)
    //     .attr("y", height + 3)
    //     .attr("dy", ".71em")
    //     .attr("text-anchor", "middle")
    //     .attr("class", "rule-text")
    //     .text(x_scale.tickFormat(opts.n_xticks));

    // var yrule = vis.selectAll("g.y")
    //     .data(y_scale.ticks(opts.n_yticks))
    //     .enter().append("g")
    //     .attr("class", "x");

    // yrule.append("line")
    //     .attr("x1", 0).attr("x2", width)
    //     .attr("y1", y_scale).attr("y2", y_scale);

    // yrule.append("text")
    //     .attr("x", -3)
    //     .attr("y", y_scale)
    //     .attr("dy", ".35em")
    //     .attr("text-anchor", "end")
    //     .attr("class", "rule-text")
    //     .text(y_scale.tickFormat(opts.n_yticks));

    // var dots = vis.selectAll("path.dot")
    //     .data(_.range(data.length))
    //     .enter().append("path");

    // var selected_dots = vis.selectAll("pathasdkf.dot")
    //     .data(_.range(data.length))
    //     .enter().append("path");

    // var d = function(d) { return data[d]; };

    // dots.style("fill", _.compose(opts.fill, d))
    //     .style("stroke", _.compose(opts.stroke, d))
    //     .style("fill-opacity", _.compose(opts.fill_opacity, d))
    //     .style("stroke-opacity", _.compose(opts.stroke_opacity, d));

    // vis.call(brush.x(x_scale).y(y_scale));

    // var selection_fill = function() { return "red"; };
    // var selection_stroke = function() { return "red"; };
    // var selection_fill_opacity = function() { return 1.0; };
    // var selection_stroke_opacity = function() { return 1.0; };

    // selected_dots.style("fill", _.compose(selection_fill, d))
    //     .style("stroke", _.compose(selection_stroke, d))
    //     .style("fill-opacity", _.compose(selection_fill_opacity, d))
    //     .style("stroke-opacity", _.compose(selection_stroke_opacity, d));

    // function update_selection() {
    //     var selection = model.selection();
    //     selected_dots
    //         .attr("display", function(d) {
    //             return selection[d]?null:"none"; 
    //         })
    //     ;
    // };

    // function place_dots(selection) {
    //     selection
    //         .attr("d", d3.svg.symbol().type("circle"))
    //         .attr("size", 5)
    //         .attr("transform", function(d) {
    //             d = data[d];
    //             return svg_translate(x_scale(opts.x(d)), 
    //                                  y_scale(opts.y(d))); 
    //         })
    //         .style("stroke-width", function(d) { 
    //             return result.opts.stroke_width(data[d]);
    //         });
    // }

    // function brushstart(p) {
    //     model.clear_brushes(result);
    // }

    // function brushevt(p) {
    //     var e = brush.extent();
    //     var selection = model.selection();
    //     dots.each(function(d) {
    //         var v = data[d];
    //         var b = (e[0][0] <= opts.x(v) && opts.x(v) <= e[1][0] &&
    //                  e[0][1] <= opts.y(v) && opts.y(v) <= e[1][1]);
    //         selection[d] = b;
    //     });
    //     model.notify();
    // }
    // function brushend() {
    //     if (brush.empty())
    //         update_selection(dots);
    // }

    // svg.on("keydown", function(e) {
    //     console.log(e);
    // });

    // place_dots(dots);
    // place_dots(selected_dots);
    // update_selection();
    // return result;
};

//////////////////////////////////////////////////////////////////////////////

return {
    handle: function(data, k) {
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

        k(function() { return plot.plot; });
        // k("<div>AKSJHDA</div>");
        // k(plot.plot);
    },

    handle_select: function (data, k) {
        var group = data[1];
        var sel = data[2];
        k(function() { return Chart.set_selections(group, sel); });
    }
};

})())
