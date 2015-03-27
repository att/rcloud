$(function () {
    window.fiddle = {
        call_notebook: function(notebook) {
            //if(args === undefined) {
            //    args = {};
            //}
            //args.cookies = document.cookie;
            //args.redirecturl = window.location.pathname;

            return new Promise(function(resolve,reject) {
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
                        promise.then(function(hello) {
                            rclient.post_response(hello);
                        });

                        // resolve(rcloud.init_client_side_data()); // what was this for?!?
             
                        version = null;
                        rcloud.call_notebook(notebook, version).then(function(x) {
                            resolve(x);
                        });
                    }, 
                    on_error: function(msg, status_code) {
                        // debugger;
                        if (msg == 'Login failed. Shutting down!') {
                            window.location =
                                (window.location.protocol +
                                '//' + window.location.host +
                                '/login.R?redirect=' +
                                encodeURIComponent(window.location.pathname + window.location.search));
                                reject(new Error(msg));
                        } else reject(new Error(msg));
                    }
                });
            });
        }
    }
});