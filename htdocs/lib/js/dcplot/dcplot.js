dcplot.bin = function(dim, binwidth) {
    return {dim: dim,
            f: function(x) { return Math.floor(x/binwidth)*binwidth; }};
};

// may be going too far in unwinding the function call chain
dcplot.count = function(decl) {
    decl.reduce = function(g) { return g.reduceCount(); };
    return decl;
};

dcplot.sum = function(decl) {
    decl.reduce = function(g) { return g.reduceSum(); };
    return decl;
};

function dcplot(frame, definition, groupno) {
    var dims = {};
    var groups = {};
    var charts = {};
    var ndx = crossfilter(frame.records());
    var defn;
    for(var d in definition.dimensions) {
        var f = definition.dimensions[d];
        dims[d] = ndx.dimension(f);
    }
    if(definition.groups) 
        for(var g in definition.groups) {
            defn = definition.groups[g];
            groups[g] = {dim: defn.dim, 
                         group: dims[defn.dim].group(defn.f)};
            if(defn.reduce)
                groups[g].group = defn.reduce(groups[g].group);
        }
    var groupname = 'chartgroup' + groupno;
    for(var c in definition.charts) {
        defn = definition.charts[c];
        var chart, name = defn.type + groupno + '_' + c;
        switch(defn.type) {
        case 'bubble': 
            chart = dc.bubbleChart('#' + name, groupname);
            if(defn.dimension) {
                var dim = dims[defn.dimension];
                chart.dimension(dim);
                chart.group(dim.group());
            }
            else if(defn.group) {
                var group = groups[defn.group];
                chart.dimension(dims[group.dim]);
                chart.group(group.group);
            }
            else throw "must specify either group or dimension for bubble chart";
            chart.elasticX(defn['x.elastic']===undefined ? true : defn['x.elastic']);
            chart.elasticY(defn['y.elastic']===undefined ? true : defn['y.elastic']);
            break;
        case 'bar':
            chart = dc.barChart('#' + name, groupname);
            chart.elasticX(defn['x.elastic']===undefined ? true : defn['x.elastic']);
            break;
        default:
            throw "unknown chart type '" + defn.type + "'";
        }
        chart.width(defn.width || 300);
        chart.height(defn.height || 300);
        chart.margins(defn.margins || {top:10, right:50, bottom:30, left:40});
        chart.transitionDuration(defn['transition.duration'] || 300);
        charts[name] = chart;
    }
    var result = {
        charts: charts,
    };
    return result;
};  
