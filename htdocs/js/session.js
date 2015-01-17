(function() {

function append_session_info(text) {
    RCloud.UI.session_pane.append_text(text);
}

function handle_img(v) {
    var url = v[0], dims = v[1], page = v[2];
    var img = "<img width="+dims[0]+" height="+dims[1]+" src='"+url+"' />\n";
    if(curr_context_id_ && output_contexts_[curr_context_id_] && output_contexts_[curr_context_id_].out)
        output_contexts_[curr_context_id_].out(img);
    else
        append_session_info(img);
}

var output_contexts_ = {};
var curr_context_id_ = null, next_context_id_ = 17;

RCloud.register_output_context = function(callbacks) {
    output_contexts_[next_context_id_] = callbacks;
    return next_context_id_++;
};

RCloud.unregister_output_context = function(context_id) {
    delete output_contexts_[context_id];
};

function outputter(type) {
    return function(v) {
        if(curr_context_id_ && output_contexts_[curr_context_id_] && output_contexts_[curr_context_id_][type])
            output_contexts_[curr_context_id_][type](v[0]);
        else
            append_session_info(v);
    };
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
    "console.out": outputter('out'),
    "console.msg": outputter('msg'),
    "console.err": outputter('err'),
    "img.url.update": handle_img,
    "img.url.final": function() {},
    // "dev.close": , // sent when device closes - we don't really care in the UI I guess ...,
    "stdout": append_session_info,
    "stderr": append_session_info,
    // NOTE: "idle": ... can be used to handle idle pings from Rserve if we care ..
    "start.cell.output": function(context) {
        if(_.isArray(context)) context = context[0];
        curr_context_id_ = context;
        if(output_contexts_[context] && output_contexts_[context].start)
            output_contexts_[context].start();
    },
    "end.cell.output": function(context) {
        if(_.isArray(context)) context = context[0];
        if(context != curr_context_id_)
            console.log("unmatched context id: curr " + curr_context_id_ + ", end.cell.output " + context);
        RCloud.unregister_output_context(context);
        curr_context_id_ = null;
    },
    "html.out": outputter('html_out')
};

var on_data = function(v) {
    v = v.value.json();
    // FIXME: this is a temporary debugging to see all OOB calls irrespective of handlers
    console.log("OOB arrived: ['"+v[0]+"']");

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
        return rcloud.languages.get_list().then(function(lang_list) {
            RCloud.language._set_available_languages(_.omit(lang_list, 'r_type', 'r_attributes'));
        }).then(function() {
            return rcloud.init_client_side_data();
        });
    });
}

RCloud.session = {
    first_session_: true,
    listeners: [],
    // FIXME rcloud.with_progress is part of the UI.
    reset: function() {
        if (this.first_session_) {
            this.first_session_ = false;
            return RCloud.UI.with_progress(function() {});
        }
        this.listeners.forEach(function(listener) {
            listener.on_reset();
        });
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
