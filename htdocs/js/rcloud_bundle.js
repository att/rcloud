function svg_translate(dx, dy)
{
    return "translate(" + dx + "," + dy + ")";
}

function create_scatterplot(x, y, width, height)
{
    x = x.value;
    y = y.value;
    var output_div = $("<div></div>")[0];
    if (!width) width = 480
    if (!height) height = 480
    var padding = 20;

    var x_scale = d3.scale.linear().domain([_.min(x), _.max(x)]).range([0, width]),
        y_scale = d3.scale.linear().domain([_.min(y), _.max(y)]).range([height, 0]);
    var n_xticks = 10;
    var n_yticks = 10;

    var vis = d3.select(output_div)
        .append("svg")
          .attr("width", width + 2 * padding)
          .attr("height", height + 2 * padding)
        .append("g")
          .attr("transform", svg_translate(padding, padding));

    vis.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "#eee");

    var xrule = vis.selectAll("g.x")
        .data(x_scale.ticks(n_xticks))
        .enter().append("g")
        .attr("class", "x");
    
    xrule.append("line")
        .attr("x1", x_scale)
        .attr("x2", x_scale)
        .attr("y1", 0)
        .attr("y2", height);

    xrule.append("text")
        .attr("x", x_scale)
        .attr("y", height + 3)
        .attr("dy", ".71em")
        .attr("text-anchor", "middle")
        .attr("class", "rule-text")
        .text(x_scale.tickFormat(n_xticks));

    var yrule = vis.selectAll("g.y")
                      .data(y_scale.ticks(n_yticks))
        .enter().append("g")
        .attr("class", "y");

    yrule.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", y_scale)
        .attr("y2", y_scale);

    yrule.append("text")
        .attr("x", -3)
        .attr("y", y_scale)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("class", "rule-text")
        .text(y_scale.tickFormat(n_yticks));

    vis.selectAll("path.dot")
        .data(_.range(x.length))
        .enter().append("path")
        .attr("class", "dot")
        .attr("d", d3.svg.symbol().type("circle"))
        .attr("size", 5)
        .attr("transform", function(d) { return svg_translate(x_scale(x[d]), y_scale(y[d])); });

    return output_div;
}
// bare-bones d3 charting facilities

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

})();
FacetChart = {};

