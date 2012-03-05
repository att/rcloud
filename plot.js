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
