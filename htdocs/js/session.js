RCloud.session = {
    first_session_: true,
    // FIXME rcloud.with_progress is part of the UI.
    reset: function() {
        if (this.first_session_) {
            this.first_session_ = false;
            return rcloud.with_progress();
        } else {
            return rcloud.with_progress(function(done) {
                rclient.close();
                // FIXME this is a bit of an annoying duplication of code on main.js and view.js
                return new Promise(function(resolve, reject) {
                    rclient = RClient.create({
                        debug: rclient.debug,
                        host: rclient.host,
                        on_connect: function(ocaps) {
                            rcloud = RCloud.create(ocaps.rcloud);
                            rcloud.session_init(rcloud.username(), rcloud.github_token());
                            rcloud.display.set_device_pixel_ratio();

                            resolve(rcloud.init_client_side_data().then(function() {
                                $("#output").find(".alert").remove();
                                return done;
                            }));
                        },
                        on_error: function(error) {
                            // if we fail to reconnect we still want
                            // to reject the promise so with_progress can continue.
                            if (!rclient.running) {
                                reject(done);
                            }
                            return false;
                        },
                        on_data: function(v) {
                            v = v.value.json();
                            oob_handlers[v[0]] && oob_handlers[v[0]](v.slice(1));
                        }
                    });
                });
            });
        }
    }, init: function() {
        this.first_session_ = true;
        function getURLParameter(name) {
            return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
        }

        // return rcloud.with_progress(function(done) {
            return new Promise(function(resolve, reject) {
                rclient = RClient.create({
                    debug: false,
                    host:  location.href.replace(/^http/,"ws").replace(/#.*$/,""),
                    on_connect: function(ocaps) {
                        rcloud = RCloud.create(ocaps.rcloud);
                        if (!rcloud.authenticated) {
                            rclient.post_error(rclient.disconnection_error("Please login first!"));
                            rclient.close();
                            return;
                        }
                        rcloud.session_init(rcloud.username(), rcloud.github_token()).then(function(hello) {
                            rclient.post_response(hello);
                        });
                        rcloud.display.set_device_pixel_ratio();

                        $(".collapse").collapse();

                        shell.init();
                        var notebook = null, version = null;
                        if (location.search.length > 0) {
                            notebook = getURLParameter("notebook");
                            version = getURLParameter("version");
                        }
                        editor.init(notebook, version);
                        /*
                         // disabling navigation for now - concurrency issues
                         window.addEventListener("popstate", function(e) {
                         if(e.state === "rcloud.notebook") {
                         var notebook2 = getURLParameter("notebook");
                         var version2 = getURLParameter("version");
                         editor.load_notebook(notebook2, version2, true, false);
                         }
                         });
                         */ 
                        resolve(rcloud.init_client_side_data()); //.return(done));
                    },
                    // on_error: function(error) {
                    //     // if we fail to connect we want
                    //     // to reject the promise so with_progress can be cleaned up.
                    //     if (!rclient.running) {
                    //         reject(done);
                    //     }
                    //     return false;
                    // },
                    on_data: function(v) {
                        v = v.value.json();
                        oob_handlers[v[0]] && oob_handlers[v[0]](v.slice(1));
                    }
                });
            });
        // });
        
    }
};
