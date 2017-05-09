(function() {

function append_session_info(ctx, text) {
    // usually a punt because ctx is bad
    RCloud.UI.session_pane.append_text(text);
}

function invoke_context_callback(type /*, ... */) {
    var ctx = arguments[1];
    var args = Array.prototype.slice.call(arguments, 2);
    var context = output_contexts_[ctx];
    console.log("forward_to_context, ctx="+ctx+", type="+type+", old.ctx="+context);
    if(context && context[type]) {
        context[type].apply(context, args);
        return true;
    }
    else {
        append_session_info(ctx, args[0]);
        return false;
    }
}

function handle_img(msg, ctx, url, dims, device, page) {
    console.log("handle_img ", msg, " device ", device, " page ", page, " url ", url);
    if(!url)
        return;
    // note: we implement "plot stealing", where the last cell to modify a plot takes
    // the image from whatever cell it was in, simply by wrapping the plot in
    // a jquery object, and jquery selection.append removes it from previous parent
    var image = RCloud.UI.image_manager.update(url, dims, device, page);
    invoke_context_callback('selection_out', ctx, image.div());
}

var output_contexts_ = {};
var next_context_id_ = 17;

RCloud.register_output_context = function(callbacks) {
    output_contexts_[next_context_id_] = callbacks;
    return next_context_id_++;
};

RCloud.unregister_output_context = function(context_id) {
    delete output_contexts_[context_id];
};

RCloud.end_cell_output = function(context_id, error) {
    invoke_context_callback('end', context_id, error);
    RCloud.unregister_output_context(context_id);
};

function forward_to_context(type, has_continuation) {
    return function() {
        var res = invoke_context_callback.apply(null, [type].concat(Array.prototype.slice.call(arguments, 0)));
        if(!res && has_continuation)
            arguments[arguments.length-1]("context does not support input", null);
    };
}

// FIXME this needs to go away as well.
var oob_sends = {
    "browsePath": function(ctx, v) {
        var url=" "+ window.location.protocol + "//" + window.location.host + v+" ";
        RCloud.UI.help_frame.display_href(url);
    },
    "browseURL": function(ctx, v) {
        window.open(v, "_blank");
    },
    "pager": function(ctx, files, header, title) {
        var html = "<h2>" + title + "</h2>\n";
        for(var i=0; i<files.length; ++i) {
            if(_.isArray(header) && header[i])
                html += "<h3>" + header[i] + "</h3>\n";
            html += "<pre>" + files[i] + "</pre>";
        }
        RCloud.UI.help_frame.display_content(html);
    },
    "editor": function(ctx, what, content, name) {
        // what is an object to edit, content is file content to edit
        // FIXME: do somethign with it - eventually this
        // should be a modal thing - for now we should at least
        // show the content ...
        append_session_info('editor', "what: "+ what + "\ncontents:" + content + "\nname: "+name+"\n");
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
    "html.out": forward_to_context('html_out'),
    "deferred.result": forward_to_context('deferred_result'),
    compute_terminated: function() {
        RCloud.UI.fatal_dialog("Your compute session died. Reload the notebook and start a new session?", "Reload", function() {
            editor.load_notebook(shell.gistname(), shell.version());
        });
    }
};

function on_data(v) {
    v = v.value.json();
    // FIXME: this is a temporary debugging to see all OOB calls irrespective of handlers
    console.log("OOB send arrived: ['"+v[0]+"']" + (oob_sends[v[0]]?'':' (unhandled)'));

    if(oob_sends[v[0]])
        oob_sends[v[0]].apply(null, v.slice(1));
};

var oob_messages = {
    "console.in": forward_to_context('in', true)
};

function on_message(v, k) {
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

function build_on_connect_error_handler(redirect_url) {
      return function(error) {// e.g. couldn't connect with github
        if(window.rclient)
            rclient.close();
        if (error.message === "Authentication required") {
            if(RCloud.session.first_session_)
                window.location = ui_utils.relogin_uri(redirect_url);
            else
                RCloud.UI.fatal_dialog("Your session has been logged out.", "Reconnect", ui_utils.relogin_uri(redirect_url));
        } else {
            var msg = error.message || error.error || error;
            RCloud.UI.fatal_dialog(could_not_initialize_error(msg), "Logout", "/logout.R");
        }
        throw error;
    };
}

function rclient_promise(allow_anonymous, on_connect_error_handler) {
    return new Promise(function(resolve, reject) {
        rclient = RClient.create({
            debug: false,
            mode: "IDE",
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
    }).catch(on_connect_error_handler).then(function() {
        return Promise.all([
            rcloud.get_conf_value('exec.token.renewal.time').then(function(timeout) {
                if(timeout) {
                    timeout = timeout * 1000; // from sec to ms
                    var replacer = function() {
                        rcloud.replace_token($.cookies.get('execToken'), 'rcloud.exec').then(function(new_token) {
                            $.cookies.set('execToken', new_token);
                            setTimeout(replacer, timeout);
                        });
                    };
                    setTimeout(replacer, timeout);
                }
            }),
            rcloud.display.set_device_pixel_ratio(),
            rcloud.api.set_url(window.location.href),
            rcloud.languages.get_list().then(function(lang_list) {
                RCloud.language._set_available_languages(_.omit(lang_list, 'r_type', 'r_attributes'));
            }),
            RCloud.UI.image_manager.load_available_formats(),
            rcloud.init_client_side_data()
        ]);
    });
}

RCloud.session = {
    first_session_: true,
    listeners: [],
    // FIXME rcloud.with_progress is part of the UI.
    reset: function(redirect_url) {
        if (this.first_session_) {
            this.first_session_ = false;
            return RCloud.UI.with_progress(function() {});
        }
        this.listeners.forEach(function(listener) {
            listener.on_reset();
        });
        
        on_connect_error_handler = build_on_connect_error_handler(redirect_url);
        return RCloud.UI.with_progress(function() {
            var anonymous = rclient.allow_anonymous_;
            rclient.close();
            return rclient_promise(anonymous, on_connect_error_handler);
        });
    }, init: function(allow_anonymous, on_connect_error_handler) {
        this.first_session_ = true;
        on_connect_error_handler = build_on_connect_error_handler();
        return rclient_promise(allow_anonymous);
    },
    on_data: on_data,
    on_oob_message: on_message,
    invoke_context_callback: invoke_context_callback
};

})();
