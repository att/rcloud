function main() {
    function getURLParameter(name) {
        var urlParam;
        if(name == "notebook" && location.href.indexOf("html") == -1){
            urlParam = location.href.split("/").pop().split("?")[0]
        }
        else {
            urlParam = decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
        }
        return urlParam;
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

            var notebook = getURLParameter("notebook"),
                version = getURLParameter("version");
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
}