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
