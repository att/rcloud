// FIXME all RCloud.*.post_error calls should be handled elsewhere

RClient = {
    create: function(opts) {
        var welcome_msg;
        opts = _.defaults(opts, {
            debug: false
        });
        function on_connect() {
            if (!rserve.ocap_mode) {
                RCloud.UI.session_pane.post_error(ui_utils.disconnection_error("Expected an object-capability Rserve. Shutting Down!"));
                shutdown();
                return;
            }

            // the rcloud ocap-0 performs the login authentication dance
            // success is indicated by the rest of the capabilities being sent
            var session_mode = (opts.mode) ? opts.mode : "IDE";
            rserve.ocap([token, execToken], session_mode, function(err, ocaps) {
                if(err)
                    on_error(err[0], err[1]);
                else {
                    ocaps = Promise.promisifyAll(ocaps);
                    if(ocaps === null) {
                        on_error("Login failed. Shutting down!");
                    }
                    else if(RCloud.is_exception(ocaps)) {
                        on_error(ocaps[0]);
                    }
                    else {
                        result.running = true;
                        /*jshint -W030 */
                        opts.on_connect && opts.on_connect.call(result, ocaps);
                    }
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
                /*jshint -W087 */
                debugger;
            }
            if (opts.on_error && opts.on_error(msg, status_code))
                return;
            RCloud.UI.session_pane.post_error(ui_utils.disconnection_error(msg));
            shutdown();
        }

        function on_close(msg) {
            if (opts.debug) {
                /*jshint -W087 */
                debugger;
            }
            if (!clean) {
                RCloud.UI.fatal_dialog("Your session has been logged out.", "Reconnect", "/login.R");
                shutdown();
            }
        }

        var token = $.cookies.get().token;  // document access token
        var execToken = $.cookies.get().execToken; // execution token (if enabled)
        var rserve = Rserve.create({
            host: opts.host,
            on_connect: on_connect,
            on_error: on_error,
            on_close: on_close,
            on_data: opts.on_data,
            on_oob_message: opts.on_oob_message
        });

        var result;
        var clean = false;

        result = {
            _rserve: rserve,
            host: opts.host,
            running: false,

            set_welcome_msg: function(msg) {
                welcome_msg = msg;
            },

            post_response: function() {
                var d = $("<pre class='response'></pre>").html(welcome_msg);
                $("#output").append(d);
            },

            post_rejection: function(e) {
                RCloud.UI.session_pane.post_error(e.message);
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
