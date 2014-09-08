RCloud.UI.session_pane = {
    init: function() {
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

        var that = this;
        //////////////////////////////////////////////////////////////////////
        // bluebird unhandled promise handler
        Promise.onPossiblyUnhandledRejection(function(e, promise) {
            that.post_rejection(e);
        });

    },
    error_dest: function() {
        return this.error_dest_;
    },
    post_error: function(msg, dest) {
        var errclass = 'session-error';
        if (typeof msg === 'string') {
            msg = ui_utils.string_error(msg);
            errclass = 'session-error spare';
        }
        else if (typeof msg !== 'object')
            throw new Error("post_error expects a string or a jquery div");
        msg.addClass(errclass);
        dest = dest || this.error_dest_;
        dest.append(msg);
        this.show_error_area();
        ui_utils.on_next_tick(function() {
            ui_utils.scroll_to_after($("#session-info"));
        });
    },
    post_rejection: function(e) {
        // print exceptions/rejections
        var msg = "";
        // bluebird will print the message for Chrome/Opera but no other browser
        if(!window.chrome && e.message)
            msg += "Error: " + e.message + "\n";
        msg += e.stack;
        console.log(msg);
        this.post_error(msg);
    }
};
