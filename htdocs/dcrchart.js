// R to dc.js bridge code.  This should probably become a library in js/, 
// just deploying it separately for now to ease development
//////////////////////////////////////////////////////////////////////////////

var dcrchart = (function() {
    var chart_group = 0;
    window.charts = {}; // initialize a global namespace for charts

    function bin_op(disp) {
        return function(args) { 
            return translate_expr(args[1]) + disp + translate_expr(args[2]); 
        }
    }

    function una_or_bin_op(disp) {
        return function(args) {
            return args.length==2 
                ? disp + translate_expr(args[1])
                : bin_op(disp)(args); 
        }
    }

    function translate_value(v) {
        return _.isString(v) ? '"' + v + '"' : v;
    }

    function translate_kv(kv) {
        if(!$.isArray(kv) || kv[0] != ':' || typeof kv[1] != "string")
            throw "expected 'key = value' in dc/r hash";
        return kv[1] + ': ' + translate_value(kv[2]);
    }

    function field(k,r) {
        var index = translate_value(k);
        return "rdata[" + index + "][" + r + "]";
    }

    var expressions = {
        "$": bin_op('.'),
        "-": una_or_bin_op('-'),
        "+": una_or_bin_op('+'),
        "*": bin_op('*'),
        "/": bin_op('/'),
        "field" : function(args) { return field(args[1],args[2]); },
        "c" : function(args) { return '[' + _.map(args.slice(1), translate_value) + ']'; },
        "[": function(args) { return translate_expr(args[1]) + '[' + translate_expr(args[2]) + ']'; },
        "hash": function(args) { return '{' + _.map(args.slice(1), translate_kv) + '}'; },
        default : function(args) { return translate_expr(args[0]) + '(' +  _.map(args.slice(1), translate_expr) + ')'; } 
    };

    function translate_function(sexp) {
        var args = sexp[0].slice(1),
            body = _.map(sexp.slice(1), translate_expr);
        var text = "function (" + args.join() + ") { " + body.slice(0, -1).join("; ") + 
            "return " + body[body.length-1] + "; }";
        return text;
    }

    function translate_expr(sexp) {
        if($.isArray(sexp)) {
            if($.isArray(sexp[0]) && sexp[0][0] == "func") // special case function expr trees
                return translate_function(sexp)
            var xlat = expressions[sexp[0]] || expressions.default;
            return xlat(sexp);
        }
        else return sexp;
    }

    function make_var(name) {
        return "var " + name + ' = ';
    }

    function translate_chart(name, groupname, constructor, sexp) {
        return make_var(name) + 'window.charts["' + name + '"] = dc.' + 
            constructor + '("#' + name + '", "'+groupname+'").' +
            translate_expr(sexp);
    }

    function make_chart_div(name) {
        return $('<div/>',
                 {id: name, style: "float:left"})
            .append($('<strong/>').append(name))
            .append('&nbsp;&nbsp;')
            .append($('<a/>',
                      {class: "reset",
                       href: "javascript:charts."+name+".filterAll(); dc.redrawAll();",
                       style: "display: none;"})
                    .append("reset"))
            .append($('<div/>').addClass("clearfix"));
    }

    var dimensions = {
        col: function(sexp) { return "d[" + sexp[1] + "]"; }
    };

    function translate_dimension(sexp) {
        if(_.isUndefined(dimensions[sexp[0]]))
            throw "unknown dc/r dimension " + sexp[0];
        return dimensions[sexp[0]](sexp);
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
        return function(result, sexp) {
            var name = prefix + chart_group + '_' + result.chart_no++;
            var groupname = "chartgroup" + chart_group;
            var chart_code = translate_chart(name, groupname, constructor, sexp[1]);
            result.charts.push(chart_code);
            result.divs.push(make_chart_div(name))
            return result;
        }
    }
    
    var statements = {
        dimension: function(result, sexp) {
            result.decls.push(make_var(sexp[1]) + "ndx.dimension(" +
                              translate_expr(sexp[2]) + ")");
            return result;
        },
        domain: function(result, sexp) {
            result.decls.push(make_var(sexp[1]) + translate_domain(sexp[2]));
            return result;
        },
        pie: chart_handler('pie', 'pieChart'),
        bar: chart_handler('line', 'lineChart'),
        bubble: chart_handler('bubble', 'bubbleChart'),
        debug: function(result, sexp) {
            result.debug = true;
            return result;
        }
    };
        
    function translate_statement(result, sexp) {
        if(_.isUndefined(statements[sexp[0]]))
            throw "unknown dc/r statement " + sexp[0]; 
        return statements[sexp[0]](result, sexp);
    }

    // assume that the rdata is an array or object of columns of the same length
    // and return the length of the first column (should be the number of rows)
    function get_num_rows(rdata) {
        for(p in rdata) 
            return rdata[p].length;
    }    
    var result = {
        get_num_rows : get_num_rows,
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
                "dc.renderAll('chartgroup"+chart_group+"');\n" +
                "} catch(e) { $('#chartdiv" + chart_group + "').text(e.toString()); }";
            var divwrap = $('<div/>',{id:"chartdiv"+chart_group});
            _.each(result.divs, function(div) { divwrap.append(div); });
            chart_group++;
            return { dcfunc: new Function("rdata", js), elem: divwrap };
        }
    };
    return result;
})();
