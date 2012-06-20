function make_basic(type, proto) {
    return function(v, attrs) {
        function r_object() {
            this.type = type;
            this.value = v;
            this.attributes = attrs;
        }
        r_object.prototype = proto || {
            html_element: function() {
                return $("<div class='obj'></div>").append($("<div class='key'></div>").html(type));
            }
        };
        return new r_object();
    };
}

function pprint_array_as_div(formatter) {
    function plain_array() {
        var result = $("<div class='obj'></div>");
        var div = $("<div class='string-value'></div>");
        var v = this.value;
        var s;
        var that = this;
        formatter = formatter || function(v) { return v; };
        var element;
        if (this.attributes && this.attributes.value.names) {
            element = function(i) {
                return that.attributes.value.names.value[i] + ": " + formatter(String(v[i]));
            };
        } else if (this.attributes && this.attributes.value.levels) {
            element = function(i) {
                return that.attributes.value.levels.value[v[i]-1];
            };
        } else {
            element = function(i) {
                return formatter(String(v[i]));
            };
        }
        
        if (v.length === 0) {
            s = "[]";
        } else if (v.length === 1) {
            s = element(0);
        } else if (v.length <= 10) {
            s = "[" + element(0);
            for (var i=1; i<v.length; ++i) {
                s = s + ", " + element(i);
            }
            s = s + "]";
        } else {
            s = "[" + element(0);
            for (var i=1; i<5; ++i) {
                s = s + ", " + element(i);
            }
            s = s + ", ... ";
            for (i=v.length-5; i<v.length; ++i)
                s = s + ", " + element(i);
            s = s + "]";
        }
        div.html(s);
        result.append(div);
        return result;
    }
    function matrix() {
        var result = document.createElement("table");
        var header = document.createElement("tr");
        result.appendChild(header);
        var dims = this.attributes.value.dim.value;
        var values = this.value;
        var that = this;
        d3.select(header)
            .selectAll("td")
            .data(_.range(dims[1]+1))
            .enter().append("td").text(function(i) {
                if (i === 0) return "";
                return "[," + i + "]";
            });
        d3.select(result)
            .selectAll("tr-data")
            .data(_.range(dims[0]))
            .enter().append("tr")
                    .selectAll("td")
                    .data(function(i) { return _.map(_.range(dims[1]+1),
                                                     function(j) {
                                                         return [i,j];
                                                     });
                                      })
                    .enter()
                    .append("td")
                    .text(function(d) {
                        var row = d[0], col = d[1];
                        if (col === 0) {
                            return "[" + (row+1) + ",]";
                        };
                        var v = values[(col-1) * dims[0] + row];
                        if (that.attributes &&
                            that.attributes.value.levels) {
                            return that.attributes.value.levels.value[v-1];
                        } else {
                            return v;
                        }
                    });
        return result;
    }
    
    return function() {
        if (this.attributes &&
            this.attributes.value.dim) {
            return matrix.call(this);
        } else
            return plain_array.call(this);

    };
}

Robj = {
    "null": function(attributes) {
        return { 
            type: "null", 
            value: null,
            attributes: attributes,
            html_element: function() {
                return $("<div class='obj'><div class='key'>null</div></div>");
            }
        };
    },

    clos: function(formals, body, attributes) {
        return {
            type: "clos",
            value: { formals: formals,
                     body: body },
            attributes: attributes,
            html_element: function() {
                var div = $("<div class='obj'></div>");
                var pair = $("<div></div>");
                pair.append($("<div class='key'>formals:</div>"));
                pair.append(this.value.formals.html_element());
                div.append(pair);
                pair = $("<div></div>");
                pair.append($("<div class='key'>body:</div>"));
                pair.append(this.value.body.html_element());
                div.append(pair);
                return div;
            }
        };
    },

    vector: make_basic("vector", {
        html_element: function () {
            var div = $("<div class='obj'></div>");
            if (!this.attributes) {
                for (var i=0; i<this.value.length; ++i) {
                    div.append(this.value[i].html_element());
                }
            } else {
                var lengths = _.map(this.value, function(v) { return v.value.length; });
                var names = this.attributes.value.names.value;
                if (_.all(lengths, function(i) { return i === lengths[0]; })) {
                    // it's a dataframe
                    var result = document.createElement("table");
                    var th = document.createElement("tr");
                    var values = this.value;
                    result.appendChild(th);
                    d3.select(th)
                        .selectAll("th")
                        .data(_.range(lengths.length))
                        .enter().append("th").text(function(i) {
                            return names[i];
                        });
                    var rows;
                        // rows = _.range(lengths[0]);
                    if (lengths[0] < 11) {
                        rows = _.range(lengths[0]);
                    } else {
                        rows = [0,1,2,3,4,5];
                        rows.push.apply(rows, _.range(lengths[0] - 5, lengths[0]));
                    }
                    d3.select(result)
                        .selectAll("tr-data")
                        .data(rows)
                        .enter().append("tr")
                                .selectAll("td")
                                .data(function(i) { return _.map(_.range(lengths.length),
                                                                 function(j) {
                                                                     return [i,j]; 
                                                                 });
                                                  })
                                .enter()
                                .append("td")
                                .text(function(d, i) {
                                    var row = d[0], col = d[1];
                                    if (lengths[0] >= 11 && row === 5)
                                        return "...";
                                    var v = values[col].value[row];
                                    if (values[col].attributes) {
                                        return values[col].attributes.value.levels.value[v-1];
                                    } else {
                                        return v;
                                    }
                                });
                    div.append(result);
                } else {
                    var pair = $("<div></div>");
                    for (var i=0; i<this.value.length; ++i) {
                        pair.append($("<span class='key'></span>").append(names[i] + ": "));
                        pair.append(this.value[i].html_element());
                    }
                    div.append(pair);
                }
            }
            return div;
        }
    }),
    symbol: make_basic("symbol"),
    list: make_basic("list"),
    lang: make_basic("lang"),
    tagged_list: make_basic("tagged_list"),
    tagged_lang: make_basic("tagged_lang"),
    vector_exp: make_basic("vector_exp"),
    int_array: make_basic("int_array", {
        html_element: pprint_array_as_div()
    }),
    double_array: make_basic("double_array", {
        html_element: pprint_array_as_div()
    }),
    string_array: make_basic("string_array", {
        // from http://javascript.crockford.com/remedial.html
        html_element: pprint_array_as_div(function (s) {
            var c, i, l = s.length, o = '"';
            for (i = 0; i < l; i += 1) {
                c = s.charAt(i);
                if (c >= ' ') {
                    if (c === '\\' || c === '"') {
                        o += '\\';
                    }
                    o += c;
                } else {
                    switch (c) {
                    case '\b':
                        o += '\\b';
                        break;
                    case '\f':
                        o += '\\f';
                        break;
                    case '\n':
                        o += '\\n';
                        break;
                    case '\r':
                        o += '\\r';
                        break;
                    case '\t':
                        o += '\\t';
                        break;
                    default:
                        c = c.charCodeAt();
                        o += '\\u00' + Math.floor(c / 16).toString(16) +
                            (c % 16).toString(16);
                    }
                }
            }
            return o + '"';
        })
    }),
    bool_array: make_basic("bool_array", {
        html_element: pprint_array_as_div()
    })
};
