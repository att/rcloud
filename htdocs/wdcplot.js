// R to dc.js bridge code.  This should probably become a library in js/, 
// just deploying it separately for now to ease development
//////////////////////////////////////////////////////////////////////////////

var wdcplot = (function() {
    var chart_group = 0;
    window.charts = {}; // initialize a global namespace for charts

    function bin_op(disp) {
        return function(frame, args, ctx) { 
            return translate_expr(frame, args[1], ctx) + disp + translate_expr(frame, args[2], ctx); 
        };
    }

    function una_or_bin_op(disp) {
        return function(frame, args, ctx) {
            return args.length==2 
                ? disp + translate_expr(frame, args[1], ctx)
                : bin_op(disp)(frame, args, ctx); 
        };
    }

    function translate_value(v) {
        return _.isString(v) ? '"' + v + '"' : v;
    }

    var expressions = {
        "$": bin_op('.'),
        "-": una_or_bin_op('-'),
        "+": una_or_bin_op('+'),
        "*": bin_op('*'),
        "/": bin_op('/'),
        "c" : function(frame, args, ctx) { return '[' + _.map(args.slice(1), function(arg) { return translate_value(arg); }) + ']'; },
        "[": function(frame, args, ctx) { return translate_expr(frame, args[1], ctx) + '[' + translate_expr(frame, args[2], ctx) + ']'; },
        default : function(frame, args, ctx) { return translate_expr(frame, args[0], ctx) + '(' +  _.map(args.slice(1), function(arg) { return translate_expr(frame, arg, ctx); }) + ')'; } 
    };

    function translate_function(frame, sexp, ctx) {
        ctx.indent++;
        var args = sexp[0].slice(1),
            body = _.map(sexp.slice(1), function(arg) { return translate_expr(frame, arg, ctx); });
        body[body.length-1] = "return " + body[body.length-1];
        var cr = "\n", indent = Array(ctx.indent+1).join("\t");
        var text = "function (" + args.join() + ") {" + cr + 
            indent + body.join(";" + cr + indent) + ";" + cr;
        ctx.indent--;
        indent = Array(ctx.indent+1).join("\t");
        text += indent + "}";
        return text;
    }

    function translate_expr(frame, sexp, ctx) {
        if($.isArray(sexp)) {
            if($.isArray(sexp[0]) && sexp[0][0] == "func") // special case function expr trees
                return translate_function(frame, sexp, ctx);
            var xlat = expressions[sexp[0]] || expressions.default;
            return xlat(frame, sexp, ctx);
        }
        else if($.isPlainObject(sexp)) {
            return JSON.stringify(sexp);
        }
        else if(_.isString(sexp)) {
            if(/\.\..*\.\.$/.test(sexp)) {
                var content = sexp.substring(2, sexp.length-2);
                switch(content) {
                case 'index': return "frame.index(key)";
                case 'selected': return "value";
                default: throw "unknown special variable " + sexp;
                }
            }
            else if(frame.has(sexp))
                return "frame.access('" + sexp + "')";
            else return translate_value(sexp);
        }
        else return sexp;
    }

    function access_expression(frame, sexp) {
        if(_.isString(sexp)) {
            // special-case simple string field access for efficiency
            if(/\.\..*\.\.$/.test(sexp)) {
                var content = sexp.substring(2, sexp.length-2);
                switch(content) {
                case 'index': return frame.index;
                default: throw "unknown special variable " + sexp;
                }
            }
            else if(frame.has(sexp))
                return frame.access(sexp);
            else return sexp;
        }
        var ctx =  {indent:1};
        var body = translate_expr(frame, sexp, ctx);
        return _.partial(new Function("frame", "key", "value", body),
                         frame);
    }

    // are these recursive or is this top-level catch enough?
    function group_expression(frame, sexp) {
        switch(sexp[0]) {
        case 'bin': return group.bin(sexp[1]);
        case 'identity': return group.identity;
        default: return access_expression(frame, sexp); // but it's operating on keys? 
        }
    }

    function reduce_expression(frame, sexp) {
        switch(sexp[0]) {
        case 'count': return reduce.count;
        case 'sum': return reduce.sum(access_expression(frame, sexp[1]));
        case 'any': return reduce.any(access_expression(frame, sexp[1]));
        case 'avg': return reduce.avg(access_expression(frame, sexp[1]));
        default: return access_expression(frame, sexp);
        }
    }

    function do_dimensions(frame, sexps) {
        var ret = {};
        for(var i = 0; i < sexps.length; ++i) 
            ret[sexps[i][0]] = access_expression(frame, sexps[i][1]);
        return ret;
    }
    function do_groups(frame, sexps) {
        var ret = {};
        for(var i = 0; i < sexps.length; ++i) {
            var name = sexps[i][0], defn = sexps[i][1];
            if(defn[0][0] !== null)
                throw "expected a null here";
            if(defn[0][1] !== "group")
                throw "groups should use group constructor";
            var group = {};
            for(var j = 1; j < defn.length; ++j) {
                var field = defn[j][0], val; 
                switch(field) {
                case 'dim': 
                    val = defn[j][1];
                    break;
                case 'group':
                    val = group_expression(frame, defn[j][1]);
                    break;
                case 'reduce':
                    val = reduce_expression(frame, defn[j][1]);
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
            var name = sexps[i][0] + chart_group + '_' + i;
            var val = sexps[i][1];
            if(val[0][0] !== null)
                throw "unexpected chart name " + val[0][0];
            var defn = {type: val[0][1]};
            defn.title = defn.title || sexps[i][0];
            for(var j = 1; j < val.length; ++j)
                defn[val[j][0]] = access_expression(frame, val[j][1]);
            ret[name] = defn;
        }
        return ret;
    }
    function make_chart_div(name, title) {
        return $('<div/>',
                 {id: name, style: "float:left"})
            .append($('<strong/>').append(title))
            .append('&nbsp;&nbsp;')
            .append($('<a/>',
                      {'class': "reset",
                       href: "javascript:window.charts['"+name+"'].filterAll(); dc.redrawAll('chartgroup" + chart_group + "');",
                       style: "display: none;"})
                    .append("reset"))
            .append($('<div/>').addClass("clearfix"));
    }

    var result = {
        field : function(rdata, k, r) {
            return rdata[k][r];
        },
        translate: function(data) {
            var frame = dataframe.cols(data);
            // allow skipping sections (but don't allow repeated sections)
            var definition = {}, divs;
            for(var i = 1; i < arguments.length; ++i) {
                var arg = arguments[i];
                var section = arg[0];
                if(section[0] !== null)
                    throw "unexpected named section " + section[0];
                if(section[1] in definition)
                    throw "unexpected repeated section " + section[1];
                var secdata = arg.slice(1);
                switch(section[1]) {
                case 'dimensions':
                    definition.dimensions = do_dimensions(frame, secdata);
                    break;
                case 'groups':
                    definition.groups = do_groups(frame, secdata);
                    break;
                case 'charts':
                    definition.charts = do_charts(frame, secdata);
                    divs = _.map(_.keys(definition.charts), 
                                 function(key) { return make_chart_div(key, definition.charts[key].title); });
                    break;
                default: throw "unexpected section " + section[1];
                }
            }

            var divwrap = $('<div/>',{id:"chartdiv"+chart_group});
            _.each(divs, function(div) { divwrap.append(div); });

            var groupname = "chartgroup" + chart_group;

            chart_group++;

            return {dataframe: frame, 
                    defn: definition, 
                    elem: divwrap, 
                    groupname: groupname};
        },
        format_error: function(e) {
            // could maybe push this into dcplot.js itself
            var tab;
            if(_.isArray(e)) { // expected exception: input error
                tab = $('<table/>');
                $.each(e, function(i) {
                    var err = e[i];
                    /*
                     var errors = $('<td/>');
                     for(var i = 0; i < err.errors.length; ++i)
                     errors.append($('<p/>').text(err.errors[i]));
                     */
                    tab.append($('<tr/>').
                               append($('<td/>').text(err.type)).
                               append($('<td/>').text(err.name)).
                               append($('<td/>').text(err.errors.toString()))
                              );
                });
            }
            else // unexpected exception: probably logic error
                tab = $('<p/>').text(e.toString());
            var error_report = $('<div/>').
                    append($('<p/>').text('dcplot errors!')).
                    append(tab);
            return error_report;
        }
    };
    return result;
})();
