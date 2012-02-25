try {
    DataView
} catch (e) {
    DataView = jDataView;
    // (function() {
    //     var proto = {
            
    //     };
    //     function DataView(buffer, byteOffset, byteLength) {
    //         this.buffer = buffer;
    //         this.array = new Uint8Array();
    //         this.byteOffset = byteOffset || 0;
    //         this.byteLength = byteLength || 0;
    //     }
    //     DataView.prototype = proto;
    //     return DataView;
    // })();
}

EndianAwareDataView = (function() {
    var _is_little_endian;
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

    var setters = ['setInt32', 'setInt16', 'setUint32', 'setUint16',
                   'setFloat32', 'setFloat64'];
    var getters = ['getInt32', 'getInt16', 'getUint32', 'getUint16',
                   'getFloat32', 'getFloat64'];

    var proto = {
        'setInt8': function(i, v) { return this.view.setInt8(i, v); },
        'setUint8': function(i, v) { return this.view.setUint8(i, v); },
        'getInt8': function(i) { return this.view.getInt8(i); },
        'getUint8': function(i) { return this.view.getUint8(i); }
    };

    for (var i=0; i<setters.length; ++i) {
        var name = setters[i];
        proto[name]= (function(name) {
            return function(i, v) { return this.view[name](i, v, _is_little_endian); };
        })(name);
    }
    for (i=0; i<getters.length; ++i) {
        var name = getters[i];
        proto[name]= (function(name) {
            return function(i) { return this.view[name](i, _is_little_endian); };
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
}
