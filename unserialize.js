// Unserialize an R SEXP that has been sent down the wire from R. This
// is straight replication of the code in src/main/serialize.c
// 
// FIXME this is all horribly slow.

var R_pstream_any_format = 0;
var R_pstream_ascii_format = 1;
var R_pstream_binary_format = 2;
var R_pstream_xdr_format = 3;

function stream(arraybuffer)
{
    var offset = 0;
    var raw_view = new Uint8Array(arraybuffer);
    var type;

    function InChar() {
        return raw_view[offset++];
    }
    function InBytes(length, as) {
        if (!as) 
            as = Uint8Array;
        var old_offset = offset;
        offset += length * as.BYTES_PER_ELEMENT;
        return new as(arraybuffer, old_offset, length);
    }

    function isspace(c) {
        return ' \t\n\v\f\r'.indexOf(c) !== -1;
    }

    return {
        InFormat: function() {
            var x = InBytes(2);
            var c = String.fromCharCode(x[0]), c2 = String.fromCharCode(x[1]);
            type = -1;
            switch (c) {
            case 'A': type = R_pstream_ascii_format; break;
            case 'B': type = R_pstream_binary_format; break;
            case 'X': type = R_pstream_xdr_format; break;
            case '\n':
                if (c2 === 'A') {
                    type = R_pstream_ascii_format;
                    InBytes(1);
                }
            default:
                throw "unknown input format";    
            }
        },
        InWord: function() {
            var c;
            var buf = '';
            do {
                c = InChar();
            } while (isspace(c));
            while (!isspace(c)) {
                buf += String.fromCharCode(c);
                c = InChar();
            }
            return buf;
        },
        InInteger: function() {
            var t;
            switch(type) {
            case R_pstream_ascii_format:
                t = this.InWord();
                if (t === "NA") 
                    return NaN;
                else
                    return parseInt(t);
            case R_pstream_binary_format:
                return InBytes(4, Int32Array)[0];
            }
        }
    };
}

function unserialize(stream)
{
    
}
