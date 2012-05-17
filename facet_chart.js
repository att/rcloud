FacetChart = {};

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
