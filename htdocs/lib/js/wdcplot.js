// generates dcplot chart descriptions from an EDSL in R
//////////////////////////////////////////////////////////////////////////////
(function() { function _wdcplot(dcplot, dataframe, dc) {
    var chart_group = 0;
    window.charts = {}; // initialize a global namespace for charts

    function chart_group_name(group_no) {
        return 'dcplotgroup' + group_no;
    }

    function bin_op_fun(f) {
        return function(frame, args, ctx) {
            var lhs = expression(frame, args[1], ctx),
                rhs = expression(frame, args[2], ctx);
            return {lambda: lhs.lambda || rhs.lambda, text: f(lhs.text, rhs.text)};
        };
    }

    function bin_op(disp) {
        return bin_op_fun(function(left, right) {
            return left + disp + right;
        });
    }

    function una_or_bin_op(disp) {
        return function(frame, args, ctx) {
            if(args.length===2) {
                var operand = expression(frame, args[1], ctx);
                return {lambda: operand.lambda, text: disp + operand.text};
            }
            else return bin_op(disp)(frame, args, ctx);
        };
    }

    function value(v) {
        return _.isString(v) ? '"' + v + '"' : v;
    }

    function comma_sep(frame, args, ctx) {
        var elems = _.map(args, function(arg) { return expression(frame, arg, ctx); });
        return {
            lambda: _.some(elems, function(e) { return e.lambda; }),
            text: _.pluck(elems, 'text').join(', ')
        };
    }

    var operators = {
        "$": bin_op('.'),
        "-": una_or_bin_op('-'),
        "+": una_or_bin_op('+'),
        "*": bin_op('*'),
        "/": bin_op('/'),
        "^": bin_op_fun(function(left, right) { // note: ** gets converted to ^
            return "Math.pow(" + left + ", " + right + ")";
        }),
        "c" : function(frame, args, ctx) {
            var elems = comma_sep(frame, args.slice(1), ctx);
            return {lambda: elems.lambda,
                    text: '[' + elems.text + ']'};
        },
        "[": function(frame, args, ctx) {
            var ray = expression(frame, args[1], ctx),
                sub = expression(frame, args[2], ctx);
            return {lambda: ray.lambda || sub.lambda,
                    text: ray.text + '[' + sub.text + ']'};
        },
        default: function(frame, args, ctx) { // parens or function application
            var fun = expression(frame, args[0], ctx),
                elems = comma_sep(frame, args.slice(1), ctx);
            return {
                lambda: elems.lambda,
                text: (fun.text==='(' ? '' : fun.text) + '(' +
                    elems.text + ')'
            };
        }
    };

    function lambda_body(frame, exprs, ctx) {
        var body = _.map(exprs, function(arg) {
            return expression(frame, arg, ctx).text;
        });
        body[body.length-1] = "return " + body[body.length-1];
        var cr = "\n", indent = Array(ctx.indent+1).join("\t");
        return indent + body.join(";" + cr + indent) + ";";
    }

    function lambda(frame, sexp, ctx) {
        ctx.indent++;
        var args = sexp[0].slice(1);
        var cr = "\n";
        var text = "(function (" + args.join() + ") {" + cr +
            lambda_body(frame, sexp.slice(1), ctx) + cr;
        ctx.indent--;
        var indent = Array(ctx.indent+1).join("\t");
        text += indent + "})";
        // what? not a lambda? no, we just don't need to wrap it as one
        // if it ends up evaluating into a lambda that's cool
        return {lambda: false, text: text};
    }

    function node(frame, sexp, ctx) {
        if($.isArray(sexp[0]) && sexp[0][0] === "func") // special case lambda expr trees
            return lambda(frame, sexp, ctx);
        var op = operators[sexp[0]] || operators.default;
        return op(frame, sexp, ctx);
    }

    function is_wdcplot_placeholder(sexp) {
        return sexp.r_attributes && sexp.r_attributes['wdcplot.placeholder'];
    }

    function special_function(sexp) {
        return is_wdcplot_placeholder(sexp) && sexp.r_attributes['wdcplot.placeholder'] === 'special' ?
            sexp[0] : undefined;
    }

    function dataframe_column(sexp) {
        return is_wdcplot_placeholder(sexp) && sexp.r_attributes['wdcplot.placeholder'] === 'column' ?
            sexp[0] : undefined;
    }

    function col_name(elem) {
        var place;
        if((place = special_function(elem)))
            return '..' + place + '..';
        else if((place = dataframe_column(elem)))
            return place;
        return null;
    }

    function col_ref(elem, field) {
        var placeholder = col_name(elem);
        if(placeholder)
            return placeholder;
        else {
            if(!_.isString(elem))
                throw field + " expects column, special, or string, got: " + elem;
            return elem;
        }
    }

    function leaf(frame, sexp, ctx) {
        if($.isPlainObject(sexp)) {
            return {lambda: false, text: JSON.stringify(sexp)};
        }
        else if(_.isArray(sexp)) {
            var place;
            if((place = special_function(sexp))) {
                switch(place) {
                case 'index': return {lambda: true, text: "frame.index(key)"};
                case 'value':
                case 'selected': return {lambda: true, text: "value"};
                case 'key': return {lambda: true, text: "key"};
                default: throw "unknown special variable " + sexp;
                }
            }
            else if((place = dataframe_column(sexp)))
                return {lambda: true, text: "frame.access('" + place + "')(key)"};
            else return {lambda: false, text: sexp};
        }
        else return {lambda: false, text: sexp};
    }

    function expression(frame, sexp, ctx) {
        // not dealing with cases where r classes are not terminals yet
        if($.isArray(sexp) && !is_wdcplot_placeholder(sexp))
            return node(frame, sexp, ctx);
        else
            return leaf(frame, sexp, ctx);
    }

    var wdcplot_expr_num = 1;

    /* a wdcplot argument may be
     - null
     - a column accessor or special variable marked with class attribute
     - an array (we assume any top-level array contains only literals)
     - a string or a number
     - otherwise we build javascript from the expression tree; if it contains
     field names identifiers, it's a lambda(key,value) else execute it immediately
     */
    function argument(frame, sexp) {
        if(sexp===null)
            return null;
        else if(_.isArray(sexp)) {
            // bypass eval for bare special variables and columns
            var place;
            if((place = special_function(sexp))) {
                switch(place) {
                case 'value':
                case 'index': return frame.index;
                case 'key': return function(k, v) { return k; };
                default: throw "unknown special variable " + sexp;
                }
            }
            else if((place = dataframe_column(sexp)))
                return frame.access(place);
            else if(sexp[0]==='c')
                return sexp.slice(1);
            // else we'll process as expression below
        }
        else if(_.isNumber(sexp) || _.isString(sexp))
            return sexp;
        var ctx = {indent:0};
        var js_expr = expression(frame, sexp, ctx);
        // incantation to make code show up in the debugger
        js_expr.text += "\n//@ sourceURL=wdcplot.expr." + wdcplot_expr_num++ + ".js";
        /*jshint -W061 */
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

    function constant_fn(arg) {
        return function (a) { return arg; };
    }

    // are these recursive or is this top-level catch enough?
    function group_constructor(frame, sexp) {
        switch(sexp[0]) {
        case 'bin': return dcplot.group.bin(sexp[1]);
        case 'identity': return dcplot.group.identity;
        default: return argument(frame, sexp); // but it's operating on keys?
        }
    }

    function reduce_constructor(frame, sexp, weight) {
        var w = weight;
        var fname = sexp[0];
        if(_.isArray(sexp)) {
            if(sexp[2] !== undefined) w = sexp[2];
            if(sexp[0] === 'count' && sexp[1] !== undefined) w = sexp[1];
        }
        else fname = sexp;

        var wacc = (w === undefined) ? undefined: argument(frame, w);
        if(_.isNumber(wacc)) wacc = constant_fn(wacc);

        switch(fname) {
        case 'count': return (w === undefined) ? dcplot.reduce.count : dcplot.reduce.sum(wacc);
        case 'sum': return dcplot.reduce.sum(argument(frame, sexp[1]),wacc);
        case 'any': return dcplot.reduce.any(argument(frame, sexp[1]));
        case 'avg': return dcplot.reduce.avg(argument(frame, sexp[1]),wacc);
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
                var placeholder = col_name(elem);
                if(placeholder) {
                    key = placeholder;
                    value = elem;
                }
                else {
                    value = elem[1];
                    if(elem[0] !== null)
                        key = elem[0];
                    else throw "must specify dimension name unless expression is column or special variable (" + value.toString() + ')';
                }
            }
            else throw 'illegal dimension specification ' + elem.toString();

            ret[key] = argument(frame, value);
        }
        return ret;
    }

    function do_groups(frame, sexps, weight) {
        var ret = {};
        for(var i = 0; i < sexps.length; ++i) {
            var name = sexps[i][0], defn = sexps[i][1];
            if(name === "weight") continue;
            defn = positionals(defn, [null, 'dimension', 'group', 'reduce', 'weight']);
            if(defn[0][0] !== null)
                throw "expected a null here";
            if(defn[0][1] !== "group")
                throw "groups should use group constructor";
            var group = {};
            for(var j = 1; j < defn.length; ++j) {
                var field = defn[j][0], val;
                switch(field) {
                case 'dimension':
                    val = col_ref(defn[j][1], "dimension");
                    break;
                case 'group':
                    val = group_constructor(frame, defn[j][1]);
                    break;
                case 'reduce':
                    val = reduce_constructor(frame, defn[j][1], weight);
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
                case 'dimension': defn[key] = col_ref(value, "dimension"); // don't allow lambdas here
                    break;
                case 'group': defn[key] = col_ref(value, "group");
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
    function make_chart_div(name, definition) {

        var title = definition.title;
        var table = $();
        var props = {id: name, style: "float:left"};

        if(_.has(definition,'columns')) {
            var chartname = name + "Div";
            var header = $('<tr/>', { class: 'header'});
            for(var col in definition.columns)
                header.append($('<th/>').append(definition.columns[col]));
            table = ($('<thead/>')
                .append(header));
            props['class'] = 'table table-hover';
        }

        var reset = $('<a/>',
                      {class: 'reset',
                       href: '#',
                       style: "display: none;"})
                .append("reset")
                .click(function(group_name) {
                    return function() {
                        window.charts[name].filterAll();
                        dc.redrawAll(group_name);
                    };
                }(chart_group_name(chart_group)));

        return $('<div/>',props)
            .append($('<div/>')
                    .append($('<strong/>').append(title))
                    .append('&nbsp;&nbsp;')
                    .append($('<span/>', {class: 'reset', style: 'display: none;'})
                            .append('Current filter: ')
                            .append($('<span/>', {class: 'filter'})))
                    .append('&nbsp;&nbsp;')
                    .append(reset)

        ).append(table);
    }

    var wdcplot = {
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
                /*jshint -W083 */
                switch(section_name) {
                case 'dimensions':
                    definition.dimensions = do_dimensions(frame, secdata);
                    break;
                case 'groups':
                    var weight = _.find(secdata, function(exp) { return exp[0] === "weight"; });
                    definition.defreduce = (weight === undefined) ?
                        dcplot.reduce.count :
                        dcplot.reduce.sum(argument(frame, weight[1]));
                    definition.groups = do_groups(frame, secdata, weight);
                    break;
                case 'charts':
                    definition.charts = do_charts(frame, secdata);
                    divs = _.map(_.keys(definition.charts),
                                 function(key) {
                                     return (definition.charts[key].div =
                                             make_chart_div(key, definition.charts[key])[0]);
                                 });
                    break;
                default: throw "unexpected section " + section[1];
                }
            }
            if(!definition.defreduce)
                definition.defreduce = dcplot.reduce.count;

            var divwrap = $('<div/>',{id:"chartdiv"+chart_group, style: "overflow:auto"});
            _.each(divs, function(div) { divwrap.append(div); });

            return {dataframe: frame,
                    defn: definition,
                    elem: divwrap,
                    groupname: chart_group_name(chart_group++)};
        }
    };
    return wdcplot;
}
if(typeof define === "function" && define.amd) {
    define(["dcplot", "dataframe", "dc"], _wdcplot);
} else if(typeof module === "object" && module.exports) {
    module.exports = _wdcplot(dcplot, dataframe);
} else {
    this.wdcplot = _wdcplot(dcplot, dataframe);
}
}
)();
