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
        for (var i=0; i<array_list.length; ++i) {
            result["dim_" + i] = Facet.attribute_buffer({
                vertex_array: array_list[i],
                item_size: 1,
                keep_array: true
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
    console.log(color);

    if (color.length === 3) {
        color = Shade.vec(color[0], color[1], color[2], 1);
    } else if (color.length > 1) {
        color = Shade.vec(Facet.attribute_buffer({vertex_array: color, item_size: 3}), 1);
    }

    // color = Shade.Utils.choose([Shade.vec(1,0,0,1),
    //                             Shade.vec(0,1,0,1),
    //                             Shade.vec(0,0,1,1)])(color);

    var dots_model = Facet.model({
        type: "points",
        lats: lats, 
        lons: lons
    });

    var dots_batch = Facet.bake(dots_model, {
        color: color,
        point_size: 2,
        position: globe.lat_lon_position(dots_model.lats.radians(), 
                                         dots_model.lons.radians())
    });

    Facet.Scene.add(globe);
    Facet.Scene.add(dots_batch);

    return canvas;
};
(function() {

// takes a string and returns the appropriate r literal string with escapes.
function escape_r_literal_string(s) {
    return "\"" + s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"";
    // return "\"" + s.replace(/"/g, "\\\"") + "\"";
}

function NoCallbackError() {
    this.name = "NoCallbackError";
}

NoCallbackError.prototype = Object.create(Error);
NoCallbackError.prototype.constructor = NoCallbackError;

function no_callback() { throw new NoCallbackError(); }

RClient = {
    create: function(opts) {

        function on_connect() {
            result.running = true;
            result.send("rcloud.support::session.init(username=" + escape_r_literal_string(rcloud.username()) + ")");
            opts.on_connect && opts.on_connect.call(result);
        }

        function on_error(msg, status_code) { 
            if (status_code === 65) {
                // Authentication failed.
                result.post_error("Authentication failed. Login first!");
                result.post_error(msg);
                
            } else {
                result.post_error(msg);
            }
        }

        function on_close(msg) {
            result.post_response("Socket was closed. Goodbye!");
            result.running = false;
        };
        var token = $.cookies.get().token;
        var rserve = Rserve.create({
            host: opts.host,
            on_connect: on_connect,
            on_error: on_error,
            on_close: on_close,
            login: token + "\n" + token
        });

        var _debug = opts.debug || false;
        var _capturing_answers = false;
        var _capturing_callback = undefined;

        var result;

        result = {
            handlers: {
                "eval": function(v) {
                    debugger;
                    result.post_response(v);
                    return v;
                },
                "markdown.eval": function(v) {
                    result.display_markdown_response(v);
                    return v;
                },
                "browsePath": function(v) {
                    $.ajax({ url: "http://127.0.0.1:8080" + v }).done(function(result) {
                        // horrible hack: we strip the content down to its main div via regexp
                        // cue jwz here.
                        var inside_body = /[\s\S]*<body>([\s\S]*)<\/body>/g.exec(result)[1];
                        $("#help-output").html(inside_body);
                    });
                },
		// FIXME: I couldn't get this.post_* to work from here so this is just to avoid the error ... it's nonsensical, obviously
		"img.url.update": function(v) { return v; },
		"img.url.final": function(v) { return v; },
		"dev.new": function(v) { return ""; },
		"dev.close": function(v) { return ""; },
                "internal_cmd": function(v) { return ""; },
                "boot.failure": function(v) { 
                    result.running = false;
                }
            },
            running: false,

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
                    console.log("Protocol error?! ", data.value[0]);
                    return undefined;
                    // return this.post_error("Protocol error, expected first element to be a single string");
                }
                var cmd = data.value[0].value[0];
                var cmds = this.handlers;
                if (cmds[cmd] === undefined) {
                    return this.post_error("Unknown command " + cmd);
                }
		if (cmd == "img.url.update" || cmd == "img.url.final") {
                    throw "Who's doing this?";
		    // FIXME: this is a bad hack storing in the window - do something more reasonable ;)
		    // var ix = window.devImgIndex;
		    // if (!ix) window.devImgIndex = ix = 1;
		    // if (cmd == "img.url.final") window.devImgIndex++;
		    // var div = document.getElementById("dimg"+ix);
		    // if (div) // FIXME: we may want to move the div down as well -- maybe just remove the old one and add a new one?
		    //     div.innerHTML = "<img src="+data.value[1].value[0]+">";
		    // else
		    //     this.post_div("<div id=dimg"+ix+"><img src="+data.value[1].value[0]+"></div>");
		}
                return cmds[cmd].call(this, data.json()[1]);
            },

            register_handler: function(cmd, callback) {
                this.handlers[cmd] = callback;
            },

            //////////////////////////////////////////////////////////////////
            // FIXME: all of this should move out of rclient and into
            // the notebook objects.

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

            //////////////////////////////////////////////////////////////////

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
                if (silent === undefined) {
                    silent = false;
                }
                return "rcloud.support::session.eval({" + command + "}, "
                    + (silent?"TRUE":"FALSE") + ")";
            },

            markdown_wrap_command: function(command, silent) {
                return "rcloud.support::session.markdown.eval({markdownToHTML(text=paste(knit(text=" + escape_r_literal_string(command+'\n') + "), collapse=\"\\n\"), fragment=TRUE)}, "
                    + (silent?"TRUE":"FALSE") + ")";
            },

            log: function(command) {
                command = "rcloud.support::session.log(\"" + rcloud.username() + "\", \"" +
                    command.replace(/\\/g,"\\\\").replace(/"/g,"\\\"")
                + "\")";
                this.send(command);
            },

            record_cell_execution: function(cell_model) {
                var json_rep = JSON.stringify(cell_model.json());
                var call = this.r_funcall("rcloud.record.cell.execution", 
                                          rcloud.username(), json_rep);
                rserve.eval(call);
            },

            send: function(command, wrap) {
                this.send_and_callback(command, no_callback, wrap);
            },

            send_and_callback: function(command, callback, wrap) {
                var that = this;
                if (_.isUndefined(callback))
                    callback = no_callback;
                var t;
                if (wrap) {
                    command = wrap(command);
                } else {
                    command = this.wrap_command(command, true);
                }
                if (_debug)
                    console.log(command);
                function unwrap(v) {
                    v = v.value.json();
                    if (_debug) {
                        debugger;
                        console.log(v);
                    }
                    try {
                        callback(v[1]);
                    } catch (e) {
                        if (e.constructor === NoCallbackError) {
                            that.handlers[v[0]](v[1]);
                        }
                    }
                }
                rserve.eval(command, unwrap);
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
rcloud = {};

rcloud.init_client_side_data = function()
{
    var that = this;
    rcloud.get_user_filenames(function(data) {
        that.user_filenames = data;

        //////////////////////////////////////////////////////////////////
        // debugging info
        var filenames = data;
        var userfiles_float = d3.select("#internals-user-files");
        userfiles_float.append("h3").text("User files");
        userfiles_float.append("ul")
            .selectAll("li")
            .data(filenames)
            .enter()
            .append("li").text(function(i) { return i; });
    });
    rclient.send_and_callback("rcloud.prefix.uuid()", function(data) {
        that.wplot_uuid = data;
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
(function() {

function fa_button(which, title)
{
    return $("<span class='fontawesome-button'><i class='" + 
             which + 
             "'></i></span>").tooltip({ 
                 title: title, 
                 delay: { show: 250, hide: 0 }
             });
}

function create_markdown_cell_html_view(cell_model)
{
    var notebook_cell_div  = $("<div class='notebook-cell'></div>");

    //////////////////////////////////////////////////////////////////////////
    // button bar
    var source_button = fa_button("icon-edit", "source");
    var result_button = fa_button("icon-picture", "result");
    var hide_button   = fa_button("icon-resize-small", "hide");
    var remove_button = fa_button("icon-trash", "remove");
    var run_md_button = fa_button("icon-repeat", "run");

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
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            result.show_source();
        }
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
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            cell_model.parent_model.controller.remove_cell(cell_model);

            // twitter bootstrap gets confused about its tooltips if parent element 
            // is deleted while tooltip is active; let's help it
            $(".tooltip").remove();
        }
    });
    function execute_cell() {
        r_result_div.html("Computing...");
        update_model();
        result.show_result();
        cell_model.controller.execute();
    }
    run_md_button.click(function(e) {
        execute_cell();
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
    var insert_cell_button = fa_button("icon-plus-sign", "insert cell");
    inner_div.append(cell_buttons_div);
    cell_buttons_div.append(insert_cell_button);
    insert_cell_button.click(function(e) {
        // truly the wrong way to go about this
        var base_index = notebook_cell_div.index();
        var model_index = base_index;
        shell.insert_markdown_cell_before(model_index);
    });
    
    var ace_div = $('<div style="width:100%; height:100%"></div>');
    inner_div.append(markdown_div);
    markdown_div.append(ace_div);
    var widget = ace.edit(ace_div[0]);
    var RMode = require("mode/rmarkdown").Mode;
    var session = widget.getSession();
    var doc = session.doc;
    widget.getSession().setMode(new RMode(false, doc, session));

    widget.setTheme("ace/theme/chrome");
    widget.getSession().setUseWrapMode(true);
    widget.resize();

    widget.commands.addCommand({
        name: 'sendToR',
        bindKey: {
            win: 'Ctrl-Return',
            mac: 'Command-Return',
            sender: 'editor'
        },
        exec: function(widget, args, request) {
            execute_cell();
        }
    });

    var r_result_div = $('<div class="r-result-div"><span style="opacity:0.5">Not evaluated</span></div>');
    inner_div.append(r_result_div);

    // FIXME this is a terrible hack created simply so we can scroll
    // to the end of a div. I know no better way of doing this..
    var end_of_div_span = $('<span></span>');
    inner_div.append(end_of_div_span);

    var current_mode;

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
            r_result_div.hide();
            r_result_div.html(r);
            r_result_div.slideDown(150);

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
                            return shell.handle(data[0], data);
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
            if (!_.isUndefined(MathJax))
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                
            this.show_result();
            end_of_div_span[0].scrollIntoView();
        },

        //////////////////////////////////////////////////////////////////////

        hide_buttons: function() {
            button_float.css("display", "none");
            cell_buttons_div.css("display", "none");
        },
        show_buttons: function() {
            button_float.css("display", null);
            cell_buttons_div.css("display", null);
        },

        show_source: function() {
            notebook_cell_div.css({'height': '70%'});
            disable(source_button);
            enable(result_button);
            enable(hide_button);
            enable(remove_button);
            editor_row.show();

            markdown_div.show();
            r_result_div.hide();
            widget.resize();
            widget.focus();

            current_mode = "source";
        },
        show_result: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            disable(result_button);
            enable(hide_button);
            enable(remove_button);

            editor_row.hide();
            markdown_div.hide();
            r_result_div.slideDown(150, function() {
                end_of_div_span[0].scrollIntoView();
            }); // show();
            current_mode = "result";
        },
        hide_all: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            enable(result_button);
            disable(hide_button);
            enable(remove_button);

            editor_row.hide();
            if (current_mode === "result") {
                r_result_div.slideUp(150); // hide();
            } else {
                markdown_div.slideUp(150); // hide();
            }
        },
        remove_self: function() {
            cell_model.parent_model.remove_cell(cell_model);            
            notebook_cell_div.remove();
        },
        div: function() {
            return notebook_cell_div;
        },
        update_model: function() {
            update_model();
        },
        focus: function() {
            widget.focus();
        }
    };

    result.show_result();
    result.content_updated();
    return result;
};

function create_interactive_cell_html_view(cell_model)
{
    var notebook_cell_div  = $("<div class='notebook-cell'></div>");

    //////////////////////////////////////////////////////////////////////////
    // button bar
    var source_button = $("<span class='fontawesome-button'><i class='icon-edit'></i></span>").tooltip({ title: "source" });
    var result_button = $("<span class='fontawesome-button'><i class='icon-picture'></i></span>").tooltip({ title: "result" });
    var hide_button   = $("<span class='fontawesome-button'><i class='icon-resize-small'></i></span>").tooltip({ title: "hide" });
    var remove_button = $("<span class='fontawesome-button'><i class='icon-trash'></i></span>").tooltip({ title: "remove" });

    function update_model() {
        cell_model.content($(input).val());
    }
    function enable(el) {
        el.removeClass("button-disabled");
    }
    function disable(el) {
        el.addClass("button-disabled");
    }

    source_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            result.show_source();
        }
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
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            cell_model.parent_model.controller.remove_cell(cell_model);

            // twitter bootstrap gets confused about its tooltips if parent element 
            // is deleted while tooltip is active; let's help it
            $(".tooltip").remove();
        }
    });
    function execute_cell() {
        r_result_div.html("Computing...");
        update_model();
        result.show_result();
        cell_model.controller.execute();
    }

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
    editor_row.hide();
    button_float.append(editor_row);

    notebook_cell_div.append(button_float);

    //////////////////////////////////////////////////////////////////////////

    var inner_div = $("<div></div>");
    var clear_div = $("<div style='clear:both;'></div>");
    notebook_cell_div.append(inner_div);
    notebook_cell_div.append(clear_div);

    var markdown_div = $('<div style="position: relative; width:100%;"></div>');
    var cell_buttons_div = $('<div style="position: absolute; right:-0.5em; top:-0.5em"></div>');
    var insert_cell_button = fa_button("icon-plus-sign", "insert cell");
    inner_div.append(cell_buttons_div);
    cell_buttons_div.append(insert_cell_button);
    insert_cell_button.click(function(e) {
        // truly the wrong way to go about this
        var base_index = notebook_cell_div.index();
        var model_index = base_index;
        shell.insert_markdown_cell_before(model_index);
    });
    
    var ace_div = $('<div style="width:100%; margin-left: 0.5em; margin-top: 0.5em"></div>');
    inner_div.append(markdown_div);
    markdown_div.append(ace_div);

    var input = $('<input type="text" style="width:88%"/>');
    ace_div.append(input);
    // http://stackoverflow.com/questions/699065
    input.keypress(function(e) {
        if (e.which === 13) {
            execute_cell();
            e.preventDefault();
            return false;
        }
        return true;
    });

    var r_result_div = $('<div class="r-result-div"></div>');
    inner_div.append(r_result_div);
    var end_of_div_span = $('<span></span>');
    inner_div.append(end_of_div_span);
    var current_mode;

    var result = {

        //////////////////////////////////////////////////////////////////////
        // pubsub event handlers

        content_updated: function() {
            input.val(cell_model.content());
        },
        self_removed: function() {
            notebook_cell_div.remove();
        },
        result_updated: function(r) {
            r_result_div.hide();
            r_result_div.html(r);
            r_result_div.slideDown(150);

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
                            return shell.handle(data[0], data);
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
            if (!_.isUndefined(MathJax))
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                
            this.show_result();
            end_of_div_span[0].scrollIntoView();
        },

        //////////////////////////////////////////////////////////////////////

        hide_buttons: function() {
            button_float.css("display", "none");
            cell_buttons_div.css("display", "none");
        },
        show_buttons: function() {
            button_float.css("display", null);
            cell_buttons_div.css("display", null);
        },

        show_source: function() {
            notebook_cell_div.css({'height': ''});
            disable(source_button);
            enable(result_button);
            enable(hide_button);
            enable(remove_button);
            editor_row.show();

            markdown_div.show();
            r_result_div.hide();
            input.focus();

            current_mode = "source";
        },
        show_result: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            disable(result_button);
            enable(hide_button);
            enable(remove_button);

            editor_row.hide();
            markdown_div.hide();
            r_result_div.slideDown(150, function() {
                end_of_div_span[0].scrollIntoView();
            });
            current_mode = "result";
        },
        hide_all: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            enable(result_button);
            disable(hide_button);
            enable(remove_button);

            editor_row.hide();
            if (current_mode === "result") {
                r_result_div.slideUp(150); // hide();
            } else {
                markdown_div.slideUp(150); // hide();
            }
        },
        remove_self: function() {
            cell_model.parent_model.remove_cell(cell_model);            
            notebook_cell_div.remove();
        },
        div: function() {
            return notebook_cell_div;
        },
        update_model: function() {
            update_model();
        },
        focus: function() {
            input.focus();
        }
    };

    result.show_result();
    result.content_updated();
    return result;
}

