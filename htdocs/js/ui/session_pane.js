RCloud.UI.session_pane = {
    error_dest_: null,
    allow_clear: true,
    body: function() {
        return RCloud.UI.panel_loader.load_snippet('session-info-snippet');
    },
    init: function() {
        var that = this;

        // detect where we will show errors
        this.error_dest_ = $("#session-info");
        if(this.error_dest_.length) {
            this.show_error_area = function() {
                RCloud.UI.right_panel.collapse($("#collapse-session-info"), false, false);
            };
        }
        else {
            this.error_dest_ = $("#output");
            this.show_error_area = function() {};
        }
        RCloud.session.listeners.push({
            on_reset: function() {
                that.clear();
            }
        });

        //////////////////////////////////////////////////////////////////////
        // bluebird unhandled promise handler
        Promise.onPossiblyUnhandledRejection(function(e, promise) {
            that.post_rejection(e);
        });
    },
    panel_sizer: function(el) {
        var def = RCloud.UI.collapsible_column.default_sizer(el);
        if(def.height)
            def.height += 20; // scrollbar height can screw it up
        return def;
    },
    error_dest: function() {
        return this.error_dest_;
    },
    clear: function() {
        if(this.allow_clear)
            $("#session-info").empty();
    },
    append_text: function(msg) {
        // FIXME: dropped here from session.js, could be integrated better
        if(!$('#session-info').length) {
            console.log('session log; ', msg);
            return; // workaround for view mode
        }
        // one hacky way is to maintain a <pre> that we fill as we go
        // note that R will happily spit out incomplete lines so it's
        // not trivial to maintain each output in some separate structure
        if (!document.getElementById("session-info-out"))
            $("#session-info").append($("<pre id='session-info-out'></pre>"));
        $("#session-info-out").append(msg);
        RCloud.UI.right_panel.collapse($("#collapse-session-info"), false, false);
        ui_utils.on_next_tick(function() {
            ui_utils.scroll_to_after($("#session-info"));
        });
    },
    post_error: function(msg, dest, logged) { // post error to UI
        $('#loading-animation').hide();
        dest = dest || this.error_dest_;
        if(!dest || !dest.length) {
            if(typeof msg === 'object')
                msg = msg.text();
            RCloud.UI.fatal_dialog(msg, "Login", ui_utils.relogin_uri());
        }
        else {
            var errclass = 'session-error';
            if (typeof msg === 'string') {
                msg = ui_utils.string_error(msg);
                errclass = 'session-error spare';
            }
            else if (typeof msg !== 'object')
                throw new Error("post_error expects a string or a jquery div");
            msg.addClass(errclass);
            dest.append(msg);
            this.show_error_area();
            ui_utils.on_next_tick(function() {
                ui_utils.scroll_to_after($("#session-info"));
            });
        }
        if(!logged) {
            if(typeof msg === 'object')
                msg = msg.text();
            console.log("pre-init post_error: " + msg);
        }
    },
    post_rejection: function(e) { // print exception on stack and then post to UI
        var msg = "";
        // bluebird will print the message for Chrome/Opera but no other browser
        if(!window.chrome && e.message)
            msg += "Error: " + e.message + "\n";
        msg += e.stack;
        console.log(msg);
        this.post_error(msg, undefined, true);
    }
};
