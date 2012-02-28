function buffer_from_msg(m)
{
    // var offset = 0;
    // var data_view = msg.make(DataView); // new DataView(msg);

    return {
        offset: 0,
        data_view: m.make(EndianAwareDataView),
        msg: m,

        //////////////////////////////////////////////////////////////////////
        // return unwrapped data

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
        // These return wrapped objects,

        read_list: function(length) {
            var result = [];
            var total_read = 0;
            while (length > 0) {
                _ = this.read_sexp();
                var sexp = _[0], read_t = _[1];
                result.push(sexp);
                length = length - read_t;
                total_read = total_read + read_t;
            }
            return [result, total_read];
        },

        //////////////////////////////////////////////////////////////////////
        // and these return full R objects as well.

        read_null: function(attributes, length) {
            return [Robj.null(attributes), length];
        },
        read_vector: function(attributes, length) {
            var result = buffer.read_list(length);
            return [Robj.vector(result[0], attributes), result[1]];
        },
        read_clos: function(attributes, length) {
            var _ = this.read_sexp();
            var formals = _[0], read_1 = _[1];
            _ = this.read_sexp();
            var body = _[0], read_2 = _[1];
            return [Robj.clos(formals, body, attributes), read_1 + read_2];
        },
        read_symname: function(attributes, length) {
            return [Robj.symbol(this.read_string(length), attributes), length];
        },
        read_list_no_tag: function(attributes, length) {
            var result = this.read_list(length);
            return [Robj.list(result[0], attributes), result[1]];
        },
        read_list_tag: function(attributes, length) {
            var result = {};
            var old_length = length;
            var total_read = 0;
            while (length > 0) {
                _ = this.read_sexp();
                var value = _[0], read_t_1 = _[1];
                _ = this.read_sexp();
                var tag = _[0], read_t_2 = _[1];
                length = length - read_t_1 - read_t_2;
                total_read = total_read + read_t_1 + read_t_2;
                if (tag.type !== "symbol") {
                    throw "Unexpected type " + tag.type + "as tag for tagged_list";
                }
                result[tag.value] = value;
            }
            if (old_length !== total_read)
                throw "total read mismatch";
            return [Robj.tagged_list(result, attributes), total_read];
        }, 
        read_vector_exp: function(attributes, length) {
            var result = this.read_list(length);
            return [Robj.vector_exp(result[0], attributes), result[1]];
        },
        read_int_array: function(attributes, length) {
            console.log("HERE!");
            var a = this.read_int_vector(length);
            return [Robj.int_array(a, attributes), length];
        },
        read_double_array: function(attributes, length) {
            var a = this.read_double_vector(length);
            return [Robj.double_array(a, attributes), length];
        },
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
            var l2 = that.read_int();
            var a = new Uint8Array(buffer.read_stream(length), 0, l2);
            var result = [];
            for (var i=0; i<a.length; ++i)
                result[i] = !!a[i];
            return [Robj.bool_array(result, attributes), length];
        },

        read_sexp: function() {
            var that = this;
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
            var handlers = {};
            handlers[Rsrv.XT_NULL] = this.read_null;
            handlers[Rsrv.XT_VECTOR] = this.read_vector;
            handlers[Rsrv.XT_CLOS] = this.read_clos;
            handlers[Rsrv.XT_SYMNAME] = this.read_symname;
            handlers[Rsrv.XT_LIST_NO_TAG] = this.read_list_no_tag;
            handlers[Rsrv.XT_LIST_TAG] = this.read_list_tag;
            handlers[Rsrv.XT_VECTOR_EXP] = this.read_vector_exp;
            handlers[Rsrv.XT_ARRAY_INT] = this.read_int_array;
            handlers[Rsrv.XT_ARRAY_DOUBLE] = this.read_double_array;
            handlers[Rsrv.XT_ARRAY_STR] = this.read_string_array;
            handlers[Rsrv.XT_ARRAY_BOOL] = this.read_bool_array;
            
            if (handlers[t] === undefined) {
                throw "Unimplemented " + t;        
            } else {
                var result = handlers[t].call(this, attributes, l);
                return [result[0], total_read + result[1]];
            }
        }
    };
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
    var result = parse_payload(buffer_from_msg(payload));

    if (result.type !== "sexp") {
        throw "Bogus reply from RServe for eval, type not sexp";
    }
    return result.value;
}

function parse_payload(buffer)
{
    var d = buffer.read_int();
    var _ = Rsrv.par_parse(d);
    var t = _[0], l = _[1];
    if (t === Rsrv.DT_INT) {
        return { type: "int", value: buffer.read_int() };
    } else if (t === Rsrv.DT_STRING) {
        return { type: "string", value: buffer.read_string(l) };
    } else if (t === Rsrv.DT_BYTESTREAM) { // NB this returns a my_ArrayBufferView()
        return { type: "stream", value: buffer.read_stream(l) };
    } else if (t === Rsrv.DT_SEXP) {
        _ = buffer.read_sexp();
        var sexp = _[0], l2 = _[1];
        return { type: "sexp", value: sexp };
    } else
        throw "Bad type for parse? " + t + " " + l;
}
