// R to dc.js bridge code.  This should probably become a library in js/,
// just deploying it separately for now to ease development
//////////////////////////////////////////////////////////////////////////////

var dcrchart = (function() {
    var chart_group = 0;
    window.charts = {}; // initialize a global namespace for charts

    function is_tagged(sexp) {
        switch(sexp.r_type) {
        case 'tagged_list':
        case 'tagged_lang':
            return true;
        default:
            return false;
        }
    }

    function root_name(sexp) {
        return is_tagged(sexp) ? sexp[0][1] : sexp[0];
    }

    function chart_group_name(group_no) {
        return 'dcchartgroup' + group_no;
    }

    function bin_op(disp) {
        return function(args,ctx) {
            return translate_expr(args[1], ctx) + disp + translate_expr(args[2], ctx);
        };
    }

    function una_or_bin_op(disp) {
        return function(args,ctx) {
            return args.length==2
                ? disp + translate_expr(args[1], ctx)
                : bin_op(disp)(args, ctx);
        };
    }

    function translate_value(v) {
        return _.isString(v) ? '"' + v + '"' : v;
    }

    function translate_kv(kv) {
        if(!_.isArray(kv) || kv[0] != ':' || typeof kv[1] != "string")
            throw "expected 'key = value' in dc/r hash";
        return kv[1] + ': ' + translate_value(kv[2]);
    }

    function translate_field(k,r) {
        var index = translate_value(k);
        return "rdata[" + index + "][" + r + "]";
    }

    function translate_gfield(k,r) {
        var index = translate_value(k);
        return "rdata[" + index + "][" + r + ".key]";
    }

    // inexact: we assume everything with tagnames should become a hash object,
    // and everything without should become an array sequence
    function translate_list(args, ctx) {
        if(is_tagged(args))
            return '{' + _.map(args.slice(1), function(arg) { return arg[0] + ': ' +
                                                              translate_value(arg[1]); }) + '}';
        else
            return '[' + _.map(args.slice(1), function(arg) { return translate_value(arg); }) + ']';
    }

    var expressions = {
        "$": bin_op('.'),
        "-": una_or_bin_op('-'),
        "+": una_or_bin_op('+'),
        "*": bin_op('*'),
        "/": bin_op('/'),
        "field" : function(args, ctx) { return translate_field(args[1],args[2]); },
        "gfield" : function(args, ctx) { return translate_gfield(args[1],args[2]); },
        "c" : translate_list,
        "list" : translate_list,
        "[": function(args, ctx) { return translate_expr(args[1], ctx) + '[' + translate_expr(args[2], ctx) + ']'; },
        "hash": function(args, ctx) { return '{' + _.map(args.slice(1), translate_kv) + '}'; },
        default : function(args, ctx) { return translate_expr(args[0], ctx) + '(' +  _.map(args.slice(1), function(arg) { return translate_expr(arg, ctx); }) + ')'; }
    };


    function translate_function(sexp, ctx) {
        ctx.indent++;
        var args = sexp[0].slice(1),
            body = _.map(sexp.slice(1), function(arg) { return translate_expr(arg,ctx); });
        body[body.length-1] = "return " + body[body.length-1];
        var cr = "\n", indent = Array(ctx.indent+1).join("\t");
        var text = "function (" + args.join() + ") {" + cr +
            indent + body.join(";" + cr + indent) + ";" + cr;
        ctx.indent--;
        indent = Array(ctx.indent+1).join("\t");
        text += indent + "}";
        return text;
    }

    function translate_expr(sexp, ctx) {
        if(_.isArray(sexp)) {
            if(_.isArray(sexp[0]) && root_name(sexp[0]) == "func") // special case function expr trees
                return translate_function(sexp, ctx);
            var xlat = expressions[root_name(sexp)] || expressions.default;
            return xlat(sexp, ctx);
        }
        else if($.isPlainObject(sexp)) {
            return JSON.stringify(sexp);
        }
        else return sexp;
    }

    function make_var(name) {
        return "var " + name + ' = ';
    }

    function translate_chart(name, groupname, constructor, sexp, ctx) {
        return make_var(name) + 'window.charts["' + name + '"] = dc.' +
            constructor + '("#' + name + '", "'+groupname+'").' +
            translate_expr(sexp, ctx);
    }

    function make_chart_div(name, title) {
        return $('<div/>',
                 {id: name, style: "float:left"})
            .append($('<strong/>').append(title))
            .append('&nbsp;&nbsp;')
            .append($('<a/>',
                      {'class': "reset",
                       href: "javascript:window.charts['"+name+"'].filterAll(); dc.redrawAll('" + chart_group_name(chart_group) + "');",
                       style: "display: none;"})
                    .append("reset"))
            .append($('<div/>').addClass("clearfix"));
    }

    // this could conceivably just be a "var" statement
    var domains = {
        uniques: function(sexp) { return "_.pluck(" + sexp[1] + ".group().all(),'key')"; }
    };

    function translate_domain(sexp) {
        if(_.isUndefined(domains[sexp[0]]))
            throw "unknown dc/r domain " + sexp[0];
        return domains[sexp[0]](sexp);
    }

    function chart_handler(prefix, constructor) {
        return function(result, sexp, ctx) {
            var name = prefix + chart_group + '_' + result.chart_no++;
            var chart_code = translate_chart(name, chart_group_name(chart_group), constructor, sexp[2], ctx);
            result.charts.push(chart_code);
            result.divs.push(make_chart_div(name, sexp[1]));
            return result;
        };
    }

    var statements = {
        dimension: function(result, sexp, ctx) {
            result.decls.push(make_var(sexp[1]) + "ndx.dimension(" +
                              translate_expr(sexp[2], ctx) + ")");
            return result;
        },
        domain: function(result, sexp, ctx) {
            result.decls.push(make_var(sexp[1]) + translate_domain(sexp[2]));
            return result;
        },
        pie: chart_handler('pie', 'pieChart'),
        bar: chart_handler('bar', 'barChart'),
        bubble: chart_handler('bubble', 'bubbleChart'),
        debug: function(result, sexp, ctx) {
            result.debug = true;
            return result;
        }
    };

    function translate_statement(result, sexp) {
        if(_.isUndefined(statements[sexp[0]]))
            throw "unknown dc/r statement " + sexp[0];
        var ctx =  {debug:result.debug,indent:1};
        return statements[sexp[0]](result, sexp, ctx);
    }

    // assume that the rdata is an array or object of columns of the same length
    // and return the length of the first column (should be the number of rows)
    function get_num_rows(rdata) {
        for(p in rdata)
            return rdata[p].length;
    }
    var result = {
        get_num_rows : get_num_rows,
        field : function(rdata, k, r) {
            return rdata[k][r];
        },
        translate: function(sexp) {
            if(sexp[0] != "charts")
                throw 'expected "charts" at top level';
            var charts_result = {chart_no: 0, decls: [], charts: [], divs: [], debug: false};
            var result = _.reduce(sexp.slice(1),
                                  translate_statement,
                                  charts_result);
            var js = "try {\n" +
                (result.debug? "debugger;\n" : "") +
                "var nrows = dcrchart.get_num_rows(rdata);\n" +
                "var ndx = crossfilter(_.range(0,nrows));\n" +
                result.decls.join(";\n") + ";\n" +
                result.charts.join(";\n") + ";\n" +
                "dc.renderAll('"+chart_group_name(chart_group)+"');\n" +
                "} catch(e) { $('#chartdiv" + chart_group + "').text(e.toString()); }\n" +
                "//@ sourceURL=dcChartScript" + chart_group + ".js";
            var divwrap = $('<div/>',{id:"chartdiv"+chart_group});
            _.each(result.divs, function(div) { divwrap.append(div); });
            chart_group++;
            return { dcfunc: new Function("rdata", js), elem: divwrap };
        }
    };
    return result;
})();
