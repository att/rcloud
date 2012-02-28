function buffer_from_msg(m)
{
    // var offset = 0;
    // var data_view = msg.make(DataView); // new DataView(msg);

    return {
        offset: 0,
        data_view: m.make(EndianAwareDataView),
        msg: m,
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
        read_list: function(length) {
            var result = [];
            var total_read = 0;
            while (length > 0) {
                _ = parse_sexp(this);
                var sexp = _[0], read_t = _[1];
                result.push(sexp);
                length = length - read_t;
                total_read = total_read + read_t;
            }
            return [result, total_read];
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
        _ = parse_sexp(buffer);
        var sexp = _[0], l2 = _[1];
        return { type: "sexp", value: sexp };
    } else
        throw "Bad type for parse? " + t + " " + l;
}

function parse_sexp(buffer)
{
    var d = buffer.read_int();
    var _ = Rsrv.par_parse(d);
    var t = _[0], l = _[1];
    var total_read = 4;
    var attributes = undefined;
    if (t & Rsrv.XT_HAS_ATTR) {
        t = t & ~Rsrv.XT_HAS_ATTR;
        var attr_result = parse_sexp(buffer);
        attributes = attr_result[0];
        total_read += attr_result[1];
        l -= attr_result[1];
    }

    var handlers = {};
    handlers[Rsrv.XT_NULL] = function() {
        return [Robj.null(attributes), total_read];
    };
    handlers[Rsrv.XT_VECTOR] = function() {
        var result = buffer.read_list(l);
        return [Robj.vector(result[0], attributes), total_read + result[1]];
    };
    handlers[Rsrv.XT_CLOS] = function() {
        _ = parse_sexp(buffer);
        var formals = _[0], read_1 = _[1];
        _ = parse_sexp(buffer);
        var body = _[0], read_2 = _[1];
        return [Robj.clos(formals, body, attributes), total_read + read_1 + read_2];
    };
    handlers[Rsrv.XT_SYMNAME] = function() {
        return [Robj.symbol(buffer.read_string(l), attributes), total_read + l];
    };
    handlers[Rsrv.XT_LIST_NO_TAG] = function() {
        var result = buffer.read_list(l);
        return [Robj.list(result[0], attributes), result[1] + total_read];
    };
    handlers[Rsrv.XT_LIST_TAG] = function() {
        var result = {};
        while (l > 0) {
            _ = parse_sexp(buffer);
            var value = _[0], read_t_1 = _[1];
            _ = parse_sexp(buffer);
            var tag = _[0], read_t_2 = _[1];
            l = l - read_t_1 - read_t_2;
            total_read = total_read + read_t_1 + read_t_2;
            if (tag.type !== "symbol") {
                throw "Unexpected type " + tag.type + "as tag for tagged_list";
            }
            result[tag.value] = value;
        }
        return [Robj.tagged_list(result, attributes), total_read];
    };
    handlers[Rsrv.XT_VECTOR_EXP] = function() {
        var result = buffer.read_list(l);
        return [Robj.vector_exp(result[0], attributes), result[1] + total_read];
    };
    handlers[Rsrv.XT_ARRAY_INT] = function() {
        var a = buffer.read_int_vector(l);
        return [Robj.int_array(a, attributes), l + total_read];
    };
    handlers[Rsrv.XT_ARRAY_DOUBLE] = function() {
        var a = buffer.read_double_vector(l);
        return [Robj.double_array(a, attributes), l + total_read];
    };
    handlers[Rsrv.XT_ARRAY_STR] = function() {
        var a = buffer.read_stream(l).make(Uint8Array);
        var result = [];
        var current_str = "";
        for (var i=0; i<a.length; ++i)
            if (a[i] === 0) {
                result.push(current_str);
                current_str = "";
            } else {
                current_str = current_str + String.fromCharCode(a[i]);
            }
        return [Robj.string_array(result, attributes), l + total_read];
    };
    handlers[Rsrv.XT_ARRAY_BOOL] = function() {
        var l2 = buffer.read_int();
        var a = new Uint8Array(buffer.read_stream(l), 0, l2);
        var result = [];
        for (var i=0; i<a.length; ++i)
            result[i] = !!a[i];
        return [Robj.bool_array(result, attributes), l + total_read];
    };

    if (handlers[t] === undefined) {
        throw "Unimplemented " + t;        
    } else {
        return handlers[t]();
    }
};
