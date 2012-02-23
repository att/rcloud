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

Robj = {
    null: function(attributes) {
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

    vector: make_basic("vector"),
    symbol: make_basic("symbol"),
    list: make_basic("list"),
    tagged_list: make_basic("tagged_list"),
    vector_exp: make_basic("vector_exp"),
    int_array: make_basic("int_array"),
    double_array: make_basic("double_array", {
        html_element: function() {
            var result = $("<div class='obj'></div>");
            var div = $("<div class='string-value'></div>");
            var v = this.value;
            var s;
            var that = this;
            var element = this.attributes ?
                function(i) {
                    return that.attributes.value.names.value[i] + ": " + String(v[i]);
                }:
            function(i) {
                return String(v[i]);
            };
            if (v.length === 0) {
                s = "[]";
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
    }),
    string_array: make_basic("string_array"),
    bool_array: make_basic("bool_array")
};
