/*
 dcplot: a minimal interface to dc.js with ggplot-like defaulting

 takes a description 
*/

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

/* forgive me for overengineering this a little bit

 1. generate a complete definition by using defaults and inference
 2. check for required and unknown attributes
 3. generate the dimensions, groups, and charts

*/

// a map of attr->required to check for at the end to make sure we have everything
var plot_attrs = {
    base: {
        dimension: {required: true},
        group: {required: true},
        width: {required: true, default: 300},
        height: {required: true, default: 300},
        'transition.duration': {required: false}, 
        label: {required: false}
        // key, value are terrible names: handle as variables below
    },
    color: {
        colors: {required: false},
        color: {required: false}, // colorAccessor
        'color.domain': {required: false}
    },
    stackable: {
        stack: {required: false}
    },
    coordinateGrid: {
        margins: {required: false},
        'x.trans': {required: false}, // x (scale)
        'x.domain': {required: false}, // domain() component of x
    },
    bubble: {
        margins: true,
        colors: true,
        color: true,
        
        

function dcplot(frame, definition, groupno) {
    function find_unused(hash, base) {
        if(!hash[base])
            return base;
        var n = 1;
        while(hash[base + n]) ++n;
        return base + n;
    }
    function base_attrs(defn) {
        if(defn.group) {
            if(defn.dimension && defn.dimension!=group[defn.group].dim)
                throw "group " + defn.group + " dimension " + group[defn.group].dim
                + " does not match chart dimension " + defn.dimension;
            defn.dimension = group[defn.group].dim;
        }
        else if(defn.dimension) {
            defn.group = find_unused(group, defn.dimension);
            var g = group[defn.group] = {};
            g.dim = defn.dimension;
                var dim = dims[defn.dimension];
                chart.dimension(dim);
                chart.group(dim.group());
            }
            else throw "must specify either group or dimension";

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
