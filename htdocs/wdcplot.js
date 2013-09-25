// R to dc.js bridge code.  This should probably become a library in js/,
// just deploying it separately for now to ease development
//////////////////////////////////////////////////////////////////////////////

var wdcplot = (function() {
    var chart_group = 0;
    window.charts = {}; // initialize a global namespace for charts

    function chart_group_name(group_no) {
        return 'dcplotgroup' + group_no;
    }

    function bin_op(disp) {
        return function(frame, args, ctx) {
            var lhs = expression(frame, args[1], ctx),
                rhs = expression(frame, args[2], ctx);
            return {lambda: lhs.lambda || rhs.lambda, text: lhs.text + disp + rhs.text};
        };
    }

    function una_or_bin_op(disp) {
        return function(frame, args, ctx) {
            if(args.length==2) {
                var operand = expression(frame, args[1], ctx);
                return {lambda: operand.lambda, text: disp + operand.text};
            }
            else return bin_op(disp)(frame, args, ctx);
        };
    }

    function value(v) {
        return _.isString(v) ? '"' + v + '"' : v;
    }

    var operators = {
        "$": bin_op('.'),
        "-": una_or_bin_op('-'),
        "+": una_or_bin_op('+'),
        "*": bin_op('*'),
        "/": bin_op('/'),
        "c" : function(frame, args, ctx) {
            return '[' + _.map(args.slice(1), function(arg) {
                return value(arg); })
                + ']';
        },
        "[": function(frame, args, ctx) {
            var ray = expression(frame, args[1], ctx),
                sub = expression(frame, args[2], ctx);
            return {lambda: ray.lambda || sub.lambda,
                    text: ray.text + '[' + sub.text + ']'};
        },
        default: function(frame, args, ctx) { // function call operator()
            var fun = expression(frame, args[0], ctx),
                call = _.foldl(args.slice(1), function(mem) {
                    var arg = expression(frame, arg, ctx);
                    return {lambda: mem.lambda || arg.lambda, text: mem.text + ', ' + arg.text};
                }, {lambda: fun.lambda, text: fun.text + '('});
            call.text += ')';
            return call;
        }
    };

    function lambda_body(frame, exprs, ctx) {
        var body = _.map(exprs, function(arg) { return expression(frame, arg, ctx).text; });
        body[body.length-1] = "return " + body[body.length-1];
        var cr = "\n", indent = Array(ctx.indent+1).join("\t");
        return indent + body.join(";" + cr + indent) + ";";
    }

    function lambda(frame, sexp, ctx) {
        ctx.indent++;
        var args = sexp[0].slice(1);
        var cr = "\n";
        var text = "function (" + args.join() + ") {" + cr +
            lambda_body(frame, sexp.slice(1), ctx) + cr;
        ctx.indent--;
        var indent = Array(ctx.indent+1).join("\t");
        text += indent + "}";
        // what? not a lambda? no, we just don't need to wrap it as one
        // if it ends up evaluating into a lambda that's cool
        return {lambda: false, text: text};
    }

    function node(frame, sexp, ctx) {
        if($.isArray(sexp[0]) && sexp[0][0] == "func") // special case lambda expr trees
            return lambda(frame, sexp, ctx);
        var op = operators[sexp[0]] || operators.default;
        return op(frame, sexp, ctx);
    }

    function leaf(frame, sexp, ctx) {
        if($.isPlainObject(sexp)) {
            return {lambda: false, text: JSON.stringify(sexp)};
        }
        else if(_.isString(sexp)) {
            if(/\.\..*\.\.$/.test(sexp)) {
                var content = sexp.substring(2, sexp.length-2);
                switch(content) {
                case 'index': return {lambda: true, text: "frame.index(key)"};
                case 'value':
                case 'selected': return {lambda: true, text: "value"};
                case 'key': return {lambda: true, text: "key"};
                default: throw "unknown special variable " + sexp;
                }
            }
            else if(frame.has(sexp))
                return {lambda: true, text: "frame.access('" + sexp + "')(key)"};
            else return {lambda: false, text: sexp};
        }
        else return {lambda: false, text: sexp};
    }

    function expression(frame, sexp, ctx) {
        if($.isArray(sexp))
            return node(frame, sexp, ctx);
        else
            return leaf(frame, sexp, ctx);
    }

    /* a wdcplot argument may be
     - null
     - a simple field accessor (if it's a string which is a field name in the dataframe)
     - a string (if it's any other string)
     - a number
     - an array (we assume any top-level array contains only literals)
     - otherwise we build javascript from the expression tree; if it contains
     field names identifiers, it's a lambda(key,value) else execute it immediately
     */
    function argument(frame, sexp) {
        if(sexp==null)
            return null;
        else if(_.isString(sexp)) {
            // special-case simple string field access for efficiency
            if(/\.\..*\.\.$/.test(sexp)) {
                var content = sexp.substring(2, sexp.length-2);
                switch(content) {
                case 'value':
                case 'index': return frame.index;
                case 'key': return function(k, v) { return k; };
                default: throw "unknown special variable " + sexp;
                }
            }
            else if(frame.has(sexp))
                return frame.access(sexp);
            else return sexp;
        }
        else if(_.isNumber(sexp))
            return sexp;
        else if(_.isArray(sexp) && sexp[0]==='c')
            return sexp.slice(1);
        var ctx = {indent:0};
        var js_expr = expression(frame, sexp, ctx);
        if(js_expr.lambda) {
            // it seems kind of screwy to use eval here but it has the nice property
            // of using a closure, which new Function() does not, which makes it
            // easier to inspect the js_expr in the debugger (without _.partial()
            // getting in the way, etc.)
            return function(key,value) { return eval(js_expr.text); };
        }
        else {
            // the expression didn't involve any variables, so we can execute it now
            return eval(js_expr.text);
        }
    }

    // are these recursive or is this top-level catch enough?
    function group_constructor(frame, sexp) {
        switch(sexp[0]) {
        case 'bin': return group.bin(sexp[1]);
        case 'identity': return group.identity;
        default: return argument(frame, sexp); // but it's operating on keys?
        }
    }

    function reduce_constructor(frame, sexp) {
        switch(sexp[0]) {
        case 'count': return reduce.count;
        case 'sum': return reduce.sum(argument(frame, sexp[1]));
        case 'any': return reduce.any(argument(frame, sexp[1]));
        case 'avg': return reduce.avg(argument(frame, sexp[1]));
        default: return argument(frame, sexp);
        }
    }

    // take an array of named or unnamed arguments and for any that are unnamed
    // at the beginning, give them the names specified in names
    // a cheap, incomplete implementation of R positional arguments
    function positionals(sexps, names) {
        var ret = [];
        if(!sexps.length)
            return ret;
        var i, names_started = false;
        if(!_.isArray(sexps[0])) {
            if(names.length < sexps.length)
                throw "ran out of positional arguments - use names";
            for(i = 0; i < sexps.length; ++i)
                ret.push([names[i], sexps[i]]);
        }
        else for(i = 0; i < sexps.length; ++i) {
            var elem = sexps[i];
            if(names_started) {
                if(!elem[0])
                    throw "all positional arguments must be first";
                ret.push(elem);
            }
            else {
                if(elem[0] !== null) {
                    names_started = true;
                    ret.push(elem);
                }
                else if(names.length-1 < i)
                    throw "ran out of positional arguments - use names";
                else ret.push([names[i], elem[1]]);
            }
        }
        return ret;
    }

    function do_dimensions(frame, sexps) {
        var ret = {};
        // could almost use positionals() here except that you can mix named & unnamed
        for(var i = 0; i < sexps.length; ++i) {
            var elem = sexps[i], key, value;
            if(_.isArray(elem)) {
                value = elem[1];
                if(elem[0] !== null)
                    key = elem[0];
                else {
                    if(!_.isString(value))
                        throw "must specify dimension name if value isn't a field name (" + value.toString() + ')';
                    key = value;
                }
            }
            else if(_.isString(elem))
                key = value = elem;
            else throw 'illegal dimension specification ' + elem.toString();

            ret[key] = argument(frame, value);
        }
        return ret;
    }

    function do_groups(frame, sexps) {
        var ret = {};
        for(var i = 0; i < sexps.length; ++i) {
            var name = sexps[i][0], defn = sexps[i][1];
            defn = positionals(defn, [null, 'dimension', 'group', 'reduce']);
            if(defn[0][0] !== null)
                throw "expected a null here";
            if(defn[0][1] !== "group")
                throw "groups should use group constructor";
            var group = {};
            for(var j = 1; j < defn.length; ++j) {
                var field = defn[j][0], val;
                switch(field) {
                case 'dimension':
                    val = defn[j][1];
                    break;
                case 'group':
                    val = group_constructor(frame, defn[j][1]);
                    break;
                case 'reduce':
                    val = reduce_constructor(frame, defn[j][1]);
                    break;
                }
                group[field] = val;
            }
            ret[name] = group;
        }
        return ret;
    }

    function do_charts(frame, sexps) {
        var ret = {};
        for(var i = 0; i < sexps.length; ++i) {
            var val = sexps[i][1];
            // pity we can't do more positional args but dimension or group is
            // the next natural argument and we don't know which
            val = positionals(val, [null, 'title']);
            if(val[0][0] !== null)
                throw "expected a null here";
            var defn = {type: val[0][1]};
            defn.title = sexps[i][0]; // a default to be overridden
            for(var j = 1; j < val.length; ++j) {
                var key = val[j][0], value = val[j][1];
                switch(key) {
                case 'dimension': defn[key] = value; // don't allow lambdas here
                    break;
                default:
                    defn[key] = argument(frame, value);
                }
            }
            var name = sexps[i][0] + '_' + chart_group + '_' + i;
            ret[name] = defn;
        }
        return ret;
    }
    function make_chart_div(name, title) {
        return $('<div/>',
                 {id: name, style: "float:left"})
            .append($('<div/>')
                    .append($('<strong/>').append(title))
                    .append('&nbsp;&nbsp;')
                    .append($('<span/>', {class: 'reset', style: 'display: none;'})
                            .append('Current filter: ')
                            .append($('<span/>', {class: 'filter'})))
                    .append('&nbsp;&nbsp;')
                    .append($('<a/>',
                              {class: 'reset',
                               href: "javascript:window.charts['"+name+"'].filterAll(); dc.redrawAll('" + chart_group_name(chart_group) + "');",
                               style: "display: none;"})
                            .append("reset"))
                   );
    }

    var result = {
        field : function(rdata, k, r) {
            return rdata[k][r];
        },
        format_error: dcplot.format_error,
        translate: function(data) {
            var frame = dataframe.cols(data);
            // allow skipping sections (but don't allow repeated sections)
            var definition = {}, divs;
            for(var i = 1; i < arguments.length; ++i) {
                var arg = arguments[i];
                if(!arg)
                    continue;
                var section = arg[0], section_name;
                if(_.isArray(section)) {
                    if(section[0] !== null)
                        throw "unexpected named section " + section[0];
                    section_name = section[1];
                }
                else if(_.isString(section)) {
                    section_name = section;
                }
                else throw 'illegal chart section ' + section.toString();

                if(section_name in definition)
                    throw "unexpected repeated section " + section[1];

                var secdata = arg.slice(1);
                switch(section_name) {
                case 'dimensions':
                    definition.dimensions = do_dimensions(frame, secdata);
                    break;
                case 'groups':
                    definition.groups = do_groups(frame, secdata);
                    break;
                case 'charts':
                    definition.charts = do_charts(frame, secdata);
                    divs = _.map(_.keys(definition.charts),
                                 function(key) {
                                     return definition.charts[key].div
                                         = make_chart_div(key, definition.charts[key].title)[0];
                                 });
                    break;
                default: throw "unexpected section " + section[1];
                }
            }

            var divwrap = $('<div/>',{id:"chartdiv"+chart_group, style: "overflow:auto"});
            _.each(divs, function(div) { divwrap.append(div); });

            return {dataframe: frame,
                    defn: definition,
                    elem: divwrap,
                    groupname: chart_group_name(chart_group++)};
        }
    };
    return result;
})();
