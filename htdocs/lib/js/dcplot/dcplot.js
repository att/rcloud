/*
 dcplot: a minimal interface to dc.js with ggplot-like defaulting

 takes a description 
 */

var group = {
    identity: function(dim) { return dim.group(); },
    bin: function(binwidth) {
        var f = function(dim) { 
            return dim.group(
                function(x) { 
                    return Math.floor(x/binwidth)*binwidth; 
                }); 
        };
        f.binwidth = binwidth;
        return f;
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
        div: {required: true}, // actually sent to parent selector for chart constructor
        dimension: {required: true},
        group: {required: true},
        width: {required: true, default: 300},
        height: {required: true, default: 300},
        'transition.duration': {required: false}, 
        label: {required: false},
        renderLabel: {required: false},
        title: {required: false},
        renderTitle: {required: false},
        more: {required: false} // executes arbitrary extra code on the dc.js chart object
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
        supported: true,
        parents: ['base'],
        margins: {required: false},
        x: {required: false}, // keyAccessor
        y: {required: false}, // valueAccessor
        // prob would be good to subgroup these?
        'x.transform': {required: true}, // transform component of x (scale)
        'x.domain': {required: true}, // domain component of x
        'x.units': {required: false}, // the most horrible thing EVER
        'x.round': {required: false},
        'x.elastic': {required: false, default: true},
        'x.padding': {required: false},
        // likewise
        'y.transform': {required: false},
        'y.domain': {required: true},
        'y.elastic': {required: false, default: true},
        'y.padding': {required: false},
        gridLines: {required: false}, // horizontal and/or vertical
        brush: {required: false}
        // etc...
    },
    pie: {
        supported: true,
        concrete: true,
        parents: ['base', 'color'],
        radius: {required: false},
        innerRadius: {required: false},
        wedge: {required: false}, // keyAccessor (okay these could just be x/y)
        size: {required: false} // valueAccessor
        // etc...
    },
    row: {
        supported: false,
        parents: ['base', 'color']
    },
    bar: {
        supported: true,
        concrete: true,
        parents: ['coordinateGrid', 'stackable'],
        width: {default: 800},
        height: {default: 250},
        centerBar: {required: false},
        gap: {required: false},
        'x.units': {required: true} // the most horrible thing EVER
    },
    line: {
        supported: true,
        concrete: true,
        parents: ['coordinateGrid', 'stackable'],
        width: {default: 800},
        height: {default: 250},
        area: {required: false},
        dotRadius: {required: false}
    },
    composite: {
        parents: ['coordinateGrid'],
        supported: false
    },
    abstractBubble: {
        supported: true,
        parents: ['color'],
        r: {required: false}, // radiusValueAccessor
        'r.transform': {required: false}, // transform component of r scale
        'r.domain': {required: false} // domain component of r
    },
    bubble: {
        concrete: true,
        parents: ['coordinateGrid', 'abstractBubble'],
        supported: true,
        'r.elastic': {required: false}
    },
    bubbleOverlay: {
        supported: false, // this chart is a crime!
        parents: ['base', 'abstractBubble']
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

function skip_attr(a) {
    return a==='supported' || a=='concrete' || a==='parents';
}

function preorder_traversal(map, iter, callbacks) {
    if(!(iter in map))
        throw 'unknown chart type ' + defn.type;
    var curr = map[iter];
    if('parents' in curr)
        for(var p in curr.parents)
            preorder_traversal(map, curr.parents[p], callbacks);
    callbacks[iter]();
}
function postorder_traversal(map, iter, callbacks) {
    if(!(iter in map))
        throw 'unknown chart type ' + defn.type;
    callbacks[iter]();
    var curr = map[iter];
    if('parents' in curr)
        for(var p in curr.parents)
            postorder_traversal(map, curr.parents[p], callbacks);
}

// defaults
function default_dimension(defn) {
    // nothing (yet?)
}
function default_group(defn, dims) {
    var errors = [];
    if(!_.has(defn, 'group'))
        defn.group = group.identity;
    if(!_.has(defn, 'reduce'))
        defn.reduce = reduce.count;

    if(errors.length)
        throw errors;
}
function default_chart(defn, dims, groups) {
    // exclusively from chart_attrs
    function do_defaults(defn, type) {
        var cattrs = chart_attrs[type];
        if(!cattrs.supported)
            throw 'chart type ' + type + ' not supported';
        for(var a in cattrs) {
            if(skip_attr(a)) 
                continue;
            if(_.has(cattrs[a], 'default') && defn[a]===undefined)
                defn[a] = cattrs[a].default;
        }
        // postorder
        if('parents' in cattrs)
            for(var i in cattrs.parents)
                do_defaults(defn, cattrs.parents[i]);

    } 
    do_defaults(defn, defn.type);
}

// inferences
function infer_dimension(defn) {
    // nothing (yet?)
}
function infer_group(defn, dims) {
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
function infer_chart(defn, dims, groups) {
    var errors = [];
    function find_unused(hash, base) {
        if(!hash[base])
            return base;
        var n = 1;
        while(hash[base + n]) ++n;
        return base + n;
    }
    var callbacks = {
        base: function() {
            if(defn.group) {
                if(!defn.dimension)
                    defn.dimension = groups[defn.group].dim;
            }
            else if(defn.dimension) {
                if(!dims[defn.dimension])
                    errors.push("unknown dimension " + defn.dimension);
                defn.group = find_unused(groups, defn.dimension);
                var g = groups[defn.group] = {};
                g.dim = defn.dimension;
                infer_group(g, dims);
            }
        },
        color: function() {
        },
        stackable: function() {
        },
        coordinateGrid: function() {
            // domain actually isn't required by dc.js but for correctness you
            // need it... unless you're elastic, in which case [0,0] is fine
            if('x.elastic' in defn && defn['x.elastic'] && !('x.domain' in defn))
                defn['x.domain'] = [0,0];
            if('y.elastic' in defn && defn['y.elastic'] && !('y.domain' in defn))
                defn['y.domain'] = [0,0];
        },
        pie: function() {
        },
        bar: function() {
            /* in practice, dc's xUnits seem to be based on either the bin width
             for a histogram, or the set of ordinals */
            if(!('x.units' in defn) && defn.group) {
                var group = groups[defn.group];
                if('group' in group && 'binwidth' in group.group)
                    defn['x.units'] = dc.units.float.precision(group.group.binwidth);
            }
        },
        line: function() {
        },
        abstractBubble: function() {
        },
        bubble: function() {
        }
    };
    preorder_traversal(chart_attrs, defn.type, callbacks);

    if(errors.length)
        throw errors;
}


// look for required attrs not filled and unknown attrs
function check_dimension_attrs(defn) {
}
function check_group_attrs(defn) {
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
function check_chart_attrs(defn) {
    function find_discreps(defn, type, missing, found) {
        var cattrs = chart_attrs[type];
        if(!cattrs.supported)
            throw 'chart type ' + type + ' not supported';
        if('parents' in cattrs)
            for(var i in cattrs.parents)
                find_discreps(defn, cattrs.parents[i], missing, found);
        for(var a in cattrs) {
            if(skip_attr(a)) 
                continue;
            if(cattrs[a].required && defn[a]===undefined)
                missing.push(a);
            if(_.has(found, a))
                found[a] = true;
        }
    }
    function empty_found_map(defn) {
        var k = _.without(_.keys(defn), 'type'), n = k.length, v = [];
        while(n--) v.push(false);
        return _.object(k,v);
    }
    var missing = [], found = empty_found_map(defn);
    find_discreps(defn, defn.type, missing, found);
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


// logic errors
function check_dimension_logic(defn) {
    // nothing (yet?)
}
function check_group_logic(defn, dims) {
    var errors = [];
    if(!_.has(dims, defn.dim))
        errors.push('unknown dimension ' + defn.dim);

    if(errors.length)
        throw errors;
}
function check_chart_logic(defn, dims, groups) {
    var errors = [];
    var callbacks = {
        base: function() {
            if(defn.dimension && defn.dimension!=groups[defn.group].dim)
                errors.push("group " + defn.group + " dimension " + groups[defn.group].dim
                            + " does not match chart dimension " + defn.dimension);
        },
        color: function() {
        },
        stackable: function() {
        },
        coordinateGrid: function() {
        },
        pie: function() {
        },
        bar: function() {
        },
        line: function() {
        },
        abstractBubble: function() {
        },
        bubble: function() {
        }
    };
    
    preorder_traversal(chart_attrs, defn.type, callbacks);

    if(errors.length)
        throw errors;
}



// this is a hopefully a lot of boilerplate with no logic
// maps from dcplot attributes to dc.js methods
function create_chart(groupname, defn, dimensions, groups) {
    var ctor, chart;

    function on_key(f) { return function(kv) { return f(kv.key); }; }

    var callbacks = {
        base: function() {
            chart = ctor(defn.div, groupname);
            chart.dimension(dimensions[defn.dimension])
                .group(groups[defn.group])
                .width(defn.width)
                .height(defn.height);
            if(_.has(defn, 'transition.duration'))
                chart.transitionDuration(defn['transition.duration']);
            if(_.has(defn, 'label'))
                chart.label(defn.label);
            if(_.has(defn, 'renderLabel'))
                chart.renderLabel(defn.renderLabel);
            if(_.has(defn, 'title'))
                chart.title(defn.title);
            if(_.has(defn, 'renderTitle'))
               chart.renderTitle(defn.renderTitle);
        },
        color: function() {
            if(_.has(defn, 'colors'))
                chart.colors(defn.colors);
            if(_.has(defn, 'color'))
                chart.colorAccessor(defn.color);
            if(_.has(defn, 'color.domain'))
                chart.colorDomain(defn['color.domain']);
        },
        stackable: function() {
            if(_.has(defn, 'stack'))
                for(var s in defn.stack) {
                    var stack = defn.stack[s];
                    if($.isArray(stack))
                        chart.stack(stack[0], stack[1]);
                    else
                        chart.stack(stack);
                }
        },
        coordinateGrid: function() {
            if(_.has(defn, 'margins'))
                chart.margins(defn.margins);

            if(_.has(defn, 'x'))
                chart.keyAccessor(on_key(defn.x));
            if(_.has(defn, 'y'))
                chart.valueAccessor(on_key(defn.y));

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
        },
        pie: function() {
            if(_.has(defn, 'wedge'))
                chart.keyAccessor(defn.wedge);
            if(_.has(defn, 'size'))
                chart.keyAccessor(defn.size);

            if(_.has(defn, 'radius'))
                chart.radius(defn.radius);
            if(_.has(defn, 'innerRadius'))
                chart.innerRadius(defn.innerRadius);
        },
        bar: function() {
            if(_.has(defn, 'centerBar'))
                chart.centerBar(defn.centerBar);
            if(_.has(defn, 'gap'))
                chart.gap(defn.gap);
        },
        line: function() {
            if(_.has(defn, 'area'))
                chart.renderArea(defn.area);
            if(_.has(defn, 'dotRadius'))
                chart.dotRadius(defn.dotRadius);
        },
        abstractBubble: function() {
        },
        bubble: function() {
            if(_.has(defn, 'r'))
                chart.radiusValueAccessor(on_key(defn.r));
            if(_.has(defn, 'r.transform')) {
                var rtrans = defn['r.transform'];
                if(_.has(defn, 'r.domain'))
                    rtrans.domain(defn['r.domain']);
                chart.r(rtrans);
            }
        }
    };
    ctor = {
        pie: dc.pieChart,
        bar: dc.barChart,
        line: dc.lineChart,
        bubble: dc.bubbleChart
    }[defn.type];
    
    preorder_traversal(chart_attrs, defn.type, callbacks);

    // perform any extra post-processing
    if(_.has(defn, 'more'))
        defn.more(chart);

    return chart;
}


function dcplot(frame, groupno, definition) {
    function aggregate_errors(dimension_fn, group_fn, chart_fn) {
        var errors = [];
        for(var d in definition.dimensions) {
            defn = definition.dimensions[d];
            try {
                dimension_fn(defn);
            }
            catch(e) {
                errors.push({type: 'dimension', name: d, errors: e});
            }
        }
        if(!_.has(definition, 'groups'))
            definition.groups = {};
        for(var g in definition.groups) {
            defn = definition.groups[g];
            try {
                group_fn(defn, definition.dimensions);
            }
            catch(e) {
                errors.push({type: 'group', name: g, errors: e});
            }
        }
        for(var c in definition.charts) {
            defn = definition.charts[c];
            try {
                chart_fn(defn, definition.dimensions, definition.groups);
            }
            catch(e) {
                errors.push({type: 'chart', name: c, errors: e});
            }
        }
        return errors;
    }

    var groupname = 'chartgroup' + groupno;
    var errors = [];
    var defn;

    // first check all chart types because the traversals are unchecked
    for(var c in definition.charts) {
        defn = definition.charts[c];
        if(!(defn.type in chart_attrs))
            throw 'unknown chart type ' + defn.type;
        if(!chart_attrs[defn.type].supported)
            throw 'unsupported chart type ' + defn.type;
        if(!chart_attrs[defn.type].concrete)
            throw "can't create abstract chart type " + defn.type;
    }

    // fill in anything easily defaultable (will not happen in incremental mode)
    // [but are there things we only want to default after inference?]
    errors = aggregate_errors(default_dimension, default_group, default_chart);
    if(errors.length)
        throw errors;

    // infer attributes from other attributes
    errors = aggregate_errors(infer_dimension, infer_group, infer_chart);
    if(errors.length)
        throw errors;

    // check for missing or unknown attrs
    errors = aggregate_errors(check_dimension_attrs, check_group_attrs, check_chart_attrs);
    if(errors.length)
        throw errors;

    // check for inconsistencies and other specific badness
    errors = aggregate_errors(check_dimension_logic, check_group_logic, check_chart_logic);
    if(errors.length)
        throw errors;

    // create / fill stuff in
    var dimensions = {};
    var groups = {};
    var charts = {};

    var ndx = crossfilter(frame.records());
    for(var d in definition.dimensions) {
        defn = definition.dimensions[d];
        dimensions[d] = ndx.dimension(defn);
    }
    for(var g in definition.groups) {
        defn = definition.groups[g];
        groups[g] = defn.reduce(defn.group(dimensions[defn.dim]));
    }
    for(c in definition.charts) {
        defn = definition.charts[c];
        // var name = defn.type + groupno + '_' + c;
        charts[c] = create_chart(groupname, defn, dimensions, groups);
    }

    dc.renderAll(groupname);

    return charts;
}
