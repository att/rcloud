RClient = {
    create: function(opts) {
        opts = _.defaults(opts, {
            debug: false
        });
        function on_connect() {
            if (!rserve.ocap_mode) {
                result.post_error(result.disconnection_error("Expected an object-capability Rserve. Shutting Down!"));
                shutdown();
                return;
            }

            // the rcloud ocap-0 performs the login authentication dance
            // success is indicated by the rest of the capabilities being sent
            rserve.ocap([token, execToken], function(err, ocaps) {
                ocaps = Promise.promisifyAll(ocaps);
                if (ocaps !== null) {
                    result.running = true;
                    opts.on_connect && opts.on_connect.call(result, ocaps);
                } else {
                    on_error("Login failed. Shutting down!");
                }
            });
        }

        // this might be called multiple times; some conditions result
        // in on_error and on_close both being called.
        function shutdown() {
            if (!clean) {
                $("#input-div").hide();
            }
            if (!rserve.closed)
                rserve.close();
        }

        function on_error(msg, status_code) {
            if (opts.debug) {
                debugger;
            }
            if (opts.on_error && opts.on_error(msg, status_code))
                return;
            result.post_error(result.disconnection_error(msg));
            shutdown();
        }

        function on_close(msg) {
            if (opts.debug) {
                debugger;
            }
            if (!clean) {
                result.post_error(result.disconnection_error("Socket was closed. Goodbye!"));
                shutdown();
            }
        };
        // detect where we will show errors

        var error_dest_ = $("#session-info");
        var show_error_area;
        if(error_dest_.length)
            show_error_area = function() {
                RCloud.UI.right_panel.collapse($("#collapse-session-info"), false);
            };
        else {
            error_dest_ = $("#output");
            show_error_area = function() {};
        }

        var token = $.cookies.get().token;  // document access token
        var execToken = $.cookies.get().execToken; // execution token (if enabled)
        var rserve = Rserve.create({
            host: opts.host,
            on_connect: on_connect,
            on_error: on_error,
            on_close: on_close,
            on_data: opts.on_data
        });

        var result;
        var clean = false;

        result = {
            _rserve: rserve,
            host: opts.host,
            running: false,

            //////////////////////////////////////////////////////////////////
            // FIXME: all of this should move out of rclient and into
            // the notebook objects.

            string_error: function(msg) {
                var button = $("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>");
                var result = $("<div class='alert alert-danger alert-dismissable'></div>");
                var text = $("<span></span>");
                result.append(button);
                result.append(text);
                text.text(msg);
                return result;
            },

            disconnection_error: function(msg, label) {
                var result = $("<div class='alert alert-danger'></div>");
                result.append($("<span></span>").text(msg));
                label = label || "Reconnect";
                var button = $("<button type='button' class='close'>" + label + "</button>");
                result.append(button);
                button.click(function() {
                    window.location =
                        (window.location.protocol +
                         '//' + window.location.host +
                         '/login.R?redirect=' +
                         encodeURIComponent(window.location.pathname + window.location.search));
                });
                return result;
            },

            post_error: function (msg, dest) {
                if (typeof msg === 'string')
                    msg = this.string_error(msg);
                if (typeof msg !== 'object')
                    throw new Error("post_error expects a string or a jquery div");
                msg.css("margin", "-15px"); // hack
                dest = dest || error_dest_;
                dest.append(msg);
                show_error_area();
            },

            post_response: function (msg) {
                var d = $("<pre class='response'></pre>").html(msg);
                $("#output").append(d);
                window.scrollTo(0, document.body.scrollHeight);
            },

            post_rejection: function(e) {
                rclient.post_error(e.message);
                throw e;
            },

            close: function() {
                clean = true;
                shutdown();
            }
        };
        return result;
    }
};
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
            var fn = get(path);
            set(path, fn ? rcloud_handler(path.join('.'), Promise.promisify(fn)) : null);
        });
    }

    //////////////////////////////////////////////////////////////////////////////
    function json_p(promise) {
        return promise.then(JSON.parse)
            .catch(rclient.post_rejection);
    }

    function rcloud_handler(command, promise_fn) {
        function success(result) {
            if(result && RCloud.is_exception(result)) {
                throw new Error(command + ": " + result[0]);
            }
            return result;
        }

        function failure(err) {
            if(err.message) {
                rclient.post_error(err.message);
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
                throw new Error(command + ': ' + result.content.message);
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
            ["api", "disable_warnings"],
            ["api", "set_url"],
            ["api", "get_url"]
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

        rcloud.get_users = function() {
            return rcloud_ocaps.get_usersAsync();
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
        rcloud.api.set_url = function(url) {
            return rcloud_ocaps.api.set_urlAsync(url);
        };
        rcloud.api.get_url = function() {
            return rcloud_ocaps.api.get_urlAsync();
        };
    }

    function setup_authenticated_ocaps() {
        var paths = [
            ["session_init"],
            ["search"],
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
            ["set_notebook_visibility"],
            ["api","disable_warnings"],
            ["api","enable_echo"],
            ["api","disable_warnings"],
            ["api","enable_echo"],
            ["config", "all_notebooks"],
            ["config", "all_notebooks_multiple_users"],
            ["config", "add_notebook"],
            ["config", "remove_notebook"],
            ["config", "get_current_notebook"],
            ["config", "set_current_notebook"],
            ["config", "new_notebook_number"],
            ["config", "get_recent_notebooks"],
            ["config", "set_recent_notebook"],
            ["config", "clear_recent_notebook"],
            ["config", "get_user_option"],
            ["config", "set_user_option"],
            ["get_notebook_info"],
            ["get_multiple_notebook_infos"],
            ["set_notebook_info"]
        ];
        process_paths(paths);

        rcloud.session_init = function(username, token) {
            return rcloud_ocaps.session_initAsync(username, token);
        };

        rcloud.update_notebook = function(id, content) {
            return rcloud_github_handler(
                "rcloud.update.notebook",
                rcloud_ocaps.update_notebookAsync(id, JSON.stringify(content)));
        };

        rcloud.search = rcloud_ocaps.searchAsync; // may be null

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
                throw new Error("File API not supported by browser.");
            else {
                var file=$("#file")[0].files[0];
                if(_.isUndefined(file))
                    throw new Error("No file selected!");
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

        rcloud.set_notebook_visibility = function(id, value) {
            return rcloud_ocaps.set_notebook_visibilityAsync(id, value);
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

        // config
        rcloud.config = {
            all_notebooks: rcloud_ocaps.config.all_notebooksAsync,
            all_notebooks_multiple_users: rcloud_ocaps.config.all_notebooks_multiple_usersAsync,
            add_notebook: rcloud_ocaps.config.add_notebookAsync,
            remove_notebook: rcloud_ocaps.config.remove_notebookAsync,
            get_current_notebook: rcloud_ocaps.config.get_current_notebookAsync,
            set_current_notebook: rcloud_ocaps.config.set_current_notebookAsync,
            new_notebook_number: rcloud_ocaps.config.new_notebook_numberAsync,
            get_recent_notebooks: rcloud_ocaps.config.get_recent_notebooksAsync,
            set_recent_notebook: rcloud_ocaps.config.set_recent_notebookAsync,
            clear_recent_notebook: rcloud_ocaps.config.clear_recent_notebookAsync,
            get_user_option: rcloud_ocaps.config.get_user_optionAsync,
            set_user_option: rcloud_ocaps.config.set_user_optionAsync
        };

        // notebook cache
        rcloud.get_notebook_info = rcloud_ocaps.get_notebook_infoAsync;
        rcloud.get_multiple_notebook_infos = rcloud_ocaps.get_multiple_notebook_infosAsync;
        rcloud.set_notebook_info = function(id, info) {
            if(!info.username) return Promise.reject("attempt to set info no username");
            if(!info.description) return Promise.reject("attempt to set info no description");
            if(!info.last_commit) return Promise.reject("attempt to set info no last_commit");
            return rcloud_ocaps.set_notebook_infoAsync(id, info);
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
var ui_utils = {};

ui_utils.fa_button = function(which, title, classname, style)
{
    var icon = $.el.i({'class': which});
    var span = $.el.span({'class': 'fontawesome-button ' + (classname || '')},
                         icon);
    if(style) {
        for (var k in style)
            icon.style[k] = style[k];
    }
    // $(icon).css(style);
    return $(span).tooltip({
        title: title,
        delay: { show: 250, hide: 0 }
    });
};

ui_utils.enable_fa_button = function(el) {
    el.removeClass("button-disabled");
};

ui_utils.disable_fa_button = function(el) {
    el.addClass("button-disabled");
};

ui_utils.enable_bs_button = function(el) {
    el.removeClass("disabled");
};

ui_utils.disable_bs_button = function(el) {
    el.addClass("disabled");
};


ui_utils.ace_editor_height = function(widget, min_rows, max_rows)
{
    min_rows = _.isUndefined(min_rows) ? 0  : min_rows;
    max_rows = _.isUndefined(max_rows) ? 30 : max_rows;
    var lineHeight = widget.renderer.lineHeight;
    var rows = Math.max(min_rows, Math.min(max_rows, widget.getSession().getLength()));
    var newHeight = lineHeight*rows + widget.renderer.scrollBar.getWidth();
    return Math.max(75, newHeight);
    /*
     // patch to remove tooltip when button clicked
     // (not needed anymore with later jquery?)
    var old_click = span.click;
    span.click = function() {
        $(this).tooltip('hide');
        old_click.apply(this, arguments);
    };
     */
};

ui_utils.ace_set_pos = function(widget, row, column) {
    var sel = widget.getSelection();
    var range = sel.getRange();
    range.setStart(row, column);
    range.setEnd(row, column);
    sel.setSelectionRange(range);
};

ui_utils.install_common_ace_key_bindings = function(widget) {
    var Autocomplete = require("ace/autocomplete").Autocomplete;
    var session = widget.getSession();

    widget.commands.addCommands([
        {
            name: 'another autocomplete key',
            bindKey: 'Ctrl-.',
            exec: Autocomplete.startCommand.exec
        },
        {
            name: 'disable gotoline',
            bindKey: {
                win: "Ctrl-L",
                mac: "Command-L"
            },
            exec: function() { return false; }
        }, {
            name: 'execute-selection-or-line',
            bindKey: {
                win: 'Alt-Return',
                mac: 'Alt-Return',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                var code = session.getTextRange(widget.getSelectionRange());
                if(code.length==0) {
                    var pos = widget.getCursorPosition();
                    var Range = require('ace/range').Range;
                    var range = new Range(pos.row, 0, pos.row+1, 0);
                    code = session.getTextRange(range);
                }
                shell.new_interactive_cell(code, true);
            }
        }
    ]);
};

ui_utils.character_offset_of_pos = function(widget, pos) {
    // surprising this is not built-in.  this adapted from
    // https://groups.google.com/forum/#!msg/ace-discuss/-RVHHWZGkk8/blFQz0TcPf8J
    var session = widget.getSession(), doc = session.getDocument();
    var nlLength = doc.getNewLineCharacter().length;
    var text = doc.getAllLines();
    if(pos.row>text.length)
        throw new Error("getting position off end of editor");
    var ret = 0, i;
    for(i=0; i<pos.row; i++)
        ret += text[i].length + nlLength;
    ret += pos.column;
    return ret;
};

// bind an ace editor to a listener and return a function to change the
// editor content without triggering that listener
ui_utils.ignore_programmatic_changes = function(widget, listener) {
    var listen = true;
    widget.on('change', function() {
        if(listen)
            listener(widget.getValue());
    });
    return function(value) {
        listen = false;
        var res = widget.setValue(value);
        listen = true;
        return res;
    };
};

ui_utils.twostate_icon = function(item, on_activate, on_deactivate,
                                  active_icon, inactive_icon) {
    function set_state(state) {
        item[0].checked = state;
        var icon = item.find('i');
        if(state) {
            icon.removeClass(inactive_icon);
            icon.addClass(active_icon);
        }
        else {
            icon.removeClass(active_icon);
            icon.addClass(inactive_icon);
        }
    }
    function on_click() {
        var state = !this.checked;
        set_state(state);
        if(state)
            on_activate();
        else
            on_deactivate();
    }
    function enable(val) {
        item.off('click');
        if(val)
            item.click(on_click);
    }
    enable(true);
    return {set_state: set_state, enable: enable};
};

// not that i'm at all happy with the look
ui_utils.checkbox_menu_item = function(item, on_check, on_uncheck) {
    var ret = ui_utils.twostate_icon(item, on_check, on_uncheck,
                                     'icon-check', 'icon-check-empty');
    var base_enable = ret.enable;
    ret.enable = function(val) {
        // bootstrap menu items go in in an <li /> that takes the disabled class
        $("#publish-notebook").parent().toggleClass('disabled', !val);
        base_enable(val);
    };
    return ret;
};

// this is a hack, but it'll help giving people the right impression.
// I'm happy to replace it witht the Right Way to do it when we learn
// how to do it.
ui_utils.make_prompt_chevron_gutter = function(widget)
{
    var dom = require("ace/lib/dom");
    widget.renderer.$gutterLayer.update = function(config) {
        var emptyAnno = {className: ""};
        var html = [];
        var i = config.firstRow;
        var lastRow = config.lastRow;
        var fold = this.session.getNextFoldLine(i);
        var foldStart = fold ? fold.start.row : Infinity;
        var foldWidgets = this.$showFoldWidgets && this.session.foldWidgets;
        var breakpoints = this.session.$breakpoints;
        var decorations = this.session.$decorations;
        var firstLineNumber = this.session.$firstLineNumber;
        var lastLineNumber = 0;
        html.push(
            "<div class='ace_gutter-cell ",
            "' style='height:", this.session.getRowLength(0) * config.lineHeight, "px;'>",
            "&gt;", "</div>"
        );

        this.element = dom.setInnerHtml(this.element, html.join(""));
        this.element.style.height = config.minHeight + "px";

        if (this.session.$useWrapMode)
            lastLineNumber = this.session.getLength();

        var gutterWidth = ("" + lastLineNumber).length * config.characterWidth;
        var padding = this.$padding || this.$computePadding();
        gutterWidth += padding.left + padding.right;
        if (gutterWidth !== this.gutterWidth && !isNaN(gutterWidth)) {
            this.gutterWidth = gutterWidth;
            this.element.style.width = Math.ceil(this.gutterWidth) + "px";
            this._emit("changeGutterWidth", gutterWidth);
        }
    };
};

// the existing jQuery editable libraries don't seem to do what we need, with
// different active and inactive text, and customized selection.
// this is a vague imitation of what a jquery.ui library might look like
// except without putting it into $ namespace
ui_utils.editable = function(elem$, command) {
    function selectRange(range) {
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
    function options() {
        return elem$.data('__editable');
    }

    var old_opts = options(),
        new_opts = old_opts;
    if(_.isObject(command)) {
        var defaults = {
            on_change: function() { return true; },
            allow_edit: true,
            inactive_text: elem$.text(),
            active_text: elem$.text(),
            select: function(el) {
                var range = document.createRange();
                range.selectNodeContents(el);
                return range;
            }
        };
        new_opts = $.extend(old_opts || defaults, command);
        elem$.data('__editable', new_opts);
    }
    else {
        if(command !== 'destroy' && !old_opts)
            throw new Error('expected already editable for command ' + command);
        function set_option(key, value) {
            old_opts = $.extend({}, old_opts);
            new_opts[key] = value;
        }
        switch(command) {
        case 'destroy':
            elem$.data('__editable', null);
            new_opts = null;
            break;
        case 'option':
            if(!arguments[2])
                return old_opts;
            else if(!arguments[3])
                return old_opts[arguments[2]];
            else {
                set_option(arguments[2], arguments[3]);
            }
            break;
        case 'disable':
            set_option('allow_edit', false);
            break;
        case 'enable':
            set_option('allow_edit', true);
            break;
        }
    }
    var action = null;
    if((!old_opts || !old_opts.allow_edit) && (new_opts && new_opts.allow_edit))
        action = 'melt';
    else if((old_opts && old_opts.allow_edit) && (!new_opts || !new_opts.allow_edit))
        action = 'freeze';

    if(new_opts)
        elem$.text(options().__active ? new_opts.active_text : new_opts.inactive_text);

    switch(action) {
    case 'freeze':
        elem$.attr('contenteditable', 'false');
        elem$.off('keydown');
        elem$.off('focus');
        elem$.off('blur');
        break;
    case 'melt':
        elem$.attr('contenteditable', 'true');
        elem$.focus(function() {
            if(!options().__active) {
                options().__active = true;
                elem$.text(options().active_text);
                window.setTimeout(function() {
                    selectRange(options().select(elem$[0]));
                    elem$.off('blur');
                    elem$.blur(function() {
                        elem$.text(options().inactive_text);
                        options().__active = false;
                    }); // click-off cancels
                }, 10);
            }
        });
        elem$.keydown(function(e) {
            if(e.keyCode === 13) {
                var result = elem$.text();
                if(options().validate(result)) {
                    options().__active = false;
                    elem$.off('blur'); // don't cancel!
                    elem$.blur();
                    options().change(result);
                }
                else return false; // don't let CR through!
            }
            else if(e.keyCode === 27)
                elem$.blur(); // and cancel
            return true;
        });
        break;
    }
};

ui_utils.on_next_tick = function(f) {
    window.setTimeout(f, 0);
};
var bootstrap_utils = {};

bootstrap_utils.alert = function(opts)
{
    opts = _.defaults(opts || {}, {
        close_button: true,
        on_close: function() {}
    });
    var div = $('<div class="alert"></div>');
    if (opts.html) div.html(opts.html);
    if (opts.text) div.text(opts.text);
    if (opts['class']) div.addClass(opts['class']);
    if (opts.close_button)
        div.prepend($('<button type="button" class="close" data-dismiss="alert">&times;</button>').click(opts.on_close));
    return div;
};

bootstrap_utils.button = function(opts)
{
    opts = opts || {}; // _.defaults(opts || {}, {});
    var a = $('<a class="btn" href="#"></a>');
    a.text(opts.text);
    if (opts['class']) a.addClass(opts['class']);
    return a;
};
Notebook = {};

//////////////////////////////////////////////////////////////////////////////
//
// roughly a MVC-kinda-thing per cell, plus a MVC for all the cells
// 
Notebook.Buffer = {};
Notebook.Cell = {};
Notebook.Asset = {};
Notebook.Buffer.create_model = function(content) {
    // by default, consider this a new cell
    var checkpoint_ = "";

    function is_empty(text) {
        return /^\s*$/.test(text);
    }

    var result = {
        views: [], // sub list for pubsub
        parent_model: null,

        renew_content: function() {
            // make content look new again, e.g. to reinsert cell
            checkpoint_ = "";
        },
        content: function(new_content) {
            if (!_.isUndefined(new_content)) {
                if(content != new_content) {
                    content = new_content;
                    this.notify_views(function(view) {
                        view.content_updated();
                    });
                    return content;
                }
                else return null;
            }
            return content;
        },
        change_object: function(obj) {
            if(obj.content)
                throw new Error("content must come from the object");
            if(!obj.filename)
                throw new Error("change object must have filename");
            var change = {filename: obj.filename};

            // github treats any content which is only whitespace or empty as an erase.
            // so we have to transform our requests to accommodate that.
            // note: any change without content, erase, or rename is a no-op.
            if(obj.erase)
                change.erase = !is_empty(checkpoint_);
            else if(obj.rename) {
                if(is_empty(content)) {
                    if(!is_empty(checkpoint_))
                        change.erase = true; // stuff => empty: erase
                    // else empty => empty: no-op
                    // no content either way
                }
                else {
                    if(is_empty(checkpoint_))
                        change.filename = obj.rename; // empty => stuff: create
                    else
                        change.rename = obj.rename; // stuff => stuff: rename
                    change.content = content;
                }
            }
            else { // change content
                if(!is_empty(content)) {
                    if(content != checkpoint_) // * => stuff: create/modify
                        change.content = content;
                    // else no-op
                }
                else {
                    if(!is_empty(checkpoint_))
                        change.erase = true; // stuff => empty: erase
                    // else empty => empty: no-op
                }
            }

            // every time we get a change_object it's in order to send it to
            // github.  so we can assume that the cell has been checkpointed
            // whenever we create a change object.
            // it would be nice to verify this somehow, but for now
            // only notebook_model creates change_objects
            // and only notebook_controller consumes them
            checkpoint_ = content;
            return change;
        },
        notify_views: function(f) {
            _.each(this.views, function(view) {
                f(view);
            });
        }
    };
    return result;
};
Notebook.Asset.create_html_view = function(asset_model)
{
    var filename_div = $("<li></li>");
    var anchor = $("<a href='#'>" + asset_model.filename() + "</a>");
    var remove = ui_utils.fa_button("icon-remove", "remove", '',
                                    { 'position': 'relative',
                                      'left': '2px',
                                      'opacity': '0.75'
                                    });
    filename_div.append(anchor);
    anchor.append(remove);
    anchor.click(function() {
        asset_model.controller.select();
    });
    remove.click(function() {
        asset_model.controller.remove();
    });
    var result = {
        div: filename_div,
        filename_updated: function() {
            anchor.text(asset_model.filename());
        },
        content_updated: function() {
        },
        active_updated: function() {
            if (asset_model.active())
                filename_div.addClass("active");
            else
                filename_div.removeClass("active");
        },
        self_removed: function() {
            filename_div.remove();
        },
        set_readonly: function(readonly) {
            // FIXME
        },
        div: function() {
            return filename_div;
        }
    };
    return result;
};
Notebook.Asset.create_model = function(content, filename)
{
    var cursor_position_;
    var active_ = false;
    var result = Notebook.Buffer.create_model(content);
    var base_change_object = result.change_object;

    _.extend(result, {
        active: function(new_active) {
            if (!_.isUndefined(new_active)) {
                if(active_ !== new_active) {
                    active_ = new_active;
                    this.notify_views(function(view) {
                        view.active_updated();
                    });
                    return active_;
                } else {
                    return null;
                }
            }
            return active_;
        },
        cursor_position: function(new_cursor_position) {
            if (!_.isUndefined(new_cursor_position))
                cursor_position_ = new_cursor_position;
            return cursor_position_;
        },
        language: function() {
            if(arguments.length)
                throw new Error("set language of asset not supported");
            var extension = filename.match(/\.([^.]+)$/);
            if (!extension)
                throw new Error("extension does not exist");
            extension = extension[1];
            return extension;
        },
        filename: function(new_filename) {
            if (!_.isUndefined(new_filename)) {
                if(filename != new_filename) {
                    filename = new_filename;
                    this.notify_views(function(view) {
                        view.filename_updated();
                    });
                    return filename;
                }
                else return null;
            }
            return filename;
        },
        json: function() {
            return {
                content: content,
                filename: this.filename(),
                language: this.language()
            };
        },
        change_object: function(obj) {
            obj = obj || {};
            obj.filename = obj.filename || this.filename();
            return base_change_object.call(this, obj);
        }
    });
    return result;
};
Notebook.Asset.create_controller = function(asset_model)
{
    var result = {
        select: function() {
            // a little ugly here...
            if (RCloud.UI.scratchpad.current_model) {
                RCloud.UI.scratchpad.current_model.controller.deselect();
            }
            asset_model.active(true);
            RCloud.UI.scratchpad.set_model(asset_model);
        },
        deselect: function() {
            asset_model.active(false);
        },
        remove: function(force) {
            var msg = "Are you sure? This will remove the asset from the notebook.";
            if (force || confirm(msg)) {
                asset_model.parent_model.controller.remove_asset(asset_model);
                var assets = asset_model.parent_model.assets;
                if (assets.length)
                    assets[0].controller.select();
                else {
                    RCloud.UI.scratchpad.set_model(null);
                }
            }
        }
    };
    return result;
};
(function() {

function create_markdown_cell_html_view(language) { return function(cell_model) {
    var EXTRA_HEIGHT = 26;
    var notebook_cell_div  = $("<div class='notebook-cell'></div>");
    update_div_id();
    notebook_cell_div.data('rcloud.model', cell_model);

    //////////////////////////////////////////////////////////////////////////
    // button bar

    var insert_cell_button = ui_utils.fa_button("icon-plus-sign", "insert cell");
    var coalesce_button = ui_utils.fa_button("icon-link", "coalesce cells");
    var source_button = ui_utils.fa_button("icon-edit", "source");
    var result_button = ui_utils.fa_button("icon-picture", "result");
    var split_button = ui_utils.fa_button("icon-unlink", "split cell");
    var remove_button = ui_utils.fa_button("icon-trash", "remove");
    var run_md_button = ui_utils.fa_button("icon-play", "run");
    var gap = $('<div/>').html('&nbsp;').css({'line-height': '25%'});

    function update_model() {
        return cell_model.content(widget.getSession().getValue());
    }
    function update_div_id() {
        notebook_cell_div.attr('id', Notebook.part_name(cell_model.id(), cell_model.language()));
    }
    var enable = ui_utils.enable_fa_button;
    var disable = ui_utils.disable_fa_button;

    insert_cell_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            shell.insert_markdown_cell_before(cell_model.id());
        }
    });
    coalesce_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            shell.coalesce_prior_cell(cell_model);
        }
    });
    split_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            var range = widget.getSelection().getRange();
            var point1, point2 = undefined;
            point1 = ui_utils.character_offset_of_pos(widget, range.start);
            if(!range.isEmpty())
                point2 = ui_utils.character_offset_of_pos(widget, range.end);
            shell.split_cell(cell_model, point1, point2);
        }
    });
    source_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            result.show_source();
        }
    });
    result_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled"))
            result.show_result();
    });
    remove_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            cell_model.parent_model.controller.remove_cell(cell_model);

            // twitter bootstrap gets confused about its tooltips if parent element
            // is deleted while tooltip is active; let's help it
            $(".tooltip").remove();
        }
    });
    function execute_cell() {
        r_result_div.html("Computing...");
        var new_content = update_model();
        result.show_result();
        if(new_content!==null) // if any change (including removing the content)
            cell_model.parent_model.controller.update_cell(cell_model);
        rcloud.with_progress(function(done) {
            cell_model.controller.execute().then(done);
        });
    }
    run_md_button.click(function(e) {
        execute_cell();
    });
    var cell_status = $("<div class='cell-status'></div>");
    var button_float = $("<div class='cell-controls'></div>");
    cell_status.append(button_float);
    cell_status.append($("<div style='clear:both;'></div>"));
    var col = $('<table/>').append('<tr/>');
    var languages = {
        "R": { 'background-color': "#E8F1FA" },
        "Markdown": { 'background-color': "#F7EEE4" }
        // ,
        // "Python": { 'background-color': "#ff0000" },
        // "Bash": { 'background-color': "#00ff00" }
    };
    var select = $("<select class='form-control'></select>");
    _.each(languages, function(value, key) {
        languages[key].element = $("<option></option>").text(key);
        select.append(languages[key].element);
    });
    $(languages[language].element).attr('selected', true);
    select.on("change", function() {
        var l = select.find("option:selected").text();
        cell_model.parent_model.controller.change_cell_language(cell_model, l);
    });

    col.append($("<div></div>").append(select));
    $.each([run_md_button, source_button, result_button, gap, split_button, remove_button],
           function() {
               col.append($('<td/>').append($(this)));
           });

    button_float.append(col);
    notebook_cell_div.append(cell_status);

    var insert_button_float = $("<div class='cell-insert-control'></div>");
    insert_button_float.append(coalesce_button);
    insert_button_float.append(insert_cell_button);
    notebook_cell_div.append(insert_button_float);

    //////////////////////////////////////////////////////////////////////////

    var inner_div = $("<div></div>");
    var clear_div = $("<div style='clear:both;'></div>");
    notebook_cell_div.append(inner_div);
    notebook_cell_div.append(clear_div);

    var outer_ace_div = $('<div class="outer-ace-div"></div>');

    var ace_div = $('<div style="width:100%; height:100%;"></div>');
    ace_div.css({ 'background-color': languages[language]["background-color"] });

    inner_div.append(outer_ace_div);
    outer_ace_div.append(ace_div);
    ace.require("ace/ext/language_tools");
    var widget = ace.edit(ace_div[0]);
    var RMode = require(language === 'R' ? "ace/mode/r" : "ace/mode/rmarkdown").Mode;
    var session = widget.getSession();
    widget.setValue(cell_model.content());
    ui_utils.ace_set_pos(widget, 0, 0); // setValue selects all
    // erase undo state so that undo doesn't erase all
    ui_utils.on_next_tick(function() {
        session.getUndoManager().reset();
    });
    var doc = session.doc;
    var am_read_only = cell_model.parent_model.read_only();
    if (am_read_only) {
        disable(remove_button);
        disable(insert_cell_button);
    }
    widget.setReadOnly(am_read_only);
    widget.setOptions({
        enableBasicAutocompletion: true
    });
    session.setMode(new RMode(false, doc, session));
    session.on('change', function() {
        notebook_cell_div.css({'height': (ui_utils.ace_editor_height(widget) + EXTRA_HEIGHT) + "px"});
        widget.resize();
    });

    widget.setTheme("ace/theme/chrome");
    session.setUseWrapMode(true);
    widget.resize();

    ui_utils.install_common_ace_key_bindings(widget);
    widget.commands.addCommands([{
        name: 'sendToR',
        bindKey: {
            win: 'Ctrl-Return',
            mac: 'Command-Return',
            sender: 'editor'
        },
        exec: function(widget, args, request) {
            execute_cell();
        }
    }]);
    var change_content = ui_utils.ignore_programmatic_changes(widget, function() {
        cell_model.parent_model.on_dirty();
    });

    var r_result_div = $('<div class="r-result-div"><span style="opacity:0.5">Computing ...</span></div>');
    inner_div.append(r_result_div);

    var current_mode;

    var result = {

        //////////////////////////////////////////////////////////////////////
        // pubsub event handlers

        content_updated: function() {
            var range = widget.getSelection().getRange();
            var changed = change_content(cell_model.content());
            widget.getSelection().setSelectionRange(range);
            return changed;
        },
        self_removed: function() {
            notebook_cell_div.remove();
        },
        id_updated: update_div_id,
        language_updated: function() {
            language = cell_model.language();
            ace_div.css({ 'background-color': languages[language]["background-color"] });
        },
        result_updated: function(r) {
            r_result_div.hide();
            r_result_div.html(r);
            r_result_div.slideDown(150);

            // There's a list of things that we need to do to the output:
            var uuid = rcloud.deferred_knitr_uuid;

            if (cell_model.language() === 'R' && inner_div.find("pre code").length === 0) {
                r_result_div.prepend("<pre><code class='r'>" + cell_model.content() + "</code></pre>");
            }

            // click on code to edit
            $("code.r", r_result_div).off('click')
                .click(result.show_source);

            // we use the cached version of DPR instead of getting window.devicePixelRatio
            // because it might have changed (by moving the user agent window across monitors)
            // this might cause images that are higher-res than necessary or blurry.
            // Since using window.devicePixelRatio might cause images
            // that are too large or too small, the tradeoff is worth it.
            var dpr = rcloud.display.get_device_pixel_ratio();
            // fix image width so that retina displays are set correctly
            inner_div.find("img")
                .each(function(i, img) { img.style.width = img.width / dpr; });

            // capture deferred knitr results
            inner_div.find("pre code")
                .contents()
                .filter(function() {
                    return this.nodeValue ? this.nodeValue.indexOf(uuid) !== -1 : false;
                }).parent().parent()
                .each(function() {
                    var that = this;
                    var uuids = this.childNodes[0].childNodes[0].data.substr(8,65).split("|");
                    // FIXME monstrous hack: we rebuild the ocap from the string to
                    // call it via rserve-js
                    var ocap = [uuids[1]];
                    ocap.r_attributes = { "class": "OCref" };
                    var f = rclient._rserve.wrap_ocap(ocap);

                    f(function(err, future) {
                        if (RCloud.is_exception(future)) {
                            var data = RCloud.exception_message(future);
                            $(that).replaceWith(function() {
                                return rclient.string_error(data);
                            });
                        } else {
                            var data = future();
                            $(that).replaceWith(function() {
                                return data;
                            });
                        }
                    });
                    // rcloud.resolve_deferred_result(uuids[1], function(data) {
                    //     $(that).replaceWith(function() {
                    //         return shell.handle(data[0], data);
                    //     });
                    // });
                });
            // highlight R
            inner_div
                .find("pre code")
                .each(function(i, e) {
                    hljs.highlightBlock(e);
                });

            // typeset the math
            if (!_.isUndefined(MathJax))
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

            // this is kinda bad
            if (!shell.notebook.controller._r_source_visible) {
                Notebook.hide_r_source(inner_div);
            }

            this.show_result();
        },
        set_readonly: function(readonly) {
            am_read_only = readonly;
            widget.setReadOnly(readonly);
            if (readonly) {
                disable(remove_button);
                disable(insert_cell_button);
            } else {
                enable(remove_button);
                enable(insert_cell_button);
            }
        },

        //////////////////////////////////////////////////////////////////////

        hide_buttons: function() {
            button_float.css("display", "none");
            insert_button_float.hide();
        },
        show_buttons: function() {
            button_float.css("display", null);
            insert_button_float.show();
        },

        show_source: function() {
            /*
             * Some explanation for the next poor soul
             * that might come across this great madness below:
             *
             * ACE appears to have trouble computing properties such as
             * renderer.lineHeight. This is unfortunate, since we want
             * to use lineHeight to determine the size of the widget in the
             * first place. The only way we got ACE to work with
             * dynamic sizing was to set up a three-div structure, like so:
             *
             * <div id="1"><div id="2"><div id="3"></div></div></div>
             *
             * set the middle div (id 2) to have a style of "height: 100%"
             *
             * set the outer div (id 1) to have whatever height in pixels you want
             *
             * make sure the entire div structure is on the DOM and is visible
             *
             * call ace's resize function once. (This will update the
             * renderer.lineHeight property)
             *
             * Now set the outer div (id 1) to have the desired height as a
             * funtion of renderer.lineHeight, and call resize again.
             *
             * Easy!
             *
             */
            // do the two-change dance to make ace happy
            outer_ace_div.show();
            widget.resize(true);
            notebook_cell_div.css({'height': (ui_utils.ace_editor_height(widget) + EXTRA_HEIGHT) + "px"});
            widget.resize(true);
            disable(source_button);
            enable(result_button);
            // enable(hide_button);
            if (!am_read_only) {
                enable(remove_button);
            }
            //editor_row.show();

            outer_ace_div.show();
            r_result_div.hide();
            widget.resize();
            widget.focus();

            current_mode = "source";
        },
        show_result: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            disable(result_button);
            // enable(hide_button);
            if (!am_read_only) {
                enable(remove_button);
            }

            //editor_row.hide();
            outer_ace_div.hide();
            r_result_div.slideDown(150); // show();
            current_mode = "result";
        },
        hide_all: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            enable(result_button);
            // disable(hide_button);
            if (!am_read_only) {
                enable(remove_button);
            }

            //editor_row.hide();
            if (current_mode === "result") {
                r_result_div.slideUp(150); // hide();
            } else {
                outer_ace_div.slideUp(150); // hide();
            }
        },
        div: function() {
            return notebook_cell_div;
        },
        update_model: function() {
            return update_model();
        },
        focus: function() {
            widget.focus();
        },
        get_content: function() { // for debug
            return cell_model.content();
        }
    };

    result.show_result();
    return result;
}};

