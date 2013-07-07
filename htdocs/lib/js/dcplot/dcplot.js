/*
 dcplot: a minimal interface to dc.js with ggplot-like defaulting

 takes a description 
*/

var group = {
    identity: function(dim) { return dim.group(); },
    bin: function(binwidth) {
        return function(dim) { 
            return dim.group(
                function(x) { 
                    return Math.floor(x/binwidth)*binwidth; 
                }); 
        };
    }
};

var reduce = {
    count: function(group) { return group.reduceCount(); },
    sum: function(access) {
        return function(group) {
            return group.reduceSum(
                function(item) { 
                    return access(item); 
                }
            );
        };
    },
    any: function(access) {
        return function(group) {
            return group.reduce(
                function(p, v) { 
                    return access(v); 
                },
                function(p, v) { 
                    return p; 
                },
                function(p, v) { 
                    return 0; 
                });
        };
    },
    avg: function(access) {
        return function(group) {
            return group.reduce(
                function(p, v) { 
                    ++p.count;
                    p.sum += access(v);
                    p.avg = p.sum / p.count;
                    return p;
                },
                function(p, v) {
                    --p.count;
                    p.sum -= access(v);
                    p.avg = p.count ? p.sum / p.count : 0;
                    return p;
                },
                function(p, v) { 
                    return {count: 0, sum: 0, avg: 0}; 
                });
        };
    }
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
        div: true, // actually sent to parent selector for chart constructor
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
        x: {required: false}, // keyAccessor
        y: {required: false}, // valueAccessor
        // prob would be good to subgroup these?
        'x.transform': {required: true}, // transform component of x (scale)
        'x.domain': {required: false}, // domain component of x
        'x.units': {required: true}, // the most horrible thing EVER
        'x.round': {required: false},
        'x.elastic': {required: false},
        'x.padding': {required: false},
        // likewise
        'y.transform': {required: false},
        'y.domain': {required: false},
        'y.elastic': {required: false},
        'y.padding': {required: false},
        gridLines: {required: false}, // horizontal and/or vertical
        brush: {required: false}
        // etc...
    },
    pie: {
        parents: ['base', 'color'],
        supported: true,
        radius: {required: false},
        innerRadius: {required: false},
        wedge: {required: false}, // keyAccessor (okay these could just be x/y)
        size: {required: false} // valueAccessor
        // etc...
    },
    row: {
        parents: ['base', 'color'],
        supported: false
    },
    bar: {
        parents: ['coordinateGrid', 'stackable'],
        supported: true,
        centerBar: {required: false},
        gap: {required: false}
    },
    line: {
        parents: ['coordinateGrid', 'stackable'],
        supported: true,
        area: {required: false},
        dotRadius: {required: false}
    },
    composite: {
        parents: ['coordinateGrid'],
        supported: false
    },
    abstractBubble: {
        parents: ['color'],
        supported: true,
        r: {required: false}, // radiusValueAccessor
        'r.transform': {required: false}, // transform component of r scale
        'r.domain': {required: false} // domain component of r
    },
    bubble: {
        parents: ['coordinateGrid', 'abstractBubble'],
        supported: true,
        'r.elastic': {required: false}
    },
    bubbleOverlay: {
        parents: ['base', 'abstractBubble'],
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

// defaults and inferences
function fill_dimension(defn) {
    // nothing (yet?)
}
function fill_group(defn, dims) {
    var errors = [];
    if(!_.has(defn, 'dim'))
        errors.push('group needs dimension');
    if(!_.has(dims, defn.dim))
        errors.push('unknown dimension ' + defn.dim);
    if(!_.has(defn, 'group'))
        defn.group = group.identity;
    if(!_.has(defn, 'reduce'))
        defn.reduce = reduce.count;

    if(errors.length)
        throw errors;
}
function fill_chart(defn, dims, groups) {
    var errors = [];
    function find_unused(hash, base) {
        if(!hash[base])
            return base;
        var n = 1;
        while(hash[base + n]) ++n;
        return base + n;
    }
    function base() {
        if(defn.group) {
            if(defn.dimension && defn.dimension!=groups[defn.group].dim)
                errors.push("group " + defn.group + " dimension " + groups[defn.group].dim
                            + " does not match chart dimension " + defn.dimension);
            defn.dimension = groups[defn.group].dim;
        }
        else if(defn.dimension) {
            if(!dims[defn.dimension])
                errors.push("unknown dimension " + defn.dimension);
            defn.group = find_unused(groups, defn.dimension);
            var g = groups[defn.group] = {};
            g.dim = defn.dimension;
        }
        else errors.push("must specify either group or dimension");
    }
    function color() {
    }
    function stackable() {
    }
    function coordinateGrid() {
        base();
    }
    function pie() {
        base();
        color();
    }
    function bar() {
        stackable();
        coordinateGrid();
    }
    function line() {
        stackable();
        coordinateGrid();
    }
    function abstractBubble() {
        color();
    }
    function bubble() {
        abstractBubble();
        coordinateGrid();
    }
    switch(defn.type) {
    case 'pie': pie(); break;
    case 'bar': bar(); break;
    case 'line': line(); break;
    case 'bubble': bubble(); break;
    default: throw 'unknown chart type ' + defn.type;
    }

    if(errors.length)
        throw errors;
}

// look for required attrs not filled and unknown attrs
function check_dimension(defn) {
}
function check_group(defn) {
    var expected = ['dim', 'group', 'reduce'];
    var k = _.keys(defn),
        missing = _.difference(expected, k),
        unknown = _.difference(k, expected),
        errors = [];
    if(missing.length)
        errors.push('group definition is missing required attrs: ' + missing.join(', '));
    if(unknown.length) 
        errors.push('group definition has unknown attrs: ' + unknown.join(', '));

    if(errors.length) 
        throw errors;
}
function check_chart(defn, type) {
    function find_discreps(defn, type, missing, found) {
        var cattrs = chart_attrs[type];
        if(!cattrs.supported)
            throw 'chart type ' + type + ' not supported';
        for(var a in cattrs) {
            if(a==='supported')
                continue;
            else if(a==='parents')
                for(var i in cattrs[a])
                    find_discreps(defn, cattrs[a][i], missing, found);
            else {
                if(cattrs[a].required && defn[a]===undefined)
                    missing.push(a);
                if(_.has(found, a))
                    found[a] = true;
            }
        }
    }
    function empty_found_map(defn) {
        var k = _.without(_.keys(defn), 'type'), n = k.length, v = [];
        while(n--) v.push(false);
        return _.object(k,v);
    }
    var missing = [], found = empty_found_map(defn);
    find_discreps(defn, type, missing, found);
    var errors = [];
    if(missing.length)
        errors.push('chart definition is missing required attrs: ' + missing.join(', '));
    var unknown = _.map(_.reject(_.pairs(found), 
                                 function(p) { return p[1]; }),
                        function(p) { return p[0]; });
    if(unknown.length) 
        errors.push('chart definition has unknown attrs: ' + unknown.join(', '));

    if(errors.length) 
        throw errors;
}

// this is a hopefully a lot of boilerplate with no logic
// maps from dcplot attributes to dc.js methods
function create_chart(groupname, defn, dimensions, groups) {
    var ctor, chart;
    function base() {
        chart = ctor(defn.div, groupname);
        chart.dimension(dimensions[defn.dimension])
            .group(groups[defn.group])
            .width(defn.width)
            .height(defn.height);
        if(_.has(defn, 'transition.duration'))
            chart.transitionDuration(defn['transition.duration']);
        if(_.has(defn, 'label'))
            chart.label(defn.label);
    }
    function color() {
        if(_.has(defn, 'colors'))
            chart.colors(defn.colors);
        if(_.has(defn, 'color'))
            chart.colorAccessor(defn.color);
        if(_.has(defn, 'color.domain'))
            chart.colorDomain(defn['color.domain']);
    }
    function stackable() {
        if(_.has(defn, 'stack'))
            for(var s in defn.stack) {
                var stack = defn.stack[s];
                if($.isArray(stack))
                    chart.stack(stack[0], stack[1]);
                else
                    chart.stack(stack);
            }
    }
    function coordinateGrid() {
        base();

        if(_.has(defn, 'margins'))
            chart.margins(defn.margins);

        if(_.has(defn, 'x'))
            chart.keyAccessor(defn.x);
        if(_.has(defn, 'y'))
            chart.keyAccessor(defn.y);

        var xtrans = defn['x.transform'];
        if(_.has(defn, 'x.domain'))
            xtrans.domain(defn['x.domain']);
        chart.x(xtrans)
            .xUnits(defn['x.units']);
        if(_.has(defn, 'x.round'))
            chart.round(defn['x.round']);
        if(_.has(defn, 'x.elastic'))
            chart.elasticX(defn['x.elastic']);
        if(_.has(defn, 'x.padding'))
            chart.xAxisPadding(defn['x.padding']);

        if(_.has(defn, 'y.transform')) {
            var ytrans = defn['y.transform'];
            if(_.has(defn, 'y.domain'))
                ytrans.domain(defn['y.domain']);
            chart.y(ytrans);
        }
        if(_.has(defn, 'y.elastic'))
            chart.elasticY(defn['y.elastic']);
        if(_.has(defn, 'y.padding'))
            chart.yAxisPadding(defn['y.padding']);

        if(_.has(defn, 'gridLines')) {
            var lines = defn.gridLines;
            if('horizontal' in lines)
                chart.renderVerticalGridLines(lines.horizontal);
            if('vertical' in lines)
                chart.renderVerticalGridLines(lines.vertical);
        }
        if(_.has(defn, 'brush'))
            chart.brushOn(defn.brush);
    }
    function pie() {
        ctor = dc.pieChart;
        base();
        color();
        
        if(_.has(defn, 'wedge'))
            chart.keyAccessor(defn.wedge);
        if(_.has(defn, 'size'))
            chart.keyAccessor(defn.size);

        if(_.has(defn, 'radius'))
            chart.radius(defn.radius);
        if(_.has(defn, 'innerRadius'))
            chart.innerRadius(defn.innerRadius);
    }
    function bar() {
        ctor = dc.barChart;
        coordinateGrid();
        stackable();
        if(_.has(defn, 'centerBar'))
            chart.centerBar(defn.centerBar);
        if(_.has(defn, 'gap'))
            chart.gap(defn.gap);
    }
    function line() {
        ctor = dc.lineChart;
        coordinateGrid();
        stackable();

        if(_.has(defn, 'area'))
            chart.renderArea(defn.area);
        if(_.has(defn, 'dotRadius'))
            chart.dotRadius(defn.dotRadius);
    }
    function abstractBubble() {
        color();
    }
    function bubble() {
        ctor = dc.bubbleChart;
        coordinateGrid();
        abstractBubble();
        
        if(_.has(defn, 'r'))
            chart.radiusValueAccessor(defn.r);
        if(_.has(defn, 'r.transform')) {
            var rtrans = defn['r.transform'];
            if(_.has(defn, 'r.domain'))
                rtrans.domain(defn['r.domain']);
            chart.r(rtrans);
        }
    }
    switch(defn.type) {
    case 'pie': pie(); break;
    case 'bar': bar(); break;
    case 'line': line(); break;
    case 'bubble': bubble(); break;
    default: throw 'unknown chart type ' + defn.type;
    }
    return chart;
}

function dcplot(frame, groupno, definition) {
    var dimensions = {};
    var groups = {};
    var charts = {};

    var groupname = 'chartgroup' + groupno;
    var errors = [];
    var defn;

    // FILL
    for(var d in definition.dimensions) {
        defn = definition.dimensions[d];
        try {
            fill_dimension(defn);
        }
        catch(e) {
            errors = errors.concat(e);
        }
    }
    if(!_.has(definition, 'groups'))
        definition.groups = {};
    for(var g in definition.groups) {
        defn = definition.groups[g];
        try {
            fill_group(defn, definition.dimensions);
        }
        catch(e) {
            errors = errors.concat(e);
        }
    }
    for(var c in definition.charts) {
        defn = definition.charts[c];
        try {
            fill_chart(defn, definition.dimensions, definition.groups);
        }
        catch(e) {
            errors = errors.concat(e);
        }
    }
    if(errors.length)
        throw errors;

    // CHECK
    for(d in definition.dimensions) {
        defn = definition.dimensions[d];
        try {
            check_dimension(defn);
        }
        catch(e) {
            errors = errors.concat(e);
        }
    }
    for(g in definition.groups) {
        defn = definition.groups[g];
        try {
            check_group(defn);
        }
        catch(e) {
            errors = errors.concat(e);
        }
    }
    for(c in definition.charts) {
        defn = definition.charts[c];
        try {
            check_chart(defn, defn.type);
        }
        catch(e) {
            errors = errors.concat(e);
        }
    }
    if(errors.length)
        throw errors;

    // CREATE
    var ndx = crossfilter(frame.records());
    for(var d in definition.dimensions) {
        defn = definition.dimensions[d];
        dimensions[d] = ndx.dimension(defn);
    }
    for(var g in definition.groups) {
        defn = definition.groups[g];
        groups[g] = defn.reduce(defn.group(dimensions[defn.dim]));
        var t = groups[g].top(3);
    }
    for(c in definition.charts) {
        defn = definition.charts[c];
        // var name = defn.type + groupno + '_' + c;
        charts[c] = create_chart(groupname, defn, dimensions, groups);
    }

    dc.renderAll(groupname);

    return charts;
}
