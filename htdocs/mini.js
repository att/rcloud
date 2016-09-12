function main() {
    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    function getQueryArgs() {
        var r, res = {}, s = location.search;
        while ((r = (new RegExp('[?|&]([^=&]+?)=([^&;#]+)(.*)').exec(s))) !== null) {
            res[decodeURIComponent(r[1])] = decodeURIComponent(r[2]);
            s = r[3];
        }
        return res;
    }

    if(ui_utils.is_ie()) {
        RCloud.UI.fatal_dialog("Sorry, RCloud does not currently support IE or Edge. Please try another browser.", "Close");
        return;
    }
    RCloud.UI.session_pane.init(); // really should be error logger which detects if there is a pane

    rclient = RClient.create({
        debug: false,
        mode: "client", // "IDE" = edit (separated), "call" = API (one process), "client" = JS (currently one process but may change)
        host: location.href.replace(/^http/,"ws").replace(/#.*$/,""),
        on_connect: function(ocaps) {
            rcloud = RCloud.create(ocaps.rcloud);
            var promise;

            if (rcloud.authenticated) {
                promise = rcloud.session_init(rcloud.username(), rcloud.github_token());
            } else {
                promise = rcloud.anonymous_session_init();
            }

            promise = promise.then(function(hello) {
                rclient.post_response(hello);
            });

            promise = promise.then(RCloud.UI.image_manager.load_available_formats);

            var notebook = getURLParameter("notebook"),
                version = getURLParameter("version");
            if (notebook === null && getURLParameter("user")) {
                var path = getURLParameter("path"), user = getURLParameter("user");
                promise = promise.then(function() {
                    return rcloud.get_notebook_by_name(path, user);
                }).then(function(result) {
                    if(!result)
                        throw new Error('Notebook "' + path + '" (user ' + user + ') not found');
                    notebook = result[0];
                });
            }
            var tag = getURLParameter("tag");
            if(!version && tag) {
                promise = promise.then(function() {
                    return rcloud.get_version_by_tag(notebook, tag)
                        .then(function(v) {
                            version = v;
                        });
                });
            };
            promise = promise.then(function() {
                return rcloud.call_notebook(notebook, version).then(function(x) {
                    // FIXME: I'm not sure what's the best way to make this available
                    // in a convenient manner so that notebooks can leverage it ...
                    window.notebook_result = x;
                    if (!_.isUndefined(x.body)) $("body").append(x.body);
                    if (_.isFunction(x.run)) x.run(getQueryArgs(), function() {});
                });
            });
            return true;
        },
        on_data: RCloud.session.on_data,
        on_oob_message: RCloud.session.on_oob_message,
        on_error: function(msg, status_code) {
            // debugger;
            if (msg == 'Login failed. Shutting down!') {
                window.location =
                    (window.location.protocol +
                     '//' + window.location.host +
                     '/login.R?redirect=' +
                     encodeURIComponent(window.location.pathname + window.location.search));
                return true;
            } else
                return false;
        }
    });
}