FacetChart.facet_tour_plot = function(array_list)
{
    var width = 600, height = 600;
    var canvas = $("<canvas width='" + width + "' height='" + height + "'></canvas>")[0];
    var tour_batch;
    var data;
    var axis_1_parameters, axis_2_parameters;

    function display()
    {
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        gl.clearDepth(1.0);
        gl.clearColor(0,0,0,0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        tour_batch.draw();
    }

    function data_buffers()
    {
        var result = {};
        var columns = [];
        for (var i=0; i<array_list.value.length; ++i) {
            result["dim_" + i] = Facet.attribute_buffer({
                vertex_array: array_list.value[i].value,
                item_size: 1
            });
            columns.push("dim_" + i);
        }
        result.columns = columns;
        return result;
    };

    function init_webgl()
    {
        Facet.set_context(gl);
        data = data_buffers();

        var point_diameter = 10;
        var stroke_width   = 2.5;
        var point_alpha    = 1.0;
        
        axis_1_parameters = [];
        axis_2_parameters = [];
        var column_min, column_max, column_center = [];
        var xy_expression = Shade.vec(0, 0),
        xy_center = Shade.vec(0, 0),
        xy_distance = Shade.vec(0, 0);
        
        for (var i=0; i<data.columns.length; ++i) {
            var this_column = data[data.columns[i]];
            axis_1_parameters.push(Shade.parameter("float"));
            axis_2_parameters.push(Shade.parameter("float"));
            var axes = Shade.vec(axis_1_parameters[i],
                                 axis_2_parameters[i]);
            column_min = _.min(this_column.array);
            column_max = _.max(this_column.array);
            column_center = (column_max + column_min) / 2;
            xy_expression = xy_expression.add(axes.mul(this_column));
            xy_center = xy_center.add(axes.mul(column_center));
            xy_distance = xy_distance.add(axes.mul(column_center -
                                                   column_min).abs());
        };
        
        // var species_color = S.Utils.choose(
        //     [S.vec(1, 0, 0, point_alpha),
        //      S.vec(0, 1, 0, point_alpha),
        //      S.vec(0, 0, 1, point_alpha)])(data.species);

        var species_color = Shade.color("red");
        
        tour_batch = Facet.Marks.scatterplot({
            elements: data[data.columns[0]].numItems,
            xy: xy_expression,
            xy_scale: Shade.Utils.linear(xy_center.sub(xy_distance),
                                         xy_center.add(xy_distance),
                                         Shade.vec(0,0), 
                                         Shade.vec(1,1)),
            fill_color: species_color,
            stroke_color: Shade.mix(Shade.color("black"), species_color, 0.5),
            stroke_width: stroke_width,
            point_diameter: point_diameter
        });
    }
    
    function random_2d_frame(dimension)
    {
        var v1 = [], v2 = [];
        var l1 = 0, l2 = 0;
        for (var i=0; i<dimension; ++i) {
            v1[i] = Math.random() * 2 - 1;
            v2[i] = Math.random() * 2 - 1;
            l1 += v1[i] * v1[i];
            l2 += v2[i] * v2[i];
        }
        l1 = Math.sqrt(l1);
        l2 = Math.sqrt(l2);
        // exceedingly unlikely; just try again.
        if (l1 === 0 || l2 === 0)
            return random_2d_frame(dimension);
        var d = 0;
        for (i=0; i<dimension; ++i) {
            v1[i] /= l1;
            v2[i] /= l2;
            d += v1[i] * v2[i];
        }
        var l = 0;
        for (i=0; i<dimension; ++i) {
            v2[i] = v2[i] - d * v1[i];
            l += v2[i] * v2[i];
        }
        l = Math.sqrt(l);
        // exceedingly unlikely; just try again.
        if (l === 0)
            return random_2d_frame(dimension);
        for (i=0; i<dimension; ++i) {
            v2[i] /= l;
        }
        return [v1, v2];
    }

    var gl = Facet.init(canvas, {
        clearColor: [1,1,1,1]
    });

    init_webgl();
    var frame_1 = random_2d_frame(data.columns.length);
    var frame_2 = random_2d_frame(data.columns.length);
    var start = new Date().getTime();
    var prev_u = 1;
    var f = function () {
        var elapsed = (new Date().getTime() - start) / 1000;
        var u = elapsed/3;
        u -= Math.floor(u);
        if (u < prev_u) {
            frame_1 = frame_2;
            frame_2 = random_2d_frame(4);
        }
        prev_u = u;
        for (var i=0; i<data.columns.length; ++i) {
            axis_1_parameters[i].set(u*frame_2[0][i] + (1-u) * frame_1[0][i]);
            axis_2_parameters[i].set(u*frame_2[1][i] + (1-u) * frame_1[1][i]);
        }
        window.requestAnimFrame(f, canvas);
        display();
    };
    f();
    return canvas;
};

FacetChart.facet_osm_plot = function(lats, lons, color, width, height)
{
    var canvas = $("<canvas width='" + width + "' height='" + height + "'></canvas>")[0];
    var gl = Facet.init(canvas, {
        clearColor: [1,1,1,1],
        mousedown: function(event) {
            var result = globe.mousedown(event);
            return result;
        },
        mousemove: function(event) {
            var result = globe.mousemove(event);
            return result;
        },
        mouseup: function(event) {
            var result = globe.mouseup(event);
            return result;
        }
    });

    var globe_zoom = Shade.parameter("float", 3.0);
    var view_proj = Shade.Camera.perspective({
        look_at: [Shade.vec(0, 0,  6),
                  Shade.vec(0, 0, -1),
                  Shade.vec(0, 1,  0)],
        field_of_view_y: Shade.div(20, globe_zoom)
    });

    var globe = Facet.Marks.globe({ 
        view_proj: view_proj,
        zoom: globe_zoom
    });

    lats = Facet.attribute_buffer({vertex_array: lats, item_size: 1});
    lons = Facet.attribute_buffer({vertex_array: lons, item_size: 1});

    var dots_model = Facet.model({
        type: "points",
        lats: lats, 
        lons: lons
    });

    var dots_batch = Facet.bake(dots_model, {
        color: Shade.color("black"),
        point_size: 2,
        position: globe.lat_lon_position(dots_model.lats.radians(), 
                                         dots_model.lons.radians())
    });

    Facet.Scene.add(globe);
    Facet.Scene.add(dots_batch);

    return canvas;
};
(function(global) {
    if (global.WebSocket === undefined) {
        if (global.MozWebSocket)
            global.WebSocket = global.MozWebSocket;
        else {
            throw "WebSocket support not found";
        }
    }
})(this);
(function() {

// takes a string and returns the appropriate r literal string with escapes.
function escape_r_literal_string(s) {
    return "\"" + s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"";
    // return "\"" + s.replace(/"/g, "\\\"") + "\"";
}

RClient = {
    create: function(host, onconnect) {
        var socket = new WebSocket(host);

        var _debug = true;
        var _capturing_answers = false;
        var _capturing_callback = undefined;
        var _received_handshake = false;

        var result;
        var command_counter = 0;
        
        socket.binaryType = 'arraybuffer';

        function hand_shake(msg)
        {
            msg = msg.data;
            if (msg.substr(0,4) !== 'Rsrv') {
                result.post_error("server is not an RServe instance");
            } else if (msg.substr(4, 4) !== '0103') {
                result.post_error("sorry, I can only use the 0103 version of the R server protocol");
            } else if (msg.substr(8, 4) !== 'QAP1') {
                result.post_error("sorry, I only speak QAP1");
            } else {
                _received_handshake = true;
                // result.post_response("Welcome to R-on-the-browser!");
		result.send(".session.init()");
                onconnect && onconnect.call(result);
            }
        }

        socket.onmessage = function(msg) {
            if (_capturing_answers) {
                try {
                    _capturing_callback(result.eval(parse(msg.data)));
                } catch (e) {
                    _capturing_answers = false;
                    _capturing_callback = undefined;
                    throw e;
                }
            } else {
                if (!_received_handshake) {
                    hand_shake(msg);
                    return;
                }
                if (typeof msg.data === 'string')
                    result.post_response(msg.data);
                else {
                    result.eval(parse(msg.data));
                }
            }
        };

        socket.onclose = function(msg) {
            result.post_response("Socket was closed. Goodbye!");
        };

        result = {
            handlers: {
                "eval": function(v) {
                    if (v.value.length === 3) {
                        var command_id = v.value[2].value[0];
                        var cb = this.result_handlers[command_id];
                        // if there's a callback attached, call it.
                        // otherwise, display it.
                        if (cb) {
                            cb(command_id, v.value[1]);
                        } else {
                            result.display_response(v.value[1]);
                        }
                    }
                    return v.value[1]; 
                },
                "markdown.eval": function(v) {
                    if (v.value.length === 3) {
                        var command_id = v.value[2].value[0];
                        var cb = this.result_handlers[command_id];
                        // if there's a callback attached, call it.
                        // otherwise, display it.
                        if (cb) {
                            cb(command_id, v.value[1]);
                        } else {
                            result.display_markdown_response(v.value[1]);
                        }
                    }
                    return v.value[1]; 
                },
		// FIXME: I couldn't get this.post_* to work from here so this is just to avoid the error ... it's nonsensical, obviously
		"img.url.update": function(v) { return v.value[1]; },
		"img.url.final": function(v) { return v.value[1]; },
		"dev.new": function(v) { return ""; },
		"dev.close": function(v) { return ""; },
                "internal_cmd": function(v) { return ""; }
            },
            result_handlers: {},

            eval: function(data) {
                var that = this;
                if (data.type !== "sexp") {
                    return this.post_error("Bad protocol, should always be sexp.");
                }
                data = data.value;
                if (data.type === "string_array") {
                    return this.post_error(data.value[0]);
                }
                if (data.type === "null") {
                    return null;
                }
                if (data.type !== "vector") {
                    return this.post_error("Protocol error, unexpected value of type " + data.type);
                }
                if (data.value[0].type !== "string_array" ||
                    data.value[0].value.length !== 1) {
                    return this.post_error("Protocol error, expected first element to be a single string");
                }
                var cmd = data.value[0].value[0];
                var cmds = this.handlers;
                if (cmds[cmd] === undefined) {
                    return this.post_error("Unknown command " + cmd);
                }
		if (cmd == "img.url.update" || cmd == "img.url.final") {
		    // FIXME: this is a bad hack storing in the window - do something more reasonable ;)
		    var ix = window.devImgIndex;
		    if (!ix) window.devImgIndex = ix = 1;
		    if (cmd == "img.url.final") window.devImgIndex++;
		    var div = document.getElementById("dimg"+ix);
		    if (div) // FIXME: we may want to move the div down as well -- maybe just remove the old one and add a new one?
			div.innerHTML = "<img src="+data.value[1].value[0]+">";
		    else
			this.post_div("<div id=dimg"+ix+"><img src="+data.value[1].value[0]+"></div>");
		}
                return cmds[cmd].call(this, data);
            },

            register_handler: function(cmd, callback) {
                this.handlers[cmd] = callback;
            },

            post_sent_command: function (msg) {
                var d = $('<pre class="r-sent-command"></pre>').html('> ' + msg);
                $("#output").append(d);
            },

            post_debug_message: function (msg) {
                var view = new Uint8Array(msg);
                var x = Array.prototype.join.call(view, ",");
                this.post_response(x);
            },

            post_div: function (msg) {
                return shell.post_div(msg);
            },

            post_binary_response: function(msg) {
                if (_debug) {
                    this.post_debug_message(msg);
                    this.display_response(parse(msg));
                } else {
                    try {
                        this.display_response(parse(msg));
                    } catch (e) {
                        this.post_error("Uncaught exception: " + e);
                    }
                }
            },

            display_response: function (result) {
                if (result) $("#output").append(result.html_element());
                window.scrollTo(0, document.body.scrollHeight);
            },

            display_markdown_response: function(result) {
                if (result) {
                    $("#output")
                        .append($("<div></div>")
                                .html(result.value[0]))
                        .find("pre code")
                        .each(function(i, e) { 
                            hljs.highlightBlock(e); 
                        });
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                }
            },

            post_error: function (msg) {
                var d = $("<div class='error-message'></div>").html(msg);
                $("#output").append(d);
                window.scrollTo(0, document.body.scrollHeight);
            },

            post_response: function (msg) {
                var d = $("<pre></pre>").html(msg);
                $("#output").append(d);
                window.scrollTo(0, document.body.scrollHeight);
            },

            capture_answers: function (how_many, callback) {
                if (_capturing_answers) {
                    throw "Still waiting for previous answers...";
                }
                _capturing_answers = true;
                var result = [];
                function blip(msg) {
                    result.push(msg);
                    how_many--;
                    if (how_many === 0) {
                        _capturing_answers = false;
                        _capturing_callback = undefined;
                        callback(result);
                    }
                }
                _capturing_callback = blip;
            },

            wrap_command: function(command, silent) {
                // FIXME code injection? notice that this is already eval, so
                // what _additional_ harm would exist?
                var this_command = command_counter++;
                if (silent === undefined) {
                    silent = false;
                }
                return [ ".session.eval({" + command + "}, "
                         + this_command + ", "
                         + (silent?"TRUE":"FALSE") + ")",
                         this_command ];
            },

            markdown_wrap_command: function(command, silent) {
                var this_command = command_counter++;
                return [ ".session.markdown.eval({markdownToHTML(text=knit(text=" + escape_r_literal_string(command+'\n') + "), fragment=TRUE)}, "
                         + this_command + ", "
                         + (silent?"TRUE":"FALSE") + ")",
                         this_command ];
            },

            log: function(command) {
                command = ".session.log(\"" + rcloud.username() + "\", \"" +
                    command.replace(/\\/g,"\\\\").replace(/"/g,"\\\"")
                + "\")";
                this.send(command);
            },

            send: function(command, wrap) {
                if (!_.isUndefined(wrap)) command = wrap(command)[0];
                var buffer = new ArrayBuffer(command.length + 21);
                var view = new EndianAwareDataView(buffer);
                view.setInt32(0,  3);
                view.setInt32(4,  5 + command.length);
                view.setInt32(8,  0);
                view.setInt32(12, 0);
                view.setInt32(16, 4 + ((1 + command.length) << 8));
                for (var i=0; i<command.length; ++i) {
                    view.setUint8(20 + i, command.charCodeAt(i));
                }
                view.setUint8(buffer.byteLength - 1, 0);

                socket.send(buffer);
            },

            send_and_callback: function(command, callback, wrap) {
                if (_.isUndefined(callback))
                    callback = _.identity;
                var t;
                if (wrap) {
                    t = wrap(command);
                } else {
                    t = this.wrap_command(command, true);
                }
                var command_id = t[1];
                command = t[0];
                var that = this;
                this.result_handlers[command_id] = function(id, data) {
                    delete that.result_handlers[id];
                    callback(data);
                };
                console.log(command);
                this.send(command);
            },

            // FIXME this needs hardening
            r_funcall: function(function_name) {
                var result = [function_name, "("];
                for (var i=1; i<arguments.length; ++i) {
                    var t = typeof arguments[i];
                    if (t === "string") {
                        result.push(escape_r_literal_string(arguments[i]));
                    } else
                        result.push(String(arguments[i]));
                    if (i < arguments.length-1)
                        result.push(",");
                }
                result.push(")");
                var s = result.join("");
                return s;
            }
        };
        return result;
    }
};

})();
(function(global) {
    var _is_little_endian;

    (function() {
        var x = new ArrayBuffer(4);
        var bytes = new Uint8Array(x),
        words = new Uint32Array(x);
        bytes[0] = 1;
        if (words[0] === 1) {
            _is_little_endian = true;
        } else if (words[0] === 16777216) {
            _is_little_endian = false;
        } else {
            throw "we're bizarro endian, refusing to continue";
        }
    })();

    var data_types = ['Int32', 'Int16', 'Uint32', 'Uint16',
                      'Float32', 'Float64'];
    var setters = ['setInt32', 'setInt16', 'setUint32', 'setUint16',
                   'setFloat32', 'setFloat64'];
    var getters = ['getInt32', 'getInt16', 'getUint32', 'getUint16',
                   'getFloat32', 'getFloat64'];

    if (!global.DataView) {
        console.log("polyfilling DataView");

        var helpers = {};
        for (var i=0; i<data_types.length; ++i) {
            var cls = this[data_types[i] + 'Array'];
            var sz = cls.BYTES_PER_ELEMENT;
            var buf = new ArrayBuffer(sz);
            var original_array = new cls(buf);
            var byte_array = new Uint8Array(buf);
            helpers[data_types[i]] = (function(original_array, byte_array) {
                return function(output, sz, ix, v) {
                    original_array[0] = v;
                    for (var i=0; i<sz; ++i) {
                        output[ix + i] = byte_array[i];
                    }
                };
            })(original_array, byte_array);
        }
        
        function MyDataView(buffer, byteOffset, byteLength) {
            this.buffer = buffer;
            this.byteOffset = _.isUndefined(byteOffset) ? 0 : byteOffset;
            this.byteLength = _.isUndefined(byteLength) ? buffer.byteLength : byteLength;
            this.view = new jDataView(buffer, byteOffset, byteLength, _is_little_endian);
            this.byte_array = new Uint8Array(buffer);
        }

        var proto = {};
        MyDataView.prototype = proto;
        for (i=0; i<data_types.length; ++i) {
            var getter = 'get' + data_types[i];
            proto[getter] = (function(name) {
                return function(i) { return this.view[name](i); };
            })(getter);
            var setter = 'set' + data_types[i];
            var sz = this[data_types[i] + 'Array'].BYTES_PER_ELEMENT;
            proto[setter] = (function(sz, name) {
                return function(byteOffset, v) {
                    console.log(name);
                    console.log(helpers);
                    helpers[name](this.byte_array, sz, byteOffset, v);
                };
            })(sz, data_types[i]);
        }

        proto.setUint8 = function(ix, v) {
            this.byte_array[ix] = v;
        };
        proto.setInt8 = function(ix, v) {
            if (v < 0) v += 256;
            this.byte_array[ix] = v;
        };
        proto.getInt8 = function(ix) { return this.view.GetInt8(ix); };
        proto.getUint8 = function(ix) { /* return this.view.GetUint8(ix); // <-- doesn't work in FF! */ this.byte_array[ix]; };

        global.DataView = MyDataView;
    }

    global.EndianAwareDataView = (function() {
        
        var proto = {
            'setInt8': function(i, v) { return this.view.setInt8(i, v); },
            'setUint8': function(i, v) { return this.view.setUint8(i, v); },
            'getInt8': function(i) { return this.view.getInt8(i); },
            'getUint8': function(i) { return this.view.getUint8(i); }
        };

        var setters = ['setInt32', 'setInt16', 'setUint32', 'setUint16',
                       'setFloat32', 'setFloat64'];
        var getters = ['getInt32', 'getInt16', 'getUint32', 'getUint16',
                       'getFloat32', 'getFloat64'];

        for (var i=0; i<setters.length; ++i) {
            var name = setters[i];
            proto[name]= (function(name) {
                return function(byteOffset, value) { 
                    return this.view[name](byteOffset, value, _is_little_endian); };
            })(name);
        }
        for (i=0; i<getters.length; ++i) {
            var name = getters[i];
            proto[name]= (function(name) {
                return function(byteOffset) { 
                    return this.view[name](byteOffset, _is_little_endian); 
                };
            })(name);
        }
        
        function my_dataView(buffer, byteOffset, byteLength) {
            if (byteOffset === undefined) {
                this.view = new DataView(buffer);
            } else {
                this.view = new DataView(buffer, byteOffset, byteLength);
            }
        };
        my_dataView.prototype = proto;
        return my_dataView;
    })();

    global.my_ArrayBufferView = function(b, o, l) {
        o = _.isUndefined(o) ? 0 : o;
        l = _.isUndefined(l) ? b.byteLength : l;
        return {
            buffer: b,
            offset: o,
            length: l,
            make: function(ctor, new_offset, new_length) { 
                new_offset = _.isUndefined(new_offset) ? 0 : new_offset;
                new_length = _.isUndefined(new_length) ? this.length : new_length;
                var element_size = ctor.BYTES_PER_ELEMENT || 1;
                var n_els = new_length / element_size;
                if ((this.offset + new_offset) % element_size != 0) {
                    var view = new DataView(this.buffer, this.offset + new_offset, new_length);
                    var output_buffer = new ArrayBuffer(new_length);
                    var out_view = new DataView(output_buffer);
                    for (var i=0; i < new_length; ++i) {
                        out_view.setUint8(i, view.getUint8(i));
                    }
                    return new ctor(output_buffer);
                } else {
                    return new ctor(this.buffer, 
                                    this.offset + new_offset, 
                                    n_els);
                }
            },
            view: function(new_offset, new_length) {
                // FIXME Needs bounds checking
                return my_ArrayBufferView(this.buffer, this.offset + new_offset, new_length);
            }
        };
    };

})(this);

function reader(m)
{
    var handlers = {};
    var _;

    function lift(f, amount) {
        return function(attributes, length) {
            return [f.call(that, attributes, length), amount || length];
        };
    }

    function bind(m, f) {
        return function(attributes, length) {
            var t = m.call(that, attributes, length);
            var t2 = f(t[0])(attributes, length - t[1]);
            return [t2[0], t[1] + t2[1]];
        };
    }

    function unfold(f) {
        return function(attributes, length) {
            var result = [];
            var old_length = length;
            while (length > 0) {
                var t = f.call(that, attributes, length);
                result.push(t[0]);
                length -= t[1];
            }
            return [result, old_length];
        };
    }

    var that = {
        offset: 0,
        data_view: m.make(EndianAwareDataView),
        msg: m,

        //////////////////////////////////////////////////////////////////////

        read_int: function() {
            var old_offset = this.offset;
            this.offset += 4;
            return this.data_view.getInt32(old_offset);
        },
        read_string: function(length) {
            // FIXME SLOW
            var result = "";
            while (length--) {
                var c = this.data_view.getInt8(this.offset++);
                if (c) result = result + String.fromCharCode(c);
            }
            return result;
        },
        read_stream: function(length) {
            var old_offset = this.offset;
            this.offset += length;
            return this.msg.view(old_offset, length);
        },
        read_int_vector: function(length) {
            var old_offset = this.offset;
            this.offset += length;
            return this.msg.make(Int32Array, old_offset, length);
        },
        read_double_vector: function(length) {
            var old_offset = this.offset;
            this.offset += length;
            return this.msg.make(Float64Array, old_offset, length);
        },

        //////////////////////////////////////////////////////////////////////

        read_null: lift(function(a, l) { return Robj.null(a); }),

        //////////////////////////////////////////////////////////////////////
        // and these return full R objects as well.

        read_string_array: function(attributes, length) {
            var a = this.read_stream(length).make(Uint8Array);
            var result = [];
            var current_str = "";
            for (var i=0; i<a.length; ++i)
                if (a[i] === 0) {
                    result.push(current_str);
                    current_str = "";
                } else {
                    current_str = current_str + String.fromCharCode(a[i]);
                }
            return [Robj.string_array(result, attributes), length];
        },
        read_bool_array: function(attributes, length) {
            var l2 = this.read_int();
            var s = this.read_stream(length-4);
            var a = s.make(Uint8Array); // new Uint8Array(s, 0, l2);
            var result = [];
            for (var i=0; i<l2; ++i)
                result[i] = !!a[i];
            return [Robj.bool_array(result, attributes), length];
        },

        read_sexp: function() {
            var d = this.read_int();
            var _ = Rsrv.par_parse(d);
            var t = _[0], l = _[1];
            var total_read = 4;
            var attributes = undefined;
            if (t & Rsrv.XT_HAS_ATTR) {
                t = t & ~Rsrv.XT_HAS_ATTR;
                var attr_result = this.read_sexp();
                attributes = attr_result[0];
                total_read += attr_result[1];
                l -= attr_result[1];
            }
            if (handlers[t] === undefined) {
                throw "Unimplemented " + t;        
            } else {
                var result = handlers[t].call(this, attributes, l);
                return [result[0], total_read + result[1]];
            }
        }
    };

    that.read_clos = bind(that.read_sexp, function(formals) { 
              return bind(that.read_sexp, function(body)    { 
              return lift(function(a, l) {
              return Robj.clos(formals, body, a); 
              }, 0);
              } );
    });

    that.read_list = unfold(that.read_sexp);
    that.read_list_tag = bind(that.read_list, function(lst) {
        return lift(function(attributes, length) {
            var result = {};
            for (var i=0; i<lst.length; i+=2) {
                var value = lst[i], tag = lst[i+1];
                if (tag.type !== "symbol")
                    throw "Unexpected type " + tag.type + " as tag for tagged_list";
                result[tag.value] = value;
            }
            return Robj.tagged_list(result, attributes);
        }, 0);
    });

    function xf(f, g) { return bind(f, function(t) { 
        return lift(function(a, l) { return g(t, a); }, 0); 
    }); }
    that.read_vector       = xf(that.read_list, Robj.vector);
    that.read_list_no_tag  = xf(that.read_list, Robj.list);
    that.read_lang_no_tag  = xf(that.read_list, Robj.lang);
    that.read_vector_exp   = xf(that.read_list, Robj.vector_exp);

    function sl(f, g) { return lift(function(a, l) {
        return g(f.call(that, l), a);
    }); }
    that.read_symname      = sl(that.read_string,        Robj.symbol);
    that.read_int_array    = sl(that.read_int_vector,    Robj.int_array);
    that.read_double_array = sl(that.read_double_vector, Robj.double_array);

    handlers[Rsrv.XT_NULL]         = that.read_null;
    handlers[Rsrv.XT_VECTOR]       = that.read_vector;
    handlers[Rsrv.XT_CLOS]         = that.read_clos;
    handlers[Rsrv.XT_SYMNAME]      = that.read_symname;
    handlers[Rsrv.XT_LIST_NOTAG]   = that.read_list_no_tag;
    handlers[Rsrv.XT_LIST_TAG]     = that.read_list_tag;
    handlers[Rsrv.XT_LANG_NOTAG]   = that.read_lang_no_tag;
    handlers[Rsrv.XT_VECTOR_EXP]   = that.read_vector_exp;
    handlers[Rsrv.XT_ARRAY_INT]    = that.read_int_array;
    handlers[Rsrv.XT_ARRAY_DOUBLE] = that.read_double_array;
    handlers[Rsrv.XT_ARRAY_STR]    = that.read_string_array;
    handlers[Rsrv.XT_ARRAY_BOOL]   = that.read_bool_array;

    return that;
}

function parse(msg)
{
    var header = new Int32Array(msg, 0, 4);
    if (header[0] !== Rsrv.RESP_OK && header[0] !== Rsrv.OOB_SEND) {
        var status_code = header[0] >> 24;
        throw("ERROR FROM R SERVER: " + (Rsrv.status_codes[status_code] || 
                                         status_code)
              + " " + header[0] + " " + header[1] + " " + header[2] + " " + header[3]
              + " " + msg.byteLength
              + " " + msg
             ); // not too helpful, but better than undefined
    }

    var payload = my_ArrayBufferView(msg, 16, msg.byteLength - 16);
    var result = parse_payload(reader(payload));
    return result;

    if (result.type !== "sexp") {
        throw "Bogus reply from RServe for eval, type not sexp";
    }
    var t = result.value;
    return t;
}

function parse_payload(reader)
{
    var d = reader.read_int();
    var _ = Rsrv.par_parse(d);
    var t = _[0], l = _[1];
    if (t === Rsrv.DT_INT) {
        return { type: "int", value: reader.read_int() };
    } else if (t === Rsrv.DT_STRING) {
        return { type: "string", value: reader.read_string(l) };
    } else if (t === Rsrv.DT_BYTESTREAM) { // NB this returns a my_ArrayBufferView()
        return { type: "stream", value: reader.read_stream(l) };
    } else if (t === Rsrv.DT_SEXP) {
        _ = reader.read_sexp();
        var sexp = _[0], l2 = _[1];
        return { type: "sexp", value: sexp };
    } else
        throw "Bad type for parse? " + t + " " + l;
}
parser = (function(){
  /* Generated by PEG.js 0.6.2 (http://pegjs.majda.cz/). */
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "command": parse_command,
        "identifier": parse_identifier,
        "parameter": parse_parameter,
        "paramlist": parse_paramlist,
        "whitespace": parse_whitespace
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "command";
      }
      
      var pos = 0;
      var reportMatchFailures = true;
      var rightmostMatchFailuresPos = 0;
      var rightmostMatchFailuresExpected = [];
      var cache = {};
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        
        if (charCode <= 0xFF) {
          var escapeChar = 'x';
          var length = 2;
        } else {
          var escapeChar = 'u';
          var length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function quote(s) {
        /*
         * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
         * string literal except for the closing quote character, backslash,
         * carriage return, line separator, paragraph separator, and line feed.
         * Any character may appear in the form of an escape sequence.
         */
        return '"' + s
          .replace(/\\/g, '\\\\')            // backslash
          .replace(/"/g, '\\"')              // closing quote character
          .replace(/\r/g, '\\r')             // carriage return
          .replace(/\n/g, '\\n')             // line feed
          .replace(/[\x80-\uFFFF]/g, escape) // non-ASCII characters
          + '"';
      }
      
      function matchFailed(failure) {
        if (pos < rightmostMatchFailuresPos) {
          return;
        }
        
        if (pos > rightmostMatchFailuresPos) {
          rightmostMatchFailuresPos = pos;
          rightmostMatchFailuresExpected = [];
        }
        
        rightmostMatchFailuresExpected.push(failure);
      }
      
      function parse_whitespace() {
        var cacheKey = 'whitespace@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        if (input.substr(pos).match(/^[ 	\n\r]/) !== null) {
          var result1 = input.charAt(pos);
          pos++;
        } else {
          var result1 = null;
          if (reportMatchFailures) {
            matchFailed("[ 	\\n\\r]");
          }
        }
        if (result1 !== null) {
          var result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (input.substr(pos).match(/^[ 	\n\r]/) !== null) {
              var result1 = input.charAt(pos);
              pos++;
            } else {
              var result1 = null;
              if (reportMatchFailures) {
                matchFailed("[ 	\\n\\r]");
              }
            }
          }
        } else {
          var result0 = null;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_command() {
        var cacheKey = 'command@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos2 = pos;
        var savedPos3 = pos;
        if (input.substr(pos, 1) === "@") {
          var result9 = "@";
          pos += 1;
        } else {
          var result9 = null;
          if (reportMatchFailures) {
            matchFailed("\"@\"");
          }
        }
        if (result9 !== null) {
          var result10 = parse_identifier();
          if (result10 !== null) {
            var result11 = parse_whitespace();
            if (result11 !== null) {
              var result12 = parse_paramlist();
              if (result12 !== null) {
                var result7 = [result9, result10, result11, result12];
              } else {
                var result7 = null;
                pos = savedPos3;
              }
            } else {
              var result7 = null;
              pos = savedPos3;
            }
          } else {
            var result7 = null;
            pos = savedPos3;
          }
        } else {
          var result7 = null;
          pos = savedPos3;
        }
        var result8 = result7 !== null
          ? (function(id, ps) { return {id: id, ps: ps}; })(result7[1], result7[3])
          : null;
        if (result8 !== null) {
          var result6 = result8;
        } else {
          var result6 = null;
          pos = savedPos2;
        }
        if (result6 !== null) {
          var result0 = result6;
        } else {
          var savedPos0 = pos;
          var savedPos1 = pos;
          if (input.substr(pos, 1) === "@") {
            var result4 = "@";
            pos += 1;
          } else {
            var result4 = null;
            if (reportMatchFailures) {
              matchFailed("\"@\"");
            }
          }
          if (result4 !== null) {
            var result5 = parse_identifier();
            if (result5 !== null) {
              var result2 = [result4, result5];
            } else {
              var result2 = null;
              pos = savedPos1;
            }
          } else {
            var result2 = null;
            pos = savedPos1;
          }
          var result3 = result2 !== null
            ? (function(id) { return {id: id, ps: []}; })(result2[1])
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_identifier() {
        var cacheKey = 'identifier@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos).match(/^[A-Za-z_]/) !== null) {
          var result3 = input.charAt(pos);
          pos++;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("[A-Za-z_]");
          }
        }
        if (result3 !== null) {
          if (input.substr(pos).match(/^[A-Za-z0-9_]/) !== null) {
            var result5 = input.charAt(pos);
            pos++;
          } else {
            var result5 = null;
            if (reportMatchFailures) {
              matchFailed("[A-Za-z0-9_]");
            }
          }
          if (result5 !== null) {
            var result4 = [];
            while (result5 !== null) {
              result4.push(result5);
              if (input.substr(pos).match(/^[A-Za-z0-9_]/) !== null) {
                var result5 = input.charAt(pos);
                pos++;
              } else {
                var result5 = null;
                if (reportMatchFailures) {
                  matchFailed("[A-Za-z0-9_]");
                }
              }
            }
          } else {
            var result4 = null;
          }
          if (result4 !== null) {
            var result1 = [result3, result4];
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(first, rest) { return first + rest.join("");})(result1[0], result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_paramlist() {
        var cacheKey = 'paramlist@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos1 = pos;
        var savedPos2 = pos;
        var result7 = parse_parameter();
        if (result7 !== null) {
          var result8 = parse_whitespace();
          if (result8 !== null) {
            var result9 = parse_paramlist();
            if (result9 !== null) {
              var result5 = [result7, result8, result9];
            } else {
              var result5 = null;
              pos = savedPos2;
            }
          } else {
            var result5 = null;
            pos = savedPos2;
          }
        } else {
          var result5 = null;
          pos = savedPos2;
        }
        var result6 = result5 !== null
          ? (function(car, cdr) { var result = [car]; for (var i=0; i<cdr.length; ++i) result.push(cdr[i]); return result; })(result5[0], result5[2])
          : null;
        if (result6 !== null) {
          var result4 = result6;
        } else {
          var result4 = null;
          pos = savedPos1;
        }
        if (result4 !== null) {
          var result0 = result4;
        } else {
          var savedPos0 = pos;
          var result2 = parse_parameter();
          var result3 = result2 !== null
            ? (function(car) { return [car]; })(result2)
            : null;
          if (result3 !== null) {
            var result1 = result3;
          } else {
            var result1 = null;
            pos = savedPos0;
          }
          if (result1 !== null) {
            var result0 = result1;
          } else {
            var result0 = null;;
          };
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function parse_parameter() {
        var cacheKey = 'parameter@' + pos;
        var cachedResult = cache[cacheKey];
        if (cachedResult) {
          pos = cachedResult.nextPos;
          return cachedResult.result;
        }
        
        
        var savedPos0 = pos;
        var savedPos1 = pos;
        if (input.substr(pos, 2) === "{{") {
          var result3 = "{{";
          pos += 2;
        } else {
          var result3 = null;
          if (reportMatchFailures) {
            matchFailed("\"{{\"");
          }
        }
        if (result3 !== null) {
          if (input.substr(pos).match(/^[A-Za-z0-9_.+\/*\-"'[\]()!@#$%^&*;:<>,\\|]/) !== null) {
            var result6 = input.charAt(pos);
            pos++;
          } else {
            var result6 = null;
            if (reportMatchFailures) {
              matchFailed("[A-Za-z0-9_.+\\/*\\-\"'[\\]()!@#$%^&*;:<>,\\\\|]");
            }
          }
          if (result6 !== null) {
            var result4 = [];
            while (result6 !== null) {
              result4.push(result6);
              if (input.substr(pos).match(/^[A-Za-z0-9_.+\/*\-"'[\]()!@#$%^&*;:<>,\\|]/) !== null) {
                var result6 = input.charAt(pos);
                pos++;
              } else {
                var result6 = null;
                if (reportMatchFailures) {
                  matchFailed("[A-Za-z0-9_.+\\/*\\-\"'[\\]()!@#$%^&*;:<>,\\\\|]");
                }
              }
            }
          } else {
            var result4 = null;
          }
          if (result4 !== null) {
            if (input.substr(pos, 2) === "}}") {
              var result5 = "}}";
              pos += 2;
            } else {
              var result5 = null;
              if (reportMatchFailures) {
                matchFailed("\"}}\"");
              }
            }
            if (result5 !== null) {
              var result1 = [result3, result4, result5];
            } else {
              var result1 = null;
              pos = savedPos1;
            }
          } else {
            var result1 = null;
            pos = savedPos1;
          }
        } else {
          var result1 = null;
          pos = savedPos1;
        }
        var result2 = result1 !== null
          ? (function(param) { return param.join(""); })(result1[1])
          : null;
        if (result2 !== null) {
          var result0 = result2;
        } else {
          var result0 = null;
          pos = savedPos0;
        }
        
        
        
        cache[cacheKey] = {
          nextPos: pos,
          result:  result0
        };
        return result0;
      }
      
      function buildErrorMessage() {
        function buildExpected(failuresExpected) {
          failuresExpected.sort();
          
          var lastFailure = null;
          var failuresExpectedUnique = [];
          for (var i = 0; i < failuresExpected.length; i++) {
            if (failuresExpected[i] !== lastFailure) {
              failuresExpectedUnique.push(failuresExpected[i]);
              lastFailure = failuresExpected[i];
            }
          }
          
          switch (failuresExpectedUnique.length) {
            case 0:
              return 'end of input';
            case 1:
              return failuresExpectedUnique[0];
            default:
              return failuresExpectedUnique.slice(0, failuresExpectedUnique.length - 1).join(', ')
                + ' or '
                + failuresExpectedUnique[failuresExpectedUnique.length - 1];
          }
        }
        
        var expected = buildExpected(rightmostMatchFailuresExpected);
        var actualPos = Math.max(pos, rightmostMatchFailuresPos);
        var actual = actualPos < input.length
          ? quote(input.charAt(actualPos))
          : 'end of input';
        
        return 'Expected ' + expected + ' but ' + actual + ' found.';
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i <  rightmostMatchFailuresPos; i++) {
          var ch = input.charAt(i);
          if (ch === '\n') {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === '\r' | ch === '\u2028' || ch === '\u2029') {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostMatchFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostMatchFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var errorPosition = computeErrorPosition();
        throw new this.SyntaxError(
          buildErrorMessage(),
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(message, line, column) {
    this.name = 'SyntaxError';
    this.message = message;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();
function make_basic(type, proto) {
    return function(v, attrs) {
        function r_object() {
            this.type = type;
            this.value = v;
            this.attributes = attrs;
        }
        r_object.prototype = proto || {
            html_element: function() {
                return $("<div class='obj'></div>").append($("<div class='key'></div>").html(type));
            }
        };
        return new r_object();
    };
}

function pprint_array_as_div(formatter) {
    function plain_array() {
        var result = $("<div class='obj'></div>");
        var div = $("<div class='string-value'></div>");
        var v = this.value;
        var s;
        var that = this;
        formatter = formatter || function(v) { return v; };
        var element;
        if (this.attributes && this.attributes.value.names) {
            element = function(i) {
                return that.attributes.value.names.value[i] + ": " + formatter(String(v[i]));
            };
        } else if (this.attributes && this.attributes.value.levels) {
            element = function(i) {
                return that.attributes.value.levels.value[v[i]-1];
            };
        } else {
            element = function(i) {
                return formatter(String(v[i]));
            };
        }
        
        if (v.length === 0) {
            s = "[]";
        } else if (v.length === 1) {
            s = element(0);
        } else if (v.length <= 10) {
            s = "[" + element(0);
            for (var i=1; i<v.length; ++i) {
                s = s + ", " + element(i);
            }
            s = s + "]";
        } else {
            s = "[" + element(0);
            for (var i=1; i<5; ++i) {
                s = s + ", " + element(i);
            }
            s = s + ", ... ";
            for (i=v.length-5; i<v.length; ++i)
                s = s + ", " + element(i);
            s = s + "]";
        }
        div.html(s);
        result.append(div);
        return result;
    }
    function matrix() {
        var result = document.createElement("table");
        var header = document.createElement("tr");
        result.appendChild(header);
        var dims = this.attributes.value.dim.value;
        var values = this.value;
        var that = this;
        d3.select(header)
            .selectAll("td")
            .data(_.range(dims[1]+1))
            .enter().append("td").text(function(i) {
                if (i === 0) return "";
                return "[," + i + "]";
            });
        d3.select(result)
            .selectAll("tr-data")
            .data(_.range(dims[0]))
            .enter().append("tr")
                    .selectAll("td")
                    .data(function(i) { return _.map(_.range(dims[1]+1),
                                                     function(j) {
                                                         return [i,j];
                                                     });
                                      })
                    .enter()
                    .append("td")
                    .text(function(d) {
                        var row = d[0], col = d[1];
                        if (col === 0) {
                            return "[" + (row+1) + ",]";
                        };
                        var v = values[(col-1) * dims[0] + row];
                        if (that.attributes &&
                            that.attributes.value.levels) {
                            return that.attributes.value.levels.value[v-1];
                        } else {
                            return v;
                        }
                    });
        return result;
    }
    
    return function() {
        if (this.attributes &&
            this.attributes.value.dim) {
            return matrix.call(this);
        } else
            return plain_array.call(this);

    };
}

Robj = {
    "null": function(attributes) {
        return { 
            type: "null", 
            value: null,
            attributes: attributes,
            html_element: function() {
                return $("<div class='obj'><div class='key'>null</div></div>");
            }
        };
    },

    clos: function(formals, body, attributes) {
        return {
            type: "clos",
            value: { formals: formals,
                     body: body },
            attributes: attributes,
            html_element: function() {
                var div = $("<div class='obj'></div>");
                var pair = $("<div></div>");
                pair.append($("<div class='key'>formals:</div>"));
                pair.append(this.value.formals.html_element());
                div.append(pair);
                pair = $("<div></div>");
                pair.append($("<div class='key'>body:</div>"));
                pair.append(this.value.body.html_element());
                div.append(pair);
                return div;
            }
        };
    },

    vector: make_basic("vector", {
        html_element: function () {
            var div = $("<div class='obj'></div>");
            if (!this.attributes) {
                for (var i=0; i<this.value.length; ++i) {
                    div.append(this.value[i].html_element());
                }
            } else {
                var lengths = _.map(this.value, function(v) { return v.value.length; });
                var names = this.attributes.value.names.value;
                if (_.all(lengths, function(i) { return i === lengths[0]; })) {
                    // it's a dataframe
                    var result = document.createElement("table");
                    var th = document.createElement("tr");
                    var values = this.value;
                    result.appendChild(th);
                    d3.select(th)
                        .selectAll("th")
                        .data(_.range(lengths.length))
                        .enter().append("th").text(function(i) {
                            return names[i];
                        });
                    var rows;
                        // rows = _.range(lengths[0]);
                    if (lengths[0] < 11) {
                        rows = _.range(lengths[0]);
                    } else {
                        rows = [0,1,2,3,4,5];
                        rows.push.apply(rows, _.range(lengths[0] - 5, lengths[0]));
                    }
                    d3.select(result)
                        .selectAll("tr-data")
                        .data(rows)
                        .enter().append("tr")
                                .selectAll("td")
                                .data(function(i) { return _.map(_.range(lengths.length),
                                                                 function(j) {
                                                                     return [i,j]; 
                                                                 });
                                                  })
                                .enter()
                                .append("td")
                                .text(function(d, i) {
                                    var row = d[0], col = d[1];
                                    if (lengths[0] >= 11 && row === 5)
                                        return "...";
                                    var v = values[col].value[row];
                                    if (values[col].attributes) {
                                        return values[col].attributes.value.levels.value[v-1];
                                    } else {
                                        return v;
                                    }
                                });
                    div.append(result);
                } else {
                    var pair = $("<div></div>");
                    for (var i=0; i<this.value.length; ++i) {
                        pair.append($("<span class='key'></span>").append(names[i] + ": "));
                        pair.append(this.value[i].html_element());
                    }
                    div.append(pair);
                }
            }
            return div;
        }
    }),
    symbol: make_basic("symbol"),
    list: make_basic("list"),
    lang: make_basic("lang"),
    tagged_list: make_basic("tagged_list"),
    tagged_lang: make_basic("tagged_lang"),
    vector_exp: make_basic("vector_exp"),
    int_array: make_basic("int_array", {
        html_element: pprint_array_as_div()
    }),
    double_array: make_basic("double_array", {
        html_element: pprint_array_as_div()
    }),
    string_array: make_basic("string_array", {
        // from http://javascript.crockford.com/remedial.html
        html_element: pprint_array_as_div(function (s) {
            var c, i, l = s.length, o = '"';
            for (i = 0; i < l; i += 1) {
                c = s.charAt(i);
                if (c >= ' ') {
                    if (c === '\\' || c === '"') {
                        o += '\\';
                    }
                    o += c;
                } else {
                    switch (c) {
                    case '\b':
                        o += '\\b';
                        break;
                    case '\f':
                        o += '\\f';
                        break;
                    case '\n':
                        o += '\\n';
                        break;
                    case '\r':
                        o += '\\r';
                        break;
                    case '\t':
                        o += '\\t';
                        break;
                    default:
                        c = c.charCodeAt();
                        o += '\\u00' + Math.floor(c / 16).toString(16) +
                            (c % 16).toString(16);
                    }
                }
            }
            return o + '"';
        })
    }),
    bool_array: make_basic("bool_array", {
        html_element: pprint_array_as_div()
    })
};
Rsrv = {
    PAR_TYPE: function(x) { return x & 255; },
    PAR_LEN: function(x) { return x >> 8; },
    PAR_LENGTH: function(x) { return x >> 8; },
    par_parse: function(x) { return [Rsrv.PAR_TYPE(x), Rsrv.PAR_LEN(x)]; },
    SET_PAR: function(ty, len) { return ((len & 0xffffff) << 8 | (ty & 255)); },
    CMD_STAT: function(x) { return (x >> 24) & 127; },
    SET_STAT: function(x, s) { return x | ((s & 127) << 24); },

    CMD_RESP           : 0x10000,
    RESP_OK            : 0x10000 | 0x0001,
    RESP_ERR           : 0x10000 | 0x0002,
    OOB_SEND           : 0x30000 | 0x1000,
    ERR_auth_failed    : 0x41,
    ERR_conn_broken    : 0x42,
    ERR_inv_cmd        : 0x43,
    ERR_inv_par        : 0x44,
    ERR_Rerror         : 0x45,
    ERR_IOerror        : 0x46,
    ERR_notOpen        : 0x47,
    ERR_accessDenied   : 0x48,
    ERR_unsupportedCmd : 0x49,
    ERR_unknownCmd     : 0x4a,
    ERR_data_overflow  : 0x4b,
    ERR_object_too_big : 0x4c,
    ERR_out_of_mem     : 0x4d,
    ERR_ctrl_closed    : 0x4e,
    ERR_session_busy   : 0x50,
    ERR_detach_failed  : 0x51,

    CMD_long             : 0x001,
    CMD_voidEval         : 0x002,
    CMD_eval             : 0x003,
    CMD_shutdown         : 0x004,
    CMD_openFile         : 0x010,
    CMD_createFile       : 0x011,
    CMD_closeFile        : 0x012,
    CMD_readFile         : 0x013,
    CMD_writeFile        : 0x014,
    CMD_removeFile       : 0x015,
    CMD_setSEXP          : 0x020,
    CMD_assignSEXP       : 0201,
    CMD_detachSession    : 0x030,
    CMD_detachedVoidEval : 0x031,
    CMD_attachSession    : 0x032,
    CMD_ctrl             : 0x40,
    CMD_ctrlEval         : 0x42,
    CMD_ctrlSource       : 0x45,
    CMD_ctrlShutdown     : 0x44,
    CMD_setBufferSize    : 0x081,
    CMD_setEncoding      : 0x082,
    CMD_SPECIAL_MASK     : 0xf0,
    CMD_serEval          : 0xf5,
    CMD_serAssign        : 0xf6,
    CMD_serEEval         : 0xf7,


    DT_INT        : 1,
    DT_CHAR       : 2,
    DT_DOUBLE     : 3,
    DT_STRING     : 4,
    DT_BYTESTREAM : 5,
    DT_SEXP       : 10,
    DT_ARRAY      : 11,
    DT_LARGE      : 64,

    XT_NULL          : 0,
    XT_INT           : 1,
    XT_DOUBLE        : 2,
    XT_STR           : 3,
    XT_LANG          : 4,
    XT_SYM           : 5,
    XT_BOOL          : 6,
    XT_S4            : 7,
    XT_VECTOR        : 16,
    XT_LIST          : 17,
    XT_CLOS          : 18,
    XT_SYMNAME       : 19,
    XT_LIST_NOTAG    : 20,
    XT_LIST_TAG      : 21,
    XT_LANG_NOTAG    : 22,
    XT_LANG_TAG      : 23,
    XT_VECTOR_EXP    : 26,
    XT_VECTOR_STR    : 27,
    XT_ARRAY_INT     : 32,
    XT_ARRAY_DOUBLE  : 33,
    XT_ARRAY_STR     : 34,
    XT_ARRAY_BOOL_UA : 35,
    XT_ARRAY_BOOL    : 36,
    XT_RAW           : 37,
    XT_ARRAY_CPLX    : 38,
    XT_UNKNOWN       : 48,
    XT_LARGE         : 64,
    XT_HAS_ATTR      : 128,

    BOOL_TRUE  : 1,
    BOOL_FALSE : 0,
    BOOL_NA    : 2,

    GET_XT: function(x) { return x & 63; },
    GET_DT: function(x) { return x & 63; },
    HAS_ATTR: function(x) { return (x & Rsrv.XT_HAS_ATTR) > 0; },
    IS_LARGE: function(x) { return (x & Rsrv.XT_LARGE) > 0; },

    // # FIXME A WHOLE LOT OF MACROS HERE WHICH ARE PROBABLY IMPORTANT
    // ##############################################################################

    itop: function(x) { return x; },
    ptoi: function(x) { return x; },
    dtop: function(x) { return x; },
    ptod: function(x) { return x; },

    fixdcpy: function() { throw "unimplemented"; },

    status_codes: {
        0x41 : "ERR_auth_failed"   ,
        0x42 : "ERR_conn_broken"   ,
        0x43 : "ERR_inv_cmd"       ,
        0x44 : "ERR_inv_par"       ,
        0x45 : "ERR_Rerror"        ,
        0x46 : "ERR_IOerror"       ,
        0x47 : "ERR_notOpen"       ,
        0x48 : "ERR_accessDenied"  ,
        0x49 : "ERR_unsupportedCmd",
        0x4a : "ERR_unknownCmd"    ,
        0x4b : "ERR_data_overflow" ,
        0x4c : "ERR_object_too_big",
        0x4d : "ERR_out_of_mem"    ,
        0x4e : "ERR_ctrl_closed"   ,
        0x50 : "ERR_session_busy"  ,
        0x51 : "ERR_detach_failed"
    }
};
rcloud = {};

rcloud.init_client_side_data = function()
{
    var that = this;
    rcloud.get_user_filenames(function(data) {
        that.user_filenames = data.value;

        //////////////////////////////////////////////////////////////////
        // debugging info
        var filenames = data.value;
        var userfiles_float = d3.select("#internals-user-files");
        userfiles_float.append("h3").text("User files");
        userfiles_float.append("ul")
            .selectAll("li")
            .data(filenames)
            .enter()
            .append("li").text(function(i) { return i; });
    });
    rclient.send_and_callback("wplot.uuid", function(data) {
        that.wplot_uuid = data.value[0];
    });
};

rcloud.username = function()
{
    return $.cookies.get('user');
};

rcloud.get_user_filenames = function(k)
{
    if (_.isUndefined(k)) k = _.identity;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.list.initial.filenames", this.username()), k);
}; 

rcloud.search = function(search_string, k)
{
    var that = this;
    if (_.isUndefined(k)) k = _.identity;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.search", search_string), k);
};

rcloud.get_all_user_filenames = function(k)
{
    var that = this;
    if (_.isUndefined(k)) k = _.identity;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.list.all.initial.filenames"), k);
}; 

rcloud.load_user_file = function(user, filename, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.load.user.file", user, filename), k);
};

rcloud.save_to_user_file = function(user, filename, content, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.save.to.user.file", user, filename, content),
                          k);
};

rcloud.create_user_file = function(filename, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.create.user.file", rcloud.username(), filename), k);
};

rcloud.resolve_deferred_result = function(uuid, k)
{
    var cmd = rclient.r_funcall("rcloud.fetch.deferred.result", uuid);
    rclient.send_and_callback(cmd, k);
};
Notebook = {};

//////////////////////////////////////////////////////////////////////////////
//
// roughly a MVC-kinda-thing per cell, plus a MVC for all the cells
// 
Notebook.Cell = {};
Notebook.Cell.create_html_view = function(cell_model)
{
    var notebook_cell_div  = $("<div class='notebook-cell'></div>");

    //////////////////////////////////////////////////////////////////////////
    // button bar
    var source_button = $("<span class='fontawesome-button'><i class='icon-edit' alt='Show Source'></i></span>");
    var result_button = $("<span class='fontawesome-button'><i class='icon-picture' alt='Show Result'></i></span>");
    var hide_button   = $("<span class='fontawesome-button'><i class='icon-resize-small' alt='Hide cell'></i></span>");
    var remove_button = $("<span class='fontawesome-button'><i class='icon-trash' alt='Remove cell'></i></span>");
    var run_md_button = $("<span class='fontawesome-button'><i class='icon-repeat' alt='Re-execute'></i></span>");

    function update_model() {
        cell_model.content(widget.getSession().getValue());
    }
    function enable(el) {
        el.removeClass("button-disabled");
    }
    function disable(el) {
        el.addClass("button-disabled");
    }

    source_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled"))
            result.show_source();
    });
    result_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled"))
            result.show_result();
    });
    hide_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled"))
            result.hide_all();
    });
    remove_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled"))
            cell_model.parent_model.remove_cell(cell_model);
    });
    run_md_button.click(function(e) {
        r_result_div.html("Computing...");
        update_model();
        result.show_result();
        cell_model.controller.execute();
    });

    // Ace sets its z-index to be 1000; 
    // "and thus began the great z-index arms race of 2012"
    var button_float = $("<div style='position:relative; float: right; z-index:10000'></div>");
    var row1 = $("<div style='margin:0.5em;'></div>");
    var editor_row = $("<div style='margin:0.5em;'></div>");
    row1.append(source_button);
    row1.append(result_button);
    row1.append(hide_button);
    row1.append(remove_button);
    button_float.append(row1);
    editor_row.append(run_md_button);
    editor_row.hide();
    button_float.append(editor_row);

    notebook_cell_div.append(button_float);

    //////////////////////////////////////////////////////////////////////////

    var inner_div = $("<div></div>");
    var clear_div = $("<div style='clear:both;'></div>");
    notebook_cell_div.append(inner_div);
    notebook_cell_div.append(clear_div);

    var markdown_div = $('<div style="position: relative; width:100%; height:100%"></div>');
    var cell_buttons_div = $('<div style="position: absolute; right:-0.5em; top:-0.5em"></div>');
    var insert_cell_button = $('<span class="fontawesome-button"><i class="icon-plus-sign"></i>');
    inner_div.append(cell_buttons_div);
    cell_buttons_div.append(insert_cell_button);
    insert_cell_button.click(function(e) {
        // this is truly the wrong way to go about things
        var base_index = notebook_cell_div.index();
        var model_index = base_index - 2;
        shell.insert_markdown_cell_before_index(model_index);
    });
    
    var ace_div = $('<div style="width:100%; height:100%"></div>');
    inner_div.append(markdown_div);
    markdown_div.append(ace_div);
    var widget = ace.edit(ace_div[0]);
    widget.setTheme("ace/theme/chrome");
    widget.getSession().setUseWrapMode(true);
    widget.resize();

    var r_result_div = $('<div class="r-result-div">Computing...</div>');
    inner_div.append(r_result_div);

    var result = {

        //////////////////////////////////////////////////////////////////////
        // pubsub event handlers

        content_updated: function() {
            widget.getSession().setValue(cell_model.content());
        },
        self_removed: function() {
            notebook_cell_div.remove();
        },
        result_updated: function(r) {
            r_result_div.html(r.value[0]);

            // There's a list of things that we need to do to the output:
            var uuid = rcloud.wplot_uuid;

            // capture interactive graphics
            inner_div.find("pre code")
                .contents()
                .filter(function() {
                    return this.nodeValue.indexOf(uuid) !== -1;
                }).parent().parent()
                .each(function() {
                    var uuids = this.childNodes[0].childNodes[0].data.substr(8,73).split("|");
                    var that = this;
                    rcloud.resolve_deferred_result(uuids[1], function(data) {
                        $(that).replaceWith(function() {
                            return shell.handle(data.value[0].value[0], data);
                        });
                    });
                });
            // highlight R
            inner_div
                .find("pre code")
                .each(function(i, e) {
                    hljs.highlightBlock(e);
                });
            
            // typeset the math
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                
            this.show_result();
        },

        //////////////////////////////////////////////////////////////////////

        show_source: function() {
            notebook_cell_div.css({'height': '70%'});
            disable(source_button);
            enable(result_button);
            enable(hide_button);
            enable(remove_button);
            editor_row.show();

            markdown_div.show();
            widget.resize();
            r_result_div.hide();
        },
        show_result: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            disable(result_button);
            enable(hide_button);
            enable(remove_button);

            editor_row.hide();
            markdown_div.hide();
            r_result_div.show();
        },
        hide_all: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            enable(result_button);
            disable(hide_button);
            enable(remove_button);

            editor_row.hide();
            markdown_div.hide();
            r_result_div.hide();
        },
        remove_self: function() {
            cell_model.parent_model.remove_cell(cell_model);            
            notebook_cell_div.remove();
        },
        div: function() {
            return notebook_cell_div;
        }
    };

    result.show_result();
    result.content_updated();
    return result;
};
Notebook.Cell.create_model = function(content, type)
{
    var result = {
        views: [], // sub list for pubsub
        type: function() {
            return type;
        },
        content: function(new_content) {
            if (!_.isUndefined(new_content)) {
                content = new_content;
                notify_views();
            }
            return content;
        },
        json: function() {
            return {
                content: content,
                type: type
            };
        }
    };
    function notify_views() {
        _.each(result.views, function(view) {
            view.content_updated();
        });
    }
    return result;
};
Notebook.Cell.create_controller = function(cell_model)
{
    var result = {
        execute: function() {
            var that = this;
            var type = cell_model.type();
            function callback(r) {
                _.each(cell_model.views, function(view) {
                    view.result_updated(r);
                });
            }
            
            if (type === 'markdown') {
                var wrapped_command = rclient.markdown_wrap_command(cell_model.content());
                rclient.send_and_callback(wrapped_command, callback, _.identity);
            } else if (type === 'interactive') {
                var wrapped_command = rclient.markdown_wrap_command("```{r}\n" + cell_model.content() + "\n```\n");
                rclient.send_and_callback(wrapped_command, callback, _.identity);
            } else alert("Can only do markdown or interactive for now!");
        }
    };

    return result;
};
Notebook.create_html_view = function(model, root_div)
{
    var result = {
        model: model,
        cell_appended: function(cell_model) {
            var cell_view = Notebook.Cell.create_html_view(cell_model);
            cell_model.views.push(cell_view);
            root_div.append(cell_view.div());
            return cell_view;
        },
        cell_inserted: function(cell_model, cell_index) {
            var cell_view = Notebook.Cell.create_html_view(cell_model);
            cell_model.views.push(cell_view);
            $(root_div).insertBefore(append(cell_view.div());
            return cell_view;
        },
        cell_removed: function(cell_model, cell_index) {
            _.each(cell_model.views, function(view) {
                view.self_removed();
            });
        }
    };
    model.views.push(result);
    return result;
};
Notebook.create_model = function()
{
    return {
        notebook: [],
        views: [], // sub list for pubsub
        append_cell: function(cell_model) {
            cell_model.parent_model = this;
            this.notebook.push(cell_model);
            _.each(this.views, function(view) {
                view.cell_appended(cell_model);
            });
        },
        insert_cell: function(cell_model, index) {
            cell_model.parent_model = this;
            this.notebook.splice(index, 0, cell_model);
            _.each(this.views, function(view) {
                view.cell_inserted(cell_model, index);
            });
        },
        json: function() {
            return _.map(this.notebook, function(cell_model) {
                return cell_model.json();
            });
        },
        remove_cell: function(cell_model) {
            var cell_index = this.notebook.indexOf(cell_model);
            if (cell_index === -1) {
                throw "cell_model not in notebook model?!";
            }
            _.each(this.views, function(view) {
                view.cell_removed(cell_model, cell_index);
            });
            this.notebook.splice(cell_index, 1);
            // delete this.notebook[cell_index];
        }
    };
};
Notebook.create_controller = function(model)
{
    return {
        append_cell: function(content, type) {
            var cell_model = Notebook.Cell.create_model(content, type);
            var cell_controller = Notebook.Cell.create_controller(cell_model);
            cell_model.controller = cell_controller;
            model.append_cell(cell_model);
            return cell_controller;
        }, insert_cell: function(content, type, index) {
            var cell_model = Notebook.Cell.create_model(content, type);
            var cell_controller = Notebook.Cell.create_controller(cell_model);
            cell_model.controller = cell_controller;
            model.insert_cell(cell_model, index);
            return cell_controller;
        }
    };
};
