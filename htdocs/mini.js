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

    rclient = RClient.create({
        debug: false,
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

            // resolve(rcloud.init_client_side_data()); // what was this for?!?

            var notebook = getURLParameter("notebook"),
                version = getURLParameter("version");
            var tag = getURLParameter("tag");
            var versiontotag = false;
            if(!version && tag) {
                promise = promise.then(function() {
                    return rcloud.get_version_by_tag(notebook, tag)
                        .then(function(v) {
                            version = v;
                        });
                });
            }
            else if(version && !tag) {
                promise = promise.then(function () {
                    return rcloud.get_tag_by_version(notebook, version)
                        .then(function (t) {
                            tag = t;
                            if (tag)
                                versiontotag = true;
                        });
                })
            };
            promise = promise.then(function() {
                if(versiontotag) {
                    var opts = {notebook: notebook, version: version, tag: tag};
                    update_mini_url(opts);
                }
                return rcloud.call_notebook(notebook, version).then(function(x) {
                    // FIXME: I'm not sure what's the best way to make this available
                    // in a convenient manner so that notebooks can leverage it ...
                    window.notebook_result = x;
                    if (!_.isUndefined(x.body)) $("body").append(x.body);
                    if (_.isFunction(x.run)) x.run(getQueryArgs(), function() {});
                });
            });
            return true;
        }, on_error: function(msg, status_code) {
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
    var make_mini_url = ui_utils.url_maker('mini.html');
    function update_mini_url(opts) {
        var url = make_mini_url(opts);
        window.history.replaceState("rcloud.notebook", null, url);
        rcloud.api.set_url(url);
    }
}

