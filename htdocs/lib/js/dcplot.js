/*
 dcplot: a minimal interface to dc.js with ggplot-like defaulting

 takes a description in json+function format describing crossfilter dimensions and groups,
 and charts.  returns the resulting charts in a map.
 */

(function() {
    function _dcplot(dc, crossfilter) {
        // todo? the groupvalue function could access subfields of the dimension value?
        dcplot.group = {
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

        // yes! these are fourth-order functions!
        // the methods on this object take an access-thing and return an object for accessor()
        // accessor() will bind access to a real accessor function
        // that function is ready to take a group
        // and pass it the functions it composes to call the true accessor
        dcplot.reduce = {
            count: function(group) { return group.reduceCount(); },
            countFilter: function(access, level) {
                return dcplot.reduce.sum(function (a) {
                    return (access(a) === level) ? 1 : 0;
                });
            },
            filter: function(reduce, access, level) {
                function wrapper(acc) {
                    return function (a) {
                        return (access(a) === level) ? acc(a) : 0;
                    };
                }
                return {
                    arg: reduce.arg,
                    fun: function(acc) { return reduce.fun(wrapper(acc)); }
                };
            },
            sum: function(access, wacc) {
                return {
                    arg: access,
                    fun: function(acc2) {
                        if(wacc === undefined)
                            return function(group) {
                                return group.reduceSum(
                                    function(item) {
                                        return acc2(item);
                                    }
                                );
                            };
                        else return function(group) {
                            return group.reduce(
                                function(p, v) {
                                    p.sum += (acc2(v)*wacc(v));
                                    return p;
                                },
                                function(p, v) {
                                    p.sum -= (acc2(v)*wacc(v));
                                    return p;
                                },
                                function(p, v) {
                                    return {sum: 0, valueOf: function() { return this.sum; }};
                                });
                        };
                    }
                };
            },
            any: function(access) {
                return {
                    arg: access,
                    fun: function(acc2) {
                        return function(group) {
                            return group.reduce(
                                function(p, v) {
                                    return acc2(v);
                                },
                                function(p, v) {
                                    return p;
                                },
                                function(p, v) {
                                    return 0;
                                });
                        };
                    }
                };
            },
            avg: function(access, wacc) {
                return {
                    arg: access,
                    fun: function(acc2) {
                        if(wacc === undefined) return function(group) {
                            return group.reduce(
                                function(p, v) {
                                    ++p.count;
                                    p.sum += acc2(v);
                                    p.avg = p.sum / p.count;
                                    return p;
                                },
                                function(p, v) {
                                    --p.count;
                                    p.sum -= acc2(v);
                                    p.avg = p.count ? p.sum / p.count : 0;
                                    return p;
                                },
                                function(p, v) {
                                    return {count: 0, sum: 0, avg: 0, valueOf: function() { return this.avg; }};
                                });
                        };
                        else return function(group) {
                            return group.reduce(
                                function(p, v) {
                                    p.count += wacc(v);
                                    p.sum += (acc2(v)*wacc(v));
                                    p.avg = p.sum / p.count;
                                    return p;
                                },
                                function(p, v) {
                                    p.count -= wacc(v);
                                    p.sum -= (acc2(v)*wacc(v));
                                    p.avg = p.count ? p.sum / p.count : 0;
                                    return p;
                                },
                                function(p, v) {
                                    return {count: 0, sum: 0, avg: 0, valueOf: function() { return this.avg; }};
                                });
                        };
                    }
                };
            },
            value: function(field) {
                return function(key, value) {
                    return value[field];
                };
            }
        };

        /*
         many stages of filling in the blanks for dimensions, groups, and charts

         1. fill in defaults for missing attributes
         2. infer other missing attributes from what's there
         3. check for required and unknown attributes
         4. check for logical errors
         5. finally, generate

         */

        // a map of attr->required to check for at the end to make sure we have everything
        // warning: don't put method calls for defaults which must be constructed each time!
        var chart_attrs = {
            base: {
                supported: true,
                div: {required: true}, // actually sent to parent selector for chart constructor
                title: {required: false}, // title for html in the div, handled outside this lib
                dimension: {required: true},
                group: {required: true},
                ordering: {required: false},
                width: {required: true, default: 300},
                height: {required: true, default: 300},
                'transition.duration': {required: false},
                label: {required: false}, // or null for no labels
                tips: {required: false}, // dc 'title', or null for no tips
                more: {required: false} // executes arbitrary extra code on the dc.js chart object
                // key, value are terrible names: handle as variables below
            },
            color: {
                supported: true,
                color: {required: false}, // colorAccessor
                'color.scale': {required: false}, // the d3 way not the dc way
                'color.domain': {required: false},
                'color.range': {required: false}
            },
            stackable: {
                supported: true,
                stack: {required: false},
                'stack.levels': {required: false}
            },
            coordinateGrid: {
                supported: true,
                parents: ['base', 'color'],
                margins: {required: false},
                x: {required: false}, // keyAccessor
                y: {required: false}, // valueAccessor
                // prob would be good to subgroup these?
                'x.ordinal': {required: false},
                'x.scale': {required: true}, // scale component of x
                'x.domain': {required: false}, // domain component of x
                'x.units': {required: false}, // the most horrible thing EVER
                'x.round': {required: false},
                'x.elastic': {required: false},
                'x.padding': {required: false},
                // likewise
                'y.scale': {required: false},
                'y.domain': {required: false},
                'y.elastic': {required: false},
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
                width: {default: 700},
                height: {default: 250},
                centerBar: {required: false},
                gap: {required: false},
                'color.x': {default: true}, // color bars individually when not stacked
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
                r: {default: 2}, // radiusValueAccessor
                'r.scale': {required: false}, // scale component of r
                'r.domain': {required: false} // domain component of r
            },
            bubble: {
                concrete: true,
                parents: ['coordinateGrid', 'abstractBubble'],
                width: {default: 400},
                label: {default: null}, // do not label by default; use ..key.. to label with keys
                color: {default: 0}, // by default use first color in palette
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
            dataTable: {
                supported: true,
                concrete: true,
                parents: ['base'],
                columns: {required: true},
                size: {required: false},
                sortBy: {required: false}
            }
        };

        function skip_attr(a) {
            return a==='supported' || a==='concrete' || a==='parents';
        }

        function parents_first_traversal(map, iter, callbacks) {
            if(!(iter in map))
                throw 'unknown chart type ' + defn.type;
            var curr = map[iter];
            if('parents' in curr)
                for(var i = 0; i < curr.parents.length; ++i)
                    parents_first_traversal(map, curr.parents[i], callbacks);
            callbacks[iter]();
        }
        function parents_last_traversal(map, iter, callbacks) {
            if(!(iter in map))
                throw 'unknown chart type ' + defn.type;
            callbacks[iter]();
            var curr = map[iter];
            if('parents' in curr)
                for(var i = 0; i < curr.parents.length; ++i)
                    parents_last_traversal(map, curr.parents[i], callbacks);
        }

        // dc.js formats all numbers as ints - override
        var _psv = dc.utils.printSingleValue;
        dc.utils.printSingleValue = function(filter) {
            if(typeof(filter) === 'number') {
                if(filter%1 === 0)
                    return filter;
                else if(filter>10000 || filter < -10000)
                    return Math.round(filter);
                else
                    return filter.toPrecision(4);
            }
            else return _psv(filter);
        };

        dcplot.format_error = function(e) {
            var tab;
            if(_.isArray(e)) { // expected exception: input error
                tab = $('<table/>');
                $.each(e, function(i) {
                    var err = e[i], formatted_errors = $('<td/>');
                    if(_.isString(err.errors))
                        formatted_errors.text(err.errors);
                    else if(_.isArray(err.errors))
                        $.each(err.errors, function(e) {
                            formatted_errors.append($('<p/>').text(err.errors[e]));
                        });
                    else formatted_errors.text(err.errors.message.toString());
                    var name = err.name.replace(/_\d*_\d*$/, '');
                    tab.append($('<tr valign=top/>').
                               append($('<td/>').text(err.type)).
                               append($('<td/>').text(name)).
                               append(formatted_errors)
                              );
                });
            }
            else // unexpected exception: probably logic error
                tab = $('<p/>').text(e.toString());
            var error_report = $('<div/>').
                    append($('<p/>').text('dcplot errors!')).
                    append(tab);
            return error_report;
        };

        function dcplot(frame, groupname, definition) {

            // generalization of _.has
            function mhas(obj) {
                for(var i=1; i<arguments.length; ++i)
                    if(!_.has(obj, arguments[i]) || obj[arguments[i]] === undefined)
                        return false;
                else obj = obj[arguments[i]];
                return true;
            }

            // defaults
            function default_dimension(name, defn) {
                // nothing (yet?)
            }
            function default_group(name, defn, dims) {
                var errors = [];
                if(!_.has(defn, 'group'))
                    defn.group = dcplot.group.identity;
                if(!_.has(defn, 'reduce'))
                    defn.reduce = definition.defreduce;

                if(errors.length)
                    throw errors;
            }
            function default_chart(name, defn, dims, groups) {
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
                    // parents last
                    if('parents' in cattrs)
                        for(var i = 0; i < cattrs.parents.length; ++i)
                            do_defaults(defn, cattrs.parents[i]);

                }
                do_defaults(defn, defn.type);
            }

            function accessor(a) {
                function constant_fn(v) {
                    return function() { return v; };
                }
                if(_.isFunction(a))
                    return a;
                else if(_.isString(a))
                    return frame.has(a) ? frame.access(a) : constant_fn(a);
                else if(_.isObject(a)) {
                    if(('fun' in a) && ('arg' in a)) {
                        var fun = a.fun, arg = a.arg;
                        var resolve = accessor(arg);
                        return fun(resolve);
                    }
                    else return constant_fn(a);
                }
                else if(_.isNumber(a))
                    return constant_fn(a);
                else throw "illegal accessor " + a.toString();
            }

            function one_stack(defn) {
                return !_.has(defn,'stack.levels') ||
                    (_.has(defn,'stack.levels') && defn['stack.levels'].length === 1);
            }

            // inferences
            function infer_dimension(name, defn) {
                // nothing (yet?)
            }
            function infer_group(name, defn, dims) {
            }
            function infer_chart(name, defn, dims, groups) {
                var errors = [];
                function find_unused(hash, base) {
                    if(!hash[base])
                        return base;
                    var n = 1;
                    while(hash[base + n]) ++n;
                    return base + n;
                }
                // abstract this into a plugin - this is RCloud-specific (rserve.js)
                function get_levels(dim) {
                    var levels = null;
                    if(_.isFunction(dim)) levels = dim.attrs.r_attributes.levels;
                    else if(_.has(dims, dim) && mhas(accessor(dims[dim]), 'attrs', 'r_attributes', 'levels'))
                        levels = accessor(dims[dim]).attrs.r_attributes.levels;
                    return levels;
                }
                function looks_ordinal(dim) {
                    return _.has(dims, dim) && _.isString(accessor(dims[dim])(0));
                }

                var callbacks = {
                    base: function() {
                        if(!('div' in defn))
                            defn.div = '#' + name;
                        if(defn.group) {
                            if(!groups[defn.group])
                                errors.push('unknown group "' + defn.group + '"');
                            else if(!defn.dimension)
                                defn.dimension = groups[defn.group].dimension;
                        }
                        else if(defn.dimension) {
                            if(!dims[defn.dimension])
                                errors.push('unknown dimension "' + defn.dimension + '"');
                            else {
                                defn.group = find_unused(groups, defn.dimension);
                                var g = groups[defn.group] = {};
                                g.dimension = defn.dimension;
                                default_group(defn.group, g, dims);
                                infer_group(defn.group, g, dims);
                            }
                        }
                        if(!_.has(defn, 'ordering')) {
                            // note it's a little messy to have this as a property of the chart rather than
                            // the group, but dc.js sometimes needs an ordering and sometimes doesn't
                            var levels = get_levels(defn.dimension);
                            if(levels !== null) {
                                var rmap = _.object(levels, _.range(levels.length));
                                // the ordering function uses a reverse map of the levels
                                defn.ordering = function(p) {
                                    return rmap[p.key];
                                };
                            }
                        }

                    },
                    color: function() {
                        if(!defn['color.scale']) {
                            // note stackable bleeds in here: since they are on different branches
                            // of the hierarchy, there is no sensible way for stackable to override
                            // color here
                            var levels = get_levels(defn.stack || defn.dimension);
                            defn['color.scale'] = (levels !== null && levels.length>10) ?
                                d3.scale.category20() : d3.scale.category10();
                        }
                        if(!defn['color.domain']) {
                            // this also should be abstracted out into a plugin (RCloud-specific)
                            if(mhas(defn, 'color', 'attrs', 'r_attributes', 'levels'))
                                defn['color.domain'] = defn.color.attrs.r_attributes.levels;
                        }
                    },
                    stackable: function() {
                        if(_.has(defn,'stack')) {
                            if(!_.has(defn,'stack.levels'))
                                defn['stack.levels'] = get_levels(defn.stack);
                            var levels = defn['stack.levels'];

                            // Change reduce functions to filter on stack levels
                            for(var s = 0; s<defn['stack.levels'].length; s++) {
                                var newName = defn.group+defn['stack.levels'][s];
                                var newGroupDefn = _.clone(groups[defn.group]);

                                // Special treatment for counts, otherwise generic filter wrapper
                                if(newGroupDefn.reduce === dcplot.reduce.count)
                                    newGroupDefn.reduce = dcplot.reduce.countFilter(defn.stack,defn['stack.levels'][s]);
                                else newGroupDefn.reduce = dcplot.reduce.filter(newGroupDefn.reduce,defn.stack,defn['stack.levels'][s]);

                                groups[newName] = newGroupDefn;
                            }
                        }
                    },
                    coordinateGrid: function() {
                        var levels = get_levels(defn.dimension);
                        if(!('x.ordinal' in defn)) {
                            defn['x.ordinal'] = (('x.units' in defn) && defn['x.units'] === dc.units.ordinal) ||
                                (levels !== null) || looks_ordinal(defn.dimension);
                        }

                        if(!('x.scale' in defn) && defn['x.ordinal'])
                            defn['x.scale'] = d3.scale.ordinal();
                        if(!('x.units' in defn) && defn['x.ordinal'])
                            defn['x.units'] = dc.units.ordinal;
                        if(!('x.domain' in defn) && levels)
                            defn['x.domain'] = levels;

                        // not a default because we must construct a new object each time
                        if(!('x.scale' in defn))
                            defn['x.scale'] = levels ? d3.scale.ordinal() : d3.scale.linear();
                        if(!('y.scale' in defn))
                            defn['y.scale'] = d3.scale.linear();

                        // this won't work incrementally out of the box
                        if(!('x.domain' in defn) && !('x.elastic' in defn))
                            defn['x.elastic'] = true;
                        if(!('y.domain' in defn) && !('y.elastic' in defn))
                            defn['y.elastic'] = true;
                    },
                    pie: function() {
                    },
                    bar: function() {
                        /* in practice, dc's xUnits seem to be based on either the bin width
                         for a histogram, or the set of ordinals */
                        if(!('x.units' in defn) && defn.group) {
                            var group = groups[defn.group];
                            if(mhas(group, 'group', 'binwidth'))
                                defn['x.units'] = dc.units.fp.precision(group.group.binwidth);
                        }
                        if(!_.has(defn, 'color.domain')) {
                            var levels;
                            if(one_stack(defn)) {
                                if(defn['color.x']) {
                                    levels = get_levels(defn.dimension);
                                    if(levels)
                                        defn['color.domain'] = levels;
                                }
                            }
                            else {
                                levels = get_levels(defn.stack);
                                if(levels)
                                    defn['color.domain'] = levels;
                            }
                        }
                    },
                    line: function() {
                    },
                    abstractBubble: function() {
                    },
                    bubble: function() {
                    },
                    dataTable: function() {
                        var bad = _.find(defn.columns,
                                         function(col) { return !frame.has(col); });
                        if(bad)
                            throw bad + " not a valid column!";
                    }
                };
                parents_first_traversal(chart_attrs, defn.type, callbacks);

                if(errors.length)
                    throw errors;
            }


            // look for required attrs not filled and unknown attrs
            function check_dimension_attrs(name, defn) {
            }
            function check_group_attrs(name, defn) {
                var expected = ['dimension', 'group', 'reduce'];
                var k = _.keys(defn),
                    missing = _.difference(expected, k),
                    unknown = _.difference(k, expected),
                    errors = [];
                if(missing.length)
                    errors.push('definition is missing required attrs: ' + missing.join(', '));
                if(unknown.length)
                    errors.push('definition has unknown attrs: ' + unknown.join(', '));

                if(errors.length)
                    throw errors;
            }
            function check_chart_attrs(name, defn) {
                function find_discreps(defn, type, missing, found) {
                    var cattrs = chart_attrs[type];
                    if(!cattrs.supported)
                        throw 'type "' + type + '" not supported';
                    if('parents' in cattrs)
                        for(var i = 0; i < cattrs.parents.length; ++i)
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
                    errors.push('definition is missing required attrs: ' + missing.join(', '));
                var unknown = _.map(_.reject(_.pairs(found),
                                             function(p) { return p[1]; }),
                                    function(p) { return p[0]; });
                if(unknown.length)
                    errors.push('definition has unknown attrs: ' + unknown.join(', '));

                if(errors.length)
                    throw errors;
            }


            // logic errors
            function check_dimension_logic(name, defn) {
                // nothing (yet?)
            }
            function check_group_logic(name, defn, dims) {
                var errors = [];
                if(!_.has(dims, defn.dimension))
                    errors.push('unknown dimension "' + defn.dimension + '"');

                if(errors.length)
                    throw errors;
            }
            function check_chart_logic(name, defn, dims, groups) {
                var errors = [];
                var callbacks = {
                    base: function() {
                        if(defn.dimension && defn.dimension!==groups[defn.group].dimension)
                            errors.push('group "' + defn.group + '" dimension "' + groups[defn.group].dimension +
                                        '" does not match chart dimension "' + defn.dimension + '"');
                    },
                    color: function() {
                    },
                    stackable: function() {
                    },
                    coordinateGrid: function() {
                        // dc.js doesn't require domain but in practice it's needed unless elastic
                        if(!defn['x.elastic'] && !('x.domain' in defn))
                            throw 'need x.domain unless x.elastic';
                        if(!defn['y.elastic'] && !('y.domain' in defn))
                            throw 'need y.domain unless y.elastic';
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
                    },
                    dataTable: function() {
                    }
                };

                parents_first_traversal(chart_attrs, defn.type, callbacks);

                if(errors.length)
                    throw errors;
            }

            function create_group(defn, dimensions) {
                return accessor(defn.reduce)(defn.group(dimensions[defn.dimension]));
            }


            // this is a hopefully a lot of boilerplate with not too much logic
            // maps from dcplot attributes to dc.js methods
            function create_chart(groupname, defn, dimensions, groups) {
                var ctor, chart;

                /* create uniformity between crossfilter dimension and reduce functions,
                 and dc.js accessor functions with a simple trick: for the latter,
                 split the input, which is {key, value}, into two params. this works
                 because crossfilter functions work with just the 'key'

                 i.e. in crossfilter:
                 * dimension functions are key -> key
                 * group.group functions are key -> key
                 * group.reduce functions are key -> value
                 in dc:
                 * accessor functions are {key,value} -> whatever

                 so instead we make them (key,value) -> whatever and then they look like
                 crossfilter functions!
                 */
                function key_value(f) { return function(kv) { return f(kv.key, kv.value); }; }

                var callbacks = {
                    base: function() {
                        chart = ctor(defn.div, groupname);
                        chart.dimension(dimensions[defn.dimension])
                            .group(groups[defn.group])
                            .width(defn.width)
                            .height(defn.height);
                        if(_.has(defn, 'ordering'))
                            chart.ordering(defn.ordering);
                        if(_.has(defn, 'transition.duration'))
                            chart.transitionDuration(defn['transition.duration']);
                        if(_.has(defn, 'label')) {
                            if(defn.label)
                                chart.label(key_value(defn.label));
                            else
                                chart.renderLabel(false);
                        }
                        if(_.has(defn, 'tips')) {
                            if(defn.tips)
                                chart.title(key_value(defn.tips));
                            else
                                chart.renderTitle(false);
                        }
                    },
                    color: function() {
                        // i am cool with dc.js's color accessor
                        if(_.has(defn, 'color'))
                            chart.colorAccessor(key_value(accessor(defn.color)));
                        // however i don't understand why dc chooses to use a
                        // "color calculator" when a d3 scale seems like it ought
                        // to serve the purpose. so just plug a d3 scale into colors
                        // and override the calculator to use it
                        // also default to category10 which seems better for discrete colors

                        var scale = defn['color.scale'];
                        if(_.has(defn, 'color.domain'))
                            scale.domain(defn['color.domain']);
                        if(_.has(defn, 'color.range'))
                            scale.range(defn['color.range']);
                        chart.colors(scale);
                        chart.colorCalculator(function(x) { return chart.colors()(x); });
                    },
                    stackable: function() {
                        if(_.has(defn, 'stack') && _.has(defn, 'stack.levels')) {
                            for(var s = 0; s<defn['stack.levels'].length; s++) {
                                var stackGroup = groups[defn.group+defn['stack.levels'][s]];

                                if(s === 0)
                                    chart.group(stackGroup);
                                else chart.stack(stackGroup);
                            }
                        }
                    },
                    coordinateGrid: function() {
                        if(_.has(defn, 'margins')) chart.margins(defn.margins);
                        else chart.margins({top: 10, right: 50, bottom: 30, left: 60});
                        if(_.has(defn, 'x'))
                            chart.keyAccessor(key_value(accessor(defn.x)));
                        if(_.has(defn, 'y'))
                            chart.valueAccessor(key_value(accessor(defn.y)));

                        var xtrans = defn['x.scale'];
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

                        if(_.has(defn, 'y.scale')) {
                            var ytrans = defn['y.scale'];
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
                            chart.keyAccessor(key_value(defn.wedge));
                        if(_.has(defn, 'size'))
                            chart.keyAccessor(key_value(defn.size));

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
                        // optionally color the bars when ordinal and not stacked or one stack
                        if(_.has(defn,'x.ordinal') && defn['x.ordinal'] && defn['color.x'] && one_stack(defn)) {
                            chart.renderlet(function(chart) {
                                chart.selectAll("rect.bar").style('fill', function(d,i) {
                                    if(d3.select(this).classed(dc.constants.DESELECTED_CLASS))
                                        return null;
                                    else return chart.colors()(d.x);
                                });
                            });
                        }
                        else if(!one_stack(defn)) {
                            // dc.js does not automatically color the stacks different colors (!)
                            chart.renderlet(function(chart) {
                                chart.selectAll("g."+dc.constants.STACK_CLASS)
                                    .each(function(d,i) {
                                        var stack = defn['stack.levels'][i];
                                        d3.select(this).selectAll("rect.bar")
                                            .style('fill', function(d,i) {
                                                if(d3.select(this).classed(dc.constants.DESELECTED_CLASS))
                                                    return null;
                                                else return chart.colors()(stack);
                                            })
                                            .select('title')
                                            .text(function(d,i) {
                                                return stack + ", " + d3.select(this).text();
                                            });
                                    });
                            });
                        }

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
                            chart.radiusValueAccessor(key_value(accessor(defn.r)));
                        if(_.has(defn, 'r.scale') || _.has(defn, 'r.domain')) {
                            var rtrans = defn['r.scale'] || d3.scale.linear();
                            rtrans.domain(defn['r.domain'] || [0,100]);
                            chart.r(rtrans);
                        }
                    },
                    dataTable: function() {
                        chart.group(accessor(defn.dimension));
                        chart.columns(defn.columns.map(accessor));
                        chart.size(defn.size || frame.records().length);
                        if(_.has(defn,'sortBy'))
                            chart.sortBy(accessor(defn.sortBy));
                    }
                };
                ctor = {
                    pie: dc.pieChart,
                    bar: dc.barChart,
                    line: dc.lineChart,
                    bubble: dc.bubbleChart,
                    dataTable: dc.dataTable
                }[defn.type];

                parents_first_traversal(chart_attrs, defn.type, callbacks);

                // perform any extra post-processing
                if(_.has(defn, 'more'))
                    defn.more(chart);

                return chart;
            }


            function aggregate_errors(dimension_fn, group_fn, chart_fn) {
                var errors = [];
                for(var d in definition.dimensions) {
                    defn = definition.dimensions[d];
                    try {
                        dimension_fn(d, defn);
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
                        group_fn(g, defn, definition.dimensions);
                    }
                    catch(e) {
                        errors.push({type: 'group', name: g, errors: e});
                    }
                }
                for(var c in definition.charts) {
                    defn = definition.charts[c];
                    try {
                        chart_fn(c, defn, definition.dimensions, definition.groups);
                    }
                    catch(e) {
                        errors.push({type: 'chart', name: c, errors: e});
                    }
                }
                return errors;
            }

            var errors = [];
            var defn;

            // first check all chart types because the traversals are unchecked
            for(var c in definition.charts) {
                defn = definition.charts[c];
                if(!(defn.type in chart_attrs))
                    throw 'unknown chart type "' + defn.type + '"';
                if(!chart_attrs[defn.type].supported)
                    throw 'unsupported chart type "' + defn.type + '"';
                if(!chart_attrs[defn.type].concrete)
                    throw "can't create abstract chart type \"" + defn.type + '"';
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

            console.log("dcplot charts definition:");
            console.log(definition);

            // create / fill stuff in
            var dimensions = {};
            var groups = {};
            var charts = {};

            var ndx = crossfilter(frame.records());
            for(var d in definition.dimensions) {
                defn = definition.dimensions[d];
                dimensions[d] = ndx.dimension(accessor(defn));
            }
            for(var g in definition.groups) {
                defn = definition.groups[g];
                groups[g] = create_group(defn, dimensions);
            }

            for(c in definition.charts) {
                defn = definition.charts[c];
                charts[c] = create_chart(groupname, defn, dimensions, groups);
            }

            dc.renderAll(groupname);

            return charts;
        }
        return dcplot;
    }
    // crossfilter is not amd-ized, therefore not a dependency here
    if(typeof define === "function" && define.amd) {
        define(["dc", "crossfilter"], _dcplot);
    } else if(typeof module === "object" && module.exports) {
        module.exports = _dcplot(dc, crossfilter);
    } else {
        this.dcplot = _dcplot(dc, crossfilter);
    }
}
)();
