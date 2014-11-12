(function() {

function append_session_info(text) {
    RCloud.UI.session_pane.append_text(text);
}

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
    var promise_c, promise_s;
    rcloud = RCloud.create(ocaps.rcloud);
    
    if (rcloud.authenticated) {
        promise_c = rcloud.compute_init(rcloud.username(), rcloud.github_token());
        promise_s = rcloud.session_init(rcloud.username(), rcloud.github_token());
    } else {
        promise_c = rcloud.anonymous_compute_init();
        promise_s = rcloud.anonymous_session_init();
    }

    promise_c.catch(function(e) {
        RCloud.UI.fatal_dialog(could_not_initialize_error(e), "Logout", "/logout.R");
    });

    promise_s.catch(function(e) {
        RCloud.UI.fatal_dialog(could_not_initialize_error(e), "Logout", "/logout.R");
    });

    // returns a promise covering both - note that the side-effect is that
    // way down the food chain there will be an array of results
    // from both
    return Promise.all([promise_c, promise_s]);
}

function on_connect_anonymous_disallowed(ocaps) {
    rcloud = RCloud.create(ocaps.rcloud);
    if (!rcloud.authenticated) {
        return Promise.reject(new Error("Authentication required"));
    }

    var res_c = rcloud.compute_init(rcloud.username(), rcloud.github_token());
    var res_s = rcloud.session_init(rcloud.username(), rcloud.github_token());

    return Promise.all([res_c, res_s]);
}

function rclient_promise(allow_anonymous) {
    var params = '';
    if(location.href.indexOf("?") > 0)
        params = location.href.substr(location.href.indexOf("?")) ;
    return new Promise(function(resolve, reject) {
        rclient = RClient.create({
            debug: false,
            host:  location.href.replace(/^http/,"ws").replace(/#.*$/,""),
            on_connect: function (ocaps) {
                resolve(ocaps);
            },
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
        if(window.rclient)
            rclient.close();
        if (error.message === "Authentication required") {
            RCloud.UI.fatal_dialog("Your session has been logged out.", "Reconnect", "/login.R" + params);
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
        RCloud.UI.session_pane.clear();
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
