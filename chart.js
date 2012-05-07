(function() {

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

Chart.data_model = function(data, group_id)
{
    var l = data.length;
    // I use typed arrays because this might be useful in Facet eventually
    var result = {
        views: {},
        group_id: group_id,
        data: function() { return data; },
        selection: function() { return selections[this.group_id]; },

        // toggle_selection: function(
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
                        console.log("clearing brush on view", v._view_index, v, active_view);
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

    vis.call(brush.x(x_scale).y(y_scale));

    function sel_function(if_true, if_false) {
        var selection = model.selection();
        return function(i) {
            if (selection[i]) {
                return if_true(data[i]);
            } else {
                return if_false(data[i]);
            }
        };
    }

    var selection_fill = sel_function(function() { return "red"; }, result.opts.fill);
    var selection_stroke = sel_function(function() { return "red"; }, result.opts.stroke);
    var selection_fill_opacity = sel_function(function() { return 1.0; }, result.opts.fill_opacity);
    var selection_stroke_opacity = sel_function(function() { return 1.0; }, result.opts.stroke_opacity);

    function update_selection(selection) {
        (_.isUndefined(selection)?dots:selection)
            .style("fill", selection_fill)
            .style("stroke", selection_stroke)
            .style("fill-opacity", selection_fill_opacity)
            .style("stroke-opacity", selection_stroke_opacity)
        ;
    };

    function style_dots(selection) {
        selection
            .attr("d", d3.svg.symbol().type("circle"))
            .attr("size", 5)
            .attr("transform", function(d) {
                d = data[d];
                return svg_translate(x_scale(opts.x(d)), 
                                     y_scale(opts.y(d))); 
            })
            .style("stroke", function(d) { 
                return result.opts.stroke(data[d]);
            })
            .style("stroke-width", function(d) { 
                return result.opts.stroke_width(data[d]);
            });
        update_selection(selection);
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

    style_dots(dots);
    return result;
};

})();