var dispatch = {
    markdown: create_markdown_cell_html_view,
    interactive: create_interactive_cell_html_view
};

Notebook.Cell.create_html_view = function(cell_model)
{
    return dispatch[cell_model.type()](cell_model);
};

})();
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
            
            rclient.record_cell_execution(cell_model);
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
        sub_views: [],
        cell_appended: function(cell_model) {
            var cell_view = Notebook.Cell.create_html_view(cell_model);
            cell_model.views.push(cell_view);
            root_div.append(cell_view.div());
            this.sub_views.push(cell_view);
            return cell_view;
        },
        cell_inserted: function(cell_model, cell_index) {
            var cell_view = Notebook.Cell.create_html_view(cell_model);
            cell_model.views.push(cell_view);
            root_div.append(cell_view.div());
            $(cell_view.div()).insertBefore(root_div.children()[cell_index]);
            this.sub_views.splice(cell_index, 0, cell_view);
            cell_view.show_source();
            return cell_view;
        },
        cell_removed: function(cell_model, cell_index) {
            _.each(cell_model.views, function(view) {
                view.self_removed();
            });
            this.sub_views.splice(cell_index, 1);
        },
        
        update_model: function() {
            _.each(this.sub_views, function(cell_view) {
                cell_view.update_model();
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
        clear: function() {
            // FIXME this is O(n^2) because of O(n) indexOf in remove_cell...
            while (this.notebook.length) {
                this.remove_cell(this.notebook[this.notebook.length-1]);
            }
        },
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
    var result = {
        append_cell: function(content, type) {
            var cell_model = Notebook.Cell.create_model(content, type);
            var cell_controller = Notebook.Cell.create_controller(cell_model);
            cell_model.controller = cell_controller;
            model.append_cell(cell_model);
            return cell_controller;
        },
        insert_cell: function(content, type, index) {
            var cell_model = Notebook.Cell.create_model(content, type);
            var cell_controller = Notebook.Cell.create_controller(cell_model);
            cell_model.controller = cell_controller;
            model.insert_cell(cell_model, index);
            return cell_controller;
        },
        remove_cell: function(cell_model) {
            model.remove_cell(cell_model);
        },
        clear: function() {
            model.clear();
        },
        load_from_file: function(user, filename, k) {
            var that = this;
            rcloud.load_user_file(user, filename, function(contents) {
                var json_contents = JSON.parse(contents.join("\n"));
                that.clear();
                _.each(json_contents, function (json_cell) {
                    var cell_model = that.append_cell(
                        json_cell.content, json_cell.type);
                });
                k();
            });
        },
        save_file: function(user, filename, k) {
            var that = this;
            var json_rep = JSON.stringify(model.json());
            rcloud.load_user_file(user, filename, function(old_contents) {
                old_contents = old_contents.join("\n");
                if (json_rep !== old_contents) {
                    rcloud.save_to_user_file(user, filename, json_rep, function() {
                        k && k();
                    });
                } else {
                    k && k();
                }
            });
        },
        run_all: function() {
            _.each(model.notebook, function(cell_model) {
                cell_model.controller.execute();
            });
        }
    };
    model.controller = result;
    return result;
};
