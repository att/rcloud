(function(global) {
    var _is_little_endian;

    (function() {
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
    })();

    if (!global.DataView) {
        var data_types = ['Int32', 'Int16', 'Uint32', 'Uint16',
                          'Float32', 'Float64'];
        var setters = ['setInt32', 'setInt16', 'setUint32', 'setUint16',
                       'setFloat32', 'setFloat64'];
        var getters = ['getInt32', 'getInt16', 'getUint32', 'getUint16',
                       'getFloat32', 'getFloat64'];

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
            this.byteOffset = _.isUndefined(byteOffset) ? 0 : byteOffset;
            this.byteLength = _.isUndefined(byteLength) ? buffer.byteLength : byteLength;
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
        proto.getUint8 = function(ix) { /* return this.view.GetUint8(ix); // <-- doesn't work in FF! */ return this.byte_array[ix]; };

        global.DataView = MyDataView;
    }
})(this);
