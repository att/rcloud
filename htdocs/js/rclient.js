RClient = {
    create: function(opts) {
        opts = _.defaults(opts, {
            debug: false
        });
        function on_connect() {
            if (!rserve.ocap_mode) {
                result.post_error(result.disconnection_error("Expected an object-capability Rserve. Shutting Down!"));
                shutdown();
                return;
            }

            // the rcloud ocap-0 performs the login authentication dance
            // success is indicated by the rest of the capabilities being sent
            rserve.ocap([token, execToken], function(err, ocaps) {
                ocaps = Promise.promisifyAll(ocaps);
                if (ocaps !== null) {
                    result.running = true;
                    opts.on_connect && opts.on_connect.call(result, ocaps);
                } else {
                    on_error("Login failed. Shutting down!");
                }
            });
        }

        // this might be called multiple times; some conditions result
        // in on_error and on_close both being called.
        function shutdown() {
            if (!clean) {
                $("#input-div").hide();
            }
            if (!rserve.closed)
                rserve.close();
        }

        function on_error(msg, status_code) {
            if (opts.debug) {
                debugger;
            }
            if (opts.on_error && opts.on_error(msg, status_code))
                return;
            result.post_error(result.disconnection_error(msg));
            shutdown();
        }

        function on_close(msg) {
            if (opts.debug) {
                debugger;
            }
            if (!clean) {
                result.post_error(result.disconnection_error("Socket was closed. Goodbye!"));
                shutdown();
            }
        };
        // detect where we will show errors

        var error_dest_ = $("#session-info");
        var show_error_area;
        if(error_dest_.length)
            show_error_area = function() {
                RCloud.UI.right_panel.collapse($("#collapse-session-info"), false, false);
            };
        else {
            error_dest_ = $("#output");
            show_error_area = function() {};
        }

        var token = $.cookies.get().token;  // document access token
        var execToken = $.cookies.get().execToken; // execution token (if enabled)
        var rserve = Rserve.create({
            host: opts.host,
            on_connect: on_connect,
            on_error: on_error,
            on_close: on_close,
            on_data: opts.on_data
        });

        var result;
        var clean = false;

        result = {
            _rserve: rserve,
            host: opts.host,
            running: false,

            //////////////////////////////////////////////////////////////////
            // FIXME: all of this should move out of rclient and into
            // the notebook objects.

            string_error: function(msg) {
                var button = $("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>");
                var result = $("<div class='alert alert-danger alert-dismissable'></div>");
                var text = $("<span></span>");
                result.append(button);
                result.append(text);
                text.text(msg);
                return result;
            },

            disconnection_error: function(msg, label) {
                var result = $("<div class='alert alert-danger'></div>");
                result.append($("<span></span>").text(msg));
                label = label || "Reconnect";
                var button = $("<button type='button' class='close'>" + label + "</button>");
                result.append(button);
                button.click(function() {
                    window.location =
                        (window.location.protocol +
                         '//' + window.location.host +
                         '/login.R?redirect=' +
                         encodeURIComponent(window.location.pathname + window.location.search));
                });
                return result;
            },

            post_error: function (msg, dest) {
                if (typeof msg === 'string')
                    msg = this.string_error(msg);
                if (typeof msg !== 'object')
                    throw new Error("post_error expects a string or a jquery div");
                msg.css("margin", "-15px"); // hack
                dest = dest || error_dest_;
                dest.append(msg);
                show_error_area();
            },

            post_response: function (msg) {
                var d = $("<pre class='response'></pre>").html(msg);
                $("#output").append(d);
                window.scrollTo(0, document.body.scrollHeight);
            },

            post_rejection: function(e) {
                rclient.post_error(e.message);
                throw e;
            },

            close: function() {
                clean = true;
                shutdown();
            }
        };
        return result;
    }
};
