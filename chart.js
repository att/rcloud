(function() {

function svg_translate(dx, dy)
{
    return "translate(" + dx + "," + dy + ")";
}

Chart = {};

Chart.data_model = function(data) 
{
    var l = data.length;
    // I use typed arrays because this might be useful in Facet eventually
    var selection = new Uint8Array(data.length);
    return {
        data: function() { return data; },
        selection: function() { return selection; }
    };
};

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
        fill: "black"
    });

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
        opts: opts,
        plot: output_div
    };
    
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
        .data(x_scale.ticks(opts.n_xticks))
        .enter().append("g");

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
        .enter().append("g");

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
        .data(data)
        .enter().append("path");

    function style_dots(selection) {
        selection
            .attr("d", d3.svg.symbol().type("circle"))
            .attr("size", 5)
            .attr("transform", function(d) {
                return svg_translate(x_scale(opts.x(d)), 
                                     y_scale(opts.y(d))); 
            })
            .style("stroke", result.opts.stroke)
            .style("stroke-width", result.opts.stroke_width)
            .style("fill", result.opts.fill);
    }

    style_dots(dots);
    return result;
};

})();
