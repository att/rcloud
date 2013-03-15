/*

 RServe is a low-level communication layer between Javascript and a
 running RServe process on the other side, via Websockets. 
 
 */

(function() {

function RserveError(message, status_code) {
    this.name = "RserveError";
    this.message = message;
    this.status_code = status_code;
}

RserveError.prototype = Object.create(Error);
RserveError.prototype.constructor = RserveError;

var Rsrv = {
    PAR_TYPE: function(x) { return x & 255; },
    PAR_LEN: function(x) { return x >> 8; },
    PAR_LENGTH: function(x) { return x >> 8; },
    par_parse: function(x) { return [Rsrv.PAR_TYPE(x), Rsrv.PAR_LEN(x)]; },
    SET_PAR: function(ty, len) { return ((len & 0xffffff) << 8 | (ty & 255)); },
    CMD_STAT: function(x) { return (x >> 24) & 127; },
    SET_STAT: function(x, s) { return x | ((s & 127) << 24); },

    CMD_RESP           : 0x10000,
    RESP_OK            : 0x10000 | 0x0001,
    RESP_ERR           : 0x10000 | 0x0002,
    OOB_SEND           : 0x30000 | 0x1000,
    ERR_auth_failed    : 0x41,
    ERR_conn_broken    : 0x42,
    ERR_inv_cmd        : 0x43,
    ERR_inv_par        : 0x44,
    ERR_Rerror         : 0x45,
    ERR_IOerror        : 0x46,
    ERR_notOpen        : 0x47,
    ERR_accessDenied   : 0x48,
    ERR_unsupportedCmd : 0x49,
    ERR_unknownCmd     : 0x4a,
    ERR_data_overflow  : 0x4b,
    ERR_object_too_big : 0x4c,
    ERR_out_of_mem     : 0x4d,
    ERR_ctrl_closed    : 0x4e,
    ERR_session_busy   : 0x50,
    ERR_detach_failed  : 0x51,

    CMD_long             : 0x001,
    CMD_voidEval         : 0x002,
    CMD_eval             : 0x003,
    CMD_shutdown         : 0x004,
    CMD_openFile         : 0x010,
    CMD_createFile       : 0x011,
    CMD_closeFile        : 0x012,
    CMD_readFile         : 0x013,
    CMD_writeFile        : 0x014,
    CMD_removeFile       : 0x015,
    CMD_setSEXP          : 0x020,
    CMD_assignSEXP       : 0201,
    CMD_detachSession    : 0x030,
    CMD_detachedVoidEval : 0x031,
    CMD_attachSession    : 0x032,
    CMD_ctrl             : 0x40,
    CMD_ctrlEval         : 0x42,
    CMD_ctrlSource       : 0x45,
    CMD_ctrlShutdown     : 0x44,
    CMD_setBufferSize    : 0x081,
    CMD_setEncoding      : 0x082,
    CMD_SPECIAL_MASK     : 0xf0,
    CMD_serEval          : 0xf5,
    CMD_serAssign        : 0xf6,
    CMD_serEEval         : 0xf7,


    DT_INT        : 1,
    DT_CHAR       : 2,
    DT_DOUBLE     : 3,
    DT_STRING     : 4,
    DT_BYTESTREAM : 5,
    DT_SEXP       : 10,
    DT_ARRAY      : 11,
    DT_LARGE      : 64,

    XT_NULL          : 0,
    XT_INT           : 1,
    XT_DOUBLE        : 2,
    XT_STR           : 3,
    XT_LANG          : 4,
    XT_SYM           : 5,
    XT_BOOL          : 6,
    XT_S4            : 7,
    XT_VECTOR        : 16,
    XT_LIST          : 17,
    XT_CLOS          : 18,
    XT_SYMNAME       : 19,
    XT_LIST_NOTAG    : 20,
    XT_LIST_TAG      : 21,
    XT_LANG_NOTAG    : 22,
    XT_LANG_TAG      : 23,
    XT_VECTOR_EXP    : 26,
    XT_VECTOR_STR    : 27,
    XT_ARRAY_INT     : 32,
    XT_ARRAY_DOUBLE  : 33,
    XT_ARRAY_STR     : 34,
    XT_ARRAY_BOOL_UA : 35,
    XT_ARRAY_BOOL    : 36,
    XT_RAW           : 37,
    XT_ARRAY_CPLX    : 38,
    XT_UNKNOWN       : 48,
    XT_LARGE         : 64,
    XT_HAS_ATTR      : 128,

    BOOL_TRUE  : 1,
    BOOL_FALSE : 0,
    BOOL_NA    : 2,

    GET_XT: function(x) { return x & 63; },
    GET_DT: function(x) { return x & 63; },
    HAS_ATTR: function(x) { return (x & Rsrv.XT_HAS_ATTR) > 0; },
    IS_LARGE: function(x) { return (x & Rsrv.XT_LARGE) > 0; },

    // # FIXME A WHOLE LOT OF MACROS HERE WHICH ARE PROBABLY IMPORTANT
    // ##############################################################################

    itop: function(x) { return x; },
    ptoi: function(x) { return x; },
    dtop: function(x) { return x; },
    ptod: function(x) { return x; },

    fixdcpy: function() { throw new RserveError("unimplemented", -1); },

    status_codes: {
        0x41 : "ERR_auth_failed"   ,
        0x42 : "ERR_conn_broken"   ,
        0x43 : "ERR_inv_cmd"       ,
        0x44 : "ERR_inv_par"       ,
        0x45 : "ERR_Rerror"        ,
        0x46 : "ERR_IOerror"       ,
        0x47 : "ERR_notOpen"       ,
        0x48 : "ERR_accessDenied"  ,
        0x49 : "ERR_unsupportedCmd",
        0x4a : "ERR_unknownCmd"    ,
        0x4b : "ERR_data_overflow" ,
        0x4c : "ERR_object_too_big",
        0x4d : "ERR_out_of_mem"    ,
        0x4e : "ERR_ctrl_closed"   ,
        0x50 : "ERR_session_busy"  ,
        0x51 : "ERR_detach_failed"
    }
};

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
            var s = this.read_stream(length-4);
            var a = s.make(Uint8Array); // new Uint8Array(s, 0, l2);
            var result = [];
            for (var i=0; i<l2; ++i)
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
                throw new RserveError("Unimplemented " + t, -1);
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
                    throw new RserveError("Unexpected type " + tag.type + " as tag for tagged_list", -1);
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
    if (header[0] !== Rsrv.RESP_OK && header[0] !== Rsrv.OOB_SEND) {
        var status_code = header[0] >> 24;
        throw new RserveError("ERROR FROM R SERVER: " + (Rsrv.status_codes[status_code] || 
                                         status_code)
               + " " + header[0] + " " + header[1] + " " + header[2] + " " + header[3]
               + " " + msg.byteLength
               + " " + msg, status_code);
    }

    var payload = my_ArrayBufferView(msg, 16, msg.byteLength - 16);
    if (payload.length === 0)
        return null;
    var result = parse_payload(reader(payload));
    return [result, header[0]];
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
        throw new RserveError("Bad type for parse? " + t + " " + l, -1);
}

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

Rserve = {
    create: function(opts) {
        var host = opts.host;
        var onconnect = opts.on_connect;
        var socket = new WebSocket(host);
        var handle_error = opts.on_error || function(error) { throw new RserveError(error, -1); };
        socket.binaryType = 'arraybuffer';

        var received_handshake = false;
        var value_callbacks = [];

        var result;
        var command_counter = 0;
        
        function hand_shake(msg)
        {
            msg = msg.data;
            if (msg.substr(0,4) !== 'Rsrv') {
                handle_error("server is not an RServe instance", -1);
            } else if (msg.substr(4, 4) !== '0103') {
                handle_error("sorry, rserve only speaks the 0103 version of the R server protocol", -1);
            } else if (msg.substr(8, 4) !== 'QAP1') {
                handle_error("sorry, rserve only speaks QAP1", -1);
            } else {
                received_handshake = true;
                if (opts.login)
                    result.login(opts.login);
                result.running = true;
                onconnect && onconnect.call(result);
            }
        }

        socket.onclose = function(msg) {
            result.running = false;
            opts.on_close && opts.on_close(msg);
        };

        socket.onmessage = function(msg) {
            if (!received_handshake) {
                hand_shake(msg);
                return;
            }
            if (typeof msg.data === 'string')
                opts.on_raw_string && opts.on_raw_string(msg.data);
            else {
                var v;
                try {
                    v = parse(msg.data);
                } catch (e) {
                    handle_error(e.message, e.status_code);
                    return;
                }

                if (v === null) {
                    // there's no data, but there's no error either: ignore the message
                    return;
                }
                var type = v[1];
                v = v[0];
                switch (type) {
                case Rsrv.RESP_OK:
                    var value_callback = value_callbacks.shift();
                    value_callback(v);
                    break;
                case Rsrv.OOB_SEND: 
                    opts.on_data && opts.on_data(v);
                    break;
                default:
                    throw new RserveError("Internal Error, parse returned unexpected type " + type, -1);
                }
            }
        };

        result = {
            close: function() {
                socket.close();
            },
            
            login: function(auth_string) {
                var command = auth_string;
                var buffer = new ArrayBuffer(command.length + 21);
                var view = new EndianAwareDataView(buffer);
                view.setInt32(0,  1);
                view.setInt32(4,  5 + command.length);
                view.setInt32(8,  0);
                view.setInt32(12, 0);
                view.setInt32(16, 4 + ((1 + command.length) << 8));
                for (var i=0; i<command.length; ++i) {
                    view.setUint8(20 + i, command.charCodeAt(i));
                }
                view.setUint8(buffer.byteLength - 1, 0);
                socket.send(buffer);
            },
            eval: function(command, k) {
                k = k || function() {};
                value_callbacks.push(k);
                var buffer = new ArrayBuffer(command.length + 21);
                var view = new EndianAwareDataView(buffer);
                view.setInt32(0,  3);
                view.setInt32(4,  5 + command.length);
                view.setInt32(8,  0);
                view.setInt32(12, 0);
                view.setInt32(16, 4 + ((1 + command.length) << 8));
                for (var i=0; i<command.length; ++i) {
                    view.setUint8(20 + i, command.charCodeAt(i));
                }
                view.setUint8(buffer.byteLength - 1, 0);
                socket.send(buffer);
            }
        };
        return result;
    }
};

})();
