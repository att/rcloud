(function() {

// FIXME this is just a proof of concept - using Rserve console OOBs
// FIXME this should use RCloud.session_pane
var append_session_info = function(msg) {
    if(!$('#session-info').length)
        return; // workaround for view mode
    // one hacky way is to maintain a <pre> that we fill as we go
    // note that R will happily spit out incomplete lines so it's
    // not trivial to maintain each output in some separate structure
    if (!document.getElementById("session-info-out"))
        $("#session-info").append($("<pre id='session-info-out'></pre>"));
    $("#session-info-out").append(msg);
    RCloud.UI.right_panel.collapse($("#collapse-session-info"), false);
    ui_utils.on_next_tick(function() {
        ui_utils.scroll_to_after($("#session-info"));
    });
};

// FIXME this needs to go away as well.
var oob_handlers = {
    "browsePath": function(v) {
        var url=" "+ window.location.protocol + "//" + window.location.host + v+" ";
        RCloud.UI.help_frame.display_href(url);
    },
    "pager": function(v) {
        var files = v[0], header = v[1], title = v[2];
        var html = "<h2>" + title + "</h2>\n";
        for(var i=0; i<files.length; ++i) {
            if(_.isArray(header) && header[i])
                html += "<h3>" + header[i] + "</h3>\n";
            html += "<pre>" + files[i] + "</pre>";
        }
        RCloud.UI.help_frame.display_content(html);
    },
    "editor": function(v) {
        // what is an object to edit, content is file content to edit
        var what = v[0], content = v[1], name = v[2];
        // FIXME: do somethign with it - eventually this
        // should be a modal thing - for now we shoudl at least
        // show the content ...
        append_session_info("what: "+ what + "\ncontents:" + content + "\nname: "+name+"\n");
    },
    "console.out": append_session_info,
    "console.msg": append_session_info,
    "console.err": append_session_info,
    "stdout": append_session_info,
    "stderr": append_session_info
    // NOTE: "idle": ... can be used to handle idle pings from Rserve if we care ..
};

var on_data = function(v) {
    v = v.value.json();
    if(oob_handlers[v[0]])
        oob_handlers[v[0]](v.slice(1));
};

function could_not_initialize_error(err) {
    var msg = "Could not initialize session. The GitHub backend might be down or you might have an invalid authorization token. (You could try clearing your cookies, for example).";
    if(err)
        msg += "<br />Error: " + err.toString();
    return msg;
}

function on_connect_anonymous_allowed(ocaps) {
    var promise;
    rcloud = RCloud.create(ocaps.rcloud);
    if (rcloud.authenticated) {
        promise = rcloud.session_init(rcloud.username(), rcloud.github_token());
    } else {
        promise = rcloud.anonymous_session_init();
    }
    return promise.catch(function(e) {
        RCloud.UI.fatal_dialog(could_not_initialize_error(e), "Logout", "/logout.R");
    });
}

function on_connect_anonymous_disallowed(ocaps) {
    rcloud = RCloud.create(ocaps.rcloud);
    if (!rcloud.authenticated) {
        return Promise.reject(new Error("Authentication required"));
    }
    return rcloud.session_init(rcloud.username(), rcloud.github_token());
}

function rclient_promise(allow_anonymous) {
    return new Promise(function(resolve, reject) {
        rclient = RClient.create({
            debug: false,
            host:  location.href.replace(/^http/,"ws").replace(/#.*$/,""),
            on_connect: function (ocaps) { resolve(ocaps); },
            on_data: on_data,
            on_error: function(error) {
                reject(error);
                return false;
            }
        });
        rclient.allow_anonymous_ = allow_anonymous;
    }).then(function(ocaps) {
        var promise = allow_anonymous ?
            on_connect_anonymous_allowed(ocaps) :
            on_connect_anonymous_disallowed(ocaps);
        return promise;
    }).then(function(hello) {
        if (!$("#output > .response").length)
            rclient.post_response(hello);
    }).catch(function(error) { // e.g. couldn't connect with github
        if(rclient)
            rclient.close();
        if (error.message === "Authentication required") {
            RCloud.UI.fatal_dialog("Your session has been logged out.", "Reconnect", "/login.R");
        } else {
            RCloud.UI.fatal_dialog(could_not_initialize_error(error), "Logout", "/logout.R");
        }
        throw error;
    }).then(function() {
        rcloud.display.set_device_pixel_ratio();
        rcloud.api.set_url(window.location.href);
        return rcloud.init_client_side_data();
    });
}

RCloud.session = {
    first_session_: true,
    // FIXME rcloud.with_progress is part of the UI.
    reset: function() {
        if (this.first_session_) {
            this.first_session_ = false;
            return RCloud.UI.with_progress(function() {});
        }
        // perhaps we need an event to listen on here
        $("#session-info").empty();
        $(".progress").hide();
        $("#file-upload-results").empty();
        return RCloud.UI.with_progress(function() {
            var anonymous = rclient.allow_anonymous_;
            rclient.close();
            return rclient_promise(anonymous);
        });
    }, init: function(allow_anonymous) {
        this.first_session_ = true;
        return rclient_promise(allow_anonymous);
    }
};

})();
