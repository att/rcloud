var _is_little_endian;

function check_little_endian() {
    var x = new ArrayBuffer(4);
    var bytes = new Uint8Array(x),
    words = new Uint32Array(x);
    bytes[0] = 1;
    if (words[0] === 1) {
        _is_little_endian = true;
    } else if (words[0] === 16777216) {
        _is_little_endian = false;
    } else {
        throw "we're bizarro endian, refusing to continue";
    }
}
check_little_endian();

(function(global) {

    var data_types = ['Int32', 'Int16', 'Uint32', 'Uint16',
                      'Float32', 'Float64'];
    var setters = ['setInt32', 'setInt16', 'setUint32', 'setUint16',
                   'setFloat32', 'setFloat64'];
    var getters = ['getInt32', 'getInt16', 'getUint32', 'getUint16',
                   'getFloat32', 'getFloat64'];

    if (!global.DataView) {
        console.log("polyfilling DataView");

        var helpers = {};
        for (var i=0; i<data_types.length; ++i) {
            var cls = this[data_types[i] + 'Array'];
            var sz = cls.BYTES_PER_ELEMENT;
            var buf = new ArrayBuffer(sz);
            var original_array = new cls(buf);
            var byte_array = new Uint8Array(buf);
            helpers[data_types[i]] = (function(original_array, byte_array) {
                return function(output, sz, ix, v) {
                    original_array[0] = v;
                    for (var i=0; i<sz; ++i) {
                        output[ix + i] = byte_array[i];
                    }
                };
            })(original_array, byte_array);
        }
        
        function MyDataView(buffer, byteOffset, byteLength) {
            this.buffer = buffer;
            this.byteOffset = byteOffset || 0;
            this.byteLength = byteLength || buffer.byteLength;
            this.view = new jDataView(buffer, byteOffset, byteLength, _is_little_endian);
            this.byte_array = new Uint8Array(buffer);
        }

        var proto = {};
        MyDataView.prototype = proto;
        for (i=0; i<data_types.length; ++i) {
            var getter = 'get' + data_types[i];
            proto[getter] = (function(name) {
                return function(i) { return this.view[name](i); };
            })(getter);
            var setter = 'set' + data_types[i];
            var sz = this[data_types[i] + 'Array'].BYTES_PER_ELEMENT;
            proto[setter] = (function(sz, name) {
                return function(byteOffset, v) {
                    console.log(name);
                    console.log(helpers);
                    helpers[name](this.byte_array, sz, byteOffset, v);
                };
            })(sz, data_types[i]);
        }

        proto.setUint8 = function(ix, v) {
            this.byte_array[ix] = v;
        };
        proto.setInt8 = function(ix, v) {
            if (v < 0) v += 256;
            this.byte_array[ix] = v;
        };
        proto.getInt8 = function(ix) { return this.view.GetInt8(ix); };
        proto.getUint8 = function(ix) { return this.view.GetUint8(ix); };

        global.DataView = MyDataView;
    }

    global.EndianAwareDataView = (function() {
        
        var proto = {
            'setInt8': function(i, v) { return this.view.setInt8(i, v); },
            'setUint8': function(i, v) { return this.view.setUint8(i, v); },
            'getInt8': function(i) { return this.view.getInt8(i); },
            'getUint8': function(i) { return this.view.getUint8(i); }
        };

        var setters = ['setInt32', 'setInt16', 'setUint32', 'setUint16',
                       'setFloat32', 'setFloat64'];
        var getters = ['getInt32', 'getInt16', 'getUint32', 'getUint16',
                       'getFloat32', 'getFloat64'];

        for (var i=0; i<setters.length; ++i) {
            var name = setters[i];
            proto[name]= (function(name) {
                return function(byteOffset, value) { 
                    return this.view[name](byteOffset, value, _is_little_endian); };
            })(name);
        }
        for (i=0; i<getters.length; ++i) {
            var name = getters[i];
            proto[name]= (function(name) {
                return function(byteOffset) { 
                    return this.view[name](byteOffset, _is_little_endian); 
                };
            })(name);
        }
        
        function my_dataView(buffer, byteOffset, byteLength) {
            if (byteOffset === undefined) {
                this.view = new DataView(buffer);
            } else {
                this.view = new DataView(buffer, byteOffset, byteLength);
            }
        };
        my_dataView.prototype = proto;
        return my_dataView;
    })();

    global.my_ArrayBufferView = function(b, o, l) {
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
                    var output_buffer = new ArrayBuffer(new_length);
                    var out_view = new DataView(output_buffer);
                    for (var i=0; i < new_length; ++i) {
                        out_view.setUint8(i, view.getUint8(i));
                    }
                    return new ctor(output_buffer);
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
    };

})(this);

