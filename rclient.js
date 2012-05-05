var RClient = {
    create: function(host, onconnect) {
        var socket = new WebSocket(host);

        var _debug = true;
        var _capturing_answers = false;
        var _capturing_callback = undefined;
        var _received_handshake = false;

        var result;
        var command_counter = 0;
        
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
		result.send(".session.init()", false);
                onconnect && onconnect();
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
                    result.eval(parse(msg.data));
                }
            }
        };

        socket.onclose = function(msg) {
            result.post_response("Socket was closed. Goodbye!");
        };

        result = {
            handlers: {
                "eval": function(v) {
                    console.log("Got result!", v);
                    if (v.value.length === 3) {
                        var command_id = v.value[2].value[0];
                        var cb = this.result_handlers[command_id];
                        // if there's a callback attached, call it.
                        // otherwise, display it.
                        if (cb) {
                            cb(command_id, v.value[1]);
                        } else {
                            result.display_response(v.value[1]);
                        }
                    }
                    return v.value[1]; 
                },
		// FIXME: I couldn't get this.post_* to work from here so this is just to avoid the error ... it's nonsensical, obviously
		"img.url.update": function(v) { return v.value[1]; },
		"img.url.final": function(v) { return v.value[1]; },
		"dev.new": function(v) { return ""; },
		"dev.close": function(v) { return ""; },
                "internal_cmd": function(v) { return ""; }
            },
            result_handlers: {},

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
                var cmds = this.handlers;
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
                return cmds[cmd].call(this, data);
            },

            register_handler: function(cmd, callback) {
                this.handlers[cmd] = callback;
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

            wrap_command: function(command, silent) {
                // FIXME code injection? notice that this is already eval, so
                // what _additional_ harm would exist?
                var this_command = command_counter++;
                if (silent === undefined) {
                    silent = false;
                }
                return [ ".session.eval({" + command + "}, "
                         + this_command + ", "
                         + (silent?"TRUE":"FALSE") + ")",
                         this_command ];
            },

            send: function(command, wrap) {
                if (wrap !== false) command = this.wrap_command(command)[0];
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
            },

            send_and_callback: function(command, callback) {
                console.log(command, callback);
                if (_.isUndefined(callback))
                    callback = _.identity;
                console.log(command, callback);
                var t = this.wrap_command(command, true);
                var command_id = t[1];
                command = t[0];
                var that = this;
                this.result_handlers[command_id] = function(id, data) {
                    console.log("back from ", command, that.result_handlers);
                    delete that.result_handlers[id];
                    callback(data);
                };
                console.log("sending ", command, this.result_handlers);
                this.send(command, false);
            },

            // FIXME this needs hardening
            r_funcall: function(function_name) {
                var result = [function_name, "("];
                for (var i=1; i<arguments.length; ++i) {
                    var t = typeof arguments[i];
                    if (t === "string") {
                        result.push("\"" + arguments[i].replace(/"/g, "\\\"") + "\"");
                    } else
                        result.push(String(arguments[i]));
                    if (i < arguments.length-1)
                        result.push(",");
                }
                result.push(")");
                var s = result.join("");
                return s;
            }
        };
        return result;
    }
};
