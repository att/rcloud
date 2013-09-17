RClient = {
    create: function(opts) {
        function on_connect() {
            if (!rserve.ocap_mode) {
                result.post_error(result.disconnection_error("Expected an object-capability Rserve. Shutting Down!"));
                shutdown();
                return;
            }

            // the rcloud ocap-0 performs the login authentication dance
            // success is indicated by the rest of the capabilities being sent
            rserve.ocap([token, execToken], function(ocaps) {
                if (ocaps !== null) {
                    result.running = true;
                    opts.on_connect && opts.on_connect.call(result, ocaps);
                } else {
                    result.post_error(result.disconnection_error("Login failed. Shutting down!"));
                    shutdown();
                }
            });
        }

        // this might be called multiple times; some conditions result
        // in on_error and on_close both being called.
        function shutdown() {
            $("#input-div").hide();
            if (!rserve.closed)
                rserve.close();
        }

        function on_error(msg, status_code) {
            result.post_error(result.disconnection_error(msg));
            shutdown();
        }

        function on_close(msg) {
            result.post_error(result.disconnection_error("Socket was closed. Goodbye!"));
            shutdown();
        };

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

        result = {
            _rserve: rserve,
            running: false,
           
            //////////////////////////////////////////////////////////////////
            // FIXME: all of this should move out of rclient and into
            // the notebook objects.

            string_error: function(msg) {
                return $("<div class='alert alert-danger'></div>").text(msg);
            },

            disconnection_error: function(msg) {
                var result = $("<div class='alert alert-danger'></div>");
                result.append($("<span></span>").text(msg));
                var button = $("<button type='button' class='close'>Reconnect</button>");
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

            post_error: function (msg) {
                if (typeof msg === 'string')
                    msg = this.string_error(msg);
                if (typeof msg !== 'object')
                    throw new Error("post_error expects a string or a jquery div");
                // var d = $("<div class='alert alert-danger'></div>").text(msg);
                $("#output").append(msg);
                window.scrollTo(0, document.body.scrollHeight);
            },

            post_response: function (msg) {
                var d = $("<pre></pre>").html(msg);
                $("#output").append(d);
                window.scrollTo(0, document.body.scrollHeight);
            }
        };
        return result;
    }
};
