var RClient = {
    create: function(host) {
        var socket = new WebSocket(host);

        var _debug = true;
        var _capturing_answers = false;
        var _capturing_callback = undefined;
        var _received_handshake = false;

        var result;
        
        socket.binaryType = 'arraybuffer';

        function hand_shake(msg)
        {
            msg = msg.data;
            if (msg.substr(0,4) !== 'Rsrv') {
                result.post_error("server is not an RServe instance");
            } else if (msg.substr(4, 4) !== '0103') {
                result.post_error("sorry, I can only use the 0103 version of the R server protocol");
            } else if (msg.substr(8, 4) !== 'QAP1') {
                result.post_error("sorry, I only speak QAP1");
            } else {
                _received_handshake = true;
                result.post_response("Welcome to R-on-the-browser!");
		result.binary_send(".session.init()", false);
            }
        }

        socket.onmessage = function(msg) {
            if (_capturing_answers) {
                try {
                    _capturing_callback(result.eval(parse(msg.data)));
                } catch (e) {
                    _capturing_answers = false;
                    _capturing_callback = undefined;
                    throw e;
                }
            } else {
                if (!_received_handshake) {
                    hand_shake(msg);
                    return;
                }
                if (typeof msg.data === 'string')
                    result.post_response(msg.data);
                else {
                    var data = result.eval(parse(msg.data));
                    result.display_response(data);
                }
            }
        };

        socket.onclose = function(msg) {
            result.post_response("Socket was closed. Goodbye!");
        };

        result = {
            eval: function(data) {
                var that = this;
                if (data.type !== "sexp") {
                    return this.post_error("Bad protocol, should always be sexp.");
                }
                data = data.value;
                if (data.type === "string_array") {
                    return this.post_error(data.value[0]);
                }
                if (data.type !== "vector") {
                    return this.post_error("Protocol error, unexpected value of type " + data.type);
                }
                if (data.value[0].type !== "string_array" ||
                    data.value[0].value.length !== 1) {
                    return this.post_error("Protocol error, expected first element to be a single string");
                }
                var cmd = data.value[0].value[0];
                var cmds = {
                    "eval": function(v) {
                        return v;
                    },
		    // FIXME: I couldn't get this.post_* to work from here so this is just to avoid the error ... it's nonsensical, obviously
		    "img.url.update": function(v) { v },
		    "img.url.final": function(v) { v },
		    // the following two are unused - they were supposed to enable the "check graphics" flag, but we do that in R now ...
		    "dev.new": function(v) { "" },
		    "dev.close": function(v) { "" }
                };
                if (cmds[cmd] === undefined) {
                    return this.post_error("Unknown command " + cmd);
                }
		if (cmd == "img.url.update" || cmd == "img.url.final") {
		    // FIXME: this is a bad hack storing in the window - do something more reasonable ;)
		    var ix = window.devImgIndex;
		    if (!ix) window.devImgIndex = ix = 1;
		    if (cmd == "img.url.final") window.devImgIndex++;
		    var div = document.getElementById("dimg"+ix);
		    if (div) // FIXME: we may want to move the div down as well -- maybe just remove the old one and add a new one?
			div.innerHTML = "<img src="+data.value[1].value[0]+">";
		    else
			this.post_div("<div id=dimg"+ix+"><img src="+data.value[1].value[0]+"></div>");
		}
                return cmds[cmd](data.value[1]);
            },

            post_sent_command: function (msg) {
                var d = $('<pre class="r-sent-command"></pre>').html('> ' + msg);
                $("#output").append(d);
            },

            post_debug_message: function (msg) {
                var view = new Uint8Array(msg);
                var x = Array.prototype.join.call(view, ",");
                this.post_response(x);
            },

            post_div: function (msg) {
                $("#output").append(msg);
                window.scrollTo(0, document.body.scrollHeight);
            },

            post_binary_response: function(msg) {
                if (_debug) {
                    this.post_debug_message(msg);
                    this.display_response(parse(msg));
                } else {
                    try {
                        this.display_response(parse(msg));
                    } catch (e) {
                        this.post_error("Uncaught exception: " + e);
                    }
                }
            },

            display_response: function (result) {
                if (result) $("#output").append(result.html_element());
                window.scrollTo(0, document.body.scrollHeight);
            },

            post_error: function (msg) {
                var d = $("<div class='error-message'></div>").html(msg);
                $("#output").append(d);
                window.scrollTo(0, document.body.scrollHeight);
            },

            post_response: function (msg) {
                var d = $("<pre></pre>").html(msg);
                $("#output").append(d);
                window.scrollTo(0, document.body.scrollHeight);
            },

            capture_answers: function (how_many, callback) {
                if (_capturing_answers) {
                    throw "Still waiting for previous answers...";
                }
                _capturing_answers = true;
                var result = [];
                function blip(msg) {
                    result.push(msg);
                    how_many--;
                    if (how_many === 0) {
                        _capturing_answers = false;
                        _capturing_callback = undefined;
                        callback(result);
                    }
                }
                _capturing_callback = blip;
            },

            wrap_command: function(command) {
                // FIXME code injection? notice that this is already eval, so
                // what _additional_ harm would exist?

                return ".session.eval({" + command + "})";
            },

            binary_send: function(command, wrap) {
                if (wrap !== false) command = this.wrap_command(command);
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
