(function() {

function append_session_info(text) {
    RCloud.UI.session_pane.append_text(text);
}

function handle_img(msg, url, dims, device, page) {
    console.log("handle_img ", msg, " device ", device, " page ", page, " url ", url);
    if(!url)
        return;
    var k;
    if(curr_context_id_ && output_contexts_[curr_context_id_] && output_contexts_[curr_context_id_].html_out)
        k = function(img) {
            output_contexts_[curr_context_id_].selection_out(img);
        };
    else
        k = function(img) {
            append_session_info(img);
        };
    RCloud.UI.image_manager.update(url, dims, device, page, k);
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

function forward_to_context(type, has_continuation) {
    return function() {
        var context = output_contexts_[curr_context_id_];
        if(curr_context_id_ && context && context[type])
            context[type].apply(context, arguments);
        else {
            append_session_info.apply(null, arguments);
            if(has_continuation)
                arguments[arguments.length-1]("context does not support input", null);
        }
    };
}

// FIXME this needs to go away as well.
var oob_sends = {
    "browsePath": function(v) {
        var url=" "+ window.location.protocol + "//" + window.location.host + v+" ";
        RCloud.UI.help_frame.display_href(url);
    },
    "pager": function(files, header, title) {
        var html = "<h2>" + title + "</h2>\n";
        for(var i=0; i<files.length; ++i) {
            if(_.isArray(header) && header[i])
                html += "<h3>" + header[i] + "</h3>\n";
            html += "<pre>" + files[i] + "</pre>";
        }
        RCloud.UI.help_frame.display_content(html);
    },
    "editor": function(what, content, name) {
        // what is an object to edit, content is file content to edit
        // FIXME: do somethign with it - eventually this
        // should be a modal thing - for now we should at least
        // show the content ...
        append_session_info("what: "+ what + "\ncontents:" + content + "\nname: "+name+"\n");
    },
    "console.out": forward_to_context('out'),
    "console.msg": forward_to_context('msg'),
    "console.err": forward_to_context('err'),
    "img.url.update": handle_img.bind(null, 'img.url.update'),
    "img.url.final": handle_img.bind(null, 'img.url.final'),
    // "dev.close": , // sent when device closes - we don't really care in the UI I guess ...,
    "stdout": append_session_info,
    "stderr": append_session_info,
    // NOTE: "idle": ... can be used to handle idle pings from Rserve if we care ..
    "start.cell.output": function(context) {
        curr_context_id_ = context;
        if(output_contexts_[context] && output_contexts_[context].start)
            output_contexts_[context].start();
    },
    "end.cell.output": function(context) {
        if(context != curr_context_id_)
            console.log("unmatched context id: curr " + curr_context_id_ + ", end.cell.output " + context);
        if(output_contexts_[context] && output_contexts_[context].end)
            output_contexts_[context].end();
        RCloud.unregister_output_context(context);
        curr_context_id_ = null;
    },
    "html.out": forward_to_context('html_out')
};

var on_data = function(v) {
    v = v.value.json();
    // FIXME: this is a temporary debugging to see all OOB calls irrespective of handlers
    console.log("OOB send arrived: ['"+v[0]+"']" + (oob_sends[v[0]]?'':' (unhandled)'));

    if(oob_sends[v[0]])
        oob_sends[v[0]].apply(null, v.slice(1));
};

var oob_messages = {
    "console.in": forward_to_context('in', true)
};

var on_message = function(v, k) {
    v = v.value.json();
    console.log("OOB message arrived: ['"+v[0]+"']" + (oob_messages[v[0]]?'':' (unhandled)'));
    if(oob_messages[v[0]]) {
        v.push(k);
        oob_messages[v[0]].apply(null, v.slice(1));
    }
    else
        k('unhandled', null);
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
            on_oob_message: on_message,
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
