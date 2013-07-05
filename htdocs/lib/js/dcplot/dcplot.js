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
var chart_attrs = {
    base: {
        supported: true,
        dimension: {required: true},
        group: {required: true},
        width: {required: true, default: 300},
        height: {required: true, default: 300},
        'transition.duration': {required: false}, 
        label: {required: false}
        // key, value are terrible names: handle as variables below
    },
    color: {
        supported: true,
        colors: {required: false},
        color: {required: false}, // colorAccessor
        'color.domain': {required: false}
    },
    stackable: {
        supported: true,
        stack: {required: false}
    },
    coordinateGrid: {
        parents: ['base'],
        supported: true,
        margins: {required: false},
        // prob a good idea to group these
        'x.trans': {required: true}, // transform component of x (scale)
        'x.domain': {required: true}, // domain component of x
        'x.units': {required: true}, // the most horrible thing EVER
        'x.round': {required: false},
        'x.elastic': {required: false},
        'x.padding': {required: false},
        // likewise
        'y.trans': {required: false},
        'y.elastic': {required: false},
        'y.padding': {required: false},
        gridlines: {required: false}, // horizontal and/or vertical
        brush: {required: false}
        // etc...
    },
    pie: {
        parents: ['color', 'base'],
        supported: true,
        radius: {required: false},
        innerRadius: {required: false}
        // etc...
    },
    row: {
        parents: ['color', 'base'],
        supported: false
    },
    bar: {
        parents: ['stackable', 'coordinateGrid'],
        supported: true,
        centerBar: {required: false},
        gap: {required: false}
    },
    line: {
        parents: ['stackable', 'coordinateGrid'],
        supported: true,
        area: {required: false},
        dotRadius: {required: false},
    },
    composite: {
        parents: ['coordinateGrid'],
        supported: false
    },
    abstractBubble: {
        parents: ['color'],
        supported: true,
        r: {required: false}, // radiusValueAccessor
        'r.trans': {required: false}, // transform component of r scale
        'r.domain': {required: false} // domain component of r
    },
    bubble: {
        parents: ['abstractBubble', 'coordinateGrid'],
        supported: true,
        margins: {required: true},
        colors: {required: true},
        color: {required: true}
    },
    bubbleOverlay: {
        parents: ['abstractBubble', 'base'],
        supported: false // this chart is a crime!
    },
    geoCloropleth: {
        supported: false
    },
    dataCount: {
        supported: false
    },
    dataTableWidget: {
        supported: false
    }
};

// look for required attrs not filled and unknown attrs
function check_requirements(defn, type) {
    function find_discreps(defn, type, missing, found) {
        var cattrs = chart_attrs[type];
        if(!cattrs.supported)
            throw 'chart type ' + type + ' not supported';
        for(var a in cattrs) {
            if(a==='supported')
                continue;
            else if(a==='parents')
                for(var i in cattrs[a])
                    find_discreps(defn, cattrs[a][i], missing);
            else {
                if(cattrs[a].required && defn[a]===undefined)
                    missing.push(a);
                if(_.has(found, a))
                    found[a] = true;
            }
        }
    }
    var missing = [], found = _.object(_.keys(defn));
    find_discreps(defn, type, missing, found);
    var error = '';
    if(missing.length)
        error += 'definition is missing required attrs ' + missing;
    var unknown = _.map(_.reject(_.pairs(found), 
                                 function(p) { return p[1]; }),
                        function(p) { return p[0]; });
    if(unknown.length) {
        if(error) error += '\n';
        error += 'definition has unknown attrs ' + unknown;
    }
    if(error) 
        throw error;
}

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
            if(!dims[defn.dimension])
                throw "unknown dimension " + defn.dimension;
            defn.group = find_unused(group, defn.dimension);
            var g = group[defn.group] = {};
            g.dim = defn.dimension;
        }
        else throw "must specify either group or dimension";
    }
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
