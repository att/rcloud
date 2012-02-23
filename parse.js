var _is_little_endian = true;

// WTF bad spec, ArrayBufferView is useful but is not exposed?
// http://code.google.com/p/chromium/issues/detail?id=60449
function my_ArrayBufferView(b, o, l)
{
    o = o || 0;
    l = l || b.byteLength;
    return {
        buffer: b,
        offset: o,
        length: l,
        make: function(ctor, new_offset, new_length) { 
            new_offset = new_offset || 0;
            new_length = new_length || this.length;
            var element_size = ctor.BYTES_PER_ELEMENT || 1;
            var n_els = new_length / element_size;
            if ((this.offset + new_offset) % element_size != 0) {
                var view = new DataView(this.buffer, this.offset + new_offset, new_length);
                var new_array = new ctor(new ArrayBuffer(new_length));
                for (var i=0; i < n_els; ++i) {
                    new_array[i] = view.getFloat64(i * element_size, _is_little_endian);
                }
                return new_array;
            } else {
                return new ctor(this.buffer, 
                                this.offset + new_offset, 
                                n_els);
            }
        },
        view: function(new_offset, new_length) {
            // FIXME Needs bounds checking
            return my_ArrayBufferView(this.buffer, this.offset + new_offset, new_length);
        }
    };
}

function buffer_from_msg(m)
{
    // var offset = 0;
    // var data_view = msg.make(DataView); // new DataView(msg);

    return {
        offset: 0,
        data_view: m.make(DataView),
        msg: m,
        read_int: function() {
            var old_offset = this.offset;
            this.offset += 4;
            return this.data_view.getInt32(old_offset, _is_little_endian);
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
            // return new ArrayBufferView(msg, old_offset, length);
            return this.msg.view(old_offset, length);
        },
        read_int_vector: function(length) {
            var old_offset = this.offset;
            this.offset += length;
            // return new Int32Array(msg, old_offset, length / 4);
            return this.msg.make(Int32Array, old_offset, length);
        },
        read_double_vector: function(length) {
            var old_offset = this.offset;
            this.offset += length;
            // return new Float64Array(msg, old_offset, length / 8);
            return this.msg.make(Float64Array, old_offset, length);
        }
    };
}

function parse(buffer)
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

function parse_list(buffer, l, total_read)
{
    var result = [];
    while (l > 0) {
        _ = parse_sexp(buffer);
        var sexp = _[0], read_t = _[1];
        result.push(sexp);
        l = l - read_t;
        total_read = total_read + read_t;
    }
    return [result, total_read];
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

    if (t === Rsrv.XT_NULL) {
        return [Robjs.null(attributes), total_read];
    } else if (t === Rsrv.XT_VECTOR) {
        var result = parse_list(buffer, l, total_read);
        return [Robjs.vector(result[0], attributes), result[1]];
    } else if (t === Rsrv.XT_CLOS) {
        _ = parse_sexp(buffer);
        var formals = _[0], read_1 = _[1];
        _ = parse_sexp(buffer);
        var body = _[0], read_2 = _[1];
        return [Robj.clos(formals, body, attributes), total_read + read_1 + read_2];
    } else if (t === Rsrv.XT_SYMNAME) {
        return [Robj.symbol(buffer.read_string(l), attributes), total_read + l];
    } else if (t === Rsrv.XT_LIST_NOTAG) {
        var result = parse_list(buffer, l, total_read);
        return [Robj.list(result[0], attributes), result[1]];
    } else if (t === Rsrv.XT_LIST_TAG) {
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
            // result.push([tag, value]);
        }
        return [Robj.tagged_list(result, attributes), total_read];
    } else if (t === Rsrv.XT_VECTOR_EXP) {
        var result = parse_list(buffer, l, total_read);
        return [Robj.vector_exp(result[0], attributes), result[1]];
    } else if (t === Rsrv.XT_ARRAY_INT) {
        var a = buffer.read_int_vector(l);
        return [Robj.int_array(a, attributes), l + total_read];
    } else if (t === Rsrv.XT_ARRAY_DOUBLE) {
        var a = buffer.read_double_vector(l);
        return [Robj.double_array(a, attributes), l + total_read];
    } else if (t === Rsrv.XT_ARRAY_STR) {
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
    } else if (t === Rsrv.XT_ARRAY_BOOL) {
        var l2 = buffer.read_int();
        var a = new Uint8Array(buffer.read_stream(l), 0, l2);
        var result = [];
        for (var i=0; i<a.length; ++i)
            result[i] = !!a[i];
        return [Robj.bool_array(result, attributes), l + total_read];
    } else
        throw "Unimplemented " + t;
};
