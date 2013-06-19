(function() {

// takes a string and returns the appropriate r literal string with escapes.
function escape_r_literal_string(s) {
    return (s == null) ? "\"\"" : ("\"" + s.replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"");
    // return "\"" + s.replace(/"/g, "\\\"") + "\"";
}

function NoCallbackError() {
    this.name = "NoCallbackError";
}

NoCallbackError.prototype = Object.create(Error);
NoCallbackError.prototype.constructor = NoCallbackError;

function no_callback() { throw new NoCallbackError(); }

RClient = {
    create: function(opts) {

        function on_connect() {
            result.running = true;
            result.send("rcloud.support::session.init(username=" 
                        + escape_r_literal_string(rcloud.username()) + ",token="
                        + escape_r_literal_string(rcloud.github_token()) + ")");
            opts.on_connect && opts.on_connect.call(result);
        }

        // this might be called multiple times; some conditions result
        // in on_error and on_close both being called.
        function shutdown() {
            $("#input-div").hide();
        }

        function on_error(msg, status_code) { 
            if (status_code === 65) {
                // Authentication failed.
                result.post_error("Authentication failed. Login first!");
            } else {
                result.post_error(msg);
            }
            shutdown();
        }

        function on_close(msg) {
            result.post_error("Socket was closed. Goodbye!");
            shutdown();
        };

        var token = $.cookies.get().token;
        var rserve = Rserve.create({
            host: opts.host,
            on_connect: on_connect,
            on_error: on_error,
            on_close: on_close,
            login: token + "\n" + token
        });

        var _debug = opts.debug || false;
        var _capturing_answers = false;
        var _capturing_callback = undefined;

        var result;

        result = {
            handlers: {
                "eval": function(v) {
                    result.post_response(v);
                    return v;
                },
                "markdown.eval": function(v) {
                    result.display_markdown_response(v);
                    return v;
                },
                "browsePath": function(v) {
                    $.ajax({ url: "http://127.0.0.1:8080" + v }).done(function(result) {
                        // horrible hack: we strip the content down to its main div via regexp
                        // cue jwz here.
                        var inside_body = /[\s\S]*<body>([\s\S]*)<\/body>/g.exec(result)[1];
                        $("#help-output").html(inside_body);
                    });
                },
		// FIXME: I couldn't get this.post_* to work from here so this is just to avoid the error ... it's nonsensical, obviously
		"dev.new": function(v) { return ""; },
		"dev.close": function(v) { return ""; },
                "internal_cmd": function(v) { return ""; },
                "boot.failure": function(v) { 
                    result.running = false;
                }
            },
            running: false,

            eval: function(data) {
                var that = this;
                if (data.type !== "sexp") {
                    return this.post_error("Bad protocol, should always be sexp.");
                }
                data = data.value;
                if (data.type === "string_array") {
                    return this.post_error(data.value[0]);
                }
                if (data.type === "null") {
                    return null;
                }
                if (data.type !== "vector") {
                    return this.post_error("Protocol error, unexpected value of type " + data.type);
                }
                if (data.value[0].type !== "string_array" ||
                    data.value[0].value.length !== 1) {
                    console.log("Protocol error?! ", data.value[0]);
                    return undefined;
                    // return this.post_error("Protocol error, expected first element to be a single string");
                }
                var cmd = data.value[0].value[0];
                var cmds = this.handlers;
                if (cmds[cmd] === undefined) {
                    return this.post_error("Unknown command " + cmd);
                }
                return cmds[cmd].call(this, data.json()[1]);
            },

            register_handler: function(cmd, callback) {
                this.handlers[cmd] = callback;
            },

            //////////////////////////////////////////////////////////////////
            // FIXME: all of this should move out of rclient and into
            // the notebook objects.

            post_div: function (msg) {
                return shell.post_div(msg);
            },

            display_markdown_response: function(result) {
                if (result) {
                    $("#output")
                        .append($("<div></div>")
                                .html(result.value[0]))
                        .find("pre code")
                        .each(function(i, e) { 
                            hljs.highlightBlock(e); 
                        });
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                }
            },

            //////////////////////////////////////////////////////////////////

            post_error: function (msg) {
                var d = $("<div class='alert alert-error'></div>").text(msg);
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
                if (silent === undefined) {
                    silent = false;
                }
                return "rcloud.support::session.eval({" + command + "}, "
                    + (silent?"TRUE":"FALSE") + ")";
            },

            markdown_wrap_command: function(command, silent) {
                return "rcloud.support::session.markdown.eval({markdownToHTML(text=paste(knit(text=" + escape_r_literal_string(command+'\n') + "), collapse=\"\\n\"), fragment=TRUE)}, "
                    + (silent?"TRUE":"FALSE") + ")";
            },

            log: function(command) {
                command = "rcloud.support::session.log(\"" + rcloud.username() + "\", \"" +
                    command.replace(/\\/g,"\\\\").replace(/"/g,"\\\"")
                + "\")";
                this.send(command);
            },

            record_cell_execution: function(cell_model) {
                var json_rep = JSON.stringify(cell_model.json());
                var call = this.r_funcall("rcloud.record.cell.execution", 
                                          rcloud.username(), json_rep);
                rserve.eval(call);
            },

            send: function(command, wrap) {
                this.send_and_callback(command, no_callback, wrap);
            },

            send_and_callback: function(command, callback, wrap) {
                var that = this;
                if (_.isUndefined(callback))
                    callback = no_callback;
                var t;
                if (wrap) {
                    command = wrap(command);
                } else {
                    command = this.wrap_command(command, true);
                }
                if (_debug)
                    console.log(command);
                function unwrap(v) {
                    v = v.value.json();
                    if (_debug) {
                        debugger;
                        console.log(v);
                    }
                    try {
                        callback(v[1]);
                    } catch (e) {
                        if (e.constructor === NoCallbackError) {
                            that.handlers[v[0]](v[1]);
                        } else
                            throw e;
                    }
                }
                rserve.eval(command, unwrap);
            },

            // supports only the following argument types:
            // * string
            // * number
            // * array of string/number (doesn't check they match)
            r_funcall: function(function_name) {
                function output_one(result, val) {
                    var t = typeof val;
                    if (t === "string") {
                        result.push(escape_r_literal_string(val));
                    } 
                    else if (t == "number") {
                        result.push(String(val));
                    }
                    else throw "unsupported r_funcall argument type " + t;
                }
                var result = [function_name, "("];
                for (var i=1; i<arguments.length; ++i) {
                    var arg = arguments[i];
                    if ($.isArray(arg)) {
                        result.push("c(");
                        for(var j = 0; j<arg.length; ++j) {
                            output_one(result,arg[j]);
                            if(j < arg.length-1)
                                result.push(",");
                        }
                        result.push(")");
                    }
                    else output_one(result, arg);
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

})();
