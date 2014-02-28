RCloud = {};

RCloud.is_exception = function(v) {
    return _.isArray(v) && v.r_attributes && v.r_attributes['class'] === 'try-error';
};

RCloud.exception_message = function(v) {
    if (!RCloud.is_exception(v))
        throw new Error("Not an R exception value");
    return v[0];
};

RCloud.create = function(rcloud_ocaps) {
    //////////////////////////////////////////////////////////////////////////////
    // promisification

    function get(path) {
        var v = rcloud_ocaps;
        for (var i=0; i<path.length; ++i)
            v = v[path[i]];
        return v;
    }
    function set(path, val) {
        var v = rcloud_ocaps;
        for (var i=0; i<path.length-1; ++i)
            v = v[path[i]];
        v[path[path.length-1] + "Async"] = val;
    }
    function process_paths(paths) {
        _.each(paths, function(path) {
            set(path, rcloud_handler(Promise.promisify(get(path))));
        });
    }

    //////////////////////////////////////////////////////////////////////////////    
    function json_p(promise) {
        return promise.then(JSON.parse)
            .catch(function(e) {
                rclient.post_error(e.message);
                throw e;
            });
    }

    function rcloud_handler(promise_fn) {
        function success(result) {
            if (result && result.r_attributes &&
                result.r_attributes['class'] === "try-error") {
                throw result;
            }
            return result;
        }
        function failure(err) {
            if (RCloud.is_exception(err)) {
                rclient.post_error(err[0]);
            }
            throw err;
        }
        return function() {
            return promise_fn.apply(this, arguments).then(success).catch(failure);
        };
    }

    function rcloud_github_handler(command, promise) {
        function success(result) {
            if (result.ok) {
                return result.content;
            } else {
                throw result.content;
            }
        }
        function failure(err) {
            var message = _.isObject(err) && 'ok' in err
                ? err.content.message : err.toString();
            rclient.post_error(command + ': ' + message);
            throw err;
        }
        return promise.then(success).catch(failure);
    }

    // function rcloud_github_handler(command, promise) {
    //     function success(result) {
    //         if (result.r_attributes['class'] === "try-error") {
    //             throw result;
    //         }
    //         if (result.ok) {
    //             return result.content;
    //         } else {
    //             throw result.content;
    //         }
    //     }
    //     function failure(err) {
    //         if (RCloud.is_exception(err)) {
    //             rclient.post_error(err[0]);
    //         } else {
    //             var message = _.isObject(err) && 'ok' in err
    //                 ? err.content.message : err.toString();
    //             rclient.post_error(command + ': ' + message);
    //         }
    //         throw err;
    //     }
    //     return promise.then(success).catch(failure);
    // }

    var rcloud = {};

    function setup_unauthenticated_ocaps() {

        var paths = [
            ["anonymous_session_init"],
            ["prefix_uuid"],
            ["get_conf_value"],
            ["get_notebook"],
            ["load_notebook"],
            ["call_notebook"],
            ["install_notebook_stylesheets"],
            ["get_users"],
            ["log", "record_cell_execution"],
            ["setup_js_installer"],
            ["comments","get_all"],
            ["debug","raise"],
            ["stars","star_notebook"],
            ["stars","unstar_notebook"],
            ["stars","is_notebook_starred"],
            ["stars","get_notebook_star_count"],
            ["stars","get_multiple_notebook_star_counts"],
            ["stars","get_my_starred_notebooks"],
            ["session_cell_eval"],
            ["reset_session"],
            ["set_device_pixel_ratio"],
            ["api", "enable_echo"],
            ["api", "disable_echo"],
            ["api", "enable_warnings"],
            ["api", "disable_warnings"]
        ];
        process_paths(paths);

        rcloud.username = function() {
            return $.cookies.get('user');
        };
        rcloud.github_token = function() {
            return $.cookies.get('token');
        };

        rcloud.anonymous_session_init = function() {
            return rcloud_ocaps.anonymous_session_initAsync();
        };

        rcloud.init_client_side_data = function() {
            var that = this;
            return rcloud_ocaps.prefix_uuidAsync().then(function(v) {
                that.deferred_knitr_uuid = v;
            });
        };

        rcloud.get_conf_value = function(key) {
            return rcloud_ocaps.get_conf_valueAsync(key);
        };

        rcloud.get_notebook = function(id, version) {
            return rcloud_github_handler(
                "rcloud.get.notebook " + id,
                rcloud_ocaps.get_notebookAsync(id, version));
        };

        rcloud.load_notebook = function(id, version) {
            return rcloud_github_handler(
                "rcloud.load.notebook " + id,
                rcloud_ocaps.load_notebookAsync(id, version));
        };

        rcloud.call_notebook = function(id, version) {
            return rcloud_github_handler(
                "rcloud.call.notebook " + id,
                rcloud_ocaps.call_notebookAsync(id, version));
        };

        rcloud.install_notebook_stylesheets = function() {
            return rcloud_ocaps.install_notebook_stylesheetsAsync();
        };

        rcloud.get_users = function(user) {
            return rcloud_ocaps.get_usersAsync(user);
        };

        rcloud.record_cell_execution = function(cell_model) {
            var json_rep = JSON.stringify(cell_model.json());
            return rcloud_ocaps.log.record_cell_executionAsync(rcloud.username(), json_rep);
        };

        // javascript.R
        rcloud.setup_js_installer = function(v) {
            return rcloud_ocaps.setup_js_installerAsync(v);
        };

        // having this naked eval here makes me very nervous.
        rcloud.modules = {};
        rcloud.setup_js_installer({
            install_js: function(name, content, k) {
                try {
                    var result = eval(content);
                    rcloud.modules[name] = result;
                    k(null, result);
                } catch (e) {
                    k(e, null);
                }
            },
            clear_css: function(current_notebook, k) {
                $(".rcloud-user-defined-css").remove();
                k(null, null);
            },
            install_css: function(urls, k) {
                if (_.isString(urls))
                    urls = [urls];
                _.each(urls, function(url) {
                    $("head").append($('<link type="text/css" rel="stylesheet" class="rcloud-user-defined-css" href="' +
                                       url + '"/>'));
                });
                k(null, null);
            }
        });

        // notebook.comments.R
        rcloud.get_all_comments = function(id) {
            return rcloud_ocaps.comments.get_allAsync(id);
        };

        // debugging ocaps
        rcloud.debug = {};
        rcloud.debug.raise = function(msg) {
            return rcloud_ocaps.debug.raiseAsync(msg);
        };

        // stars
        rcloud.stars = {};
        rcloud.stars.is_notebook_starred = function(id) {
            return rcloud_ocaps.stars.is_notebook_starredAsync(id);
        };
        rcloud.stars.get_notebook_star_count = function(id) {
            return rcloud_ocaps.stars.get_notebook_star_countAsync(id);
        };
        rcloud.stars.get_multiple_notebook_star_counts = function(id) {
            return rcloud_ocaps.stars.get_multiple_notebook_star_countsAsync(id);
        };

        rcloud.session_cell_eval = function(filename, language, silent) {
            return rcloud_ocaps.session_cell_evalAsync(filename, language, silent);
        };

        rcloud.reset_session = function() {
            return rcloud_ocaps.reset_sessionAsync();
        };

        rcloud.display = {};
        var cached_device_pixel_ratio;
        rcloud.display.set_device_pixel_ratio = function() {
            cached_device_pixel_ratio = window.devicePixelRatio;
            return rcloud_ocaps.set_device_pixel_ratioAsync(window.devicePixelRatio);
        };
        rcloud.display.get_device_pixel_ratio = function() {
            return cached_device_pixel_ratio;
        };

        ////////////////////////////////////////////////////////////////////////////////
        // access the runtime API in javascript as well

        rcloud.api = {};
        rcloud.api.disable_warnings = function() {
            return rcloud_ocaps.api.disable_warningsAsync();
        };
        rcloud.api.enable_warnings = function() {
            return rcloud_ocaps.api.enable_warningsAsync();
        };
        rcloud.api.disable_echo = function() {
            return rcloud_ocaps.api.disable_echoAsync();
        };
        rcloud.api.enable_echo = function() {
            return rcloud_ocaps.api.enable_echoAsync();
        };
    }

    function setup_authenticated_ocaps() {
        var paths = [
            ["session_init"],
            ["search"],
            ["load_user_config"],
            ["load_multiple_user_configs"],
            ["save_user_config"],
            ["update_notebook"],
            ["create_notebook"],
            ["fork_notebook"],
            ["port_notebooks"],
            ["purl_source"],
            ["get_completions"],
            ["rename_notebook"],
            ["session_markdown_eval"],
            ["notebook_upload"],
            ["file_upload","upload_path"],
            ["file_upload","create"],
            ["file_upload","write"],
            ["file_upload","close"],
            ["comments","post"],
            ["is_notebook_published"],
            ["publish_notebook"],
            ["unpublish_notebook"],
            ["api","disable_warnings"],
            ["api","enable_echo"],
            ["api","disable_warnings"],
            ["api","enable_echo"]
        ];
        process_paths(paths);

        rcloud.session_init = function(username, token) {
            return rcloud_ocaps.session_initAsync(username, token);
        };
        rcloud.search = function(search_string) {
            return rcloud_ocaps.searchAsync(search_string);
        };
        rcloud.load_user_config = function(user) {
            return json_p(rcloud_ocaps.load_user_configAsync(user));
        };
        rcloud.load_multiple_user_configs = function(users) {
            return json_p(rcloud_ocaps.load_multiple_user_configsAsync(users));
        };
        rcloud.save_user_config = function(user, content) {
            return json_p(rcloud_ocaps.save_user_configAsync(user, JSON.stringify(content)));
        };
        rcloud.update_notebook = function(id, content) {
            return rcloud_github_handler(
                "rcloud.update.notebook",
                rcloud_ocaps.update_notebookAsync(id, JSON.stringify(content)));
        };
        rcloud.create_notebook = function(content) {
            return rcloud_github_handler(
                "rcloud.create.notebook", 
                rcloud_ocaps.create_notebookAsync(JSON.stringify(content)));
        };
        rcloud.fork_notebook = function(id) {
            return rcloud_github_handler(
                "rcloud.fork.notebook",
                rcloud_ocaps.fork_notebookAsync(id));
        };
        rcloud.port_notebooks = function(source, notebooks, prefix) {
            return rcloud_ocaps.port_notebooksAsync(source, notebooks, prefix);
        };
        rcloud.purl_source = function(source) {
            rcloud_ocaps.purl_sourceAsync(source);
        };

        rcloud.get_completions = function(text, pos) {
            return rcloud_ocaps.get_completionsAsync(text, pos)
                .then(function(comps) {
                    if (_.isString(comps))
                        comps = [comps]; // quirk of rserve.js scalar handling
                    // convert to the record format ace.js autocompletion expects
                    // meta is what gets displayed at right; name & score might be improved
                    return _.map(comps,
                                 function(comp) {
                                     return {meta: "local",
                                             name: "library",
                                             score: 3,
                                             value: comp
                                            };
                                 });
                });
        };

        rcloud.rename_notebook = function(id, new_name) {
            return rcloud_github_handler(
                "rcloud.rename.notebook",
                rcloud_ocaps.rename_notebookAsync(id, new_name));
        };
        rcloud.session_markdown_eval = function(command, language, silent) {
            return rcloud_ocaps.session_markdown_evalAsync(command, language, silent);
        };

        // FIXME make into promises
        rcloud.upload_to_notebook = function(force, k) {
            k = k || _.identity;
            var on_success = function(v) { k(null, v); };
            var on_failure = function(v) { k(v, null); };

            function do_upload(file) {
                var fr = new FileReader();
                var chunk_size = 1024*1024;
                var f_size = file.size;
                var file_to_upload = new Uint8Array(f_size);
                var bytes_read = 0;
                var cur_pos = 0;
                $(".progress").show();
                $("#progress-bar").css("width", "0%");
                $("#progress-bar").attr("aria-valuenow", "0");
                fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                fr.onload = function(e) {
                    $("#progress-bar").attr("aria-valuenow", ~~(100 * (bytes_read / f_size)));
                    $("#progress-bar").css("width", (100 * (bytes_read / f_size)) + "%");
                    if (e.target.result.byteLength > 0) {
                        // still sending data to user agent
                        var bytes = new Uint8Array(e.target.result);
                        file_to_upload.set(bytes, cur_pos);
                        cur_pos += bytes.byteLength;
                        bytes_read += e.target.result.byteLength;
                        fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                    } else {
                        // done, push to notebook.
                        rcloud_ocaps.notebook_upload(
                            file_to_upload.buffer, file.name, function(err, result) {
                                if (err) {
                                    on_failure(err);
                                } else {
                                    on_success([file_to_upload, file, result.content]);
                                }
                            });
                    }
                };
            }
            if(!(window.File && window.FileReader && window.FileList && window.Blob))
                throw new Error("File API not supported by browser.");
            var file=$("#file")[0].files[0];
            if(_.isUndefined(file))
                throw new Error("No file selected!");

            rcloud_ocaps.file_upload.upload_path(function(err, path) {
                if (err) {
                    throw err;
                }
                var file=$("#file")[0].files[0];
                if(_.isUndefined(file))
                    throw new Error("No file selected!");
                do_upload(file);
            });
        };

        // FIXME make into promises
        rcloud.upload_file = function(force, k) {
            k = k || _.identity;
            var on_success = function(v) { k(null, v); };
            var on_failure = function(v) { k(v, null); };

            function do_upload(path, file) {
                var upload_name = path + '/' + file.name;
                rcloud_ocaps.file_upload.create(upload_name, force, function(err, result) {
                    debugger;
                    if (RCloud.is_exception(result)) {
                        on_failure(RCloud.exception_message(result));
                        return;
                    }
                    var fr = new FileReader();
                    var chunk_size = 1024*1024;
                    var f_size=file.size;
                    var cur_pos=0;
                    var bytes_read = 0;
                    $(".progress").show();
                    $("#progress-bar").css("width", "0%");
                    $("#progress-bar").attr("aria-valuenow", "0");
                    //initiate the first chunk, and then another, and then another ...
                    // ...while waiting for one to complete before reading another
                    fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                    fr.onload = function(e) {
                        $("#progress-bar").attr("aria-valuenow", ~~(100 * (bytes_read / f_size)));
                        $("#progress-bar").css("width", (100 * (bytes_read / f_size)) + "%");
                        if (e.target.result.byteLength > 0) {
                            var bytes = new Uint8Array(e.target.result);
                            rcloud_ocaps.file_upload.write(bytes.buffer, function() {
                                bytes_read += e.target.result.byteLength;
                                cur_pos += chunk_size;
                                fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                            });
                        } else {
                            rcloud_ocaps.file_upload.close(function(err, result){
                                if (err) {
                                    on_failure(err);
                                } else {
                                    on_success([path, file]);
                                }
                            });
                        }
                    };
                });
            }

            if(!(window.File && window.FileReader && window.FileList && window.Blob))
                throw "File API not supported by browser.";
            else {
                var file=$("#file")[0].files[0];
                if(_.isUndefined(file))
                    throw "No file selected!";
                else {
                    /*FIXME add logged in user */
                    rcloud_ocaps.file_upload.upload_path(function(err, path) {
                        if (err) throw err;
                        var file=$("#file")[0].files[0];
                        if(_.isUndefined(file))
                            throw new Error("No file selected!");
                        do_upload(path, file);
                    });
                }
            }
        };

        rcloud.post_comment = function(id, content) {
            return rcloud_ocaps.comments.postAsync(id, content);
        };

        // publishing notebooks
        rcloud.is_notebook_published = function(id) {
            return rcloud_ocaps.is_notebook_publishedAsync(id);
        };

        rcloud.publish_notebook = function(id) {
            return rcloud_ocaps.publish_notebookAsync(id);
        };
        rcloud.unpublish_notebook = function(id) {
            return rcloud_ocaps.unpublish_notebookAsync(id);
        };

        // stars
        rcloud.stars = {};
        rcloud.stars.star_notebook = function(id) {
            return rcloud_ocaps.stars.star_notebookAsync(id);
        };
        rcloud.stars.unstar_notebook = function(id) {
            return rcloud_ocaps.stars.unstar_notebookAsync(id);
        };
        rcloud.stars.is_notebook_starred = function(id) {
            return rcloud_ocaps.stars.is_notebook_starredAsync(id);
        };
        rcloud.stars.get_notebook_star_count = function(id) {
            return rcloud_ocaps.stars.get_notebook_star_countAsync(id);
        };
        rcloud.stars.get_multiple_notebook_star_counts = function(ids) {
            return rcloud_ocaps.stars.get_multiple_notebook_star_countsAsync(ids);
        };
        rcloud.stars.get_my_starred_notebooks = function() {
            return rcloud_ocaps.stars.get_my_starred_notebooksAsync();
        };

    }

    rcloud.authenticated = rcloud_ocaps.authenticated;
    setup_unauthenticated_ocaps();
    if (rcloud.authenticated)
        setup_authenticated_ocaps();

    //////////////////////////////////////////////////////////////////////////
    // Progress indication

    // FIXME this doesn't feel like it belongs on rcloud, but then again,
    // where would it?

    var progress_dialog;
    var progress_counter = 0;
    var allowed = 1;
    var curtains_on = false;

    function set_curtain() {
        if (curtains_on)
            return;
        curtains_on = true;
        if (_.isUndefined(progress_dialog)) {
            progress_dialog = $('<div id="progress-dialog" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-body">Please wait...</div></div></div>');
            $("body").append(progress_dialog);
        }
        progress_dialog.modal({keyboard: true});
    }
    function clear_curtain() {
        if (!curtains_on)
            return;
        curtains_on = false;
        progress_dialog.modal('hide');
    }
    function set_cursor() {
        _.delay(function() {
            document.body.style.cursor = "wait";
        }, 0);
    }
    function clear_cursor() {
        _.delay(function() {
            document.body.style.cursor = '';
        }, 0);
    }
    rcloud.with_progress = function(thunk, delay) {
        if (_.isUndefined(delay))
            delay = 2000;
        set_cursor();
        function done() {
            progress_counter -= 1;
            if (progress_counter === 0) {
                clear_cursor();
                clear_curtain();
            }
        }
        _.delay(function() {
            if (progress_counter > 0 && allowed > 0)
                set_curtain();
        }, delay);
        progress_counter += 1;
        return Promise.cast(done).then(thunk);
    };
    rcloud.prevent_progress_modal = function() {
        if (allowed === 1) {
            if (progress_counter > 0) {
                clear_cursor();
                clear_curtain();
            }
        }
        allowed -= 1;
    };
    rcloud.allow_progress_modal = function() {
        if (allowed === 0) {
            if (progress_counter > 0) {
                set_cursor();
                set_curtain();
            }
        }
        allowed += 1;
    };

    return rcloud;
};
