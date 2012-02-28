function reader(m)
{
    var handlers = {};
    var _;

    function lift(f, amount) {
        return function(attributes, length) {
            return [f.call(that, attributes, length), amount || length];
        };
    }

    function bind(m, f) {
        return function(attributes, length) {
            var t = m.call(that, attributes, length);
            var t2 = f(t[0])(attributes, length - t[1]);
            return [t2[0], t[1] + t2[1]];
        };
    }

    function unfold(f) {
        return function(attributes, length) {
            var result = [];
            var old_length = length;
            while (length > 0) {
                var t = f.call(that, attributes, length);
                result.push(t[0]);
                length -= t[1];
            }
            return [result, old_length];
        };
    }

    var that = {
        offset: 0,
        data_view: m.make(EndianAwareDataView),
        msg: m,

        //////////////////////////////////////////////////////////////////////

        read_int: function() {
            var old_offset = this.offset;
            this.offset += 4;
            return this.data_view.getInt32(old_offset);
        },
        read_string: function(length) {
            // FIXME SLOW
            var result = "";
            while (length--) {
                var c = this.data_view.getInt8(this.offset++);
                if (c) result = result + String.fromCharCode(c);
            }
            return result;
        },
        read_stream: function(length) {
            var old_offset = this.offset;
            this.offset += length;
            return this.msg.view(old_offset, length);
        },
        read_int_vector: function(length) {
            var old_offset = this.offset;
            this.offset += length;
            return this.msg.make(Int32Array, old_offset, length);
        },
        read_double_vector: function(length) {
            var old_offset = this.offset;
            this.offset += length;
            return this.msg.make(Float64Array, old_offset, length);
        },

        //////////////////////////////////////////////////////////////////////

        read_null: lift(function(a, l) { return Robj.null(a); }),

        //////////////////////////////////////////////////////////////////////
        // and these return full R objects as well.

        read_string_array: function(attributes, length) {
            var a = this.read_stream(length).make(Uint8Array);
            var result = [];
            var current_str = "";
            for (var i=0; i<a.length; ++i)
                if (a[i] === 0) {
                    result.push(current_str);
                    current_str = "";
                } else {
                    current_str = current_str + String.fromCharCode(a[i]);
                }
            return [Robj.string_array(result, attributes), length];
        },
        read_bool_array: function(attributes, length) {
            var l2 = this.read_int();
            var a = new Uint8Array(this.read_stream(length), 0, l2);
            var result = [];
            for (var i=0; i<a.length; ++i)
                result[i] = !!a[i];
            return [Robj.bool_array(result, attributes), length];
        },

        read_sexp: function() {
            var d = this.read_int();
            var _ = Rsrv.par_parse(d);
            var t = _[0], l = _[1];
            var total_read = 4;
            var attributes = undefined;
            if (t & Rsrv.XT_HAS_ATTR) {
                t = t & ~Rsrv.XT_HAS_ATTR;
                var attr_result = this.read_sexp();
                attributes = attr_result[0];
                total_read += attr_result[1];
                l -= attr_result[1];
            }
            if (handlers[t] === undefined) {
                throw "Unimplemented " + t;        
            } else {
                var result = handlers[t].call(this, attributes, l);
                return [result[0], total_read + result[1]];
            }
        }
    };

    that.read_clos = bind(that.read_sexp, function(formals) { 
              return bind(that.read_sexp, function(body)    { 
              return lift(function(a, l) {
              return Robj.clos(formals, body, a); 
              }, 0);
              } );
    });

    that.read_list = unfold(that.read_sexp);
    that.read_list_tag = bind(that.read_list, function(lst) {
        return lift(function(attributes, length) {
            var result = {};
            for (var i=0; i<lst.length; i+=2) {
                var value = lst[i], tag = lst[i+1];
                if (tag.type !== "symbol")
                    throw "Unexpected type " + tag.type + " as tag for tagged_list";
                result[tag.value] = value;
            }
            return Robj.tagged_list(result, attributes);
        }, 0);
    });

    function xf(f, g) { return bind(f, function(t) { 
        return lift(function(a, l) { return g(t, a); }, 0); 
    }); }
    that.read_vector       = xf(that.read_list, Robj.vector);
    that.read_list_no_tag  = xf(that.read_list, Robj.list);
    that.read_lang_no_tag  = xf(that.read_list, Robj.lang);
    that.read_vector_exp   = xf(that.read_list, Robj.vector_exp);

    function sl(f, g) { return lift(function(a, l) {
        return g(f.call(that, l), a);
    }); }
    that.read_symname      = sl(that.read_string,        Robj.symbol);
    that.read_int_array    = sl(that.read_int_vector,    Robj.int_array);
    that.read_double_array = sl(that.read_double_vector, Robj.double_array);

    handlers[Rsrv.XT_NULL]         = that.read_null;
    handlers[Rsrv.XT_VECTOR]       = that.read_vector;
    handlers[Rsrv.XT_CLOS]         = that.read_clos;
    handlers[Rsrv.XT_SYMNAME]      = that.read_symname;
    handlers[Rsrv.XT_LIST_NOTAG]   = that.read_list_no_tag;
    handlers[Rsrv.XT_LIST_TAG]     = that.read_list_tag;
    handlers[Rsrv.XT_LANG_NOTAG]   = that.read_lang_no_tag;
    handlers[Rsrv.XT_VECTOR_EXP]   = that.read_vector_exp;
    handlers[Rsrv.XT_ARRAY_INT]    = that.read_int_array;
    handlers[Rsrv.XT_ARRAY_DOUBLE] = that.read_double_array;
    handlers[Rsrv.XT_ARRAY_STR]    = that.read_string_array;
    handlers[Rsrv.XT_ARRAY_BOOL]   = that.read_bool_array;

    return that;
}

function parse(msg)
{
    var header = new Int32Array(msg, 0, 4);
    if (header[0] !== Rsrv.RESP_OK) {
        var status_code = header[0] >> 24;
        throw("ERROR FROM R SERVER: " + (Rsrv.status_codes[status_code] || 
                                         status_code)
              + " " + header[0] + " " + header[1] + " " + header[2] + " " + header[3]
              + " " + msg.byteLength
              + " " + msg
             ); // not too helpful, but better than undefined
    }
    
    var payload = my_ArrayBufferView(msg, 16, msg.byteLength - 16);
    var result = parse_payload(reader(payload));

    if (result.type !== "sexp") {
        throw "Bogus reply from RServe for eval, type not sexp";
    }
    return result.value;
}

function parse_payload(reader)
{
    var d = reader.read_int();
    var _ = Rsrv.par_parse(d);
    var t = _[0], l = _[1];
    if (t === Rsrv.DT_INT) {
        return { type: "int", value: reader.read_int() };
    } else if (t === Rsrv.DT_STRING) {
        return { type: "string", value: reader.read_string(l) };
    } else if (t === Rsrv.DT_BYTESTREAM) { // NB this returns a my_ArrayBufferView()
        return { type: "stream", value: reader.read_stream(l) };
    } else if (t === Rsrv.DT_SEXP) {
        _ = reader.read_sexp();
        var sexp = _[0], l2 = _[1];
        return { type: "sexp", value: sexp };
    } else
        throw "Bad type for parse? " + t + " " + l;
}
