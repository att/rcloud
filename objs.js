function make_basic(type) {
    return function(v, attrs) {
        return { type: type,
                 value: v,
                 attributes: attrs };
    };
}

Robj = {
    null: function(attributes) {
        return { 
            type: "null", 
            value: null,
            attributes: attributes
        };
    },

    vector: make_basic("vector"),

    clos: function(formals, body, attributes) {
        return {
            type: "clos",
            value: { formals: formals,
                     body: body },
            attributes: attributes
        };
    },

    symbol: make_basic("symbol"),
    list: make_basic("list"),
    tagged_list: make_basic("tagged_list"),
    vector_exp: make_basic("vector_exp"),
    int_array: make_basic("int_array"),
    double_array: make_basic("double_array"),
    string_array: make_basic("string_array"),
    bool_array: make_basic("bool_array")
};