Notebook.Cell.create_html_view = function(cell_model)
{
    return create_markdown_cell_html_view(cell_model.language())(cell_model);
};

})();
Notebook.Cell.create_model = function(content, language)
{
    var id_ = -1;
    var result = Notebook.Buffer.create_model(content);
    var base_change_object = result.change_object;

    _.extend(result, {
        language: function(new_language) {
            if (!_.isUndefined(new_language)) {
                if(language != new_language) {
                    language = new_language;
                    this.notify_views(function(view) {
                        view.language_updated();
                    });
                    return language;
                }
                else return null;
            }
            return language;
        },
        id: function(new_id) {
            if (!_.isUndefined(new_id) && new_id != id_) {
                id_ = new_id;
                this.notify_views(function(view) {
                    view.id_updated();
                });
            }
            return id_;
        },
        filename: function() {
            if(arguments.length)
                throw new Error("can't set filename of cell");
            return Notebook.part_name(this.id(), this.language());
        },
        json: function() {
            return {
                content: content,
                language: language
            };
        },
        change_object: function(obj) {
            obj = obj || {};
            if(obj.id && obj.filename)
                throw new Error("must specify only id or filename");
            if(!obj.filename) {
                var id = obj.id || this.id();
                if(!(id>0)) // negative, NaN, null, undefined, etc etc.  note: this isn't <=
                    throw new Error("bad id for cell change object: " + id);
                obj.filename = Notebook.part_name(id, this.language());
            }
            if(obj.rename && _.isNumber(obj.rename))
                obj.rename = Notebook.part_name(obj.rename, this.language());
            return base_change_object.call(this, obj);
        }
    });
    return result;
};
Notebook.Cell.create_controller = function(cell_model)
{
    var result = {
        execute: function() {
            var that = this;
            var language = cell_model.language();
            function callback(r) {
                that.set_status_message(r);
            }
            var promise;

            rcloud.record_cell_execution(cell_model);
            if (rcloud.authenticated) {
                promise = rcloud.session_markdown_eval(cell_model.content(), language, false);
            } else {
                promise = rcloud.session_cell_eval(
                    Notebook.part_name(cell_model.id(),
                                       cell_model.language()),
                    cell_model.language(),
                    false);
            }
            return promise.then(callback);
        },
        set_status_message: function(msg) {
            _.each(cell_model.views, function(view) {
                view.result_updated(msg);
            });
        },
        change_language: function(language) {
            cell_model.language(language);
        }
    };

    return result;
};
Notebook.create_html_view = function(model, root_div)
{
    var root_asset_div = $("#asset-list");

    function show_or_hide_cursor(readonly) {
        if(readonly)
            $('.ace_cursor-layer').hide();
        else
            $('.ace_cursor-layer').show();
    }
    var result = {
        model: model,
        sub_views: [],
        asset_sub_views: [],
        cell_appended: function(cell_model) {
            var cell_view = Notebook.Cell.create_html_view(cell_model);
            cell_model.views.push(cell_view);
            root_div.append(cell_view.div());
            this.sub_views.push(cell_view);
            return cell_view;
        },
        asset_appended: function(asset_model) {
            var asset_view = Notebook.Asset.create_html_view(asset_model);
            asset_model.views.push(asset_view);
            root_asset_div.append(asset_view.div());
            this.asset_sub_views.push(asset_view);
            return asset_view;
        },
        cell_inserted: function(cell_model, cell_index) {
            var cell_view = Notebook.Cell.create_html_view(cell_model);
            cell_model.views.push(cell_view);
            root_div.append(cell_view.div());
            $(cell_view.div()).insertBefore(root_div.children('.notebook-cell')[cell_index]);
            this.sub_views.splice(cell_index, 0, cell_view);
            cell_view.show_source();
            return cell_view;
        },
        cell_removed: function(cell_model, cell_index) {
            _.each(cell_model.views, function(view) {
                view.self_removed();
            });
            this.sub_views.splice(cell_index, 1);
        },
        asset_removed: function(asset_model, asset_index) {
            _.each(asset_model.views, function(view) {
                view.self_removed();
            });
            this.asset_sub_views.splice(asset_index, 1);
        },
        cell_moved: function(cell_model, pre_index, post_index) {
            this.sub_views.splice(pre_index, 1);
            this.sub_views.splice(post_index, 0, cell_model.views[0]);
        },
        set_readonly: function(readonly) {
            show_or_hide_cursor(readonly);
            _.each(this.sub_views, function(view) {
                view.set_readonly(readonly);
            });
            _.each(this.asset_sub_views, function(view) {
                view.set_readonly(readonly);
            });
        },
        update_model: function() {
            return _.map(this.sub_views, function(cell_view) {
                return cell_view.update_model();
            });
        }
    };
    model.views.push(result);
    return result;
};
Notebook.create_model = function()
{
    var readonly_ = false;
    var user_ = "";

    function last_id(cells) {
        if(cells.length)
            return cells[cells.length-1].id();
        else
            return 0;
    }

    // anything here that returns a set of changes must only be called from the
    // controller.  the controller makes sure those changes are sent to github.

    /* note, the code below is a little more sophisticated than it needs to be:
       allows multiple inserts or removes but currently n is hardcoded as 1.  */
    return {
        cells: [],
        assets: [],
        views: [], // sub list for cell content pubsub
        dishers: [], // for dirty bit pubsub
        clear: function() {
            var cells_removed = this.remove_cell(null,last_id(this.cells));
            var assets_removed = this.remove_asset(null,this.assets.length);
            return cells_removed.concat(assets_removed);
        },
        append_asset: function(asset_model, filename, skip_event) {
            asset_model.parent_model = this;
            var changes = [];
            changes.push(asset_model.change_object());
            this.assets.push(asset_model);
            if(!skip_event)
                _.each(this.views, function(view) {
                    view.asset_appended(asset_model);
                });
            return changes;
        },
        append_cell: function(cell_model, id, skip_event) {
            cell_model.parent_model = this;
            var changes = [];
            var n = 1;
            id = id || 1;
            id = Math.max(id, last_id(this.cells)+1);
            while(n) {
                cell_model.id(id);
                changes.push(cell_model.change_object());
                this.cells.push(cell_model);
                if(!skip_event)
                    _.each(this.views, function(view) {
                        view.cell_appended(cell_model);
                    });
                ++id;
                --n;
            }
            return changes;
        },
        insert_cell: function(cell_model, id, skip_event) {
            var that = this;
            cell_model.parent_model = this;
            cell_model.renew_content();
            var changes = [];
            var n = 1, x = 0;
            while(x<this.cells.length && this.cells[x].id() < id) ++x;
            // if id is before some cell and id+n knocks into that cell...
            if(x<this.cells.length && id+n > this.cells[x].id()) {
                // see how many ids we can squeeze between this and prior cell
                var prev = x>0 ? this.cells[x-1].id() : 0;
                id = Math.max(this.cells[x].id()-n, prev+1);
            }
            for(var j=0; j<n; ++j) {
                changes.push(cell_model.change_object({id: id+j})); // most likely blank
                cell_model.id(id+j);
                this.cells.splice(x, 0, cell_model);
                if(!skip_event)
                    _.each(this.views, function(view) {
                        view.cell_inserted(that.cells[x], x);
                    });
                ++x;
            }
            while(x<this.cells.length && n) {
                if(this.cells[x].id() > id) {
                    var gap = this.cells[x].id() - id;
                    n -= gap;
                    id += gap;
                }
                if(n<=0)
                    break;
                changes.push(this.cells[x].change_object({
                    rename: this.cells[x].id()+n
                }));
                this.cells[x].id(this.cells[x].id() + n);
                ++x;
                ++id;
            }
            // apply the changes backward so that we're moving each cell
            // out of the way just before putting the next one in its place
            return changes.reverse();
        },
        remove_asset: function(asset_model, n, skip_event) {
            if (this.assets.length === 0)
                return [];
            var that = this;
            var asset_index, filename;
            if(asset_model!=null) {
                asset_index = this.assets.indexOf(asset_model);
                filename = asset_model.filename();
                if (asset_index === -1) {
                    throw "asset_model not in notebook model?!";
                }
            }
            else {
                asset_index = 0;
                filename = this.assets[asset_index].filename();
            }
            n = n || 1;
            var x = asset_index;
            var changes = [];
            while(x<this.assets.length && n) {
                if(this.assets[x].filename() == filename) {
                    if(!skip_event)
                        _.each(this.views, function(view) {
                            view.asset_removed(that.assets[x], x);
                        });
                    changes.push(that.assets[x].change_object({ erase: 1 }));
                    this.assets.splice(x, 1);
                }
                if (x<this.assets.length)
                    filename = this.assets[x].filename();
                --n;
            }
            return changes;
        },
        remove_cell: function(cell_model, n, skip_event) {
            var that = this;
            var cell_index, id;
            if(cell_model!=null) {
                cell_index = this.cells.indexOf(cell_model);
                id = cell_model.id();
                if (cell_index === -1) {
                    throw "cell_model not in notebook model?!";
                }
            }
            else {
                cell_index = 0;
                id = 1;
            }
            n = n || 1;
            var x = cell_index;
            var changes = [];
            while(x<this.cells.length && n) {
                if(this.cells[x].id() == id) {
                    if(!skip_event)
                        _.each(this.views, function(view) {
                            view.cell_removed(that.cells[x], x);
                        });
                    changes.push(that.cells[x].change_object({ erase: 1 }));
                    this.cells.splice(x, 1);
                }
                ++id;
                --n;
            }
            return changes;
        },
        move_cell: function(cell_model, before) {
            // remove doesn't change any ids, so we can just remove then add
            var pre_index = this.cells.indexOf(cell_model),
                changes = this.remove_cell(cell_model, 1, true)
                    .concat(before >= 0
                            ? this.insert_cell(cell_model, before, true)
                            : this.append_cell(cell_model, null, true)),
                post_index = this.cells.indexOf(cell_model);
            _.each(this.views, function(view) {
                view.cell_moved(cell_model, pre_index, post_index);
            });
            return changes;
        },
        prior_cell: function(cell_model) {
            var index = this.cells.indexOf(cell_model);
            if(index>0)
                return this.cells[index-1];
            else
                return null;
        },
        change_cell_language: function(cell_model, language) {
            // for this one case we have to use filenames instead of ids
            var pre_name = cell_model.filename();
            cell_model.language(language);
            return [cell_model.change_object({filename: pre_name,
                                              rename: cell_model.filename()})];
        },
        update_cell: function(cell_model) {
            return [cell_model.change_object()];
        },
        update_asset: function(asset_model) {
            return [asset_model.change_object()];
        },
        reread_buffers: function() {
            // force views to update models
            var changed_cells_per_view = _.map(this.views, function(view) {
                return view.update_model();
            });
            if(changed_cells_per_view.length != 1)
                throw "not expecting more than one notebook view";
            var contents = changed_cells_per_view[0];
            var changes = [];
            for (var i=0; i<contents.length; ++i)
                if (contents[i] !== null)
                    changes.push(this.cells[i].change_object());
            var asset_change = RCloud.UI.scratchpad.update_model();
            if (asset_change) {
                var active_asset_model = RCloud.UI.scratchpad.current_model;
                changes.push(active_asset_model.change_object());
            }
            return changes;
        },
        read_only: function(readonly) {
            if(!_.isUndefined(readonly)) {
                readonly_ = readonly;
                _.each(this.views, function(view) {
                    view.set_readonly(readonly_);
                });
            }
            return readonly_;
        },
        user: function(user) {
            if (!_.isUndefined(user)) {
                user_ = user;
            }
            return user_;
        },
        on_dirty: function() {
            _.each(this.dishers, function(disher) {
                disher.on_dirty();
            });
        },
        json: function() {
            return _.map(this.cells, function(cell_model) {
                return cell_model.json();
            });
        }
    };
};
Notebook.create_controller = function(model)
{
    var current_gist_,
        dirty_ = false,
        save_button_ = null,
        save_timer_ = null,
        save_timeout_ = 30000, // 30s
        show_source_checkbox_ = null;

    var editor_callback_ = editor.load_callback({is_change: true, selroot: true}),
        default_callback_ = function(notebook) {
            if(save_button_)
                ui_utils.disable_bs_button(save_button_);
            dirty_ = false;
            return editor_callback_(notebook);
        };

    function append_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return {controller: cell_controller, changes: model.append_cell(cell_model, id)};
    }

    function append_asset_helper(content, filename) {
        var asset_model = Notebook.Asset.create_model(content, filename);
        var asset_controller = Notebook.Asset.create_controller(asset_model);
        asset_model.controller = asset_controller;
        return {controller: asset_controller,
                changes: model.append_asset(asset_model, filename)};
    }

    function insert_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return {controller: cell_controller, changes: model.insert_cell(cell_model, id)};
    }

    function on_load(version, notebook) {
        if (!_.isUndefined(notebook.files)) {
            var i;
            this.clear();
            var cells = {}; // could rely on alphabetic input instead of gathering
            var assets = {};
            _.each(notebook.files, function (file, k) {
                // ugh, we really need to have a better javascript mapping of R objects..
                if (k === "r_attributes" || k === "r_type")
                    return;
                var filename = file.filename;
                if(/^part/.test(filename)) {
                    // cells
                    var number = parseInt(filename.slice(4).split('.')[0]);
                    if(!isNaN(number))
                        cells[number] = [file.content, file.language, number];
                } else {
                    // assets
                    assets[filename] = [file.content, file.filename];
                }
            });
            // we intentionally drop change objects on the floor, here and only here.
            // that way the cells/assets are checkpointed where they were loaded
            var asset_controller;
            for(i in cells)
                append_cell_helper(cells[i][0], cells[i][1], cells[i][2]);
            for(i in assets) {
                var result = append_asset_helper(assets[i][0], assets[i][1]).controller;
                asset_controller = asset_controller || result;
            }
            model.user(notebook.user.login);
            model.read_only(version != null || notebook.user.login != rcloud.username());
            current_gist_ = notebook;
            // it's rare but valid not to have assets
            if(asset_controller)
                asset_controller.select();
        }
        return notebook;
    }

    // calculate the changes needed to get back from the newest version in notebook
    // back to what we are presently displaying (current_gist_)
    function find_changes_from(notebook) {
        function change_object(obj) {
            obj.name = function(n) { return n; };
            return obj;
        }
        var changes = [];

        // notebook files, current files
        var nf = notebook.files,
            cf = _.extend({}, current_gist_.files); // dupe to keep track of changes

        // find files which must be changed or removed to get from nf to cf
        for(var f in nf) {
            if(f==='r_type' || f==='r_attributes')
                continue; // R metadata
            if(f in cf) {
                if(cf[f].language != nf[f].language || cf[f].content != nf[f].content) {
                    changes.push(change_object({filename: f,
                                                language: cf[f].language,
                                                content: cf[f].content}));
                }
                delete cf[f];
            }
            else changes.push(change_object({filename: f, erase: true, language: nf[f].language}));
        }

        // find files which must be added to get from nf to cf
        for(f in cf) {
            if(f==='r_type' || f==='r_attributes')
                continue; // artifact of rserve.js
            changes.push(change_object({filename: f,
                                        language: cf[f].language,
                                        content: cf[f].content}));
        }
        return changes;
    }

    function update_notebook(changes, gistname, more) {
        function add_more_changes(gist) {
            if (_.isUndefined(more))
                return gist;
            return _.extend(_.clone(gist), more);
        }
        // remove any "empty" changes.  we can keep empty cells on the
        // screen but github will refuse them.  if the user doesn't enter
        // stuff in them before saving, they will disappear on next session
        changes = changes.filter(function(change) {
            return change.content || change.erase || change.rename;
        });
        if (model.read_only())
            return Promise.reject("attempted to update read-only notebook");
        if (!changes.length && _.isUndefined(more)) {
            return Promise.cast(current_gist_);
        }
        gistname = gistname || shell.gistname();
        function changes_to_gist(changes) {
            var files = {};
            // play the changes in order - they must be sequenced so this makes sense
            _.each(changes, function(change) {
                if(change.erase || change.rename) {
                    files[change.filename] = null;
                    if(change.rename)
                        files[change.rename] = {content: change.content};
                }
                else files[change.filename] = {content: change.content};
            });
            return {files: files};
        }
        var gist = add_more_changes(changes_to_gist(changes));
        return rcloud.update_notebook(gistname, gist)
            .then(function(notebook) {
                if('error' in notebook)
                    throw notebook;
                current_gist_ = notebook;
                return notebook;
            });
    }
    function refresh_buffers() {
        return model.reread_buffers();
    }

    function on_dirty() {
        if(!dirty_) {
            if(save_button_)
                ui_utils.enable_bs_button(save_button_);
            dirty_ = true;
        }
        if(save_timer_)
            window.clearTimeout(save_timer_);
        save_timer_ = window.setTimeout(function() {
            result.save();
            save_timer_ = null;
        }, save_timeout_);
    }

    function setup_show_source() {
        show_source_checkbox_ = ui_utils.checkbox_menu_item($("#show-source"),
           function() {result.show_r_source();},
           function() {result.hide_r_source();});
        show_source_checkbox_.set_state(true);
    }

    setup_show_source();
    model.dishers.push({on_dirty: on_dirty});

    var result = {
        save_button: function(save_button) {
            if(arguments.length) {
                save_button_ = save_button;
            }
            return save_button_;
        },
        append_asset: function(content, filename) {
            var cch = append_asset_helper(content, filename);
            update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback_);
            return cch.controller;
        },
        append_cell: function(content, type, id) {
            var cch = append_cell_helper(content, type, id);
            update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback_);
            return cch.controller;
        },
        insert_cell: function(content, type, id) {
            var cch = insert_cell_helper(content, type, id);
            update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback_);
            return cch.controller;
        },
        remove_cell: function(cell_model) {
            var changes = refresh_buffers().concat(model.remove_cell(cell_model));
            RCloud.UI.command_prompt.prompt.widget.focus(); // there must be a better way
            update_notebook(changes)
                .then(default_callback_);
        },
        remove_asset: function(asset_model) {
            var changes = refresh_buffers().concat(model.remove_asset(asset_model));
            update_notebook(changes)
                .then(default_callback_);
        },
        move_cell: function(cell_model, before) {
            var changes = refresh_buffers().concat(model.move_cell(cell_model, before ? before.id() : -1));
            update_notebook(changes)
                .then(default_callback_);
        },
        coalesce_prior_cell: function(cell_model) {
            var prior = model.prior_cell(cell_model);
            if(!prior)
                return;

            function opt_cr(text) {
                if(text.length && text[text.length-1] != '\n')
                    return text + '\n';
                return text;
            }
            function crunch_quotes(left, right) {
                var end = /```\n$/, begin = /^```{r}/;
                if(end.test(left) && begin.test(right))
                    return left.replace(end, '') + right.replace(begin, '');
                else return left + right;
            }

            // note we have to refresh everything and then concat these changes onto
            // that.  which won't work in general but looks like it is okay to
            // concatenate a bunch of change content objects with a move or change
            // to one of the same objects, and an erase of one
            var new_content, changes = refresh_buffers();

            // this may have to be multiple dispatch when there are more than two languages
            if(prior.language()==cell_model.language()) {
                new_content = crunch_quotes(opt_cr(prior.content()),
                                            cell_model.content());
                prior.content(new_content);
                changes = changes.concat(model.update_cell(prior));
            }
            else {
                if(prior.language()==="R") {
                    new_content = crunch_quotes('```{r}\n' + opt_cr(prior.content()) + '```\n',
                                                cell_model.content());
                    prior.content(new_content);
                    changes = changes.concat(model.change_cell_language(prior, "Markdown"));
                    changes[changes.length-1].content = new_content; //  NOOOOOO!!!!
                }
                else {
                    new_content = crunch_quotes(opt_cr(prior.content()) + '```{r}\n',
                                                opt_cr(cell_model.content()) + '```\n');
                    new_content = new_content.replace(/```\n```{r}\n/, '');
                    prior.content(new_content);
                    changes = changes.concat(model.update_cell(prior));
                }
            }
            _.each(prior.views, function(v) { v.show_source(); });
            update_notebook(changes.concat(model.remove_cell(cell_model)))
                .then(default_callback_);
        },
        split_cell: function(cell_model, point1, point2) {
            function resplit(a) {
                for(var i=0; i<a.length-1; ++i)
                    if(!/\n$/.test(a[i]) && /^\n/.test(a[i+1])) {
                        a[i] = a[i].concat('\n');
                        a[i+1] = a[i+1].replace(/^\n/, '');
                    }
            }
            var changes = refresh_buffers();
            var content = cell_model.content(),
                parts = [content.substring(0, point1)],
                id = cell_model.id(), language = cell_model.language();
            if(point2 === undefined)
                parts.push(content.substring(point1));
            else
                parts.push(content.substring(point1, point2),
                           content.substring(point2));
            resplit(parts);
            cell_model.content(parts[0]);
            changes = changes.concat(model.update_cell(cell_model));
            // not great to do multiple inserts here - but not quite important enough to enable insert-n
            for(var i=1; i<parts.length; ++i)
                changes = changes.concat(insert_cell_helper(parts[i], language, id+i).changes);
            update_notebook(changes)
                .then(default_callback_);
        },
        change_cell_language: function(cell_model, language) {
            var changes = refresh_buffers().concat(model.change_cell_language(cell_model, language));
            update_notebook(changes)
                .then(default_callback_);
        },
        clear: function() {
            model.clear();
            // FIXME when scratchpad becomes a view, clearing the model
            // should make this happen automatically.
            RCloud.UI.scratchpad.clear();
        },
        load_notebook: function(gistname, version) {
            return rcloud.load_notebook(gistname, version || null)
                .then(_.bind(on_load, this, version));
        },
        create_notebook: function(content) {
            var that = this;
            return rcloud.create_notebook(content).then(function(notebook) {
                that.clear();
                model.read_only(notebook.user.login != rcloud.username());
                current_gist_ = notebook;
                return notebook;
            });
        },
        fork_or_revert_notebook: function(is_mine, gistname, version) {
            var that = this;
            // 1. figure out the changes
            var promiseChanges;
            if(is_mine) // revert: get HEAD, calculate changes from there to here, and apply
                promiseChanges = rcloud.load_notebook(gistname, null).then(function(notebook) {
                    return [find_changes_from(notebook), gistname];
                });
            else // fork:
                promiseChanges = rcloud.fork_notebook(gistname).then(function(notebook) {
                    if(version)
                        // fork, then get changes from there to where we are in the past, and apply
                        // git api does not return the files on fork, so load
                        return rcloud.get_notebook(notebook.id, null)
                            .then(function(notebook2) {
                                return [find_changes_from(notebook2), notebook2.id];
                            });
                    else return [[], notebook.id];
                });
            // 2. apply the changes, if any
            return promiseChanges.spread(function(changes, gistname) {
                return changes.length
                    ? update_notebook(changes, gistname)
                    : that.load_notebook(gistname, null); // do a load - we need to refresh
            });
        },
        update_cell: function(cell_model) {
            return update_notebook(refresh_buffers().concat(model.update_cell(cell_model)))
                .then(default_callback_);
        },
        update_asset: function(asset_model) {
            return update_notebook(refresh_buffers().concat(model.update_asset(asset_model)))
                .then(default_callback_);
        },
        rename_notebook: function(desc) {
            return update_notebook(refresh_buffers(), null, {description: desc})
                .then(default_callback_);
        },
        save: function() {
            if(!dirty_)
                return Promise.resolve(undefined);
            return update_notebook(refresh_buffers())
                .then(default_callback_);
        },
        run_all: function() {
            this.save();
            _.each(model.cells, function(cell_model) {
                cell_model.controller.set_status_message("Waiting...");
            });

            // will ordering bite us in the leg here?
            var promises = _.map(model.cells, function(cell_model) {
                return Promise.resolve().then(function() {
                    cell_model.controller.set_status_message("Computing...");
                    return cell_model.controller.execute();
                });
            });
            return Promise.all(promises);
        },

        //////////////////////////////////////////////////////////////////////

        is_mine: function() {
            return rcloud.username() === model.user();
        },

        //////////////////////////////////////////////////////////////////////

        _r_source_visible: true,

        hide_r_source: function() {
            this._r_source_visible = false;
            show_source_checkbox_.set_state(this._r_source_visible);
            Notebook.hide_r_source();
        },
        show_r_source: function() {
            this._r_source_visible = true;
            show_source_checkbox_.set_state(this._r_source_visible);
            Notebook.show_r_source();
        }
    };
    model.controller = result;
    return result;
};
Notebook.hide_r_source = function(selection)
{
    if (selection)
        selection = $(selection).find(".r");
    else
        selection = $(".r");
    selection.parent().hide();
};

Notebook.show_r_source = function(selection)
{
    if (selection)
        selection = $(selection).find(".r");
    else
        selection = $(".r");
    selection.parent().show();
};
Notebook.part_name = function(id, language) {
    // yuk
    if(_.isString(id))
        return id;
    var ext;
    switch(language) {
    case 'R':
        ext = 'R';
        break;
    case 'Markdown':
        ext = 'md';
        break;
    default:
        throw "Unknown language " + language;
    }
    return 'part' + id + '.' + ext;
};
// FIXME this is just a proof of concept - using Rserve console OOBs
var append_session_info = function(msg) {
    // one hacky way is to maintain a <pre> that we fill as we go
    // note that R will happily spit out incomplete lines so it's
    // not trivial to maintain each output in some separate structure
    if (!document.getElementById("session-info-out"))
        $("#session-info").append($("<pre id='session-info-out'></pre>"));
    $("#session-info-out").append(msg);
    RCloud.UI.right_panel.collapse($("#collapse-session-info"), false);
};

// FIXME this needs to go away as well.
var oob_handlers = {
    "browsePath": function(v) {
        var x=" "+ window.location.protocol + "//" + window.location.host + v+" ";
        $("#help-frame").attr("src", x);
        RCloud.UI.left_panel.collapse($("#collapse-help"), false);
    },
    "console.out": append_session_info,
    "console.msg": append_session_info,
    "console.err": append_session_info
};

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
                return new Promise(function(resolve, reject) {
                    rclient = RClient.create({
                        debug: rclient.debug,
                        host: rclient.host,
                        on_connect: function(ocaps) {
                            rcloud = RCloud.create(ocaps.rcloud);
                            rcloud.session_init(rcloud.username(), rcloud.github_token());
                            rcloud.display.set_device_pixel_ratio();
                            rcloud.api.set_url(window.location);

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
    }, init: function(allow_anonymous) {
        this.first_session_ = true;

        return new Promise(function(resolve, reject) {
            rclient = RClient.create({
                debug: false,
                host:  location.href.replace(/^http/,"ws").replace(/#.*$/,""),
                on_connect: function(ocaps) {
                    rcloud = RCloud.create(ocaps.rcloud);
                    if (allow_anonymous) {
                        var promise;
                        if (rcloud.authenticated) {
                            promise = rcloud.session_init(rcloud.username(), rcloud.github_token());
                        } else {
                            promise = rcloud.anonymous_session_init();
                        }
                        promise.then(function(hello) {
                            rclient.post_response(hello);
                        });
                    } else {
                        if (!rcloud.authenticated) {
                            rclient.post_error(rclient.disconnection_error("Please login first!"));
                            rclient.close();
                            reject(new Error("Not authenticated"));
                            return;
                        }
                        rcloud.session_init(rcloud.username(), rcloud.github_token()).then(function(hello) {
                            rclient.post_response(hello);
                        });
                    }
                    rcloud.display.set_device_pixel_ratio();
                    rcloud.api.set_url(window.location.href);

                    resolve(rcloud.init_client_side_data());
                }, on_data: function(v) {
                    v = v.value.json();
                    oob_handlers[v[0]] && oob_handlers[v[0]](v.slice(1));
                }
            });
        });

    }
};
RCloud.UI = {};
RCloud.UI.init = function() {
    $("#fork-revert-notebook").click(function() {
        var is_mine = shell.notebook.controller.is_mine();
        var gistname = shell.gistname();
        var version = shell.version();
        editor.fork_or_revert_notebook(is_mine, gistname, version);
    });
    $("#open-in-github").click(function() {
        window.open(shell.github_url(), "_blank");
    });
    $("#open-from-github").click(function() {
        var result = prompt("Enter notebook ID or github URL:");
        if(result !== null)
            shell.open_from_github(result);
    });
    $("#import-notebooks").click(function() {
        shell.import_notebooks();
    });
    var saveb = $("#save-notebook");
    saveb.click(function() {
        shell.save_notebook();
    });
    shell.notebook.controller.save_button(saveb);
    $('#export-notebook-file').click(function() {
        shell.export_notebook_file();
    });
    $('#export-notebook-as-r').click(function() {
        shell.export_notebook_as_r_file();
    });
    $('#import-notebook-file').click(function() {
        shell.import_notebook_file();
    });
    $("#upload-submit").click(function() {
        var to_notebook = ($('#upload-to-notebook').is(':checked'));
        function success(lst) {
            var path = lst[0], file = lst[1], notebook = lst[2];
            $("#file-upload-div").append(
                bootstrap_utils.alert({
                    "class": 'alert-info',
                    text: (to_notebook ? "Asset " : "File ") + file.name + " uploaded.",
                    on_close: function() {
                        $(".progress").hide();
                    }
                })
            );
            if(to_notebook)
                editor.update_notebook_file_list(notebook.files);
        };

        // FIXME check for more failures besides file exists
        function failure() {
            var overwrite_click = function() {
                rcloud.upload_file(true, function(err, value) {
                    if (err) {
                        $("#file-upload-div").append(
                            bootstrap_utils.alert({
                                "class": 'alert-danger',
                                text: err
                            })
                        );
                    } else {
                        success(value);
                    }
                });
            };
            var alert_element = $("<div></div>");
            var p = $("<p>File exists. </p>");
            alert_element.append(p);
            var overwrite = bootstrap_utils
                .button({"class": 'btn-danger'})
                .click(overwrite_click)
                .text("Overwrite");
            p.append(overwrite);
            $("#file-upload-div").append(bootstrap_utils.alert({'class': 'alert-danger', html: alert_element}));
        }

        var upload_function = to_notebook
            ? rcloud.upload_to_notebook
            : rcloud.upload_file;

        upload_function(false, function(err, value) {
            if (err)
                failure(err);
            else
                success(value);
        });
    });

    RCloud.UI.left_panel.init();
    RCloud.UI.right_panel.init();

    var non_notebook_panel_height = 246;
    $('.notebook-tree').css('height', (window.innerHeight - non_notebook_panel_height)+'px');

    $("#search").submit(function() {
        var qry = $('#input-text-search').val();
        RCloud.UI.search.exec(qry);
        return false;
    });

    $("#insert-new-cell").click(function() {
        debugger;
        var language = $("#insert-cell-language option:selected").text();
        if (language === 'Markdown') {
            shell.new_markdown_cell("");
        } else if (language === 'R') {
            shell.new_interactive_cell("", false);
        }
        var vs = shell.notebook.view.sub_views;
        vs[vs.length-1].show_source();
    });

    // $("#new-md-cell-button").click(function() {
    //     shell.new_markdown_cell("");
    //     var vs = shell.notebook.view.sub_views;
    //     vs[vs.length-1].show_source();
    // });
    // $("#new-r-cell-button").click(function() {
    //     shell.new_interactive_cell("", false);
    //     var vs = shell.notebook.view.sub_views;
    //     vs[vs.length-1].show_source();
    // });
    $("#rcloud-logout").click(function() {
        // let the server-side script handle this so it can
        // also revoke all tokens
        window.location.href = '/logout.R';
    });

    $("#comment-submit").click(function() {
        editor.post_comment($("#comment-entry-body").val());
        return false;
    });

    $("#run-notebook").click(shell.run_notebook);

    RCloud.UI.scratchpad.init();
    RCloud.UI.command_prompt.init();
    RCloud.UI.help_frame.init();

    function make_cells_sortable() {
        var cells = $('#output');
        cells.sortable({
            items: "> .notebook-cell",
            start: function(e, info) {
                $(e.toElement).addClass("grabbing");
            },
            stop: function(e, info) {
                $(e.toElement).removeClass("grabbing");
            },
            update: function(e, info) {
                var ray = cells.sortable('toArray');
                var model = info.item.data('rcloud.model'),
                    next = info.item.next().data('rcloud.model');
                shell.notebook.controller.move_cell(model, next);
            },
            handle: " .ace_gutter-layer",
            scroll: true,
            scrollSensitivity: 40
        });
    }
    make_cells_sortable();

    //////////////////////////////////////////////////////////////////////////
    // autosave when exiting. better default than dropping data, less annoying
    // than prompting
    $(window).bind("unload", function() {
        shell.save_notebook();
        return true;
    });

    $(".panel-collapse").collapse({toggle: false});

    //////////////////////////////////////////////////////////////////////////
    // view mode things
    $("#edit-notebook").click(function() {
        window.location = "main.html?notebook=" + shell.gistname();
    });

};
RCloud.UI.load = function() {
    RCloud.UI.left_panel.load();
    RCloud.UI.right_panel.load();
};
RCloud.UI.column = function(sel_column, colwidth) {
    function classes(cw) {
        return "col-md-" + cw + " col-sm-" + cw;
    }
    var result = {
        colwidth: function(val) {
            if(!_.isUndefined(val) && val != colwidth) {
                $(sel_column).removeClass(classes(colwidth)).addClass(classes(val));
                colwidth = val;
            }
            return colwidth;
        }
    };
    return result;
};

RCloud.UI.collapsible_column = function(sel_column, sel_accordion, sel_collapser, colwidth) {
    var collapsed_ = false;
    var result = RCloud.UI.column(sel_column, colwidth);
    function collapsibles() {
        return $(sel_accordion + " > .panel > div.panel-collapse");
    }
    function togglers() {
        return $(sel_accordion + " > .panel > div.panel-heading > a.accordion-toggle");
    }
    function collapse(target, collapse, persist) {
        target.data("would-collapse", collapse);
        if(persist && rcloud.config) {
            var opt = 'ui/' + target[0].id;
            rcloud.config.set_user_option(opt, collapse);
        }
    }
    function all_collapsed() {
        return $.makeArray(collapsibles()).every(function(el) {
            return $(el).hasClass('out') || $(el).data("would-collapse")===true;
        });
    }
    function sel_to_opt(sel) {
        return sel.replace('#', 'ui/');
    }
    function opt_to_sel(opt) {
        return opt.replace('ui/', '#');
    }
    _.extend(result, {
        init: function() {
            var that = this;
            collapsibles().each(function() {
                $(this).data("would-collapse", !$(this).hasClass('in') && !$(this).hasClass('out'));
            });
            togglers().click(function() {
                var target = $(this.hash);
                that.collapse(target, target.hasClass('in'));
                return false;
            });
            $(sel_accordion).on("show.bs.collapse", function(e) {
                that.resize();
            });
            $(sel_accordion).on("hide.bs.collapse", function(e) {
                that.resize();
            });
            var shadow_sizer = function() {
                $(".panel-shadow").each(function(v) {
                    var h = $(this).parent().height();
                    if (h === 0)
                        h = "100%";
                    $(this).attr("height", h);
                });
            };
            $(sel_accordion).on("shown.bs.collapse", shadow_sizer);
            $(sel_accordion).on("reshadow", shadow_sizer);
            $(sel_collapser).click(function() {
                if (collapsed_)
                    that.show(true);
                else
                    that.hide(true);
            });
        },
        load: function() {
            var that = this;
            var sels = $.makeArray(collapsibles()).map(function(el) { return '#' + el.id; });
            sels.push(sel_accordion);
            var opts = sels.map(sel_to_opt);
            rcloud.config.get_user_option(opts).then(function(settings) {
                var hide_column;
                for(var k in settings) {
                    var id = opt_to_sel(k);
                    if(id === sel_accordion)
                        hide_column = settings[k];
                    else if(typeof settings[k] === "boolean")
                        collapse($(id), settings[k], false);
                }
                // do the column last because it will affect all its children
                if(typeof hide_column === "boolean") {
                    if(hide_column)
                        that.hide(false);
                    else
                        that.show(false);
                }
                else that.show(true); // make sure we have a setting
            });
        },
        collapse: function(target, whether) {
            if(collapsed_) {
                collapse(target, false, true);
                this.show(true);
                return;
            }
            collapse(target, whether, true);
            if(all_collapsed())
                this.hide(true);
            else
                this.show(true);
        },
        resize: function() {
            var cw = this.calcwidth();
            console.log("resizing " + sel_column + " to " + cw);
            this.colwidth(cw);
            RCloud.UI.middle_column.update();
        },
        hide: function(persist) {
            // all collapsible sub-panels that are not "out" and not already collapsed, collapse them
            $(sel_accordion + " > .panel > div.panel-collapse:not(.collapse):not(.out)").collapse('hide');
            $(sel_collapser + " i").removeClass("icon-minus").addClass("icon-plus");
            collapsed_ = true;
            this.resize();
            if(persist && rcloud.config)
                rcloud.config.set_user_option(sel_to_opt(sel_accordion), true);
        },
        show: function(persist) {
            if(all_collapsed())
                collapse($(collapsibles()[0]), false, true);
            collapsibles().each(function() {
                $(this).collapse($(this).data("would-collapse") ? "hide" : "show");
            });
            $(sel_collapser + " i").removeClass("icon-plus").addClass("icon-minus");
            collapsed_ = false;
            this.resize();
            if(persist && rcloud.config)
                rcloud.config.set_user_option(sel_to_opt(sel_accordion), false);
        },
        calcwidth: function() {
            if(collapsed_)
                return 1;
            var widths = [];
            collapsibles().each(function() {
                var width = $(this).data("would-collapse") ? 1 : $(this).attr("data-colwidth");
                if(width > 0)
                    widths.push(width);
            });
            return d3.max(widths);
        }
    });
    return result;
};
RCloud.UI.left_panel = (function() {
    var result = RCloud.UI.collapsible_column("#left-column,#fake-left-column",
                                              "#accordion-left", "#left-pane-collapser", 3);
    var base_hide = result.hide.bind(result),
        base_show = result.show.bind(result);

    _.extend(result, {
        hide: function(persist) {
            $("#new-notebook").hide();
            base_hide(persist);
        },
        show: function(persist) {
            $("#new-notebook").show();
            base_show(persist);
        }
    });
    return result;
}());

RCloud.UI.right_panel = (function() {
    var result = RCloud.UI.collapsible_column("#right-column,#fake-right-column",
                                              "#accordion-right", "#right-pane-collapser", 4);
    return result;
}());
RCloud.UI.middle_column = (function() {
    var result = RCloud.UI.column("#middle-column, #prompt-div", 5);

    _.extend(result, {
        update: function() {
            var size = 12 - RCloud.UI.left_panel.colwidth() - RCloud.UI.right_panel.colwidth();
            result.colwidth(size);
        }
    });
    return result;
}());
RCloud.UI.scratchpad = {
    session: null,
    widget: null,
    exists: false,
    current_model: null,
    change_content: null,
    init: function() {
        var that = this;
        function setup_scratchpad(div) {
            var inner_div = $("<div></div>");
            var clear_div = $("<div style='clear:both;'></div>");
            div.append(inner_div);
            div.append(clear_div);
            var ace_div = $('<div style="width:100%; height:100%"></div>');
            ace_div.css({'background-color': "#f1f1f1"});
            inner_div.append(ace_div);
            ace.require("ace/ext/language_tools");
            var widget = ace.edit(ace_div[0]);
            var RMode = require("ace/mode/r").Mode;
            var session = widget.getSession();
            that.session = session;
            that.widget = widget;
            var doc = session.doc;
            session.on('change', function() {
                div.css({'height': ui_utils.ace_editor_height(widget, 30) + "px"});
                widget.resize();
            });

            widget.setOptions({
                enableBasicAutocompletion: true
            });
            session.setMode(new RMode(false, doc, session));
            session.setUseWrapMode(true);
            widget.resize();
            ui_utils.on_next_tick(function() {
                session.getUndoManager().reset();
                div.css({'height': ui_utils.ace_editor_height(widget, 30) + "px"});
                widget.resize();
            });
            that.change_content = ui_utils.ignore_programmatic_changes(
                that.widget, function() {
                    if (that.current_model)
                        that.current_model.parent_model.on_dirty();
                });
            ui_utils.install_common_ace_key_bindings(widget);
        }
        var scratchpad_editor = $("#scratchpad-editor");
        if (scratchpad_editor.length) {
            this.exists = true;
            setup_scratchpad(scratchpad_editor);
        }
        $("#new-asset > a").click(function() {
            // FIXME prompt, yuck. I know, I know.
            var filename = prompt("Choose a filename for your asset");
            if (!filename)
                return;
            if (filename.toLocaleLowerCase().substring(0,4) === "part") {
                alert("Asset names cannot start with 'part', sorry!");
                return;
            }
            shell.notebook.controller.append_asset(
                "# New file " + filename, filename).select();
        });
    },
    // FIXME this is completely backwards
    set_model: function(asset_model) {
        var that = this;
        if(!this.exists)
            return;
        var modes = {
            r: "ace/mode/r",
            py: "ace/mode/python",
            md: "ace/mode/rmarkdown",
            css: "ace/mode/css",
            txt: "ace/mode/text"
        };
        if (this.current_model) {
            this.current_model.cursor_position(this.widget.getCursorPosition());
            // if this isn't a code smell I don't know what is.
            if (this.current_model.content(this.widget.getValue())) {
                this.current_model.parent_model.controller.update_asset(this.current_model);
            }
        }
        this.current_model = asset_model;
        if (!this.current_model) {
            that.session.setValue("");
            that.widget.resize();
            return;
        }
        this.change_content(this.current_model.content());
        // restore cursor
        var model_cursor = asset_model.cursor_position();
        if (model_cursor) {
            ui_utils.ace_set_pos(this.widget, model_cursor);
        } else {
            ui_utils.ace_set_pos(this.widget, 0, 0);
        }
        ui_utils.on_next_tick(function() {
            that.session.getUndoManager().reset();
        });
        var lang = asset_model.language().toLocaleLowerCase();
        var mode = require(modes[lang] || modes.txt).Mode;
        that.session.setMode(new mode(false, that.session.doc, that.session));
        that.widget.resize();
        that.widget.focus();
    },
    // this behaves like cell_view's update_model
    update_model: function() {
        return this.current_model.content(this.widget.getSession().getValue());
    }, clear: function() {
        var that = this;
        if(!this.exists)
            return;
        that.session.setValue("");
        that.session.getUndoManager().reset();
        that.widget.resize();
    }
};
RCloud.UI.command_prompt = {
    prompt: null,
    history: null,
    init: function() {
        this.history = this.setup_prompt_history();
        this.prompt = this.setup_command_prompt();
    },
    focus: function() {
        // surely not the right way to do this
        if (!this.prompt)
            return;
        this.prompt.widget.focus();
        this.prompt.restore();
    },
    setup_prompt_history: function() {
        var entries_ = [], alt_ = [];
        var curr_ = 0;
        function curr_cmd() {
            return alt_[curr_] || (curr_<entries_.length ? entries_[curr_] : "");
        }
        var prefix_ = null;
        var result = {
            init: function() {
                prefix_ = "rcloud.history." + shell.gistname() + ".";
                var i = 0;
                entries_ = [];
                alt_ = [];
                while(1) {
                    var cmd = window.localStorage[prefix_+i],
                        cmda = window.localStorage[prefix_+i+".alt"];
                    if(cmda !== undefined)
                        alt_[i] = cmda;
                    if(cmd === undefined)
                        break;
                    entries_.push(cmd);
                    ++i;
                }
                curr_ = entries_.length;
                return curr_cmd();
            },
            execute: function(cmd) {
                if(cmd==="") return;
                alt_[entries_.length] = null;
                entries_.push(cmd);
                alt_[curr_] = null;
                curr_ = entries_.length;
                window.localStorage[prefix_+(curr_-1)] = cmd;
            },
            last: function() {
                if(curr_>0) --curr_;
                return curr_cmd();
            },
            next: function() {
                if(curr_<entries_.length) ++curr_;
                return curr_cmd();
            },
            change: function(cmd) {
                window.localStorage[prefix_+curr_+".alt"] = alt_[curr_] = cmd;
            }
        };
        return result;
    },

    setup_command_prompt: function() {
        var that = this;
        var prompt_div = $("#command-prompt");
        if (!prompt_div.length)
            return null;
        function set_ace_height() {
            prompt_div.css({'height': ui_utils.ace_editor_height(widget) + "px"});
            widget.resize();
        }
        prompt_div.css({'background-color': "#fff"});
        prompt_div.addClass("r-language-pseudo");
        ace.require("ace/ext/language_tools");
        var widget = ace.edit(prompt_div[0]);
        set_ace_height();
        var RMode = require("ace/mode/r").Mode;
        var session = widget.getSession();
        var doc = session.doc;
        widget.setOptions({
            enableBasicAutocompletion: true
        });
        session.setMode(new RMode(false, doc, session));
        session.on('change', set_ace_height);

        widget.setTheme("ace/theme/chrome");
        session.setUseWrapMode(true);
        widget.resize();
        var change_prompt = ui_utils.ignore_programmatic_changes(widget, this.history.change.bind(this.history));
        function execute(widget, args, request) {
            var code = session.getValue();
            if(code.length) {
                var language = $("#insert-cell-language option:selected").text();
                if (language === 'Markdown') {
                    shell.new_markdown_cell(code, true);
                } else if (language === 'R') {
                    shell.new_interactive_cell(code, true);
                }
                change_prompt('');
            }
        }

        function last_row(widget) {
            var doc = widget.getSession().getDocument();
            return doc.getLength()-1;
        }

        function last_col(widget, row) {
            var doc = widget.getSession().getDocument();
            return doc.getLine(row).length;
        }

        function restore_prompt() {
            var cmd = that.init();
            change_prompt(cmd);
            var r = last_row(widget);
            ui_utils.ace_set_pos(widget, r, last_col(widget, r));
        }

        ui_utils.install_common_ace_key_bindings(widget);

        // note ace.js typo which we need to correct when we update ace
        var up_handler = widget.commands.commandKeyBinding[0]["up"],
            down_handler = widget.commands.commandKeyBinding[0]["down"];
        widget.commands.addCommands([{
            name: 'execute',
            bindKey: {
                win: 'Return',
                mac: 'Return',
                sender: 'editor'
            },
            exec: execute
        }, {
            name: 'execute-2',
            bindKey: {
                win: 'Ctrl-Return',
                mac: 'Command-Return',
                sender: 'editor'
            },
            exec: execute
        }, {
            name: 'up-with-history',
            bindKey: 'up',
            exec: function(widget, args, request) {
                var pos = widget.getCursorPosition();
                if(pos.row > 0)
                    up_handler.exec(widget, args, request);
                else {
                    change_prompt(that.history.last());
                    var r = last_row(widget);
                    ui_utils.ace_set_pos(widget, r, last_col(widget, r));
                }
            }
        }, {
            name: 'down-with-history',
            bindKey: 'down',
            exec: function(widget, args, request) {
                var pos = widget.getCursorPosition();
                var r = last_row(widget);
                if(pos.row < r)
                    down_handler.exec(widget, args, request);
                else {
                    change_prompt(that.history.next());
                    ui_utils.ace_set_pos(widget, 0, last_col(widget, 0));
                }
            }
        }
        ]);
        ui_utils.make_prompt_chevron_gutter(widget);

        return {
            widget: widget,
            restore: restore_prompt
        };
    }
};
RCloud.UI.share_button = {
    set_link: function() {
        var link = window.location.protocol + '//' + window.location.host + '/view.html?notebook=' + shell.gistname();
        var v = shell.version();
        if(v)
            link += '&version='+v;

        $("#share-link").attr("href", link);
    }
};
/*
 * Adjusts the UI depending on whether notebook is read-only
 */
RCloud.UI.configure_readonly = function() {
    var fork_revert = $('#fork-revert-notebook');
    if(shell.notebook.model.read_only()) {
        $('#prompt-div').hide();
        fork_revert.text(shell.notebook.controller.is_mine() ? 'Revert' : 'Fork');
        fork_revert.show();
        $('#save-notebook').hide();
        $('#output').sortable('disable');
    }
    else {
        $('#prompt-div').show();
        fork_revert.hide();
        $('#save-notebook').show();
        $('#output').sortable('enable');
    }
};
RCloud.UI.notebook_title = (function() {
    var last_editable_ =  null;
    function rename_current_notebook(name) {
        editor.rename_notebook(name)
            .then(function() {
                result.set(name);
            });
    }
    // always select all text after last slash, or all text
    function select(el) {
        if(el.childNodes.length !== 1 || el.firstChild.nodeType != el.TEXT_NODE)
            throw new Error('expecting simple element with child text');
        var text = el.firstChild.textContent;
        var range = document.createRange();
        range.setStart(el.firstChild, text.lastIndexOf('/') + 1);
        range.setEnd(el.firstChild, text.length);
        return range;
    }
    var editable_opts = {
        change: rename_current_notebook,
        select: select,
        validate: function(name) { return editor.validate_name(name); }
    };

    var result = {
        set: function (text) {
            var is_read_only = shell.notebook.model.read_only();
            var active_text = text;
            var ellipt_start = false, ellipt_end = false;
            var title = $('#notebook-title');
            title.text(text);
            while(window.innerWidth - title.width() < 505) {
                var slash = text.search('/');
                if(slash >= 0) {
                    ellipt_start = true;
                    text = text.slice(slash+1);
                }
                else {
                    ellipt_end = true;
                    text = text.substr(0, text.length - 2);
                }
                title.text((ellipt_start ? '.../' : '')
                                          + text +
                                          (ellipt_end ? '...' : ''));
            }
            ui_utils.editable(title, $.extend({allow_edit: !is_read_only,
                                               inactive_text: title.text(),
                                               active_text: active_text},
                                              editable_opts));
        }, make_editable: function(node, editable) {
            function get_title(node) {
                return $('.jqtree-title:not(.history)', node.element);
            }
            if(last_editable_ && (!node || last_editable_ !== node))
                ui_utils.editable(get_title(last_editable_), 'destroy');
            if(node) {
                ui_utils.editable(get_title(node),
                                  $.extend({allow_edit: editable,
                                            inactive_text: node.name,
                                            active_text: node.full_name},
                                           editable_opts));
            }
            last_editable_ = node;
        }
    };
    return result;
})();
RCloud.UI.search = {
    exec: function(query) {
        function summary(html) {
            $("#search-summary").show().html($("<h4 />").append(html));
        }
        function create_list_of_search_results(d) {
            var i;
            if(d == null || d == "null" || d == "") {
                summary("No Results Found");
            } else if(d[0] == "error") {
                d[1] = d[1].replace(/\n/g, "<br/>");
                summary("ERROR:\n" + d[1]);
            } else {
                if(typeof (d) == "string") {
                    d = JSON.parse("[" + d + "]");
                }
                //convert any string type part to json object : not required most of the time
                for(i = 0; i < d.length; i++) {
                    if(typeof (d[i]) == "string") {
                        d[i] = JSON.parse(d[i]);
                    }
                }
                d.sort(function(a, b) {
                    var astars = +(a.starcount||0), bstars = +(b.starcount||0);
                    return bstars-astars;
                });
                var len = d.length;
                var search_results = "";
                var star_count;
                var qtime = 0;
                //iterating for all the notebooks got in the result/response
                for(i = 0; i < len; i++) {
                    try {
                        qtime = d[0].QTime;
                        if(typeof d[i].starcount === "undefined") {
                            star_count = 0;
                        } else {
                            star_count = d[i].starcount;
                        }
                        var notebook_id = d[i].id;
                        var image_string = "<i class=\"icon-star\" style=\"font-size: 110%; line-height: 90%;\"><sub>" + star_count + "</sub></i>";
                        d[i].parts = JSON.parse(d[i].parts);
                        var parts_table = "";
                        var inner_table = "";
                        var added_parts = 0;
                        //displaying only 5 parts of the notebook sorted based on relevancy from solr
                        for(var k = 0; k < d[i].parts.length && added_parts < 5; k++) {
                            inner_table = "";
                            var ks = Object.keys(d[i].parts[k]);
                            if(ks.length > 0 && d[i].parts[k].content != "") {
                                var content = d[i].parts[k].content;
                                if(typeof content == "string")
                                    content = [content];
                                if(content.length > 0)
                                    parts_table += "<tr><th class='search-result-part-name'>" + d[i].parts[k].filename + "</th></tr>";
                                for(var l = 0; l < content.length; l++)
                                    inner_table += "<tr><td class='search-result-line-number'>" + (l + 1) + "</td><td class='search-result-code'><code>" + content[l] + "</code></td></tr>";

                                added_parts++;
                            }
                            if(inner_table != "") {
                                inner_table = "<table>" + inner_table + "</table>";
                                parts_table += "<tr><td>" + inner_table + "</td></tr>";
                            }
                        }
                        if(parts_table != "") {
                            parts_table = "<table>" + parts_table + "</table>";
                        }
                        search_results += "<table class='search-result-item' width=100%><tr><td width=10%>" + "<a id=\"open_" + i + "\" href='javascript:editor.load_notebook(\"" + notebook_id + "\")' class='search-result-heading'>" + d[i].user + " / " + d[i].notebook + "</a>" + image_string + "<br/><span class='search-result-modified-date'>modified at <i>" + d[i].updated_at + "</i></span></td></tr>";
                        if(parts_table != "")
                            search_results += "<tr><td colspan=2 width=100% style='font-size: 12'><div>" + parts_table + "</div></td></tr>";
                        search_results += "</table>";
                    } catch(e) {
                        summary("Error : \n" + e);
                    }
                }
                var qry = decodeURIComponent(query);
                qry = qry.replace(/\</g,'&lt;');
                qry = qry.replace(/\>/g,'&gt;');
                var search_summary = len + " Results Found"; //+ " <i style=\"font-size:10px\"> Response Time:"+qtime+"ms</i>";
                summary(search_summary);
                $("#search-results").show().css("height", "50vh").html(search_results);
                $("#accordion-left").trigger("reshadow");
            }
        };

        summary("Searching...");
        $("#search-results").hide().html("");
        query = encodeURIComponent(query);
        rcloud.with_progress(function(done) {
            rcloud.search(query).then(function (v) {
                create_list_of_search_results(v);
                done();
            });
        });
    }
};
RCloud.UI.help_frame = {
    init: function() {
        // i can't be bothered to figure out why the iframe causes onload to be triggered early
        // if this code is directly in main.html
        $("#help-parent").append('<iframe id="help-frame" frameborder="0" />');
    }
};
