// FIXME all RCloud.*.post_error calls should be handled elsewhere

RClient = {
    create: function(opts) {
        opts = _.defaults(opts, {
            debug: false
        });
        function on_connect() {
            if (!rserve.ocap_mode) {
                RCloud.UI.session_pane.post_error(ui_utils.disconnection_error("Expected an object-capability Rserve. Shutting Down!"));
                shutdown();
                return;
            }

            // the rcloud ocap-0 performs the login authentication dance
            // success is indicated by the rest of the capabilities being sent
            var session_mode = (opts.mode) ? opts.mode : "client";
            rserve.ocap([token, execToken], session_mode, function(err, ocaps) {
                if(err)
                    on_error(err[0], err[1]);
                else {
                    ocaps = Promise.promisifyAll(ocaps);
                    if(ocaps === null) {
                        on_error("Login failed. Shutting down!");
                    }
                    else if(RCloud.is_exception(ocaps)) {
                        on_error(ocaps);
                    }
                    else {
                        result.running = true;
                        /*jshint -W030 */
                        opts.on_connect && opts.on_connect.call(result, ocaps);
                    }
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
                /*jshint -W087 */
                debugger;
            }
            if (opts.on_error && opts.on_error(msg, status_code))
                return;
            RCloud.UI.session_pane.post_error(ui_utils.disconnection_error(msg));
            shutdown();
        }

        function on_close(msg) {
            if (opts.debug) {
                /*jshint -W087 */
                debugger;
            }
            if (!clean) {
                RCloud.UI.fatal_dialog("Your session has been logged out.", "Reconnect", ui_utils.relogin_uri());
                shutdown();
            }
        }

        var token = $.cookies.get().token;  // document access token
        var execToken = $.cookies.get().execToken; // execution token (if enabled)
        var rserve = Rserve.create({
            host: opts.host,
            on_connect: on_connect,
            on_error: on_error,
            on_close: on_close,
            on_data: opts.on_data,
            on_oob_message: opts.on_oob_message
        });

        var result;
        var clean = false;

        result = {
            _rserve: rserve,
            host: opts.host,
            running: false,

            post_response: function (msg) {
                var d = $("<pre class='response'></pre>").html(msg);
                //$(d).insertBefore("#selection-bar");//.insertBefore(d);

                $('#output').append(d);
            },

            post_rejection: function(e) {
                RCloud.UI.session_pane.post_error(e.message);
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

// FIXME: what is considered an execption - and API error or also cell eval error? We can tell them apart now ...
RCloud.is_exception = function(v) {
    // consider only OCAP errors an exception -- eventually both should use the exception mechanism, though
    return _.isObject(v) && v.r_attributes && v.r_attributes['class'] === 'OCAP-eval-error';

    // once we get there, the following catches all of them
    // FIXME: it would be nice to support inherits() [i.e., look at the class structure not just the last subclass]
    // such that we don't need to hard-code all classes ...
    // return _.isObject(v) && v.r_attributes && (v.r_attributes['class'] === 'OCAP-eval-error' || v.r_attributes['class'] === 'cell-eval-error'|| v.r_attributes['class'] === 'parse-error');
};

RCloud.exception_message = function(v) {
    if (!RCloud.is_exception(v))
        throw new Error("Not an R exception value");
    return v['error'];
};

//////////////////////////////////////////////////////////////////////////////
// promisification

RCloud.promisify_paths = (function() {
    function rcloud_handler(command, promise_fn) {
        function success(result) {
            if(result && RCloud.is_exception(result)) {
                var tb = result['traceback'] ? result['traceback'] : "";
                if (tb.join) tb = tb.join("\n");
                throw new Error(command + ": " + result.error + "R trace:\n" + tb);
            }
            return result;
        }

        return function() {
            return promise_fn.apply(this, arguments).then(success);
        };
    }

    function process_paths(ocaps, paths, replace) {
        function get(path) {
            var v = ocaps;
            for (var i=0; i<path.length; ++i)
                v = v[path[i]];
            return v;
        }

        function set(path, val) {
            var v = ocaps;
            for (var i=0; i<path.length-1; ++i)
                v = v[path[i]];
            v[path[path.length-1] + suffix] = val;
        }

        var suffix = replace ? '' : 'Async';
        _.each(paths, function(path) {
            var fn = get(path);
            set(path, fn ? rcloud_handler(path.join('.'), Promise.promisify(fn)) : null);
        });
        return ocaps;
    }

    return process_paths;
})();

RCloud.create = function(rcloud_ocaps) {
    function rcloud_github_handler(command, promise) {
        function success(result) {
            if (result.ok) {
                return result.content;
            } else {
                var message;
                if(result.content && result.content.message)
                    message = result.content.message + ' (' + result.code + ')';
                else
                    message = "error code " + result.code;
                throw new Error(command + ': ' + message);
            }
        }
        return promise.then(success);
    }

    var rcloud = {};

    function setup_unauthenticated_ocaps() {
        var paths = [
            ["version_info"],
            ["anonymous_session_init"],
            ["anonymous_compute_init"],
            ["has_compute_separation"],
            ["prefix_uuid"],
            ["get_conf_value"],
            ["get_conf_values"],
            ["get_gist_sources"],
            ["get_notebook"],
            ["load_notebook"],
            ["load_notebook_compute"],
            ["call_notebook"],
            ["install_notebook_stylesheets"],
            ["get_version_by_tag"],
            ["get_tag_by_version"],
            ["get_users"],
            ["log", "record_cell_execution"],
            ["setup_js_installer"],
            ["replace_token"],
            ["comments","get_all"],
            ["help"],
            ["debug","raise"],
            ["stars","star_notebook"],
            ["stars","unstar_notebook"],
            ["stars","is_notebook_starred"],
            ["stars","get_notebook_star_count"],
            ["stars","get_notebook_starrer_list"],
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
            ["api", "get_url"],
            ["get_notebook_by_name"],
            ["languages", "get_list"],
            ["plots", "render"],
            ["plots", "get_formats"]
        ];
        RCloud.promisify_paths(rcloud_ocaps, paths);

        rcloud.username = function() {
            return $.cookies.get('user');
        };
        rcloud.github_token = function() {
            return $.cookies.get('token');
        };

        rcloud.version_info = function() {
            return rcloud_ocaps.version_infoAsync.apply(null, arguments);
        };

        rcloud.anonymous_session_init = function() {
            return rcloud_ocaps.anonymous_session_initAsync();
        };

        rcloud.anonymous_compute_init = function() {
            return rcloud_ocaps.anonymous_compute_initAsync();
        };

        rcloud.init_client_side_data = function() {
            var that = this;
            return Promise.all([rcloud_ocaps.prefix_uuidAsync(),
                                rcloud_ocaps.has_compute_separationAsync()])
                .spread(function(uuid, has_compute) {
                    that.deferred_knitr_uuid = uuid;
                    that.has_compute_separation = has_compute;
                });
        };

        rcloud.get_conf_value = function(key, source) {
            return rcloud_ocaps.get_conf_valueAsync(key, source);
        };

        rcloud.get_conf_values = function(key) {
            return rcloud_ocaps.get_conf_valuesAsync(key);
        };

        rcloud.get_gist_sources = function() {
            return rcloud_ocaps.get_gist_sourcesAsync();
        };

        rcloud.get_notebook = function(id, version, source, raw) {
            if(source===undefined) source = null;
            if(raw===undefined) raw = false;
            return rcloud_github_handler(
                "rcloud.get.notebook " + id,
                rcloud_ocaps.get_notebookAsync(id, version, source, raw));
        };

        rcloud.load_notebook = function(id, version) {
            return Promise.all([
                rcloud_github_handler("rcloud.load.notebook.compute " + id,
                                      rcloud_ocaps.load_notebook_computeAsync(id, version)),
                rcloud_github_handler("rcloud.load.notebook " + id,
                                      rcloud_ocaps.load_notebookAsync(id, version))])
                .spread(function(_, notebook) {
                    return notebook;
                });
        };
        rcloud.refresh_compute_notebook = function(id) {
            return rcloud_github_handler("rcloud.load.notebook.compute (refresh) " + id,
                                         rcloud_ocaps.load_notebook_computeAsync(id, null, null, false));
        };

        rcloud.get_version_by_tag = function(gist_id,tag) {
            return rcloud_ocaps.get_version_by_tagAsync(gist_id,tag);
        };

        rcloud.get_tag_by_version = function(gist_id,version) {
            return rcloud_ocaps.get_tag_by_versionAsync(gist_id,version);
        };

        rcloud.call_notebook = function(id, version) {
            return rcloud_github_handler(
                "rcloud.call.notebook " + id,
                rcloud_ocaps.call_notebookAsync(id, version));
        };

        rcloud.install_notebook_stylesheets = function() {
            return rcloud_ocaps.install_notebook_stylesheetsAsync();
        };

        rcloud.help = function(topic) {
            return rcloud_ocaps.helpAsync(topic).then(function(found) {
                if(!found)
                    RCloud.UI.help_frame.display_content("<h2>No help found for <em>" + topic + "</em></h2>");
            });
        };

        rcloud.get_users = function() {
            return rcloud_ocaps.get_usersAsync();
        };

        rcloud.record_cell_execution = function(json_rep) {
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
                    /*jshint -W061 */
                    var result = eval(content);
                    rcloud.modules[name] = result;
                    k(null, result);
                } catch (e) {
                    Promise.reject(e); // print error
                    var v = { "type": e.name,
                              "message": e.message
                            };
                    k(v, null);
                }
            },
            clear_css: function(current_notebook, k) {
                $(".rcloud-user-defined-css").remove();
                k(null, null);
            },
            install_css: function(urls, k) {
                if (_.isString(urls))
                    urls = [urls];
                else if(!_.isArray(urls)) // not sure why c() is becoming {r_type: 'vector'...}
                    urls = [];
                _.each(urls, function(url) {
                    $("head").append($('<link type="text/css" rel="stylesheet" class="rcloud-user-defined-css" href="' +
                                       url + '"/>'));
                });
                k(null, null);
            }
        });

        // security: request new token
        rcloud.replace_token = function(old_token, realm) {
            return rcloud_ocaps.replace_tokenAsync(old_token, realm);
        };

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
        rcloud.stars.get_notebook_starrer_list = function(id) {
            return rcloud_ocaps.stars.get_notebook_starrer_listAsync(id);
        };
        rcloud.stars.get_multiple_notebook_star_counts = function(id) {
            return rcloud_ocaps.stars.get_multiple_notebook_star_countsAsync(id);
        };

        rcloud.session_cell_eval = function(context_id, filename, language, version, silent) {
            return rcloud_ocaps.session_cell_evalAsync(context_id, filename, language, version, silent);
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

        rcloud.get_notebook_by_name = function(user, path) {
            return rcloud_ocaps.get_notebook_by_nameAsync(user, path);
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

        //////////////////////////////////////////////////////////////////////
        // languages

        rcloud.languages = {};
        rcloud.languages.get_list = function() {
            return rcloud_ocaps.languages.get_listAsync();
        };

        //////////////////////////////////////////////////////////////////////
        // plots
        rcloud.plots = {};
        rcloud.plots.render = function(device, page, options) {
            return rcloud_ocaps.plots.renderAsync(device, page, options);
        };
        rcloud.plots.get_formats = function() {
            return rcloud_ocaps.plots.get_formatsAsync();
        };
    }

    function setup_authenticated_ocaps() {
        var paths = [
            ["session_init"],
            ["compute_init"],
            ["signal_to_compute"],
            ["search"],
            ["update_notebook"],
            ["create_notebook"],
            ["fork_notebook"],
            ["port_notebooks"],
            ["purl_source"],
            ["get_completions"],
            ["rename_notebook"],
            ["authenticated_cell_eval"],
            ["session_markdown_eval"],
            ["notebook_upload"],
            ["tag_notebook_version"],
            ["file_upload","upload_path"],
            ["file_upload","create"],
            ["file_upload","write"],
            ["file_upload","close"],
            ["comments","post"],
            ["comments","modify"],
            ["comments","delete"],
            ["is_notebook_published"],
            ["publish_notebook"],
            ["unpublish_notebook"],
            ["set_notebook_visibility"],
            ["protection", "get_notebook_cryptgroup"],
            ["protection", "set_notebook_cryptgroup"],
            ["protection", "get_cryptgroup_users"],
            ["protection", "get_user_cryptgroups"],
            ["protection", "create_cryptgroup"],
            ["protection", "set_cryptgroup_name"],
            ["protection", "add_cryptgroup_user"],
            ["protection", "remove_cryptgroup_user"],
            ["protection", "delete_cryptgroup"],
            ["protection", "has_notebook_protection"],
            ["api","disable_warnings"],
            ["api","enable_echo"],
            ["api","disable_warnings"],
            ["api","enable_echo"],
            ["config", "all_notebooks"],
            ["config", "all_user_notebooks"],
            ["config", "all_notebooks_multiple_users"],
            ["config", "get_all_notebook_info"],
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
            ["config", "get_alluser_option"],
            ["get_notebook_info"],
            ["get_multiple_notebook_infos"],
            ["set_notebook_info"],
            ["get_notebook_property"],
            ["set_notebook_property"],
            ["remove_notebook_property"],
            ["notebook_by_name"]
        ];
        RCloud.promisify_paths(rcloud_ocaps, paths);

        rcloud.session_init = function(username, token) {
            return rcloud_ocaps.session_initAsync(username, token);
        };

        rcloud.compute_init = function(username, token) {
            return rcloud_ocaps.compute_initAsync(username, token);
        };

        rcloud.signal_to_compute = function(signal) {
            return rcloud_ocaps.signal_to_computeAsync(signal);
        };

        rcloud.update_notebook = function(id, content, is_current) {
            if(is_current === undefined)
                is_current = true;
            return rcloud_github_handler(
                "rcloud.update.notebook",
                rcloud_ocaps.update_notebookAsync(id, content, is_current));
        };

        rcloud.search = rcloud_ocaps.searchAsync; // may be null

        rcloud.create_notebook = function(content, is_current) {
            if(is_current === undefined)
                is_current = true;
            return rcloud_github_handler(
                "rcloud.create.notebook",
              rcloud_ocaps.create_notebookAsync(content, is_current))
                .then(function(result) {
                    if(is_current)
                        rcloud_ocaps.load_notebook_computeAsync(result.id);
                    return result;
                });
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
            return rcloud_ocaps.purl_sourceAsync(source);
        };

        rcloud.get_completions = function(language, text, pos) {
            return rcloud_ocaps.get_completionsAsync(language, text, pos)
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
        rcloud.authenticated_cell_eval = function(context_id, filename, language, version, silent) {
            return rcloud_ocaps.authenticated_cell_evalAsync(context_id, filename, language, version, silent);
        };

        rcloud.notebook_upload = function(file, name) {
            return rcloud_github_handler(
                "rcloud.upload.to.notebook",
                rcloud_ocaps.notebook_uploadAsync(file, name));
        };

        rcloud.tag_notebook_version = function(gist_id,version,tag_name) {
            return rcloud_ocaps.tag_notebook_versionAsync(gist_id,version,tag_name);
        };

        rcloud.post_comment = function(id, content) {
            return rcloud_github_handler(
                "rcloud.post.comment",
                rcloud_ocaps.comments.postAsync(id, content));
        };

        rcloud.modify_comment = function(id, cid, content) {
            return rcloud_ocaps.comments.modifyAsync(id, cid,content);
        };

        rcloud.delete_comment = function(id, cid) {
            return rcloud_ocaps.comments.deleteAsync(id, cid);
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

        // protection
        rcloud.protection = {};
        rcloud.protection.get_notebook_cryptgroup = function(notebookid) {
            return rcloud_ocaps.protection.get_notebook_cryptgroupAsync(notebookid);
        };
        rcloud.protection.set_notebook_cryptgroup = function(notebookid, groupid, modify) {
            if(modify === undefined)
                modify = true;
            return rcloud_ocaps.protection.set_notebook_cryptgroupAsync(notebookid, groupid, modify);
        };
        rcloud.protection.get_cryptgroup_users = function(groupid) {
            return rcloud_ocaps.protection.get_cryptgroup_usersAsync(groupid);
        };
        rcloud.protection.get_user_cryptgroups = function(user) {
            return rcloud_ocaps.protection.get_user_cryptgroupsAsync(user);
        };
        rcloud.protection.create_cryptgroup = function(groupname) {
            return rcloud_ocaps.protection.create_cryptgroupAsync(groupname);
        };
        rcloud.protection.set_cryptgroup_name = function(groupid, groupname) {
            return rcloud_ocaps.protection.set_cryptgroup_nameAsync(groupid, groupname);
        };
        rcloud.protection.add_cryptgroup_user = function(groupid, user, is_admin) {
            return rcloud_ocaps.protection.add_cryptgroup_userAsync(groupid, user, is_admin);
        };
        rcloud.protection.remove_cryptgroup_user = function(groupid, user) {
            return rcloud_ocaps.protection.remove_cryptgroup_userAsync(groupid, user);
        };
        rcloud.protection.delete_cryptgroup = function(groupid) {
            return rcloud_ocaps.protection.delete_cryptgroupAsync(groupid);
        };
        rcloud.protection.has_notebook_protection = function() {
            return rcloud_ocaps.protection.has_notebook_protectionAsync();
        };

        // stars
        rcloud.stars.star_notebook = function(id) {
            return rcloud_ocaps.stars.star_notebookAsync(id);
        };
        rcloud.stars.unstar_notebook = function(id) {
            return rcloud_ocaps.stars.unstar_notebookAsync(id);
        };
        rcloud.stars.get_my_starred_notebooks = function() {
            return rcloud_ocaps.stars.get_my_starred_notebooksAsync();
        };

        // config
        rcloud.config = {
            all_notebooks: rcloud_ocaps.config.all_notebooksAsync,
            all_user_notebooks: rcloud_ocaps.config.all_user_notebooksAsync,
            all_notebooks_multiple_users: rcloud_ocaps.config.all_notebooks_multiple_usersAsync,
            get_all_notebook_info: rcloud_ocaps.config.get_all_notebook_infoAsync,
            add_notebook: rcloud_ocaps.config.add_notebookAsync,
            remove_notebook: rcloud_ocaps.config.remove_notebookAsync,
            get_current_notebook: rcloud_ocaps.config.get_current_notebookAsync,
            set_current_notebook: rcloud_ocaps.config.set_current_notebookAsync,
            new_notebook_number: rcloud_ocaps.config.new_notebook_numberAsync,
            get_recent_notebooks: rcloud_ocaps.config.get_recent_notebooksAsync,
            set_recent_notebook: rcloud_ocaps.config.set_recent_notebookAsync,
            clear_recent_notebook: rcloud_ocaps.config.clear_recent_notebookAsync,
            get_user_option: rcloud_ocaps.config.get_user_optionAsync,
            set_user_option: rcloud_ocaps.config.set_user_optionAsync,
            get_alluser_option: rcloud_ocaps.config.get_alluser_optionAsync
        };

        // notebook cache
        rcloud.get_notebook_info = rcloud_ocaps.get_notebook_infoAsync;
        rcloud.get_multiple_notebook_infos = rcloud_ocaps.get_multiple_notebook_infosAsync;
        rcloud.set_notebook_info = function(id, info) {
            if(!info.username) return Promise.reject(new Error("attempt to set info no username"));
            if(!info.description) return Promise.reject(new Error("attempt to set info no description"));
            if(!info.last_commit) return Promise.reject(new Error("attempt to set info no last_commit"));
            return rcloud_ocaps.set_notebook_infoAsync(id, info);
        };
        rcloud.get_notebook_property = rcloud_ocaps.get_notebook_propertyAsync;
        rcloud.set_notebook_property = rcloud_ocaps.set_notebook_propertyAsync;
        rcloud.remove_notebook_property = rcloud_ocaps.remove_notebook_propertyAsync;

        rcloud.get_notebook_by_name = function(user, path) {
            return rcloud_ocaps.notebook_by_nameAsync(user, path);
        };
    }

    rcloud._ocaps = rcloud_ocaps;
    rcloud.authenticated = rcloud_ocaps.authenticated;
    setup_unauthenticated_ocaps();
    if (rcloud.authenticated)
        setup_authenticated_ocaps();

    return rcloud;
};

var ui_utils = {};

ui_utils.make_url = function(page, opts) {
    opts = opts || {};
    var url = window.location.protocol + '//' + window.location.host + '/' + page;
    if(opts.do_path) {
        if(opts.notebook) {
            url += '/' + opts.notebook;
            // tags currently not supported for notebook.R & the like
            if(opts.version)
                url += '/' + opts.version;
        }
    }
    else {
        if(opts.notebook) {
            url += '?notebook=' + opts.notebook;
            if(opts.source)
                url += '&source=' + opts.source;
            if(opts.tag)
                url += '&tag=' + opts.tag;
            else if(opts.version)
                url += '&version=' + opts.version;
        }
        else if(opts.new_notebook)
            url += '?new_notebook=true';
    }
    return url;
};

ui_utils.relogin_uri = function() {
    return window.location.protocol +
        '//' + window.location.host +
        '/login.R?redirect=' +
        encodeURIComponent(window.location.pathname + window.location.search);
};

ui_utils.disconnection_error = function(msg, label) {
    var result = $("<div class='alert alert-danger'></div>");
    result.append($("<span></span>").text(msg));
    label = label || "Reconnect";
    var button = $("<button type='button' class='close'>" + label + "</button>");
    result.append(button);
    button.click(function() {
        window.location = ui_utils.relogin_uri();
    });
    return result;
};

ui_utils.string_error = function(msg) {
    var button = $("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>");
    var result = $("<div class='alert alert-danger alert-dismissable'></div>");
    // var text = $("<span></span>");

    result.append(button);
    var text = _.map(msg.split("\n"), function(str) {
        // poor-man replacing 4 spaces with indent
        var el = $("<div></div>").text(str), match;
        if ((match = str.match(/^( {4})+/))) {
            var indent = match[0].length / 4;
            el.css("left", indent +"em");
            el.css("position", "relative");
        }
        return el;
    });
    result.append(text);
    return result;
};

/*
 * if container_is_self is true, then the html container of the tooltip is the element
 * itself (which is the default for bootstrap but doesn't work very well for us
 * because of z-index issues).
 *
 * On the other hand, if *all* containers are the html body, then this happens:
 *
 * https://github.com/att/rcloud/issues/525
 */
ui_utils.fa_button = function(which, title, classname, style, container_is_self)
{
    var icon = $.el.i({'class': which});
    var span = $.el.span({'class': 'fontawesome-button ' + (classname || '')},
                        icon);
    if(style) {
        for (var k in style)
            icon.style[k] = style[k];
    }
    // $(icon).css(style);
    var opts = {
        title: title,
        delay: { show: 250, hide: 0 }
    };
    if (!container_is_self) {
        opts.container = 'body';
    }
    return $(span).tooltip(opts);
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
    var rows = Math.max(min_rows, Math.min(max_rows, widget.getSession().getScreenLength()));
    var newHeight = lineHeight*rows + widget.renderer.scrollBar.getWidth();
    return newHeight;
};

ui_utils.ace_set_pos = function(widget, row, column) {
    var sel = widget.getSelection();
    var range = sel.getRange();
    range.setStart(row, column);
    range.setEnd(row, column);
    sel.setSelectionRange(range);
};

ui_utils.install_common_ace_key_bindings = function(widget, get_language) {
    var Autocomplete = ace.require("ace/autocomplete").Autocomplete;
    var session = widget.getSession();
    var tab_handler = widget.commands.commandKeyBinding[0].tab;

    widget.commands.addCommands([
        {
            name: 'another autocomplete key',
            bindKey: 'Ctrl-.',
            exec: Autocomplete.startCommand.exec
        },
        {
            name: 'the autocomplete key people want',
            bindKey: 'Tab',
            exec: function(widget, args, request) {
                //determine if there is anything but whitespace on line
                var range = widget.getSelection().getRange();
                var line = widget.getSession().getLine(range.start.row);
                var before = line.substring(0, range.start.column);
                if(before.match(/\S/))
                    Autocomplete.startCommand.exec(widget, args, request);
                else tab_handler.exec(widget, args, request);
            }
        },
        {
            name: 'disable gotoline',
            bindKey: {
                win: "Ctrl-L",
                mac: "Command-L"
            },
            exec: function() { return false; }
        }, 
        {
            name: 'execute-selection-or-line',
            bindKey: {
                win: 'Ctrl-Return',
                mac: 'Command-Return',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                if (widget.getOption("readOnly"))
                    return;
                var code = session.getTextRange(widget.getSelectionRange());
                if(code.length===0) {
                    var pos = widget.getCursorPosition();
                    var Range = ace.require('ace/range').Range;
                    var range = new Range(pos.row, 0, pos.row+1, 0);
                    code = session.getTextRange(range);
                    widget.navigateDown(1);
                    widget.navigateLineEnd();
                }
                RCloud.UI.command_prompt.history().add_entry(code);
                shell.new_cell(code, get_language())
                    .spread(function(_, controller) {
                        controller.enqueue_execution_snapshot();
                        shell.scroll_to_end();
                    });
            }
        },

        {
            name: 'cursor at beginning of line',
            ctrlACount : 0,
            lastRow: -1,
            bindKey: {
                mac: 'Ctrl-A',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                if (widget.getOption("readOnly"))
                    return;
                //row of the cursor on current line
                var row = widget.getCursorPosition().row;
                //if on a new line
                if( this.lastRow !== row) {
                    this.ctrlACount = 1;
                    widget.navigateLineStart();
                    this.lastRow = row;
                }
                else {
                    if(this.ctrlACount === 0) {
                        //make sure it appears at beginning of text
                        widget.navigateLineStart();
                        this.ctrlACount ++;
                    }
                    else if(this.ctrlACount === 1 ) {
                        //move to the beginning of that line
                        widget.navigateTo(row, 0);
                        this.ctrlACount = 0;
                    }
                    this.lastRow = row;
                }
            }
        } ,
        {
            name: 'cursor at end of line',
            bindKey: {
                mac: 'Ctrl-E',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                //row of the cursor on current line
                var row = widget.getCursorPosition().row;
                //last column of the cursor on current line
                var lastCol = ui_utils.last_col(widget, row);
                //move to the end of that line
                widget.navigateTo(row, lastCol);
            }
        }
    ]);
};


ui_utils.last_col = function(widget, row) {
    var doc = widget.getSession().getDocument();
    return doc.getLine(row).length;
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

ui_utils.position_of_character_offset = function(widget, offset) {
    // based on the above; the wontfix ace issue is
    // https://github.com/ajaxorg/ace/issues/226
    var session = widget.getSession(), doc = session.getDocument();
    var nlLength = doc.getNewLineCharacter().length;
    var text = doc.getAllLines();
    var i;
    for(i=0; i<text.length; i++) {
        if(offset <= text[i].length)
            break;
        offset -= text[i].length + nlLength;
    }
    if(i===text.length)
        throw new Error("character offset off end of editor");
    return {row: i, column: offset};
};

ui_utils.ace_range_of_character_range = function(widget, cbegin, cend) {
    var Range = ace.require('ace/range').Range;
    var begin = ui_utils.position_of_character_offset(widget, cbegin),
        end = ui_utils.position_of_character_offset(widget, cend);
    return new Range(begin.row, begin.column, end.row, end.column);
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
        var oldValue = widget.getValue();
        var res = (value !== oldValue) ? widget.setValue(value) : null;
        listen = true;
        return res;
    };
};

ui_utils.set_ace_readonly = function(widget, readonly) {
    // a better way to set non-interactive readonly
    // https://github.com/ajaxorg/ace/issues/266
    widget.setOptions({
        readOnly: readonly,
        highlightActiveLine: !readonly,
        highlightGutterLine: !readonly
    });
    widget.renderer.$cursorLayer.element.style.opacity = readonly?0:1;
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
        item.parent().toggleClass('disabled', !val);
        base_enable(val);
    };
    return ret;
};

// this is a hack, but it'll help giving people the right impression.
// I'm happy to replace it with the Right Way to do it when we learn
// how to do it.
// still a hack, generalizing it a little bit.

ui_utils.customize_ace_gutter = function(widget, line_text_function)
{
    var dom = ace.require("ace/lib/dom");
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
        var maxLineLength = 0;
        for(; i <= lastRow; ++i) {
            var line = line_text_function(i);
            html.push(
                "<div class='ace_gutter-cell ",
                "' style='height:", this.session.getRowLength(0) * config.lineHeight, "px;'>",
                line,
                "</div>"
            );
            maxLineLength = Math.max(maxLineLength, line.length);
        }

        this.element = dom.setInnerHtml(this.element, html.join(""));
        this.element.style.height = config.minHeight + "px";

        var gutterWidth = maxLineLength * config.characterWidth;
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
    function encode(s) {
        if(command.allow_multiline) {
            s = s.replace(/\n/g, "<br/>");
        }
        return s.replace(/  /g, ' \xa0'); // replace every space with nbsp
    }
    function decode(s) {
        if(command.allow_multiline) {
            s = s.replace(/<br>/g, "\n");
        }
        return s.replace(/\xa0/g,' '); // replace nbsp's with spaces
    }
    function set_content_type(is_multiline,content) {
        if(is_multiline) {
            elem$.html(content);
        } else {
            elem$.text(content);
        }
    }
    var old_opts = options(),
        new_opts = old_opts;
    if(_.isObject(command)) {
        var defaults;
        if(old_opts)
            defaults = $.extend({}, old_opts);
        else
            defaults = {
                on_change: function() { return true; },
                allow_edit: true,
                inactive_text: elem$.text(),
                active_text: elem$.text(),
                allow_multiline: false,
                select: function(el) {
                    var range = document.createRange();
                    range.selectNodeContents(el);
                    return range;
                }
            };
        new_opts = $.extend(defaults, command);
        elem$.data('__editable', new_opts);
    }
    else {
        if(command !== 'destroy' && !old_opts)
            throw new Error('expected already editable for command ' + command);
        var set_option = function(key, value) {
            old_opts = $.extend({}, old_opts);
            new_opts[key] = value;
        };
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
        set_content_type(command.allow_multiline,encode(options().__active ? new_opts.active_text : new_opts.inactive_text));

    switch(action) {
    case 'freeze':
        elem$.removeAttr('contenteditable');
        elem$.off('keydown.editable');
        elem$.off('focus.editable');
        elem$.off('click.editable');
        elem$.off('blur.editable');
        break;
    case 'melt':
        elem$.attr('contenteditable', 'true');
        elem$.on({
            'focus.editable': function() {
                if(!options().__active) {
                    options().__active = true;
                    set_content_type(command.allow_multiline,encode(options().active_text));
                    window.setTimeout(function() {
                        selectRange(options().select(elem$[0]));
                        elem$.off('blur.editable');
                        elem$.on('blur.editable', function() {
                            set_content_type(command.allow_multiline,encode(options().inactive_text));
                            options().__active = false;
                        }); // click-off cancels
                    }, 10);
                }
            },
            'click.editable': function(e) {
                e.stopPropagation();
                // allow default action but don't bubble (causing eroneous reselection in notebook tree)
            },
            'keydown.editable': function(e) {
                if(e.keyCode === $.ui.keyCode.ENTER) {
                    var txt = decode(elem$.text());
                    function execute_if_valid_else_ignore(f) {
                        if(options().validate(txt)) {
                            options().__active = false;
                            elem$.off('blur.editable'); // don't cancel!
                            elem$.blur();
                            f(txt, txt!=options().active_text);
                            return true;
                        } else {
                            return false; // don't let CR through!
                        }
                    }
                    if (options().ctrl_cmd && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        return execute_if_valid_else_ignore(options().ctrl_cmd);
                    }
                    else if(!command.allow_multiline || (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        return execute_if_valid_else_ignore(options().change);
                    }
                } else if(e.keyCode === $.ui.keyCode.ESCAPE) {
                    elem$.blur(); // and cancel
                }
                return true;
            },
            'input.editable': function(e) {
                if(elem$.text().length===0)
                    elem$.css('padding-right', '1px');
                else
                    elem$.css('padding-right', '');
            }
        });
        break;
    }
    return elem$;
};

// hack to fake a hover over a jqTree node (or the next one if it's deleted)
// because jqTree rebuilds DOM elements and events get lost
ui_utils.fake_hover = function fake_hover(node) {
    var parent = node.parent;
    var index = $('.notebook-commands.appear', node.element).css('display') !== 'none' ?
            parent.children.indexOf(node) : undefined;
    ui_utils.on_next_tick(function() {
        if(index>=0 && index < parent.children.length) {
            var next = parent.children[index];
                $(next.element).mouseover();
        }
    });
};


ui_utils.on_next_tick = function(f) {
    window.setTimeout(f, 0);
};

ui_utils.scroll_to_after = function($sel, duration) {
    // no idea why the plugin doesn't take current scroll into account when using
    // the element parameter version
    if ($sel.length === 0)
        return;
    var opts;
    if(duration !== undefined)
        opts = {animation: {duration: duration}};
    var $parent = $sel.parent();
    var y = $parent.scrollTop() + $sel.position().top +  $sel.outerHeight();
    $parent.scrollTo(null, y, opts);
};

ui_utils.scroll_into_view = function($scroller, top_buffer, bottom_buffer, _) {
    if(_ === undefined)
        return;
    var height = +$scroller.css("height").replace("px","");
    var scrolltop = $scroller.scrollTop(),
        elemtop = 0;
    for(var i = 3; i<arguments.length; ++i)
        elemtop += arguments[i].position().top;
    if(elemtop > height)
        $scroller.scrollTo(null, scrolltop + elemtop - height + top_buffer);
    else if(elemtop < 0)
        $scroller.scrollTo(null, scrolltop + elemtop - bottom_buffer);
};

ui_utils.prevent_backspace = function($doc) {
    // Prevent the backspace key from navigating back.
    // from http://stackoverflow.com/a/2768256/676195
    $doc.unbind('keydown').bind('keydown', function (event) {
        var doPrevent = false;
        if (event.keyCode === $.ui.keyCode.BACKSPACE) {
            var d = event.srcElement || event.target;
            if((d.tagName.toUpperCase() === 'INPUT' &&
                (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' ||
                 d.type.toUpperCase() === 'FILE' || d.type.toUpperCase() === 'EMAIL' )) ||
               d.tagName.toUpperCase() === 'TEXTAREA' ||
               d.isContentEditable) {
                doPrevent = d.readOnly || d.disabled;
            }
            else {
                doPrevent = true;
            }
        }

        if(doPrevent)
            event.preventDefault();
    });
};


ui_utils.is_a_mac = function() {
    // http://stackoverflow.com/questions/7044944/jquery-javascript-to-detect-os-without-a-plugin
    var PLAT = navigator.platform.toUpperCase();
    return function() {
        var isMac = PLAT.indexOf('MAC')!==-1;
        // var isWindows = PLAT.indexOf('WIN')!==-1;
        // var isLinux = PLAT.indexOf('LINUX')!==-1;
        return isMac;
    };
}();

ui_utils.kill_popovers = function() {
    if(window.allPopovers) {
        $(window.allPopovers).each(function(i, e) {
            $(this).popover('destroy');
        });
        window.allPopovers.length = 0;
    }
};

ui_utils.hide_selectize_dropdown = function() {
    $('.selectize-dropdown').hide();
    $('.selectize-input').removeClass('focus input-active dropdown-active');

    
    //$('div.selectize-input > input').blur();
};

RCloud.utils = {};

// Ways to execute promise in sequence, with each started after the last completes
RCloud.utils.promise_for = function(condition, action, value) {
    if(!condition(value))
        return value;
    return action(value).then(RCloud.utils.promise_for.bind(null, condition, action));
};

// like Promise.each but each promise is not *started* until the last one completes
RCloud.utils.promise_sequence = function(collection, operator) {
    return RCloud.utils.promise_for(
        function(i) {
            return i < collection.length;
        },
        function(i) {
            return operator(collection[i]).return(++i);
        },
        0);
};


/*
 RCloud.extension is the root of all extension mechanisms in RCloud.

 It is designed to be used by containment: an extendable feature class
 will privately keep an RCloud.extension instance, and then implement
 init(), add(), and remove(), forwarding part of their implementation to
 RCloud.extension.

 Note: this functionality is still evolving.  More common functionality
 will get moved here over time as patterns emerge, and some extensible
 features do not use RCloud.extension yet.  These are accidents of
 history and do not read anything into them.
*/

RCloud.extension = (function() {
    return {
        filter_field: function(field, value) {
            return function(entry) {
                return entry[field] === value;
            };
        },
        create: function(options) {
            options = options || {};
            var items_ = {};
            var sections_ = {};
            var defaults_ = options.defaults ? options.defaults : {};

            if(options.sections) {
                for(var key in options.sections)
                    sections_[key] = {filter: options.sections[key].filter};
            }
            else sections_.all = {};

            function recompute_sections() {
                for(key in sections_) {
                    sections_[key].entries = _.filter(items_, function(entry) {
                        if(entry.disable)
                            return false;
                        return sections_[key].filter ? sections_[key].filter(entry) : true;
                    });
                    sections_[key].entries.sort(function(a, b) { return a.sort - b.sort; });
                }
            }

            return {
                add: function(entries) {
                    for(var key in entries)
                        items_[key] = _.extend(_.extend({key: key}, defaults_), entries[key]);
                    recompute_sections();
                    return this;
                },
                remove: function(name) {
                    delete items_[name];
                    recompute_sections();
                    return this;
                },
                disable: function(name, disable) {
                    if(items_[name]) {
                        items_[name].disable = disable;
                        recompute_sections();
                    }
                    return this;
                },
                get: function(name) {
                    return items_[name];
                },
                entries: function(name) {
                    return sections_[name].entries;
                },
                create: function(name, _) {
                    var map = {}, array = [];
                    var args = Array.prototype.slice.call(arguments, 1);
                    var entries = this.entries(name);
                    if(entries)
                        entries.forEach(function(entry) {
                            array.push(map[entry.key] = entry.create.apply(entry, args));
                        });
                    return {map: map, array: array};
                },
                sections: sections_
            };
        }
    };
})();


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

Notebook.Buffer.create_model = function(content, language) {
    // by default, consider this a new cell
    var checkpoint_ = "";

    function is_empty(text) {
        return Notebook.empty_for_github(text);
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
                if(content !== new_content) {
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
        language: function(new_language) {
            if (!_.isUndefined(new_language)) {
                if(language !== new_language) {
                    language = new_language;
                    this.notify_views(function(view) {
                        view.language_updated();
                    });
                    return language;
                }
                else return null;
            }
            if(language === undefined)
                throw new Error("tried to read no language");
            else if(language === null)
                return 'Text'; // Github considers null a synonym for Text; nip that in the bud
            return language;
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
                    // we need to remember creates for one round
                    // (see notebook_controller's update_notebook)
                    if(is_empty(checkpoint_))
                        change.create = true;
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
    var anchor = $("<a href='#'></a>");
    var filename_span = $("<span  style='cursor:pointer'>" + asset_model.filename() + "</span>");
    var remove = ui_utils.fa_button("icon-remove", "remove", '',
                                    { 'position': 'relative',
                                        'left': '2px',
                                        'opacity': '0.75'
                                    }, true);
    anchor.append(filename_span);
    filename_div.append(anchor);
    anchor.append(remove);
    var asset_old_name = filename_span.text();
    var rename_file = function(v) {
        // this is massively inefficient - actually three round-trips to the server when
        // we could have one!  save, create new asset, delete old one
        shell.notebook.controller.save().then(function() {
            var new_asset_name = filename_span.text();
            new_asset_name = new_asset_name.replace(/\s/g, " ");
            var old_asset_content = asset_model.content();
            if (Notebook.is_part_name(new_asset_name)) {
                alert("Asset names cannot start with 'part[0-9]', sorry!");
                filename_span.text(asset_old_name);
                return;
            }
            var found = shell.notebook.model.get_asset(new_asset_name);
            if (found) {
                alert('An asset with the name "' + filename_span.text() + '" already exists. Please choose a different name.');
                filename_span.text(asset_old_name);
            }
            else {
                shell.notebook.controller
                    .append_asset(old_asset_content, new_asset_name)
                    .spread(function(_, new_controller) {
                        new_controller.select();
                        asset_model.controller.remove(true);
                    });
            }
        });
    };
    function select(el) {
        if(el.childNodes.length !== 1 || el.firstChild.nodeType != el.TEXT_NODE)
            throw new Error('expecting simple element with child text');
        var text = el.firstChild.textContent;
        var range = document.createRange();
        range.setStart(el.firstChild, 0);
        range.setEnd(el.firstChild, (text.lastIndexOf('.')>0?text.lastIndexOf('.'):text.length));
        return range;
    }
    var editable_opts = {
        change: rename_file,
        select: select,
        validate: function(name) { return editor.validate_name(name); }
    };
    filename_span.click(function() {
        if(!asset_model.active())
            asset_model.controller.select();
        //ugly fix, but desperate times call for desperate measures.
        $('#scratchpad-binary object').css('position', 'static')
                .css('position', 'absolute');
    });
    remove.click(function() {
        asset_model.controller.remove();
    });
    var result = {
        filename_updated: function() {
            anchor.text(asset_model.filename());
        },
        content_updated: function() {
            if(asset_model.active())
                RCloud.UI.scratchpad.content_updated();
        },
        language_updated: function() {
            if(asset_model.active())
                RCloud.UI.scratchpad.language_updated();
        },
        active_updated: function() {
            if (asset_model.active()) {
                if(!shell.notebook.model.read_only())
                    ui_utils.editable(filename_span, $.extend({allow_edit: true,inactive_text: filename_span.text(),active_text: filename_span.text()},editable_opts));
                filename_div.addClass("active");
            }
            else {
                ui_utils.editable(filename_span, "destroy");
                filename_div.removeClass("active");
            }
        },
        self_removed: function() {
            filename_div.remove();
        },
        set_readonly: function(readonly) {
            if(readonly)
                remove.hide();
            else
                remove.show();
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
            var asset_name = asset_model.filename();
            var msg = "Do you want to remove the asset '" +asset_name+ "' from the notebook?";
            if (force || confirm(msg)) {
                asset_model.parent_model.controller.remove_asset(asset_model);
                if(asset_model === RCloud.UI.scratchpad.current_model) {
                    var assets = asset_model.parent_model.assets;
                    if (assets.length)
                        assets[0].controller.select();
                    else {
                        RCloud.UI.scratchpad.set_model(null);
                    }
                }
            }
        }
    };
    return result;
};

(function() {

function ensure_image_has_hash(img)
{
    if (img.dataset.sha256)
        return img.dataset.sha256;
    var hasher = new sha256(img.getAttribute("src"), "TEXT");
    img.dataset.sha256 = hasher.getHash("SHA-256", "HEX");
    return img.dataset.sha256;
}

var MIN_LINES = 2;
var EXTRA_HEIGHT_SOURCE = 2, EXTRA_HEIGHT_INPUT = 10;

function create_cell_html_view(language, cell_model) {
    var ace_widget_;
    var ace_session_;
    var ace_document_;
    var am_read_only_ = "unknown";
    var source_div_;
    var code_div_;
    var result_div_, has_result_;
    var current_result_; // text is aggregated
    var current_error_; // text is aggregated
    var change_content_;
    var cell_status_;
    var above_between_controls_, cell_controls_, left_controls_;
    var edit_mode_; // note: starts neither true nor false
    var highlights_;
    var code_preprocessors_ = []; // will be an extension point, someday
    var running_state_;  // running state

    // input1
    var prompt_text_;
    var input_div_, input_ace_div_, input_widget_, input_kont_, input_anim_;

    var result = {}; // "this"

    var notebook_cell_div  = $("<div class='notebook-cell'></div>");
    notebook_cell_div.data('rcloud.model', cell_model);

    //////////////////////////////////////////////////////////////////////////
    // button bar

    function update_model() {
        if(!ace_session_)
            return null;
        return cell_model.content(ace_session_.getValue());
    }
    function update_div_id() {
        notebook_cell_div.attr('id', Notebook.part_name(cell_model.id(), cell_model.language()));
        if(left_controls_)
            left_controls_.controls['cell_number'].set(cell_model.id());
    }
    function set_widget_height() {
        outer_ace_div.css('height', (ui_utils.ace_editor_height(ace_widget_, MIN_LINES) +
                                   EXTRA_HEIGHT_SOURCE) + "px");
    }

    cell_status_ = $("<div class='cell-status nonselectable'></div>");

    var cell_status_left = $("<div class='cell-status-left'></div>");
    cell_status_.append(cell_status_left);
    left_controls_ = RCloud.UI.cell_commands.decorate('left', cell_status_left, cell_model, result);

    if(!shell.is_view_mode()) {
        var cell_control_bar = $("<div class='cell-control-bar'></div>");
        cell_status_.append(cell_control_bar);
        // disable sort action on the control bar area
        cell_control_bar.mousedown(function(e) {
            e.stopPropagation();
        });
        cell_controls_ = RCloud.UI.cell_commands.decorate('cell', cell_control_bar, cell_model, result);

        var cell_commands_above = $("<div class='cell-controls-above nonselectable'></div>");
        above_between_controls_ = RCloud.UI.cell_commands.decorate('above_between', cell_commands_above, cell_model, result);
        notebook_cell_div.append(cell_commands_above);

        cell_status_.click(function(e) {

            var cell_model = $(this).closest('.notebook-cell').data('rcloud.model');

            if(e.ctrlKey || e.metaKey || e.shiftKey) {
                e.preventDefault();
            }
            cell_model.parent_model.controller.select_cell(cell_model, {
                is_toggle: (ui_utils.is_a_mac() && e.metaKey) || (!ui_utils.is_a_mac() && e.ctrlKey),
                is_range : e.shiftKey,
                is_exclusive: !e.ctrlKey && !e.shiftKey
            });

        }).children().click(function(e) {
            var target = $(e.target);
            if(!target.hasClass('cell-number')) {
                e.stopPropagation();
            }
        });
    }
    notebook_cell_div.append(cell_status_);

    var edit_colors_ = {
        markdown: "#F7EEE4",
        code: "#E8F1FA"
    };

    function set_background_class(div) {
        var md = RCloud.language.is_a_markdown(language);
        div.toggleClass(md ? 'edit-markdown' : 'edit-code', true);
        div.toggleClass(md ? 'edit-code' : 'edit-markdown', false);
    }

    function update_language() {
        language = cell_model.language();
        if(!RCloud.language.is_a_markdown(language))
            result.hide_source && result.hide_source(false);
        if(cell_controls_)
            cell_controls_.controls['language_cell'].set(language);
        set_background_class(code_div_.find('pre'));
        if(ace_widget_) {
            ace_div.toggleClass('active', true);
            set_background_class(ace_div);
            var LangMode = ace.require(RCloud.language.ace_mode(language)).Mode;
            ace_session_.setMode(new LangMode(false, ace_document_, ace_session_));
        }
    }

    function update_selected() {
        if(cell_model.is_selected()) {
            notebook_cell_div.addClass("selected");
        } else {
            notebook_cell_div.removeClass("selected");
        }

        notebook_cell_div.find('.cell-control input[type="checkbox"]').prop('checked', cell_model.is_selected());
    }

    //////////////////////////////////////////////////////////////////////////

    var inner_div = $("<div></div>");
    var clear_div = $("<div style='clear:both;'></div>");
    notebook_cell_div.append(inner_div);
    notebook_cell_div.append(clear_div);

    source_div_ = $('<div class="source-div"></div>');
    code_div_ = $('<div class="code-div"></div>');
    source_div_.append(code_div_);

    var outer_ace_div = $('<div class="outer-ace-div"></div>');
    var ace_div = $('<div style="width:100%; height:100%;"></div>');
    set_background_class(ace_div);

    update_div_id();

    outer_ace_div.append(ace_div);
    source_div_.append(outer_ace_div);
    inner_div.append(source_div_);

    function click_to_edit(div, whether) {
        if(whether) {
            set_background_class(code_div_.find('pre'));
            if(am_read_only_===false)
                div.toggleClass('inactive', true);
            // distinguish between a click and a drag
            // http://stackoverflow.com/questions/4127118/can-you-detect-dragging-in-jquery
            div.on({
                'mousedown.rcloud-cell': function(e) {
                    $(this).data('p0', { x: e.pageX, y: e.pageY });
                },
                'mouseup.rcloud-cell': function(e) {
                    var p0 = $(this).data('p0');
                    if(p0) {
                        var p1 = { x: e.pageX, y: e.pageY },
                            d = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
                        if (d < 4) {
                            if(am_read_only_)
                                result.hide_source(false);
                            else
                                result.edit_source(true, e);
                            div.mouseleave();
                        }
                    }
                }
/*
                'mouseenter.rcloud-cell': function() {
                    if(edit_mode_) // don't highlight if it won't do anything
                        return;
                    var edit_color = RCloud.language.is_a_markdown(language) ? edit_colors_.markdown  : edit_colors_.code;
                    var avg_color = d3.interpolateHsl('#f5f5f5', edit_color)(0.75);
                    $(this).css('background-color', avg_color);
                },
                'mouseleave.rcloud-cell': function() {
                    $(this).css('background-color', '');
                }
*/
            });
        }
        else div.off('mousedown.rcloud-cell mouseup.rcloud-cell');
    }

    // postprocessing the dom is slow, so only do this when we have a break
    var result_updated = _.debounce(function() {
        Notebook.Cell.postprocessors.entries('all').forEach(function(post) {
            post.process(result_div_, result);
        });
    }, 100);

    function clear_result() {
        result_div_.empty();
        has_result_ = false;
        if(cell_controls_)
            results_button_border(false);
    }

    // start trying to refactor out this repetitive nonsense
    function ace_stuff(div, content) {
        ace.require("ace/ext/language_tools");
        var widget = ace.edit(div[0]);
        var session = widget.getSession();
        widget.setValue(content);
        ui_utils.ace_set_pos(widget, 0, 0); // setValue selects all
        // erase undo state so that undo doesn't erase all
        ui_utils.on_next_tick(function() {
            session.getUndoManager().reset();
        });
        var document = session.getDocument();
        widget.setOptions({
            enableBasicAutocompletion: true
        });
        widget.setTheme("ace/theme/chrome");
        session.setUseWrapMode(true);
        return {
            widget: widget,
            session: session,
            document: document
        };
    }

    function cell_changed() {
        var new_state;
        switch(running_state_) {
        case 'waiting':
        case 'unknown':
            new_state = 'unknown';
            break;
        case 'running':
        case 'unknown-running':
            new_state = 'unknown-running';
            break;
        default:
            new_state = 'ready';
        }
        result.state_changed(new_state);
    }

    function create_edit_widget() {
        if(ace_widget_) return;

        var aaa = ace_stuff(ace_div, cell_model.content());
        ace_widget_ = aaa.widget;
        ace_session_ = aaa.session;
        ace_document_ = aaa.document;

        ace_session_.on('change', function() {
            set_widget_height();
            ace_widget_.resize();
        });

        ace_widget_.resize();

        ui_utils.install_common_ace_key_bindings(ace_widget_, function() {
            return language;
        });
        ace_widget_.commands.addCommands([{
            name: 'executeCell',
            bindKey: {
                win: 'Alt-Return',
                mac: 'Alt-Return',
                sender: 'editor'
            },
            exec: function(ace_widget_, args, request) {
                result.execute_cell();
            }
        }]);
        ace_widget_.commands.removeCommands(['find', 'replace']);
        change_content_ = ui_utils.ignore_programmatic_changes(ace_widget_, function() {
            cell_changed();
            cell_model.parent_model.on_dirty();
        });
        update_language();
    }
    function create_input_widget() {
        if(input_widget_) return;

        var aaa = ace_stuff(input_ace_div_, '');
        input_widget_ = aaa.widget;

        ui_utils.customize_ace_gutter(input_widget_, function(i) {
            return i===0 ? prompt_text_ : '';
        });
        input_widget_.commands.addCommands([{
            name: 'enter',
            bindKey: 'Return',
            exec: function(ace_widget, args, request) {
                var input = ace_widget.getValue();
                result.add_result('code', _.unescape(prompt_text_) + input + '\n');
                if(input_kont_)
                    input_kont_(null, input);
                input_div_.hide();
                window.clearInterval(input_anim_);
                input_anim_ = null;
            }
        }]);
        RCloud.UI.prevent_progress_modal();
    }
    function find_code_elems(parent) {
        return parent
            .find("pre code")
            .filter(function(i, e) {
                // things which have defined classes coming from knitr and markdown
                // we might look in RCloud.language here?
                return e.classList.length > 0;
            });
    }
    function highlight_code() {
        find_code_elems(code_div_).each(function(i, e) {
            hljs.highlightBlock(e);
        });
    }
    function highlight_classes(kind) {
        return 'find-highlight' + ' ' + kind;
    }
    function edit_button_border(whether) {
        if(cell_controls_)
            cell_controls_.controls['edit'].control.find('i').toggleClass('icon-border', whether);
    }
    function results_button_border(whether) {
        if(cell_controls_)
            cell_controls_.controls['results'].control.find('i').toggleClass('icon-border', whether);
    }

    // should be a code preprocessor extension, but i've run out of time
    code_preprocessors_.push(
        function(code) {
            var yuk = _.escape;
            // add search highlights
            var last = 0, text = [];
            if(highlights_)
                highlights_.forEach(function(range) {
                    text.push(yuk(code.substring(last, range.begin)));
                    text.push('<span class="', highlight_classes(range.kind), '">',
                              yuk(code.substring(range.begin, range.end)), '</span>');
                    last = range.end;
                });
            text.push(yuk(code.substring(last)));
            return text.join('');
        },
        function(code) {
            // add abso-relative line number spans at the beginning of each line
            var line = 1;
            code = code.split('\n').map(function(s) {
                return ['<span class="rcloud-line-number-position nonselectable">',
                        '&#x200b;',
                        '<span class="rcloud-line-number">',
                        line++,
                        '</span></span>',s].join('');
            }).join('\n');

            code += '&nbsp;'; // make sure last line is shown even if it is just a tag
            return code;
        },
        function(code) {
            // match the number of lines ace.js is going to show
            // 1. html would skip final blank line
            if(code[code.length-1] === '\n')
                code += '\n';

            // 2. we have ace configured to show a minimum of MIN_LINES lines
            var lines = (code.match(/\n/g)||[]).length;
            if(lines<MIN_LINES)
                code += new Array(MIN_LINES+1-lines).join('\n');
            return code;
        });

    function assign_code(code) {
        code = code || cell_model.content();

        code = code_preprocessors_.reduce(function(code, f) {
            return f(code);
        }, code);

        code_div_.empty();
        var elem = $('<code></code>').append(code);
        var gutter = $('<div class="rcloud-gutter"></div>');

        var hljs_class = RCloud.language.hljs_class(cell_model.language());
        if(hljs_class)
            elem.addClass(hljs_class);
        code_div_.append(gutter, $('<pre></pre>').append(elem));
        highlight_code();
        // yuk
        code_div_.find('.rcloud-line-number .hljs-number').css('color', 'black');
        if(am_read_only_ !== 'unknown')
            click_to_edit(code_div_.find('pre'), true);
        set_background_class(code_div_.find('pre'));
    }
    assign_code();

    result_div_ = $('<div class="r-result-div"></div>');
    clear_result();
    inner_div.append(result_div_);
    input_div_ = $('<div class="input-div"></div>');
    input_ace_div_ = $('<div style="height: 100%"></div>');
    input_div_.hide().append(input_ace_div_);
    inner_div.append(input_div_);

    update_language();

    _.extend(result, {

        //////////////////////////////////////////////////////////////////////
        // pubsub event handlers

        content_updated: function() {
            assign_code();
            if(ace_widget_) {
                var st = ace_session_.getScrollTop();
                var range = ace_widget_.getSelection().getRange();
                var changed = change_content_(cell_model.content());
                ace_widget_.getSelection().setSelectionRange(range);
                ace_session_.setScrollTop(st);
            }
            return changed;
        },
        self_removed: function() {
            notebook_cell_div.remove();
        },
        ace_widget: function() {
            return ace_widget_;
        },
        id_updated: update_div_id,
        language_updated: function() {
            update_language();
            cell_changed();
        },
        selected_updated: function() {
            update_selected();
        },
        state_changed: function(state) {
            var control = left_controls_.controls['run_state'];
            if(running_state_==="unknown" && state==="running")
                state = "unknown-running";
            switch(state) {
            case 'ready':
                control.icon('icon-circle-blank').color('#777').title('content has not been run');
                break;
            case 'waiting':
                control.icon('icon-arrow-right').color('blue').title('cell is enqueued and waiting to run');
                break;
            case 'cancelled':
                control.icon('icon-asterisk').color('#e06a06').title('execution was cancelled before this cell could run');
                break;
            case 'unknown-running':
                control.icon('icon-question icon-spin').color('blue').title('cell is currently running');
                has_result_ = false;
                break;
            case 'running':
                control.icon('icon-spinner icon-spin').color('blue').title('cell is currently running');
                has_result_ = false;
                break;
            case 'complete':
                control.icon('icon-circle').color('#72B668').title('cell successfully ran');
                break;
            case 'error':
                control.icon('icon-exclamation').color('crimson').title('cell ran but had an error');
                break;
            case 'unknown':
                control.icon('icon-question').color('purple').title('output may or may not reflect current content');
                break;
            }
            running_state_ = state;
            return this;
        },
        add_result: function(type, r) {
            if(!has_result_) {
                result_div_.empty(); // clear previous output
                if(RCloud.language.is_a_markdown(language))
                    result.hide_source(true);
                has_result_ = true;
            }
            this.toggle_results(true); // always show when updating
            switch(type) {
            case 'selection':
            case 'deferred_result':
                break;
            default:
                Notebook.Cell.preprocessors.entries('all').forEach(function(pre) {
                    r = pre.process(r);
                });
            }

            if(type!='code')
                current_result_ = null;
            if(type!='error')
                current_error_ = null;
            var pre;
            switch(type) {
            case 'code':
                if(!current_result_) {
                    pre = $('<pre></pre>');
                    current_result_ = $('<code></code>');
                    pre.append(current_result_);
                    result_div_.append(pre);
                }
                current_result_.append(_.escape(r));
                break;
            case 'error':
                // sorry about this!
                if(!current_error_) {
                    pre = $('<pre></pre>');
                    current_error_ = $('<code style="color: crimson"></code>');
                    pre.append(current_error_);
                    result_div_.append(pre);
                }
                current_error_.append(_.escape(r));
                break;
            case 'selection':
            case 'html':
                result_div_.append(r);
                break;
            case 'deferred_result':
                result_div_.append('<span class="deferred-result">' + r + '</span>');
                break;
            default:
                throw new Error('unknown result type ' + type);
            }
            result_updated();
        },
        end_output: function(error) {
            if(!has_result_) {
                // the no-output case
                result_div_.empty();
                has_result_ = true;
            }
            this.state_changed(error ? 'error' : running_state_==='unknown-running' ? 'ready' : 'complete');
            current_result_ = current_error_ = null;
        },
        clear_result: clear_result,
        set_readonly: function(readonly) {
            am_read_only_ = readonly;
            if(ace_widget_)
                ui_utils.set_ace_readonly(ace_widget_, readonly );
            [cell_controls_, above_between_controls_, left_controls_].forEach(function(controls) {
                if(controls)
                    controls.set_flag('modify', !readonly);
            });
            click_to_edit(code_div_.find('pre'), !readonly);
            cell_status_.toggleClass('readonly', readonly);
            if(readonly)
                edit_button_border($(source_div_).is(":visible"));
        },
        set_show_cell_numbers: function(whether) {
            left_controls_.set_flag('cell-numbers', whether);
        },
        click_to_edit: click_to_edit,

        //////////////////////////////////////////////////////////////////////

        execute_cell: function() {
            return cell_model.parent_model.controller.save()
                .then(function() {
                    cell_model.controller.enqueue_execution_snapshot();
                });
        },
        toggle_edit: function() {
            return this.edit_source(!edit_mode_);
        },
        edit_source: function(edit_mode, event) {
            if(edit_mode === edit_mode_) {
                if(edit_mode)
                    ace_widget_.focus();
                return;
            }
            if(edit_mode) {
                if(cell_controls_)
                    edit_button_border(true);
                if(RCloud.language.is_a_markdown(language))
                    this.hide_source(false);
                code_div_.hide();
                create_edit_widget();
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
                ace_widget_.resize(true);
                set_widget_height();
                ace_widget_.resize(true);
                if(cell_controls_)
                    cell_controls_.set_flag('edit', true);
                outer_ace_div.show();
                ace_widget_.resize(); // again?!?
                ace_widget_.focus();
                if(event) {
                    var scrollTopOffset = ace_widget_.getSession().getScrollTop();
                    var screenPos = ace_widget_.renderer.pixelToScreenCoordinates(event.pageX, event.pageY - scrollTopOffset);
                    var docPos = ace_session_.screenToDocumentPosition(Math.abs(screenPos.row), Math.abs(screenPos.column));


                    var Range = ace.require('ace/range').Range;
                    var row = Math.abs(docPos.row), column = Math.abs(docPos.column);
                    var range = new Range(row, column, row, column);
                    ace_widget_.getSelection().setSelectionRange(range);
                }
            }
            else {
                if(cell_controls_)
                    edit_button_border(false);
                var new_content = update_model();
                if(new_content!==null) // if any change (including removing the content)
                    cell_model.parent_model.controller.update_cell(cell_model);
                source_div_.css({'height': ''});
                if(cell_controls_)
                    cell_controls_.set_flag('edit', false);
                code_div_.show();
                outer_ace_div.hide();
            }
            edit_mode_ = edit_mode;
            this.change_highlights(highlights_); // restore highlights
        },
        toggle_source: function() {
            this.hide_source($(source_div_).is(":visible"));
        },
        hide_source: function(whether) {
            if(whether) {
                source_div_.hide();
                edit_button_border(false);
            }
            else {
                source_div_.show();
                edit_button_border(true);
            }
        },
        toggle_results: function(val) {
            if(val===undefined)
                val = result_div_.is(':hidden');
            if(cell_controls_)
                results_button_border(val);
            if(val) result_div_.show();
            else result_div_.hide();
        },
        get_input: function(type, prompt, k) {
            if(!has_result_) {
                result_div_.empty();
                has_result_ = true;
            }
            prompt_text_ = _.escape(prompt).replace(/\n/g,'');
            create_input_widget();
            input_widget_.setValue('');
            input_div_.show();
            input_div_.css('height', "36px"); // can't get ui_utils.ace_editor_height to work
            // recalculate gutter width:
            input_widget_.renderer.$gutterLayer.gutterWidth = 0;
            input_widget_.renderer.$changes |= input_widget_.renderer.__proto__.CHANGE_FULL;
            input_widget_.resize(true);
            input_widget_.focus();
            input_div_.css('border-color', '#eeeeee');
            var dir = false;
            var switch_color = function() {
                input_div_.animate({borderColor: dir ? '#ffac88' : '#E34234'},
                                   {duration: 1000,
                                    easing: 'easeInOutCubic',
                                    queue: false});
                dir = !dir;
            };
            switch_color();
            input_anim_ = window.setInterval(switch_color, 1000);
            ui_utils.scroll_into_view($('#rcloud-cellarea'), 100, 100, notebook_cell_div, input_div_);
            input_kont_ = k;
        },
        div: function() {
            return notebook_cell_div;
        },
        update_model: function() {
            return update_model();
        },
        focus: function() {
            ace_widget_.focus();
            return this;
        },
        get_content: function() { // for debug
            return cell_model.content();
        },
        reformat: function() {
            if(edit_mode_) {
                // resize once to get right height, then set height,
                // then resize again to get ace scrollbars right (?)
                ace_widget_.resize();
                set_widget_height();
                ace_widget_.resize();
            }
            return this;
        },
        check_buttons: function() {
            if(above_between_controls_)
                above_between_controls_.betweenness(!!cell_model.parent_model.prior_cell(cell_model));
            return this;
        },
        change_highlights: function(ranges) {
            highlights_ = ranges;
            if(edit_mode_) {
                var markers = ace_session_.getMarkers();
                for(var marker in markers) {
                    if(markers[marker].type === 'rcloud-select')
                        ace_session_.removeMarker(marker);
                }
                if(ranges)
                    ranges.forEach(function(range) {
                        var ace_range = ui_utils.ace_range_of_character_range(ace_widget_, range.begin, range.end);
                        ace_session_.addMarker(ace_range, highlight_classes(range.kind), 'rcloud-select');
                        if(/active/.test(range.kind)) {
                            ace_widget_.scrollToLine(ace_range.start.row);
                            window.setTimeout(function() {
                                var hl = ace_div.find('.find-highlight.' + range.kind);
                                if(hl.size())
                                    ui_utils.scroll_into_view($('#rcloud-cellarea'), 100, 100, notebook_cell_div, ace_div, hl);
                            }, 0);
                        }
                    });
            }
            else {
                assign_code();
                var $active = code_div_.find('.find-highlight.active, .find-highlight.activereplaced');
                if($active.size())
                    ui_utils.scroll_into_view($('#rcloud-cellarea'), 100, 100, notebook_cell_div, code_div_, $active);

            }
            return this;
        }
    });

    result.edit_source(false);
    return result;
};

Notebook.Cell.create_html_view = function(cell_model)
{
    return create_cell_html_view(cell_model.language(), cell_model);
};
})();

Notebook.Cell.create_model = function(content, language)
{
    var id_ = -1;
    var is_selected_ = false;
    var result = Notebook.Buffer.create_model(content, language);
    var base_change_object = result.change_object;

    _.extend(result, {
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
        get_execution_snapshot: function() {
            // freeze the cell as it is now, to execute it later
            var language = this.language() || 'Text'; // null is a synonym for Text
            return {
                controller: this.controller,
                json_rep: this.json(),
                partname: Notebook.part_name(this.id(), language),
                language: language,
                version: this.parent_model.controller.current_gist().history[0].version
            };
        },
        deselect_cell: function() {
            is_selected_ = false;

            this.notify_views(function(view) {
                view.selected_updated();
            });

            return is_selected_;
        },
        select_cell: function() {
            is_selected_ = true;

            this.notify_views(function(view) {
                view.selected_updated();
            });

            return is_selected_;  
        },
        toggle_cell: function() {
            is_selected_ = !is_selected_;

            this.notify_views(function(view) {
                view.selected_updated();
            });

            return is_selected_;  
        },
        is_selected: function() {
            return is_selected_;
        },
        json: function() {
            return {
                content: content,
                language: this.language()
            };
        },
        change_object: function(obj) {
            obj = obj || {};
            if(obj.id && obj.filename)
                throw new Error("must specify only id or filename");
            if(!obj.filename) {
                var id = obj.id || this.id();
                if((id>0)!==true) // negative, NaN, null, undefined, etc etc.  note: this isn't <=
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
    var execution_context_ = null;
    var result = {
        enqueue_execution_snapshot: function() {
            var that = this;
            if(!execution_context_) {
                function appender(type) {
                    return that.append_result.bind(this, type);
                }
                var resulter = appender('code');
                execution_context_ =
                    {
                        end: this.end_output.bind(this),
                        // these should convey the meaning e.g. through color:
                        out: resulter, err: appender('error'), msg: resulter,
                        html_out: appender('html'),
                        deferred_result: appender('deferred_result'),
                        selection_out: appender('selection'),
                            in: this.get_input.bind(this, 'in')
                    };
            }
            var context_id = RCloud.register_output_context(execution_context_);
            that.set_run_state("waiting");
            that.edit_source(false);
            var snapshot = cell_model.get_execution_snapshot();
            RCloud.UI.run_button.enqueue(
                function() {
                    that.set_run_state("running");
                    return cell_model.parent_model.controller.execute_cell_version(context_id, snapshot);
                },
                function() {
                    that.set_run_state("cancelled");
                });
        },
        set_run_state: function(msg) {
            cell_model.notify_views(function(view) {
                view.state_changed(msg);
            });
        },
        clear_result: function() {
            cell_model.notify_views(function(view) {
                view.clear_result();
            });
        },
        append_result: function(type, msg) {
            cell_model.notify_views(function(view) {
                view.add_result(type, msg);
            });
        },
        end_output: function(error) {
            cell_model.notify_views(function(view) {
                if(error && error !== true)
                    view.add_result('error', error);
                view.end_output(error);
            });
        },
        get_input: function(type, prompt, k) {
            // assume only one view has get_input
            var view = _.find(cell_model.views, function(v) { return v.get_input; });
            if(!view)
                k("cell view does not support input", null);
            else
                view.get_input(type, prompt, k);
        },
        edit_source: function(whether) {
            cell_model.notify_views(function(view) {
                view.edit_source(whether);
            });
        },
        change_language: function(language) {
            cell_model.language(language);
        }
    };

    return result;
};

Notebook.Cell.preprocessors = RCloud.extension.create();
Notebook.Cell.postprocessors = RCloud.extension.create();

Notebook.Cell.postprocessors.add({
    device_pixel_ratio: {
        sort: 1000,
        disable: true, // needs to move into RCloud.UI.image_manager
        process: function(div) {
            // we use the cached version of DPR instead of getting window.devicePixelRatio
            // because it might have changed (by moving the user agent window across monitors)
            // this might cause images that are higher-res than necessary or blurry.
            // Since using window.devicePixelRatio might cause images
            // that are too large or too small, the tradeoff is worth it.
            var dpr = rcloud.display.get_device_pixel_ratio();
            // fix image width so that retina displays are set correctly
            div.find("img")
                .each(function(i, img) {
                    function update() { img.style.width = img.width / dpr; }
                    if (img.width === 0) {
                        $(img).on("load", update);
                    } else {
                        update();
                    }
                });
        }
    },
    deferred_results: {
        sort: 2000,
        process: function(div) {
            var uuid = rcloud.deferred_knitr_uuid;
            div.find("span.deferred-result")
                .each(function() {
                    var that = this;
                    var uuids = this.textContent.split("|");
                    // FIXME monstrous hack: we rebuild the ocap from the string to
                    // call it via rserve-js
                    var ocap = [uuids[1]];
                    ocap.r_attributes = { "class": "OCref" };
                    var f = rclient._rserve.wrap_ocap(ocap);

                    f(function(err, future) {
                        var data;
                        if (err) {
                            $(that).replaceWith(function() {
                                return ui_utils.string_error(err[0]);
                            });
                        } else {
                            data = future();
                            $(that).replaceWith(function() {
                                return data;
                            });
                        }
                    });
                });
        }
    },
    mathjax: {
        sort: 3000,
        process: function(div) {
            // typeset the math
            // why does passing the div as last arg not work, as documented here?
            // http://docs.mathjax.org/en/latest/typeset.html
            if (!_.isUndefined(MathJax))
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        }
    },
    shade_pre_r: {
        sort: 4000,
        process: function(div) {
            div.find("pre code")
                .filter(function(i, e) {
                    // things which have defined classes coming from knitr and markdown
                    // we might look in RCloud.language here?
                    return e.classList.length > 0;
                }).parent().toggleClass('r', true);
        }
    },
    hide_source: {
        sort: 5000,
        process: function(div) {
            // this is kinda bad
            if (!shell.notebook.controller._r_source_visible) {
                Notebook.hide_r_source(div);
            }
        }
    },
    click_markdown_code: {
        sort: 6000,
        process: function(div, view) {
            view.click_to_edit(div.find('pre.r'), true);
        }
    }
});

Notebook.Cell.preprocessors.add({
    quote_deferred_results: {
        sort: 1000,
        process: (function() {
            var deferred_result_uuid_, deferred_regexp_, deferred_replacement_;
            function make_deferred_regexp() {
                deferred_result_uuid_ = rcloud.deferred_knitr_uuid;
                deferred_regexp_ = new RegExp(deferred_result_uuid_ + '\\|[\\+a-zA-Z_0-9.]*', 'g');
                deferred_replacement_ = '<span class="deferred-result">$&</span>';
            }
            return function(r) {
                if(!deferred_result_uuid_ != rcloud.deferred_knitr_uuid)
                    make_deferred_regexp();
                // manually replace all, and replace any `+` within matches with `@`
                var x = deferred_regexp_.exec(r);
                if(x) {
                    var parts = [], s=0;
                    while(x) {
                        parts.push(r.substring(s, x.index));
                        parts.push(deferred_replacement_.replace('$&', r.substr(x.index, x[0].length).replace('+', '@')));
                        s = x.index + x[0].length;
                        x = deferred_regexp_.exec(r);
                    }
                    parts.push(r.substring(s));
                    r = parts.join('');
                }
                return r;
            };
        })()
    }
});


Notebook.create_html_view = function(model, root_div)
{
    var show_cell_numbers_;
    function on_rearrange() {
        _.each(result.sub_views, function(view) {
            view.check_buttons();
        });
    }

    function init_cell_view(cell_view) {
        cell_view.set_readonly(model.read_only() || shell.is_view_mode());
        cell_view.set_show_cell_numbers(show_cell_numbers_);
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
            init_cell_view(cell_view);
            on_rearrange();
            return cell_view;
        },
        asset_appended: function(asset_model) {
            var asset_view = Notebook.Asset.create_html_view(asset_model);
            asset_model.views.push(asset_view);
            $("#asset-list").append(asset_view.div());
            this.asset_sub_views.push(asset_view);
            on_rearrange();
            return asset_view;
        },
        cell_inserted: function(cell_model, cell_index) {
            var cell_view = Notebook.Cell.create_html_view(cell_model);
            cell_model.views.push(cell_view);
            root_div.append(cell_view.div());
            $(cell_view.div()).insertBefore(root_div.children('.notebook-cell')[cell_index]);
            this.sub_views.splice(cell_index, 0, cell_view);
            init_cell_view(cell_view);
            on_rearrange();
            return cell_view;
        },
        cell_removed: function(cell_model, cell_index) {
            _.each(cell_model.views, function(view) {
                view.self_removed();
            });
            this.sub_views.splice(cell_index, 1);
            on_rearrange();
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
            on_rearrange();
        },
        set_readonly: function(readonly) {
            _.each(this.sub_views, function(view) {
                view.set_readonly(readonly);
            });
            _.each(this.asset_sub_views, function(view) {
                view.set_readonly(readonly);
            });
        },
        set_show_cell_numbers: function(whether) {
            show_cell_numbers_ = whether;
            _.each(this.sub_views, function(view) {
                view.set_show_cell_numbers(whether);
            });
        },
        update_urls: function() {
            RCloud.UI.scratchpad.update_asset_url();
        },
        update_model: function() {
            return _.map(this.sub_views, function(cell_view) {
                return cell_view.update_model();
            });
        },
        reformat: function() {
            _.each(this.sub_views, function(view) {
                view.reformat();
            });
        }
    };
    model.views.push(result);
    return result;
};

// these functions in loops are okay
/*jshint -W083 */
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
        execution_watchers: [],
        clear: function() {
            var cells_removed = this.remove_cell(null,last_id(this.cells));
            var assets_removed = this.remove_asset(null,this.assets.length);
            RCloud.UI.selection_bar.update(this.cells);
            return cells_removed.concat(assets_removed);
        },
        get_asset: function(filename) {
            return _.find(this.assets, function(asset) {
                return asset.filename() == filename;
            });
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
        cell_count: function() {
            return this.cells.length;
        },
        append_cell: function(cell_model, id, skip_event) {
            cell_model.parent_model = this;
            cell_model.renew_content();
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
            RCloud.UI.selection_bar.update(this.cells);
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

            RCloud.UI.selection_bar.update(this.cells);

            // apply the changes backward so that we're moving each cell
            // out of the way just before putting the next one in its place
            return changes.reverse();
        },
        remove_asset: function(asset_model, n, skip_event) {
            if (this.assets.length === 0)
                return [];
            var that = this;
            var asset_index, filename;
            if(asset_model!==null) {
                asset_index = this.assets.indexOf(asset_model);
                filename = asset_model.filename();
                if (asset_index === -1) {
                    throw new Error("asset_model not in notebook model?!");
                }
            }
            else {
                asset_index = 0;
                filename = this.assets[asset_index].filename();
            }
            // the n > 1 case is stupid: it's only for clearing the
            // whole notebook (and no changes need to be recorded for that)
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
            if(cell_model!==null) {
                cell_index = this.cells.indexOf(cell_model);
                id = cell_model.id();
                if (cell_index === -1) {
                    throw new Error("cell_model not in notebook model?!");
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
                    var cell = this.cells[x];
                    this.cells.splice(x, 1);
                    if(!skip_event)
                        _.each(this.views, function(view) {
                            view.cell_removed(cell, x);
                        });
                    changes.push(cell.change_object({ erase: 1 }));
                }
                ++id;
                --n;
            }

            RCloud.UI.selection_bar.update(this.cells);
            
            return changes;
        },
        remove_selected_cells: function() {
            var that = this, changes = [];

            _.chain(this.cells)
            .filter(function(cell) {
                return cell.is_selected();
            })
            .each(function(cell) {
                changes = changes.concat(that.remove_cell(cell));
            });

            RCloud.UI.selection_bar.update(this.cells);

            return changes;
        },
        invert_selected_cells: function() {
            _.each(this.cells, function(cell) {
                cell.toggle_cell();
            });
            RCloud.UI.selection_bar.update(this.cells);
        },
        clear_all_selected_cells: function() {
            _.each(this.cells, function(cell) {
                cell.deselect_cell();
            });
            RCloud.UI.selection_bar.update(this.cells);
        },
        crop_cells: function() {
            var that = this, changes = [];
            _.chain(this.cells)
            .filter(function(cell) {
                return !cell.is_selected();
            })
            .each(function(cell) {
                changes = changes.concat(that.remove_cell(cell));
            });
            RCloud.UI.selection_bar.update(this.cells);

            return changes;
        },
        select_all_cells: function() {
            _.each(this.cells, function(cell) {
                cell.select_cell();
            });
            RCloud.UI.selection_bar.update(this.cells);
        },
        move_cell: function(cell_model, before) {
            // remove doesn't change any ids, so we can just remove then add
            var pre_index = this.cells.indexOf(cell_model),
                changes = this.remove_cell(cell_model, 1, true)
                    .concat(before >= 0 ?
                            this.insert_cell(cell_model, before, true) :
                            this.append_cell(cell_model, null, true)),
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
        select_cell: function(cell_model, modifiers) {

            var that = this;

            var clear_all = function() {
                _.chain(that.cells)
                .filter(function(cell) {
                    return cell.is_selected();
                })
                .each(function(cell) {
                    cell.deselect_cell();
                }); 
            };

            var get_selected_index_range = function() {
                var foundIndexes = [];

                for(var loop = 0; loop < that.cells.length; loop++) {
                    if(that.cells[loop].is_selected()) {
                        foundIndexes.push(loop);
                    }
                }

                return foundIndexes.length === 0 ? undefined : {
                    lower: foundIndexes[0],
                    upper: foundIndexes[foundIndexes.length - 1]
                };
            };

            var select_range = function(lower, upper) {
                var items = [];

                for(var loop = lower; loop <= upper; loop++) {
                    that.cells[loop].select_cell();
                }
            };

            if(modifiers.is_toggle) {
                cell_model.toggle_cell();
            } else if(modifiers.is_exclusive) {
                clear_all();
                cell_model.toggle_cell();
            } else /* is_range */ {
                var selected_index_range = get_selected_index_range();
                var selected_index = this.cells.indexOf(cell_model);

                if(_.isUndefined(selected_index_range)) {
                    cell_model.select_cell();
                } else {
                    clear_all();
                    if(selected_index > selected_index_range.upper) {
                        select_range(selected_index_range.upper, selected_index);
                    } else if(selected_index < selected_index_range.lower) {
                        select_range(selected_index, selected_index_range.lower);
                    } else {
                        select_range(selected_index_range.lower, selected_index_range.upper);
                    }
                }
            }

            RCloud.UI.selection_bar.update(this.cells);
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
                throw new Error("not expecting more than one notebook view");
            var contents = changed_cells_per_view[0];
            var changes = [];
            for (var i=0; i<contents.length; ++i)
                if (contents[i] !== null)
                    changes.push(this.cells[i].change_object());
            var asset_change = RCloud.UI.scratchpad.update_model();
            // too subtle here: update_model distinguishes between no change (null)
            // and change-to-empty.  we care about change-to-empty and let github
            // delete the asset but leave it on the screen until reload (as with cells)
            if (asset_change !== null) {
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
        update_files: function(files) {
            for(var i = 0; i<this.assets.length; ++i) {
                var ghfile = files[this.assets[i].filename()];
                // note this is where to get the asset raw_url if we need it again
                if (ghfile) this.assets[i].language(ghfile.language);
            }
            _.each(this.views, function(view) {
                view.update_urls();
            });
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
        save_timer_ = null;
    // only create the callbacks once, but delay creating them until the editor
    // is initialized
    var default_callback = function() {
        var cb_ = null;
        return function() {
            if(!cb_) {
                var editor_callback = editor.load_callback({is_change: true, selroot: true});
                cb_ = function(notebook) {
                    var saveb = RCloud.UI.navbar.control('save_notebook');
                    saveb && saveb.disable();
                    dirty_ = false;
                    if(save_timer_) {
                        window.clearTimeout(save_timer_);
                        save_timer_ = null;
                    }
                    rcloud.refresh_compute_notebook(notebook.id);
                    return editor_callback(notebook);
                };
            }
            return cb_;
        };
    }();

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
                changes: model.append_asset(asset_model, filename),
                model: asset_model};
    }

    function insert_cell_helper(content, type, id) {
        var cell_model = Notebook.Cell.create_model(content, type);
        var cell_controller = Notebook.Cell.create_controller(cell_model);
        cell_model.controller = cell_controller;
        return {controller: cell_controller, changes: model.insert_cell(cell_model, id)};
    }

    function on_load(version, notebook) {
        // the git backend should determine readonly but that's another huge refactor
        // and it would require multiple usernames, which would be a rather huge change
        var ninf = editor.get_notebook_info(notebook.id);
        var is_read_only = ninf && ninf.source ||
                version !== null ||
                notebook.user.login !== rcloud.username() ||
                shell.is_view_mode();
        current_gist_ = notebook;
        model.read_only(is_read_only);
        if (!_.isUndefined(notebook.files)) {
            var i;
            // we can't do much with a notebook with no name, so give it one
            if(!notebook.description)
                notebook.description = "(untitled)";
            this.clear();
            var cells = {}; // could rely on alphabetic input instead of gathering
            var assets = {};
            _.each(notebook.files, function (file, k) {
                // ugh, we really need to have a better javascript mapping of R objects..
                if (k === "r_attributes" || k === "r_type")
                    return;
                var filename = file.filename;
                if(Notebook.is_part_name(filename)) {
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
            model.update_files(notebook.files);

            if(asset_controller)
                asset_controller.select();
            else
                RCloud.UI.scratchpad.set_model(null);
            // set read-only again to trickle MVC events through to the display :-(
            model.read_only(is_read_only);
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
            return Promise.reject(new Error("attempted to update read-only notebook"));
        if (!changes.length && _.isUndefined(more)) {
            return Promise.cast(current_gist_);
        }
        gistname = gistname || shell.gistname();
        function changes_to_gist(changes) {
            var files = {}, creates = {};
            // play the changes in order - they must be sequenced so this makes sense
            _.each(changes, function(change) {
                if(change.erase || change.rename) {
                    if(creates[change.filename])
                        delete files[change.filename];
                    else
                        files[change.filename] = null;
                    if(change.rename)
                        files[change.rename] = {content: change.content};
                }
                else {
                    // if the first time we see a filename in the changeset is a create,
                    // we need to remember that so that if the last change is a delete,
                    // we just send "no change"
                    if(change.create && !(change.filename in files))
                        creates[change.filename] = true;
                    files[change.filename] = {content: change.content};
                }
            });
            return {files: files};
        }
        var gist = add_more_changes(changes_to_gist(changes));
        return rcloud.update_notebook(gistname, gist)
            .then(function(notebook) {
                if('error' in notebook)
                    throw notebook;
                current_gist_ = notebook;
                model.update_files(notebook.files);
                return notebook;
            })
            .catch(function(e) {
                // this should not ever happen but there is no choice but to reload if it does
                if(/non-existent/.test(e.message))
                    editor.fatal_reload(e.message);
                throw e;
            });
    }

    function apply_changes_and_load(changes, gistname) {
        return (changes.length ?
            update_notebook(changes, gistname) :
            Promise.resolve(undefined))
            .then(function() {
                return result.load_notebook(gistname, null); // do a load - we need to refresh
            });
    }

    function refresh_buffers() {
        return model.reread_buffers();
    }

    function on_dirty() {
        if(!dirty_) {
            var saveb = RCloud.UI.navbar.control('save_notebook');
            saveb && saveb.enable();
            dirty_ = true;
        }
        if(save_timer_)
            window.clearTimeout(save_timer_);
        var save_timeout = shell.autosave_timeout();
        if(save_timeout > 0)
            save_timer_ = window.setTimeout(function() {
                result.save();
                save_timer_ = null;
            }, save_timeout);
    }

    model.dishers.push({on_dirty: on_dirty});

    var result = {
        current_gist: function() {
            // are there reasons we shouldn't be exposing this?
            return current_gist_;
        },
        append_asset: function(content, filename) {
            var cch = append_asset_helper(content, filename);
            return update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback())
                .then(function(notebook) {
                    // set content again because server may have determined it's text
                    cch.model.content(notebook.files[filename].content);
                    return [notebook, cch.controller];
                });
        },
        cell_count: function() {
            return model.cell_count();
        },
        append_cell: function(content, type, id) {
            var cch = append_cell_helper(content, type, id);
            return update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback())
                .then(function(notebook) {
                    return [notebook, cch.controller];
                });
        },
        insert_cell: function(content, type, id) {
            var cch = insert_cell_helper(content, type, id);
            return update_notebook(refresh_buffers().concat(cch.changes))
                .then(default_callback())
                .then(function(notebook) {
                    return [notebook, cch.controller];
                });
        },
        remove_cell: function(cell_model) {
            var changes = refresh_buffers().concat(model.remove_cell(cell_model));
            RCloud.UI.command_prompt.focus();
            return update_notebook(changes)
                .then(default_callback());
        },
        remove_selected_cells: function() {
            var changes = refresh_buffers().concat(model.remove_selected_cells());
            RCloud.UI.command_prompt.focus();
            return update_notebook(changes)
                .then(default_callback());
        },
        invert_selected_cells: function() {
            model.invert_selected_cells();
        },
        clear_all_selected_cells: function() {
            model.clear_all_selected_cells();
        },
        crop_cells: function() {
            var changes = refresh_buffers().concat(model.crop_cells());
            RCloud.UI.command_prompt.focus();
            return update_notebook(changes)
                .then(default_callback());
        },
        select_all_cells: function() {
            model.select_all_cells();
        },
        remove_asset: function(asset_model) {
            var changes = refresh_buffers().concat(model.remove_asset(asset_model));
            return update_notebook(changes)
                .then(default_callback());
        },
        move_cell: function(cell_model, before) {
            var changes = refresh_buffers().concat(model.move_cell(cell_model, before ? before.id() : -1));
            return update_notebook(changes)
                .then(default_callback());
        },
        join_prior_cell: function(cell_model) {
            var prior = model.prior_cell(cell_model);
            if(!prior)
                return Promise.resolve(undefined);

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
            _.each(prior.views, function(v) { v.clear_result(); });
            return update_notebook(changes.concat(model.remove_cell(cell_model)))
                .then(default_callback());
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
            var content = cell_model.content();
            // make sure point1 is before point2
            if(point1>=point2)
                point2 = undefined;
            // remove split points at the beginning or end
            if(point2 !== undefined && /^\s*$/.test(content.substring(point2)))
                point2 = undefined;
            if(point1 !== undefined) {
                if(/^\s*$/.test(content.substring(point1)))
                    point1 = undefined;
                else if(/^\s*$/.test(content.substring(0, point1)))
                    point1 = point2;
            }
            // don't do anything if there is no real split point
            if(point1 === undefined)
                return Promise.resolve(undefined);
            var parts = [content.substring(0, point1)],
                id = cell_model.id(), language = cell_model.language();
            if(point2 === undefined)
                parts.push(content.substring(point1));
            else
                parts.push(content.substring(point1, point2),
                           content.substring(point2));
            resplit(parts);
            cell_model.content(parts[0]);
            _.each(cell_model.views, function(v) { v.clear_result(); });
            changes = changes.concat(model.update_cell(cell_model));
            // not great to do multiple inserts here - but not quite important enough to enable insert-n
            for(var i=1; i<parts.length; ++i)
                changes = changes.concat(insert_cell_helper(parts[i], language, id+i).changes);
            return update_notebook(changes)
                .then(default_callback());
        },
        change_cell_language: function(cell_model, language) {
            var changes = refresh_buffers().concat(model.change_cell_language(cell_model, language));
            return update_notebook(changes)
                .then(default_callback());
        },
        select_cell: function(cell_model, modifiers) {
            var changes = refresh_buffers().concat(model.select_cell(cell_model, modifiers));
        },
        clear: function() {
            model.clear();
            // FIXME when scratchpad becomes a view, clearing the model
            // should make this happen automatically.
            RCloud.UI.scratchpad.clear();
        },
        load_notebook: function(gistname, version) {
            return rcloud.load_notebook(gistname, version || null)
                .catch(function(xep) {
                    xep.from_load = true;
                    throw xep;
                })
                .then(_.bind(on_load, this, version));
        },
        create_notebook: function(content) {
            var that = this;
            return rcloud.create_notebook(content)
                .then(_.bind(on_load,this,null));
        },
        revert_notebook: function(gistname, version) {
            model.read_only(false); // so that update_notebook doesn't throw
            // get HEAD, calculate changes from there to here, and apply
            return rcloud.load_notebook(gistname, null).then(function(notebook) {
                return [find_changes_from(notebook), gistname];
            }).spread(apply_changes_and_load);
        },
        fork_notebook: function(gistname, version) {
            model.read_only(false); // so that update_notebook doesn't throw
            return rcloud.fork_notebook(gistname)
                .then(function(notebook) {
                    if(version)
                        // fork, then get changes from there to where we are in the past, and apply
                        // git api does not return the files on fork, so load
                        return rcloud.get_notebook(notebook.id, null)
                        .then(function(notebook2) {
                            return [find_changes_from(notebook2), notebook2.id];
                        });
                    else return [[], notebook.id];
            }).spread(apply_changes_and_load);
        },
        update_cell: function(cell_model) {
            return update_notebook(refresh_buffers().concat(model.update_cell(cell_model)))
                .then(default_callback());
        },
        update_asset: function(asset_model) {
            return update_notebook(refresh_buffers().concat(model.update_asset(asset_model)))
                .then(function(notebook) {
                    // set content again because server may have determined it's text
                    asset_model.content(notebook.files[asset_model.filename()].content);
                    return notebook;
                })
                .then(default_callback());
        },
        rename_notebook: function(desc) {
            return update_notebook(refresh_buffers(), null, {description: desc})
                .then(default_callback());
        },
        apply_changes: function(changes) {
            return update_notebook(changes).then(default_callback());
        },
        save: function() {
            if(!dirty_)
                return Promise.resolve(undefined);
            return update_notebook(refresh_buffers())
                .then(default_callback());
        },
        execute_cell_version: function(context_id, info) {
            function execute_cell_callback(r) {
                if (r && r.r_attributes) {
                    if (r.r_attributes['class'] === 'parse-error') {
                        // available: error=message
                        RCloud.end_cell_output(context_id, "Parse error: " + r.error);
                        throw 'stop';
                    } else if (r.r_attributes['class'] === 'cell-eval-error') {
                        // available: error=message, traceback=vector of calls, expression=index of the expression that failed
                        var tb = r.traceback || '';
                        if (tb.join) tb = tb.join("\n");
                        var trace = tb ? 'trace:\n'+tb : true;
                        RCloud.end_cell_output(context_id, trace);
                        throw 'stop';
                    }
                    else RCloud.end_cell_output(context_id, null);
                }
                else RCloud.end_cell_output(context_id, null);
                _.each(model.execution_watchers, function(ew) {
                    ew.run_cell(info.json_rep);
                });
            }
            rcloud.record_cell_execution(info.json_rep);
            var cell_eval = rcloud.authenticated ? rcloud.authenticated_cell_eval : rcloud.session_cell_eval;
            return cell_eval(context_id, info.partname, info.language, info.version, false).then(execute_cell_callback);
        },
        run_all: function() {
            var that = this;
            return this.save().then(function() {
                _.each(model.cells, function(cell_model) {
                    cell_model.controller.enqueue_execution_snapshot();
                });
            });
        },
        show_cell_numbers: function(whether) {
            _.each(model.views, function(view) {
                view.set_show_cell_numbers(whether);
            });
            return this;
        },

        //////////////////////////////////////////////////////////////////////

        is_mine: function() {
            return rcloud.username() === model.user();
        },

        //////////////////////////////////////////////////////////////////////

        _r_source_visible: true,

        hide_r_source: function() {
            this._r_source_visible = false;
            RCloud.UI.advanced_menu.check('show_source', false);
            Notebook.hide_r_source();
        },
        show_r_source: function() {
            this._r_source_visible = true;
            RCloud.UI.advanced_menu.check('show_source', true);
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
    selection.hide();
};

Notebook.show_r_source = function(selection)
{
    if (selection)
        selection = $(selection).find(".r");
    else
        selection = $(".r");
    selection.show();
};

Notebook.is_binary_content = function(content) {
    return !_.isUndefined(content.byteLength) && !_.isUndefined(content.slice);
};

Notebook.part_name = function(id, language) {
    // yuk
    if(_.isString(id))
        return id;
    var ext = RCloud.language.extension(language);
    if (_.isUndefined(ext))
        throw new Error("Unknown language " + language);
    return 'part' + id + '.' + ext;
};

Notebook.empty_for_github = function(text) {
    return /^\s*$/.test(text);
};

Notebook.is_part_name = function(filename) {
    return filename.match(/^part\d+\./);
};

Notebook.sanitize = function(notebook) {
    notebook = _.pick(notebook, 'description', 'files');
    var files = notebook.files;
    delete files.r_attributes;
    delete files.r_type;
    for(var fn in files)
        files[fn] = _.pick(files[fn], 'content');
    return notebook;
};



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

function rclient_promise(allow_anonymous) {
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
    }).catch(function(error) { // e.g. couldn't connect with github
        if(window.rclient)
            rclient.close();
        if (error.message === "Authentication required") {
            RCloud.UI.fatal_dialog("Your session has been logged out.", "Reconnect", ui_utils.relogin_uri());
        } else {
            var msg = error.message || error.error || error;
            RCloud.UI.fatal_dialog(could_not_initialize_error(msg), "Logout", "/logout.R");
        }
        throw error;
    }).then(function() {
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
    },
    on_data: on_data,
    on_oob_message: on_message,
    invoke_context_callback: invoke_context_callback
};

})();

RCloud.language = (function() {
    // the keys of the language map come from GitHub's language detection
    // infrastructure which we don't control. (this is likely a bad thing)
    var languages_ = {
        CSS: {
            ace_mode: "ace/mode/css"
        },
        JavaScript: {
            ace_mode: "ace/mode/javascript"
        },
        Text: {
            ace_mode: "ace/mode/text",
            extension: 'txt'
        }, 
        HTML: {
            ace_mode: "ace/mode/html"
        }
    };

    var langs_ = [];

    return {
        is_a_markdown: function(language) {
            return languages_[language] ? languages_[language].is_a_markdown : false;
        },
        ace_mode: function(language) {
            return (languages_[language] && languages_[language].ace_mode) || languages_.Text.ace_mode;
        },
        extension: function(language) {
            var ext = (languages_[language] && languages_[language].extension) || '';
            if(_.isArray(ext)) ext = ext[0];
            return ext;
        },
        hljs_class: function(language) {
            return (languages_[language] && languages_[language].hljs_class) || null;
        },
        // don't call _set_available_languages yourself; it's called
        // by the session initialization code.
        _set_available_languages: function(langs) {
            langs_ = [];
            for(var lang in langs) {
                langs_.push(lang);
                languages_[lang] = languages_[lang] || {};
                languages_[lang].is_a_markdown = langs[lang]['is.a.markdown'];
                languages_[lang].ace_mode = langs[lang]['ace.mode'];
                languages_[lang].hljs_class = langs[lang]['hljs.class'];
                languages_[lang].extension = langs[lang].extension;
            }
        },
        available_languages: function() {
            return langs_;
        }
    };

})();

(function() {
    function upload_opts(opts) {
        if(_.isBoolean(opts) || _.isUndefined(opts))
            opts = {force: !!opts};
        else if(!_.isObject(opts))
            throw new Error("didn't understand options " + opts);
        opts = $.extend({
            force: false
        }, opts);
        if(!opts.files)
            opts.files = opts.$file ? opts.$file[0].files : [];
        return opts;
    }

    function text_or_binary_reader() {
        return Promise.promisify(function(file, callback) {
            var fr = new FileReader();
            var bytes_read = 0;

            fr.onload = function(e) {
                // send across as ArrayBuffer/raw vector. server will decide if it's string or binary content
                callback(null, fr.result);
            };
            fr.onerror = function(e) {
                callback(fr.error, null);
            };
            fr.readAsArrayBuffer(file.slice(0, file.size));
        });
    }

    RCloud.upload_assets = function(options, react) {
        react = react || {};
        options = upload_opts(options);
        function upload_asset(filename, content) {
            var replacing = shell.notebook.model.get_asset(filename);
            var promise_controller;
            if(replacing) {
                if(react.replace)
                    react.replace(filename);
                replacing.content(content);
                promise_controller = shell.notebook.controller.update_asset(replacing)
                    .return(replacing.controller);
            }
            else {
                if(react.add)
                    react.add(filename);
                promise_controller = shell.notebook.controller.append_asset(content, filename)
                    .then(function() {
                        return shell.notebook.model.get_asset(filename).controller;
                    });
            }
            return promise_controller.then(function(controller) {
                controller.select();
            });
        }
        return RCloud.utils.promise_sequence(
            options.files,
            function(file) {
                if(file.size > 750000)
                    return Promise.reject(new Error('File ' + file.name + ' rejected: maximum asset size is 750KB'));
                return text_or_binary_reader()(file)
                    .then(function(content) {
                        if(_.isString(content) && Notebook.empty_for_github(content))
                            throw new Error("empty");
                        return upload_asset(file.name, content);
                    });
            });
    };

    function binary_upload(upload_ocaps, react) {
        return Promise.promisify(function(file, is_replace, callback) {
            var fr = new FileReader();
            var chunk_size = 1024*128;
            var f_size=file.size;
            var cur_pos=0;
            var bytes_read = 0;
            if(react.start)
                react.start(file.name);
            //initiate the first chunk, and then another, and then another ...
            // ...while waiting for one to complete before reading another
            fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
            fr.onload = function(e) {
                if(react.progress)
                    react.progress(bytes_read, f_size);
                var promise;
                if (e.target.result.byteLength > 0) {
                    var bytes = new Uint8Array(e.target.result);
                    promise = upload_ocaps.writeAsync(bytes.buffer)
                        .then(function() {
                            bytes_read += e.target.result.byteLength;
                            cur_pos += chunk_size;
                            fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                        });
                } else {
                    promise = upload_ocaps.closeAsync()
                        .then(function() {
                            if(react.done)
                                react.done(is_replace, file.name);
                            callback(null, true);
                        });
                }
                promise.catch(function(err) {
                    callback(err, null);
                });
            };
        });
    }

    RCloud.upload_files = function(options, react) {
        var upload_ocaps = options.upload_ocaps || rcloud._ocaps.file_upload;
        react = react || {};
        options = upload_opts(options);
        var upload = binary_upload(upload_ocaps, react);
        function upload_file(path, file) {
            var upload_name = path + '/' + file.name;
            return upload_ocaps.createAsync(upload_name, options.force)
                .catch(function(err) {
                    if(react.confirm_replace && /exists/.test(err.message)) {
                        return react.confirm_replace(file.name)
                            .then(function(confirm) {
                                return confirm ?
                                    upload_ocaps.createAsync(upload_name, true)
                                    .return("overwrite") :
                                    Promise.resolve(false);
                            });
                    }
                    else throw err;
                })
                .then(function(whether) {
                    return whether ? upload(file, whether==="overwrite") : Promise.resolve(undefined);
                });
        }

        if(!(window.File && window.FileReader && window.FileList && window.Blob))
            return Promise.reject(new Error("File API not supported by browser."));
        else {
            if(_.isUndefined(options.files) || !options.files.length)
                return Promise.reject(new Error("No files selected!"));
            else {
                /*FIXME add logged in user */
                return upload_ocaps.upload_pathAsync()
                    .then(function(path) {
                        return RCloud.utils.promise_sequence(options.files, upload_file.bind(null, path));
                    });
            }
        }
    };
})();

RCloud.UI = {};

RCloud.UI.advanced_menu = (function() {
    var menu_;
    var result = {
        init: function() {
            menu_ = RCloud.UI.menu.create();
            menu_.init();
            // we want the object to derive from RCloud.UI.menu directly but alphabetical order blocks it
            d3.rebind(result, menu_, 'add', 'remove', 'check', 'uncheck', 'enable', 'create');
            RCloud.UI.menus.add({
                advanced_menu: {
                    sort: 5000,
                    type: 'menu',
                    title: 'Advanced',
                    modes: ['view', 'edit'],
                    menu: menu_
                }
            });
            menu_.add({
                open_in_github: {
                    sort: 1000,
                    text: "Open in GitHub",
                    modes: ['view', 'edit'],
                    action: function() {
                        shell.github_url().then(function(url) {
                            if(!url)
                                alert('Sorry, Open in GitHub is not supported for this notebook source.');
                            else
                                window.open(url, "_blank");
                        });
                    }
                },
                open_from_github: {
                    sort: 2000,
                    text: "Load Notebook by ID",
                    modes: ['edit'],
                    action: function() {
                        var result = prompt("Enter notebook ID or github URL:");
                        if(result !== null)
                            shell.open_from_github(result);
                    }
                },
                show_source: {
                    sort: 9000,
                    text: "Show Source",
                    checkbox: true,
                    value: true,
                    modes: ['view'],
                    action: function(value) {
                        if(value)
                            shell.notebook.controller.show_r_source();
                        else
                            shell.notebook.controller.hide_r_source();
                    }
                },
                publish_notebook: {
                    sort: 10000,
                    text: "Publish Notebook",
                    checkbox: true,
                    modes: ['edit'],
                    action: function(value) {
                        function publish_success(gistname, un) {
                            return function(val) {
                                if(!val)
                                    console.log("Failed to " + (un ? "un" : "") + "publish notebook " + gistname);
                            };
                        }
                        if(value) {
                            rcloud.publish_notebook(editor.current().notebook)
                                .then(publish_success(editor.current().notebook, false));
                        }
                        else {
                            rcloud.unpublish_notebook(editor.current().notebook)
                                .then(publish_success(editor.current().notebook, true));
                        }
                    }
                }
            });
        }
    };
    return result;
})();


RCloud.UI.cell_commands = (function() {
    var extension_;

    function create_command_set(area, div, cell_model, cell_view) {
        var commands_ = extension_.create(area, cell_model, cell_view);
        commands_.array.forEach(function(command) {
            command.control.addClass('cell-control');
        });
        var flags_ = {};
        div.append.apply(div, _.pluck(commands_.array, 'control'));
        return {
            controls: commands_.map,
            set_flag: function(flag, value) {
                var checkf = function(f) {
                    var reverse;
                    if(f.substr(0,1)=='!') {
                        reverse = true;
                        f = f.substr(1);
                    }
                    return reverse^flags_[f];
                };
                // a command will be enabled iff all of its enable_flags are true
                // a command will be shown iff all of its display_flags are true
                flags_[flag] = value;
                extension_.entries(area).forEach(function(cmd) {
                    if(!_.every(cmd.enable_flags, checkf))
                        commands_.map[cmd.key].disable();
                    else
                        commands_.map[cmd.key].enable();
                    if(!_.every(cmd.display_flags, checkf))
                        commands_.map[cmd.key].control.hide();
                    else
                        commands_.map[cmd.key].control.show();
                });
            }
        };
    }

    var result = {
        create_button: function(awesome, text, action) {
            var control = ui_utils.fa_button(awesome, text);
            control.click(function(e) {
                // this is a blunt instrument.  seems the tooltips don't go away
                // when they are set to container = body
                $(".tooltip").remove();
                if (!$(e.currentTarget).hasClass("button-disabled")) {
                    action(control);
                }
            });
            return {
                control: control,
                enable: function() {
                    ui_utils.enable_fa_button(control);
                },
                disable: function() {
                    ui_utils.disable_fa_button(control);
                }
            };
        },
        create_select: function(items, action) {
            var control = $("<select class='form-control cell-control-select'></select>");
            control.append.apply(control,
                                 items.map(function(item) {
                                     return $("<option></option>").text(item);
                                 }));
            control.change(function() {
                var val = control.val();
                action(val);
            });
            return {
                control: control,
                enable: function() {
                    control.prop('disabled', false);
                },
                disable: function() {
                    control.prop('disabled', 'disabled');
                },
                set: function(val) {
                    if(items.indexOf(val)<0)
                        throw new Error('tried to select unknown value ' + val);
                    control.val(val);
                }
            };
        },
        create_static: function(html, wrap, action) {
            var content = $('<span><span/>').html(html);
            var span = wrap ? wrap(content) : content;

            if(action) {
                action(span);
            }

            return {
                control: span,
                enable: function() {},
                disable: function() {},
                set: function(html) {
                    content.html(html);
                    return this;
                },
                get: function() {
                    return content;
                }
            };
        },
        create_icon: function(icon, color, wrap) {
            var result = this.create_static("<i></i>");
            result = _.extend(result, {
                icon: function(icon) {
                    result.get().find('i').attr('class', icon);
                    return this;
                },
                color: function(color) {
                    result.get().find('i').css('color', color);
                    return this;
                },
                title: function(title) {
                    result.get().find('i').attr('title', title);
                    return this;
                }
            });
            result.get().attr('class', 'state-icon left-indicator');
            result.icon(icon).color(color);
            return result;
        },
        init: function() {
            extension_ = RCloud.extension.create({
                defaults: {},
                sections: {
                    above_between: {
                        filter: function(command) {
                            return command.area === 'above' || command.area === 'between';
                        }
                    },
                    cell: {
                        filter: function(command) {
                            return command.area === 'cell';
                        }
                    },
                    prompt: {
                        filter: function(command) {
                            return command.area === 'prompt';
                        }
                    },
                    left: {
                        filter: function(command) {
                            return command.area === 'left';
                        }
                    }
                }
            });

            var that = this;
            this.add({
                insert: {
                    area: 'above',
                    sort: 1000,
                    enable_flags: ['modify'],
                    create: function(cell_model) {
                        return that.create_button("icon-plus-sign", "insert cell", function() {
                            shell.insert_cell_before("", cell_model.language(), cell_model.id())
                                .spread(function(_, controller) {
                                    controller.edit_source(true);
                                });
                        });
                    }
                },
                join: {
                    area: 'between',
                    sort: 2000,
                    enable_flags: ['modify'],
                    create: function(cell_model) {
                        return that.create_button("icon-link", "join cells", function() {
                            shell.join_prior_cell(cell_model);
                        });
                    }
                },
                language_cell: {
                    area: 'cell',
                    sort: 1000,
                    enable_flags: ['modify'],
                    create: function(cell_model, cell_view) {
                        var languages = RCloud.language.available_languages();
                        if(languages.indexOf(cell_model.language())<0)
                            languages.push(cell_model.language());
                        return that.create_select(languages, function(language) {
                            cell_model.parent_model.controller.change_cell_language(cell_model, language);
                            cell_view.clear_result();
                        });
                    }
                },
                run: {
                    area: 'cell',
                    sort: 2000,
                    create: function(cell_model, cell_view) {
                        return that.create_button("icon-play", "run", function() {
                            cell_view.execute_cell();
                        });
                    }
                },
                edit: {
                    area: 'cell',
                    sort: 3000,
                    create: function(cell_model, cell_view) {
                        return that.create_button("icon-edit borderable", "toggle edit mode", function() {
                            if(cell_model.parent_model.read_only())
                                cell_view.toggle_source();
                            else
                                cell_view.toggle_edit();
                        });
                    }
                },
                results: {
                    area: 'cell',
                    sort: 3500,
                    create: function(cell_model, cell_view) {
                        return that.create_button("icon-picture borderable", "show/hide results", function() {
                            cell_view.toggle_results();
                        });
                    }
                },
                command_gap: {
                    area: 'cell',
                    sort: 3500,
                    create: function(cell_model) {
                        return that.create_static('&nbsp;');
                    }
                },
                split: {
                    area: 'cell',
                    sort: 4000,
                    enable_flags: ['modify', 'edit'],
                    create: function(cell_model, cell_view) {
                        return that.create_button("icon-unlink", "split cell", function() {
                            var ace_widget = cell_view.ace_widget();
                            if(ace_widget) {
                                var range = ace_widget.getSelection().getRange();
                                var point1, point2;
                                point1 = ui_utils.character_offset_of_pos(ace_widget, range.start);
                                if(!range.isEmpty())
                                    point2 = ui_utils.character_offset_of_pos(ace_widget, range.end);
                                shell.split_cell(cell_model, point1, point2);
                            }
                        });
                    }
                },
                selection: {
                    area: 'left',
                    sort: 1250,
                    display_flags: ['modify'],
                    create: function(cell_model) {
                        var html = "<input type='checkbox'></input>";
                        return that.create_static(html, function(x) {
                            return $("<span class='cell-selection'>").append(x);
                        }, function(static_content) {
                            static_content.click(function(e) {
                                cell_model.parent_model.controller.select_cell(cell_model, {
                                    is_toggle: !e.shiftKey, 
                                    is_range : e.shiftKey
                                });
                            });
                        });
                    }
                },
                left_gap: {
                    area: 'left',
                    sort: 1500,
                    display_flags: ['!modify'],
                    create: function(cell_model) {
                        return that.create_static('&nbsp;');
                    }
                },
                run_state: {
                    area: 'left',
                    sort: 2000,
                    create: function(cell_model) {
                        return that.create_icon('icon-circle-blank', '#777');
                    }
                },
                cell_number: {
                    area: 'left',
                    sort: 3000,
                    display_flags: ['cell-numbers'],
                    create: function(cell_model) {
                        return that.create_static(cell_model.id(), function(x) {
                            return $("<span class='left-indicator cell-number'></span>").append('cell ', x);
                        }, function(static_content) {
                        });
                    }
                }
            });
            return this;
        },
        add: function(commands) {
            if(extension_)
                extension_.add(commands);
            return this;
        },
        remove: function(command_name) {
            if(extension_)
                extension_.remove(command_name);
            return this;
        },
        decorate: function(area, div, cell_model, cell_view) {
            var result = create_command_set(area, div, cell_model, cell_view);
            switch(area) {
            case 'above_between':
                _.extend(result, {
                    betweenness: function(between) {
                        extension_.entries('above_between').forEach(function(cmd) {
                            if(cmd.area === 'between') {
                                if(between)
                                    result.controls[cmd.key].control.show();
                                else
                                    result.controls[cmd.key].control.hide();
                            }
                        });
                    }
                });
                break;
            default:
            }
            return result;
        }
    };
    return result;
})();

RCloud.UI.column = function(sel_column) {
    var colwidth_;
    function classes(cw) {
        return "col-md-" + cw + " col-sm-" + cw;
    }
    var result = {
        init: function() {
            var $sel = $(sel_column);
            if($sel.length === 0)
                return; // e.g. view mode
            // find current column width from classes
            var classes = $sel.attr('class').split(/\s+/);
            classes.forEach(function(c) {
                var cw = /^col-(?:md|sm)-(\d+)$/.exec(c);
                if(cw) {
                    cw = +cw[1];
                    if(colwidth_ === undefined)
                        colwidth_ = cw;
                    else if(colwidth_ !== cw)
                        throw new Error("mismatched col-md- or col-sm- in column classes");
                }
            });
        },
        colwidth: function(val) {
            if(!_.isUndefined(val) && val != colwidth_) {
                $(sel_column).removeClass(classes(colwidth_)).addClass(classes(val));
                colwidth_ = val;
            }
            return colwidth_;
        }
    };
    return result;
};

RCloud.UI.collapsible_column = function(sel_column, sel_accordion, sel_collapser) {
    var collapsed_ = false;
    var result = RCloud.UI.column(sel_column);
    var parent_init = result.init.bind(result);
    var parent_colwidth = result.colwidth.bind(result);
    function collapsibles() {
        return $(sel_accordion + " > .panel > div.panel-collapse:not(.out)");
    }
    function togglers() {
        return $(sel_accordion + " > .panel > div.panel-heading");
    }
    function set_collapse(target, collapse, persist) {
        if(target.data("would-collapse") == collapse)
            return false;
        target.data("would-collapse", collapse);
        if(persist && rcloud.config && target.length) {
            var opt = 'ui/' + target[0].id;
            rcloud.config.set_user_option(opt, collapse);
        }
        return true;
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
    function reshadow() {
        $(sel_accordion + " .panel-shadow").each(function(v) {
            var h = $(this).parent().find('.panel-body').outerHeight();
            if (h === 0)
                h = "100%";
            $(this).attr("height", h);
        });
    }
    _.extend(result, {
        init: function() {
            var that = this;
            parent_init();
            collapsibles().each(function() {
                $(this).data("would-collapse", !$(this).hasClass('in') && !$(this).hasClass('out'));
            });
            togglers().click(function() {
                var target = $(this.dataset.target);
                that.collapse(target, target.hasClass('in'));
                return false;
            });
            collapsibles().on("size-changed", function() {
                that.resize(true);
            });
            $(sel_collapser).click(function() {
                if (collapsed_)
                    that.show(true);
                else
                    that.hide(true);
            });
        },
        load_options: function() {
            var that = this;
            var sels = $.makeArray(collapsibles()).map(function(el) { return '#' + el.id; });
            sels.push(sel_accordion);
            var opts = sels.map(sel_to_opt);
            return rcloud.config.get_user_option(opts)
                .then(function(settings) {
                    var hide_column;
                    for(var k in settings) {
                        var id = opt_to_sel(k);
                        if(id === sel_accordion)
                            hide_column = settings[k];
                        else if(typeof settings[k] === "boolean")
                            set_collapse($(id), settings[k], false);
                    }
                    // do the column last because it will affect all its children
                    var save_setting = false;  // make sure we have a setting
                    if(hide_column === undefined) {
                        hide_column = false;
                        save_setting = true;
                    }
                    if(hide_column)
                        that.hide(save_setting);
                    else
                        that.show(save_setting);
                });
        },
        colwidth: function(val) {
            val = parent_colwidth(val);
            collapsibles().trigger('panel-resize');
            return val;
        },
        collapse: function(target, whether, persist) {
            if(persist === undefined)
                persist = true;
            if(collapsed_) {
                collapsibles().each(function() {
                    if(this===target[0])
                        set_collapse($(this), false, persist);
                    else
                        set_collapse($(this), true, persist);
                });
                this.show(true);
                return;
            }
            var change = set_collapse(target, whether, persist);
            if(all_collapsed())
                this.hide(persist, !change);
            else
                this.show(persist, !change);
        },
        resize: function(skip_calc) {
            if(!skip_calc) {
                var cw = this.calcwidth();
                this.colwidth(cw);
            }
            RCloud.UI.middle_column.update();
            var heights = {}, padding = {}, cbles = collapsibles(), ncollapse = cbles.length;
            var greedy_one = null;
            cbles.each(function() {
                if(!$(this).hasClass("out") && !$(this).data("would-collapse")) {
                    var spf = $(this).data("panel-sizer");
                    var sp = spf ? spf(this) : RCloud.UI.collapsible_column.default_sizer(this);
                    heights[this.id] = sp.height;
                    padding[this.id] = sp.padding;
                    // remember the first greedy panel
                    if(!greedy_one && $(this).attr("data-widgetheight")==="greedy")
                        greedy_one = $(this);
                }
            });
            var available = $(sel_column).height();
            var total_headings = d3.sum($(sel_accordion + " .panel-heading")
                                        .map(function(_, ph) { return $(ph).outerHeight(); }));
            available -= total_headings;
            for(var id in padding)
                available -= padding[id];
            var left = available, do_fit = false;
            for(id in heights)
                left -= heights[id];
            if(left>=0) {
                // they all fit, now just give the rest to greedy one (if any)
                if(greedy_one !== null) {
                    heights[greedy_one.get(0).id] += left;
                    do_fit = true;
                }
            }
            else {
                // they didn't fit
                left = available;
                var remaining = _.keys(heights),
                    done = false, i;
                var split = left/remaining.length;

                // see which need less than an even split and be done with those
                while(remaining.length && !done) {
                    done = true;
                    for(i = 0; i < remaining.length; ++i)
                        if(heights[remaining[i]] < split) {
                            left -= heights[remaining[i]];
                            remaining.splice(i,1);
                            --i;
                            done = false;
                        }
                    split = left/remaining.length;
                }
                // split the rest among the remainders
                for(i = 0; i < remaining.length; ++i)
                    heights[remaining[i]] = split;
                do_fit = true;
            }
            for(id in heights) {
                $('#' + id).find(".panel-body").height(heights[id]);
                $('#' + id).trigger('panel-resize');
            }
            reshadow();
            var expected = $(sel_column).height();
            var got = d3.sum(_.values(padding)) + d3.sum(_.values(heights)) + total_headings;
            if(do_fit && expected != got)
                console.log("Error in vertical layout algo: filling " + expected + " pixels with " + got);
        },
        hide: function(persist, skip_calc) {
            collapsibles().each(function() {
                var heading_sel = $(this).data('heading-content-selector');
                if(heading_sel) {
                    heading_sel.hide();
                }
            });
            // all collapsible sub-panels that are not "out" and not already collapsed, collapse them
            $(sel_accordion + " > .panel > div.panel-collapse:not(.collapse):not(.out)").collapse('hide');
            $(sel_collapser + " i").removeClass("icon-minus").addClass("icon-plus");
            collapsed_ = true;
            this.resize(skip_calc);
            if(persist && rcloud.config)
                rcloud.config.set_user_option(sel_to_opt(sel_accordion), true);
        },
        show: function(persist, skip_calc) {
            collapsibles().each(function() {
                var heading_sel = $(this).data('heading-content-selector');
                if(heading_sel)
                    heading_sel.show();
            });
            if(all_collapsed())
                set_collapse($(collapsibles()[0]), false, true);
            collapsibles().each(function() {
                $(this).collapse($(this).data("would-collapse") ? "hide" : "show");
            });
            $(sel_collapser + " i").removeClass("icon-plus").addClass("icon-minus");
            collapsed_ = false;
            this.resize(skip_calc);
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


RCloud.UI.collapsible_column.default_padder = function(el) {
    var el$ = $(el),
        body$ = el$.find('.panel-body'),
        padding = el$.outerHeight() - el$.height() +
            body$.outerHeight() - body$.height();
    return padding;
};

RCloud.UI.collapsible_column.default_sizer = function(el) {
    var el$ = $(el),
        $izer = el$.find(".widget-vsize"),
        height = $izer.height(),
        padding = RCloud.UI.collapsible_column.default_padder(el);
    return {height: height, padding: padding};
};

//////////////////////////////////////////////////////////////////////////
// resize left and right panels by dragging on the divider

RCloud.UI.column_sizer = {
    init: function() {
        $('.notebook-sizer').draggable({
            axis: 'x',
            opacity: 0.75,
            zindex: 10000,
            revert: true,
            revertDuration: 0,
            grid: [window.innerWidth/12, 0],
            stop: function(event, ui) {
                var wid_over_12 = window.innerWidth/12;
                // position is relative to parent, the notebook
                var diff, size;
                if($(this).hasClass('left')) {
                    diff = Math.round(ui.position.left/wid_over_12);
                    size = Math.max(1,
                                    Math.min(+RCloud.UI.left_panel.colwidth() + diff,
                                             11 - RCloud.UI.right_panel.colwidth()));
                    if(size===1)
                        RCloud.UI.left_panel.hide(true, true);
                    else
                        RCloud.UI.left_panel.show(true, true);
                    RCloud.UI.left_panel.colwidth(size);
                    RCloud.UI.middle_column.update();
                }
                else if($(this).hasClass('right')) {
                    diff = Math.round(ui.position.left/wid_over_12) - RCloud.UI.middle_column.colwidth();
                    size = Math.max(1,
                                    Math.min(+RCloud.UI.right_panel.colwidth() - diff,
                                             11 - RCloud.UI.left_panel.colwidth()));
                    if(size===1)
                        RCloud.UI.right_panel.hide(true, true);
                    else
                        RCloud.UI.right_panel.show(true, true);
                    RCloud.UI.right_panel.colwidth(size);
                    RCloud.UI.middle_column.update();
                }
                else throw new Error('unexpected shadow drag with classes ' + $(this).attr('class'));
                // revert to absolute position
                $(this).css({left: "", right: "", top: ""});
            }
        });

        // make grid responsive to window resize
        $(window).resize(function() {
            var wid_over_12 = window.innerWidth/12;
            $('.notebook-sizer').draggable('option', 'grid', [wid_over_12, 0]);
        });
    }
};


RCloud.UI.command_prompt = (function() {
    var show_prompt_ = false, // start hidden so it won't flash if user has it turned off
        readonly_ = true,
        history_ = null,
        entry_ = null,
        language_ = null,
        command_bar_ = null;

    function setup_command_entry() {
        var prompt_div = $("#command-prompt");
        if (!prompt_div.length)
            return null;
        function set_ace_height() {
            var EXTRA_HEIGHT = 6;
            prompt_div.css({'height': (ui_utils.ace_editor_height(widget, 5) + EXTRA_HEIGHT) + "px"});
            widget.resize();
            shell.scroll_to_end(0);
        }
        prompt_div.css({'background-color': "#fff"});
        prompt_div.addClass("r-language-pseudo");
        ace.require("ace/ext/language_tools");
        var widget = ace.edit(prompt_div[0]);
        set_ace_height();
        var RMode = ace.require("ace/mode/r").Mode;
        var session = widget.getSession();
        var doc = session.doc;
        widget.setOptions({
            enableBasicAutocompletion: true
        });
        session.on('change', set_ace_height);

        widget.setTheme("ace/theme/chrome");
        session.setUseWrapMode(true);
        widget.resize();
        var change_prompt = ui_utils.ignore_programmatic_changes(widget, history_.change.bind(history_));
        function execute(widget, args, request) {
            var code = session.getValue();
            if(code.length) {
                RCloud.UI.command_prompt.history().add_entry(code);
                shell.new_cell(code, language_)
                    .spread(function(_, controller) {
                        controller.enqueue_execution_snapshot();
                        shell.scroll_to_end();
                    });
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
            var prop = history_.init();
            change_prompt(prop.cmd);
            result.language(prop.lang);
            var r = last_row(widget);
            ui_utils.ace_set_pos(widget, r, last_col(widget, r));
        }

        function set_language(language) {
            var LangMode = ace.require(RCloud.language.ace_mode(language)).Mode;
            session.setMode(new LangMode(false, session.doc, session));
        }

        ui_utils.install_common_ace_key_bindings(widget, result.language.bind(result));

        var up_handler = widget.commands.commandKeyBinding[0].up,
            down_handler = widget.commands.commandKeyBinding[0].down;
        widget.commands.addCommands([
            {
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
                    win: 'Alt-Return',
                    mac: 'Alt-Return',
                    sender: 'editor'
                },
                exec: execute
            }, {
                name: 'up-with-history',
                bindKey: 'up',
                exec: function(widget, args, request) {
                    var pos = widget.getCursorPositionScreen();
                    if(pos.row > 0)
                        up_handler.exec(widget, args, request);
                    else {
                        if(history_.has_last()) {
                            change_prompt(history_.last());
                            var r = widget.getSession().getScreenLength();
                            ui_utils.ace_set_pos(widget, r, pos.column);
                        }
                        else
                            ui_utils.ace_set_pos(widget, 0, 0);
                    }
                }
            }, {
                name: 'down-with-history',
                bindKey: 'down',
                exec: function(widget, args, request) {
                    var pos = widget.getCursorPositionScreen();
                    var r = widget.getSession().getScreenLength();
                    if(pos.row < r-1)
                        down_handler.exec(widget, args, request);
                    else {
                        if(history_.has_next()) {
                            change_prompt(history_.next());
                            ui_utils.ace_set_pos(widget, 0, pos.column);
                        }
                        else {
                            r = last_row(widget);
                            ui_utils.ace_set_pos(widget, r, last_col(widget, r));
                        }
                    }
                }
            }
        ]);
        widget.commands.removeCommands(['find', 'replace']);
        ui_utils.customize_ace_gutter(widget, function(i) {
            return i===0 ? '&gt;' : '+';
        });

        return {
            widget: widget,
            restore: restore_prompt,
            set_language: set_language
        };
    }

    function setup_prompt_history() {
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
                var last_lang = window.localStorage["last_cell_lang"] || "R";
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
                return {"cmd":curr_cmd(),"lang":last_lang};
            },
            add_entry: function(cmd) {
                if(cmd==="") return;
                alt_[entries_.length] = null;
                entries_.push(cmd);
                alt_[curr_] = null;
                curr_ = entries_.length;
                window.localStorage[prefix_+(curr_-1)] = cmd;
            },
            has_last: function() {
                return curr_>0;
            },
            last: function() {
                if(curr_>0) --curr_;
                return curr_cmd();
            },
            has_next: function() {
                return curr_<entries_.length;
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
    }

    function show_or_hide() {
        var prompt_area = $('#prompt-area'),
            prompt = $('#command-prompt'),
            controls = $('#prompt-area .cell-status .cell-control-bar');
        if(readonly_)
            prompt_area.hide();
        else {
            prompt_area.show();
            if(show_prompt_) {
                prompt.show();
                controls.removeClass('flipped');
            }
            else {
                prompt.hide();
                controls.addClass('flipped');
            }
        }
    }

    var result = {
        init: function() {
            var that = this;

            RCloud.UI.cell_commands.add({
                insert_prompt: {
                    area: 'prompt',
                    modifying: true,
                    sort: 1000,
                    create: function() {
                        return RCloud.UI.cell_commands.create_button('icon-plus', 'insert new cell', function() {
                            shell.new_cell("", language_)
                                .spread(function(_, controller) {
                                    controller.edit_source(true);
                                });
                        });
                    }
                },
                language_prompt: {
                    area: 'prompt',
                    modifying: true,
                    sort: 2000,
                    create: function() {
                        return RCloud.UI.cell_commands.create_select(RCloud.language.available_languages(), function(language) {
                            window.localStorage["last_cell_lang"] = language;
                            RCloud.UI.command_prompt.language(language, true);
                        });
                    }
                }
            });
            var prompt_div = $(RCloud.UI.panel_loader.load_snippet('command-prompt-snippet'));
            $('#rcloud-cellarea').append(prompt_div);
            var prompt_command_bar = $('#prompt-area .cell-control-bar');
            command_bar_ = RCloud.UI.cell_commands.decorate('prompt', prompt_command_bar);
            history_ = setup_prompt_history();
            entry_ = setup_command_entry();
        },
        history: function() {
            return history_;
        },
        show_prompt: function(val) {
            if(!arguments.length)
                return show_prompt_;
            show_prompt_ = val;
            show_or_hide();
            return this;
        },
        readonly: function(val) {
            if(!arguments.length)
                return readonly_;
            readonly_ = val;
            show_or_hide();
            return this;
        },
        language: function(val, skip_ui) {
            if(val === undefined)
                return language_;
            language_ = val;
            if(!skip_ui)
                command_bar_.controls['language_prompt'].set(language_);
            entry_.set_language(language_);
            return this;
        },
        focus: function() {
            // surely not the right way to do this
            if (!entry_)
                return;
            entry_.widget.focus();
            entry_.restore();
        }
    };
    return result;
})();

RCloud.UI.comments_frame = (function() {
    var is_foreign_ = false;
    function rebuild_comments(comments) {
        try {
            comments = JSON.parse(comments);
        } catch (e) {
            RCloud.UI.session_pane.post_error("populate comments: " + e.message);
            return;
        }
        var username = rcloud.username();
        var editable = function(d) {
            return d.user.login === username && !is_foreign_;
        };
        d3.select("#comment-count").text(String(comments.length));
        // no update logic, clearing/rebuilding is easier
        d3.select("#comments-container").selectAll("div").remove();
        var comment_div = d3.select("#comments-container")
                .selectAll("div")
                .data(comments)
                .enter()
                .append("div")
                .attr("class", "comment-container")
                .on("mouseover",function(d){
                    if(editable(d)) {
                        $('.comment-header-close', this).show();
                    }
                })
                .on("mouseout",function(d){
                    $('.comment-header-close', this).hide();
                })
                .attr("comment_id",function(d) { return d.id; });
        comment_div
            .append("div")
            .attr("class", "comment-header")
            .style({"max-width":"30%"})
            .text(function(d) { return d.user.login; });

        comment_div
            .append("div")
            .attr("class", "comment-body")
            .style({"max-width":"70%"})
            .append("div")
            .attr("class", "comment-body-wrapper")
            .append("div")
            .attr("class", "comment-body-text")
            .text(function(d) { return d.body; })
            .each(function(d){
                var comment_element = $(this);
                var edit_comment = function(v){
                    var comment_text = comment_element.html();
                    result.modify_comment(d.id, comment_text);
                };
                var editable_opts = {
                    change: edit_comment,
                    allow_multiline: true,
                    validate: function(name) { return !Notebook.empty_for_github(name); }
                };
                ui_utils.editable(comment_element, $.extend({allow_edit: editable(d),inactive_text: comment_element.text(),active_text: comment_element.text()},editable_opts));
            });
        var text_div = d3.selectAll(".comment-body-wrapper",this);
        text_div
            .append("i")
            .attr("class", "icon-remove comment-header-close")
            .style({"max-width":"5%"})
            .on("click", function (d, e) {
                if(editable(d))
                    result.delete_comment(d.id);
            });
        $('#collapse-comments').trigger('size-changed');
        ui_utils.on_next_tick(function() {
            ui_utils.scroll_to_after($("#comments-qux"));
        });
    }
    var result = {
        body: function() {
            return RCloud.UI.panel_loader.load_snippet('comments-snippet');
        },
        init: function() {
            var that = this;
            var comment = $("#comment-entry-body");
            var count = 0;
            var scroll_height = "";
            $("#comment-submit").click(function() {
                if(!Notebook.empty_for_github(comment.val())) {
                    that.post_comment(_.escape(comment.val()));
                    comment.height("41px");
                }
                return false;
            });

            comment.keydown(function (e) {
                if (e.keyCode == $.ui.keyCode.ENTER && (e.ctrlKey || e.metaKey)) {
                    if(!Notebook.empty_for_github(comment.val())) {
                        that.post_comment(_.escape(comment.val()));
                        comment.height("41px");
                        count = 0;
                        scroll_height = "";
                    }
                    return false;
                }
                comment.bind('input', function() {
                    if(count > 1 && scroll_height != comment[0].scrollHeight) {
                        comment.height((comment[0].scrollHeight)  + 'px');
                    }
                    count = count + 1;
                    scroll_height = comment[0].scrollHeight;
                    $("#comments-qux").animate({ scrollTop: $(document).height() }, "slow");
                    return false;
                });
                return undefined;
            });
        },
        set_foreign: function(is_foreign) {
            if(is_foreign) {
                $('#comment-entry').hide();
                $('#comments-not-allowed').show();
            } else {
                $('#comment-entry').show();
                $('#comments-not-allowed').hide();
            }
            is_foreign_ = is_foreign;
        },
        display_comments: function() {
            return rcloud.get_all_comments(shell.gistname())
                .then(function(comments) {
                    rebuild_comments(comments);
                });
        },
        post_comment: function(comment) {
            comment = JSON.stringify({"body":comment});
            return rcloud.post_comment(shell.gistname(), comment)
                .then(this.display_comments.bind(this))
                .then(function() {
                    $('#comment-entry-body').val('');
                });
        },
        modify_comment: function (cid,comment) {
            var that = this;
            comment = JSON.stringify({
                "body": comment
            });
            return rcloud.modify_comment(shell.gistname(), cid, comment)
                .then(this.display_comments.bind(this));
        },
        delete_comment: function (cid) {
            return rcloud.delete_comment(shell.gistname(), cid)
                .then(this.display_comments.bind(this));
        }
    };
    return result;
})();


/*
 * Adjusts the UI depending on whether notebook is read-only
 */
RCloud.UI.configure_readonly = function() {
    var readonly_notebook = $("#readonly-notebook");
    var revertb = RCloud.UI.navbar.control('revert_notebook'),
        saveb = RCloud.UI.navbar.control('save_notebook');
    if(shell.notebook.controller.is_mine()) {
        if(shell.notebook.model.read_only()) {
            revertb && revertb.show();
            saveb && saveb.hide();
        }
        else {
            revertb && revertb.hide();
            saveb && saveb.show();
        }
    }
    else {
        revertb && revertb.hide();
        saveb && saveb.hide();
    }
    if(shell.notebook.model.read_only()) {
        RCloud.UI.command_prompt.readonly(true);
        RCloud.UI.selection_bar.hide();
        readonly_notebook.show();
        $('#output').sortable('disable');
        $('#upload-to-notebook')
            .prop('checked', false)
            .attr("disabled", true);
        RCloud.UI.scratchpad.set_readonly(true);
    }
    else {
        RCloud.UI.command_prompt.readonly(false);
        RCloud.UI.selection_bar.show();
        readonly_notebook.hide();
        $('#output').sortable('enable');
        $('#upload-to-notebook')
            .prop('checked', false)
            .removeAttr("disabled");
        RCloud.UI.scratchpad.set_readonly(false);
    }
};

(function() {

var fatal_dialog_;
var message_;

RCloud.UI.fatal_dialog = function(message, label, href_or_function) { // no href -> just close
    $('#loading-animation').hide();
    if (_.isUndefined(fatal_dialog_)) {
        var default_button = $("<button type='submit' class='btn btn-primary' style='float:right'>" + label + "</span>"),
            ignore_button = $("<span class='btn' style='float:right'>Ignore</span>"),
            body = $('<div />')
                .append('<h1>Aw, shucks</h1>');
        message_ = $('<p style="white-space: pre-wrap">' + message + '</p>');
        body.append(message_, default_button);
        if(href_or_function)
            body.append(ignore_button);
        body.append('<div style="clear: both;"></div>');
        default_button.click(function(e) {
            e.preventDefault();
            if(_.isString(href_or_function))
                window.location = href_or_function;
            else if(_.isFunction(href_or_function)) {
                fatal_dialog_.modal("hide");
                href_or_function();
            }
            else
                fatal_dialog_.modal("hide");
        });
        ignore_button.click(function() {
            fatal_dialog_.modal("hide");
        });
        fatal_dialog_ = $('<div id="fatal-dialog" class="modal fade" />')
            .append($('<div class="modal-dialog" />')
                    .append($('<div class="modal-content" />')
                            .append($('<div class="modal-body" />')
                                    .append(body))));
        $("body").append(fatal_dialog_);
        fatal_dialog_.on("shown.bs.modal", function() {
            default_button.focus();
        });
    }
    else message_.text(message);
    fatal_dialog_.modal({keyboard: false});
};

})();

RCloud.UI.find_replace = (function() {
    var find_dialog_ = null, regex_,
        find_desc_, find_input_, replace_desc_, replace_input_, replace_stuff_,
        find_next_, find_last_, replace_next_, replace_all_,
        shown_ = false, replace_mode_ = false,
        find_cycle_ = null, replace_cycle_ = null,
        matches_ = [], active_match_;
    function toggle_find_replace(replace) {
        if(!find_dialog_) {
            find_dialog_ = $('<div id="find-dialog"></div>');
            var find_form = $('<form id="find-form"></form>');
            find_desc_ = $('<label id="find-label" for="find-input"><span>Find</span></label>');
            find_input_ = $('<input type=text id="find-input" class="form-control-ext"></input>');
            find_next_ = $('<button id="find-next" class="btn btn-primary">Next</button>');
            find_last_ = $('<button id="find-last" class="btn">Previous</button>');
            var replace_break = $('<br/>');
            replace_desc_ = $('<label id="replace-label" for="replace-input"><span>Replace</span></label>');
            replace_input_ = $('<input type=text id="replace-input" class="form-control-ext"></input>');
            replace_next_ = $('<button id="replace" class="btn">Replace</button>');
            replace_all_ = $('<button id="replace-all" class="btn">Replace All</button>');
            replace_stuff_ = replace_break.add(replace_desc_).add(replace_input_).add(replace_next_).add(replace_all_);
            var close = $('<span id="find-close"><i class="icon-remove"></i></span>');
            find_form.append(find_desc_.append(find_input_), find_next_, find_last_, close, replace_break,
                             replace_desc_.append(replace_input_), replace_next_, replace_all_);
            find_dialog_.append(find_form);
            $('#middle-column').prepend(find_dialog_);

            find_input_.on('input', function(e) {
                e.preventDefault();
                e.stopPropagation();
                active_match_ = undefined;
                build_regex(find_input_.val());
                highlight_all();
            });

            function find_next(reason) {
                active_transition(reason || 'deactivate');
                if(active_match_ !== undefined)
                    active_match_ = (active_match_ + 1) % matches_.length;
                else
                    active_match_ = 0;
                active_transition('activate');
            }
            find_next_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                find_next();
                return false;
            });

            find_last_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                active_transition('deactivate');
                if(active_match_ !== undefined)
                    active_match_ = (active_match_ + matches_.length - 1) % matches_.length;
                else
                    active_match_ = 0;
                active_transition('activate');
                return false;
            });

            replace_next_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                if(active_match_ !== undefined) {
                    var cell = replace_current();
                    if(cell) {
                        shell.notebook.controller.update_cell(cell)
                            .then(function() {
                                find_next('replace');
                            });
                    }
                }
                else
                    find_next();
                return false;
            });

            replace_all_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                if(active_match_ !== undefined) {
                    active_transition('deactivate');
                    replace_rest();
                }
                else
                    replace_all(find_input_.val(), replace_input_.val());
                return false;
            });

            find_cycle_ = ['find-input', 'find-next', 'find-last'];
            replace_cycle_ = ['find-input', 'replace-input', 'find-next', 'find-last', 'replace-all'];

            function click_find_next(e) {
                if(e.keyCode===$.ui.keyCode.ENTER) {
                    e.preventDefault();
                    e.stopPropagation();
                    find_next_.click();
                    return false;
                }
                return undefined;
            }

            find_input_.keydown(click_find_next);
            replace_input_.keydown(click_find_next);

            find_form.keydown(function(e) {
                switch(e.keyCode) {
                case $.ui.keyCode.TAB:
                    e.preventDefault();
                    e.stopPropagation();
                    var cycle = replace_mode_ ? replace_cycle_ : find_cycle_;
                    var i = cycle.indexOf(e.target.id) + cycle.length;
                    if(e.shiftKey) --i; else ++i;
                    i = i % cycle.length;
                    $('#' + cycle[i]).focus();
                    return false;
                case $.ui.keyCode.ESCAPE:
                    e.preventDefault();
                    e.stopPropagation();
                    hide_dialog();
                    return false;
                }
                return undefined;
            });

            find_form.find('input').focus(function() {
                window.setTimeout(function() {
                    this.select();
                }.bind(this), 0);
            });

            close.click(function() {
                hide_dialog();
            });
        }

        find_dialog_.show();
        find_input_.focus();
        if(replace)
            replace_stuff_.show();
        else
            replace_stuff_.hide();
        build_regex(find_input_.val());
        highlight_all();
        shown_ = true;
        replace_mode_ = replace;
    }
    function hide_dialog() {
        active_match_ = undefined;
        build_regex(null);
        highlight_all();
        find_dialog_.hide();
        shown_ = false;
    }
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    function escapeRegExp(string) {
        // regex option will skip this
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function build_regex(find) {
        regex_ = find && find.length ? new RegExp(escapeRegExp(find), 'g') : null;
    }
    function update_match_cell(match) {
        var matches = matches_.filter(function(m) { return m.filename === match.filename; });
        shell.notebook.model.cells[match.index].notify_views(function(view) {
            view.change_highlights(matches);
        });
    }
    function active_transition(transition) {
        if(active_match_ !== undefined) {
            var match = matches_[active_match_];
            switch(transition) {
            case 'replace': match.kind = 'replaced';
                break;
            case 'activate': match.kind = match.kind === 'replaced' ? 'activereplaced' : 'active';
                break;
            case 'deactivate': match.kind = match.kind === 'activereplaced' ? 'replaced' : 'normal';
                break;
            }
            update_match_cell(match);
        }
    }
    function highlight_cell(cell) {
        var matches = [];
        if(regex_) {
            var content = cell.content(), match;
            while((match = regex_.exec(content))) {
                matches.push({
                    begin: match.index,
                    end: match.index+match[0].length,
                    kind: matches.length === active_match_ ? 'active' : 'normal'
                });
                if(match.index === regex_.lastIndex) ++regex_.lastIndex;
            }
        }
        cell.notify_views(function(view) {
            view.change_highlights(matches);
        });
        return matches;
    }
    function annotate_matches(matches, cell, n) {
        return matches.map(function(match) {
            return _.extend({index: n, filename: cell.filename()}, match);
        });
    }
    function highlight_all() {
        if(shell.is_view_mode())
            shell.notebook.controller.show_r_source();
        matches_ = [];
        shell.notebook.model.cells.forEach(function(cell, n) {
            var matches = highlight_cell(cell);
            matches_.push.apply(matches_, annotate_matches(matches, cell, n));
        });
    }
    function replace_current() {
        function findIndex(a, f, i) {
            if(i===undefined) i = 0;
            for(; i < a.length && !f(a[i]); ++i);
            return i === a.length ? -1 : i;
        }
        var match = matches_[active_match_];
        var cell = shell.notebook.model.cells[match.index];
        var content = cell.content();
        var before = content.substring(0, match.begin),
            after = content.substring(match.end);
        var replacement =  replace_input_.val();
        var dlen = replacement.length + match.begin - match.end;
        match.begin = before.length;
        match.end = before.length + replacement.length;
        for(var i = active_match_+1; i < matches_.length && matches_[i].filename === match.filename; ++i) {
            matches_[i].begin += dlen;
            matches_[i].end += dlen;
        }
        return cell.content(before + replacement + after) ? cell : null;
    }
    function replace_all(find, replace) {
        highlight_all(null);
        if(!find || !find.length)
            return;
        find = escapeRegExp(find);
        var regex = new RegExp(find, 'g');
        var changes = shell.notebook.model.reread_buffers();
        shell.notebook.model.cells.forEach(function(cell) {
            var content = cell.content(),
                new_content = content.replace(regex, replace);
            if(cell.content(new_content))
                changes.push.apply(changes, shell.notebook.model.update_cell(cell));
        });
        shell.notebook.controller.apply_changes(changes);
    }
    function replace_rest() {
        var changes = shell.notebook.model.reread_buffers();
        while(active_match_ < matches_.length) {
            var cell = replace_current();
            active_transition('replace');
            if(cell)
                changes.push.apply(changes, shell.notebook.model.update_cell(cell));
            ++active_match_;
        }
        active_match_ = undefined;
        shell.notebook.controller.apply_changes(changes);
    }
    var result = {
        init: function() {
            document.addEventListener("keydown", function(e) {
                var action;
                if (ui_utils.is_a_mac() && e.keyCode == 70 && e.metaKey) { // cmd-F / cmd-opt-F
                    if(e.shiftKey)
                        return; // don't capture Full Screen
                    action = e.altKey ? 'replace' : 'find';
                }
                else if(!ui_utils.is_a_mac() && e.keyCode == 70 && e.ctrlKey) // ctrl-F
                    action = 'find';
                else if(!ui_utils.is_a_mac() && e.keyCode == 72 && e.ctrlKey) // ctrl-H
                    action = 'replace';
                if(action) {
                    // do not allow replace in view mode or read-only
                    if(shell.notebook.model.read_only())
                        action = 'find';
                    e.preventDefault();
                    toggle_find_replace(action === 'replace');
                }
            });
        }
    };
    return result;
})();

RCloud.UI.shortcut_manager = (function() {

    var extension_, 
        shortcuts_changed = false;

    function convert_extension(shortcuts) {
        var shortcuts_to_add, obj = {};
        var existing_shortcuts = extension_.sections.all.entries;

        if(!_.isArray(shortcuts)) {
            shortcuts_to_add = [shortcuts];
        } else {
            shortcuts_to_add = shortcuts;
        }

        _.each(shortcuts_to_add, function(shortcut) {

            var can_add = true;

            var shortcut_to_add = _.defaults(shortcut, {
                category: 'General'
            });

            // if this is not a mac, filter out the 'command' options:
            if(!ui_utils.is_a_mac()) {
                shortcut.keys = _.reject(shortcut.keys, function(keys) {
                    return _.contains(keys, 'command');
                });
            } else {
                // this is a mac; if this shortcut has a command AND a ctrl, remove the ctrl
                if(_.contains(shortcut.keys, 'command') && _.contains(shortcut.keys, 'ctrl')) {
                    shortcut.keys = _.reject(shortcut.keys, function(keys) {
                        return _.contains(keys, 'ctrl');
                    });
                }
            }

            // if this is a shortcut that needs to be added:
            if(!_.isUndefined(shortcut.keys) && shortcut.keys.length) {

                shortcut_to_add.key_bindings = [];

                // construct the key bindings:
                for (var i = 0; i < shortcut.keys.length; i++) {
                    
                    // ensure consistent order across definitions:
                    var keys = _
                        .chain(shortcut.keys[i])
                        .map(function(element) { return element.toLowerCase(); })
                        .sortBy(function(element){  
                          var rank = {
                              "command": 1,
                              "ctrl": 2,
                              "shift": 3
                          };
                          return rank[element];
                      }).value();

                    // so that they can be compared:
                    shortcut_to_add.key_bindings.push(keys.join('+'));
                }

                // with existing shortcuts:
                for(var loop = 0; loop < existing_shortcuts.length; loop++) {
                    if(_.intersection(existing_shortcuts[loop].key_bindings, shortcut_to_add.key_bindings).length > 0) {
                        console.warn('Keyboard shortcut "' + shortcut_to_add.description + '" cannot be registered because its keycode clashes with an existing shortcut.');
                        can_add = false;
                        break;
                    }
                }

                if(can_add) {

                    // update any 'command' entries to the '⌘' key:
                    /*
                    _.each(shortcut_to_add.keys, function(keys){
                        for(var keyLoop = 0; keyLoop < keys.length; keyLoop++) {
                            if(keys[keyLoop] === 'command') {
                                keys[keyLoop] = '&#8984;';
                            }
                        }
                    });*/

                    if(_.isUndefined(shortcut.action)){
                        shortcut_to_add.create = function() {};
                    }
                    else {
                        shortcut_to_add.create = function() { 
                            _.each(shortcut_to_add.key_bindings, function(binding) {
                                window.Mousetrap(document.querySelector('body')).bind(binding, function(e) { 
                                    e.preventDefault(); 
                                    shortcut.action();
                                });
                            });
                        }
                    }
                }

                if(can_add) {
                    obj[shortcut.id] = shortcut_to_add;

                    // add to the existing shortcuts so that it can be compared:
                    existing_shortcuts.push(shortcut_to_add);
                }
            }
        });

        return obj;
    }

    var result = {
        init: function() {

            // based on https://craig.is/killing/mice#api.stopCallback
            window.Mousetrap.prototype.stopCallback = function(e, element, combo) {

                // if the element has the class "mousetrap" then no need to stop
                if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
                    return false;
                }

                return (element.tagName == 'INPUT' && element.type !== 'checkbox') || 
                       element.tagName == 'SELECT' || 
                       element.tagName == 'TEXTAREA' || 
                       (element.contentEditable && element.contentEditable == 'true');
            };

            extension_ = RCloud.extension.create({

            });

            this.add([]);

            return this;
        },
        add: function(s) {
            if(extension_) {
                extension_.add(convert_extension(s));
                shortcuts_changed = true;
            }

            return this;
        },
        load: function() {
            if(extension_) {
                extension_.create('all');
            }
        },
        shortcuts_changed: function() {
            return shortcuts_changed;
        },
        get_registered_shortcuts_by_category: function(sort_items) {
            shortcuts_changed = false;

            console.log();

            var rank = _.map(sort_items, (function(item, index) { return { key: item, value: index + 1 }}));
            rank = _.object(_.pluck(rank, 'key'), _.pluck(rank, 'value'));   
  
            return _.sortBy(_.map(_.chain(extension_.sections.all.entries).groupBy('category').value(), function(item, key) {
                return { category: key, shortcuts: item }
            }), function(group) {
                return rank[group.category];
            });
        }
    };

    return result;
})();
RCloud.UI.shortcut_dialog = (function() {

    var content_, shortcuts_by_category_ = [], shortcut_dialog_;

    var result = {

        show: function() {
           
            $('#loading-animation').hide();

            if(!shortcut_dialog_) {              
                shortcut_dialog_ = $('<div id="shortcut-dialog" class="modal fade" />')
                    .append($('<div class="modal-dialog" />')
                            .append($('<div class="modal-content" style="background-color: rgba(255, 255, 255, 1.0)" />')
                                    .append($('<div class="modal-header" style="padding-left:20px!important;padding-right:20px!important" />')
                                        .append($('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'))
                                        .append($('<h4 class="modal-title" style="font-size: 20px">Keyboard shortcuts</h4>')))
                                    .append($('<div class="modal-body" style="padding-top: 0; max-height:calc(100vh - 120px); overflow-y: auto;" />'))
                                    /*.append($('<div class="modal-footer" />')
                                        .append($('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>')))*/));
                                       
                $("body").append(shortcut_dialog_);
            } 

            if(!content_ || RCloud.UI.shortcut_manager.shortcuts_changed()) {
                shortcuts_by_category_ = RCloud.UI.shortcut_manager.get_registered_shortcuts_by_category([
                    'General',
                    'Notebook Management',
                    'Cell Management']);

                content_ = '';

                _.each(shortcuts_by_category_, function(group) {

                    content_ += '<div class="category">';
                    content_ += '<h3>' + group.category + '</h3>';
                    content_ += '<table>';

                    _.each(group.shortcuts, function(shortcut) {

                        var keys_markup = []; 
                        _.each(shortcut.keys, function(keys) {
                            keys_markup.push('<kbd>' + keys.join(' ') + '</kbd>');
                        });

                        content_ += '<tr>';
                        content_ += '<td>';
                        content_ += keys_markup.join(' / ');
                        content_ += '</td>';
                        content_ += '<td>';
                        content_ += shortcut.description;
                        content_ += '</td>';
                        content_ += '</tr>';
                    });

                    content_ += '</table>';
                    content_ += '</div>';
                });

                $('#shortcut-dialog .modal-body').html(content_);
            }
            
            shortcut_dialog_.modal({ 
                keyboard: false 
            });
        }
    };

    return result;

})();
RCloud.UI.help_frame = {
    body: function() {
        return RCloud.UI.panel_loader.load_snippet('help-snippet');
    },
    init: function() {
        // i can't be bothered to figure out why the iframe causes onload to be triggered early
        // if this code is directly in edit.html
        $("#help-body").append('<iframe id="help-frame" frameborder="0" />');
        $('#help-form').submit(function(e) {
            e.preventDefault();
            e.stopPropagation();
            var topic = $('#input-text-help').val();
            $('#input-text-help').blur();
            rcloud.help(topic);
            return false;
        });
    },
    panel_sizer: function(el) {
        if($('#help-body').css('display') === 'none')
            return RCloud.UI.collapsible_column.default_sizer(el);
        else return {
            padding: RCloud.UI.collapsible_column.default_padder(el),
            height: 9000
        };
    },
    show: function() {
        $("#help-body").css('display', 'table-row');
        $("#help-body").attr('data-widgetheight', "greedy");
        $("#collapse-help").trigger('size-changed');
        RCloud.UI.left_panel.collapse($("#collapse-help"), false);
        ui_utils.prevent_backspace($("#help-frame").contents());
    },
    display_content: function(content) {
        $("#help-frame").contents().find('body').html(content);
        this.show();
    },
    display_href: function(href) {
        $("#help-frame").attr("src", href);
        this.show();
    }
};

(function() {

// from https://github.com/ebidel/filer.js/blob/master/src/filer.js
/**
 * Creates and returns a blob from a data URL (either base64 encoded or not).
 *
 * @param {string} dataURL The data URL to convert.
 * @return {Blob} A blob representing the array buffer data.
 */
function dataURLToBlob(dataURL) {
    var BASE64_MARKER = ';base64,';
    var parts, contentType, raw;
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        parts = dataURL.split(',');
        contentType = parts[0].split(':')[1];
        raw = decodeURIComponent(parts[1]);

        return new Blob([raw], {type: contentType});
    }

    parts = dataURL.split(BASE64_MARKER);
    contentType = parts[0].split(':')[1];
    raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
}

RCloud.UI.image_manager = (function() {
    var images_ = {};
    var formats_ = RCloud.extension.create();
    function create_image(id, url, dims, device, page) {
        var div_, img_, image_div_, scroller_div_, dims_;
        function img_tag() {
            var attrs = {
                id: id,
                src: url
            };
            return $($.el.img(attrs));
        }
        function save_as(fmt) {
            var options = {type: fmt};
            if(dims_)
                options.dim = dims_;
            rcloud.plots.render(device, page, options)
                .then(function(data) {
                    saveAs(dataURLToBlob(data.url), id + '.' + fmt);
                });
        }
        function resize_stop(event, ui) {
            var dims = [ui.size.width, ui.size.height];
            rcloud.plots.render(device, page, {dim: dims})
                .then(function(data) {
                    result.update(data.url, dims);
                })
                .catch(function(err) {
                    if(!/Error in replayPlot/.test(err.message))
                        throw err;
                });
        }
        function save_button() {
            var save_dropdown = $('<div class="dropdown"></div>');
            // i couldn't figure out how to get fa_button('icon-save', 'save image', 'btn dropdown-toggle')
            // to open a dropdown
            var save_button = $('<span class="dropdown-toggle fontawesome-button" type="button" data-toggle="dropdown" aria-expanded="true"></span>');
            save_button.append($('<i class="icon-save"></i>'));
            var save_menu = $('<ul role="menu" class="dropdown-menu plot-save-formats"></ul>');
            _.pluck(formats_.entries('all'), 'key').forEach(function(fmt) {
                var link = $('<a role="menuitem" href="#">' + fmt + '</a>');
                link.click(function() {
                    save_as(fmt);
                });
                var li = $('<li role="presentation"></li>').append(link);
                save_menu.append(li);
            });
            var opts = {
                title: 'save image',
                delay: { show: 250, hide: 0 }
            };
            opts.container = 'body';
            save_button.tooltip(opts);
            save_dropdown.append(save_button, save_menu);
            return save_dropdown;
        }

        function update_dims(dims) {
            if(dims) {
                if(dims[0])
                    image_div_.css('width', dims[0]);
                if(dims[1]) {
                    image_div_.css('height', dims[1]);
                }
                dims_ = dims;
            }
        }

        function add_controls($image) {
            var container = $('<div class="live-plot-container"></div>');
            var plot = $('<div class="live-plot"></div>');
            scroller_div_ = $('<div class="live-plot-scroller"></div>');
            image_div_ =  $('<div></div>');
            plot.append(scroller_div_);
            scroller_div_.append(image_div_, $('<br/>'));
            image_div_.append($image);
            var image_commands = $('<span class="live-plot-commands"></div>');
            image_commands.append(save_button());
            image_commands.hide();
            plot.hover(function() {
                image_commands.show();
            }, function() {
                image_commands.hide();
            });
            plot.append(image_commands);
            $image.css({width: '100%', height: '100%'});
            update_dims(dims);

            image_div_.resizable({
                autoHide: true,
                stop: resize_stop
            });
            container.append(plot);
            return container;
        }
        img_ = img_tag();
        div_ = add_controls(img_);

        var result = {
            div: function() {
                return div_;
            },
            update: function(url, dims) {
                img_.attr('src', url);
                update_dims(dims);
            },
            locate: function(k) {
                div_.attr('tabindex', 1).css('cursor', 'crosshair');
                div_.focus().keydown(function(e) {
                    if(e.keyCode === $.ui.keyCode.ESCAPE) {
                        div_.off('keydown').blur();
                        img_.off('click');
                        div_.attr('tabindex', null).removeAttr('style');
                        k(null, null);
                    }
                });
                img_.click(function(e) {
                    // sadly, there seems to be a lot of disagreement about the correct
                    // way to get image-relative coordinates. may need adjusting!
                    // http://stackoverflow.com/a/14045047/676195
                    var offset = $(this).offset();
                    var offset_t = $(this).offset().top - $(window).scrollTop();
                    var offset_l = $(this).offset().left - $(window).scrollLeft();

                    var x = Math.round( (e.clientX - offset_l) );
                    var y = Math.round( (e.clientY - offset_t) );

                    div_.off('keydown').blur();
                    img_.off('click');
                    div_.attr('tabindex', null).removeAttr('style');

                    k(null, [x, y]);
                });
            }
        };
        return result;
    }
    function image_id(device, page) {
        return device + "-" + page;
    }
    var result = {
        update: function(url, dims, device, page) {
            var image;
            var id = image_id(device, page);
            if(images_[id]) {
                image = images_[id];
                image.update(url, dims);
            }
            else {
                image = create_image(id, url, dims, device, page);
                images_[id] = image;
            }
            return image;
        },
        locate: function(device, page, k) {
            var id = image_id(device, page);
            if(images_[id]) {
                var image = images_[id];
                image.locate(k);
            } else k("ERROR: cannot find image corresponding to the locator"); // FIXME: is this the right way to return an error?
        },
        load_available_formats: function() {
            return rcloud.plots.get_formats().then(function(formats) {
                formats = _.without(formats, 'r_attributes', 'r_type');
                var i = 1000;
                var im_formats = {};
                formats.forEach(function(format) {
                    im_formats[format] = { sort: i };
                    i += 1000;
                });
                RCloud.UI.image_manager.formats.add(im_formats);
            });
        },
        formats: formats_
    };
    return result;
})();

})();

RCloud.UI.import_export = (function() {
    function download_as_file(filename, content, mimetype) {
        var file = new Blob([content], {type: mimetype});
        saveAs(file, filename); // FileSaver.js
    }

    return {
        init: function() {
            RCloud.UI.advanced_menu.add({
                import_notebooks: {
                    sort: 4000,
                    text: "Import External Notebooks",
                    modes: ['edit'],
                    action: function() {
                        function do_import() {
                            var url = $('#import-source').val(),
                                notebooks = $('#import-gists').val(),
                                prefix = $('#import-prefix').val();
                            notebooks = _.without(notebooks.split(/[\s,;]+/), "");
                            rcloud.port_notebooks(url, notebooks, prefix)
                                .then(function(result) {
                                    var succeeded = [], failed = [];
                                    for(var res in result) {
                                        if(res==='r_type' || res==='r_attributes')
                                            continue; // R metadata
                                        if(result[res].ok)
                                            succeeded.push(result[res].content);
                                        else
                                            failed.push(res);
                                    }
                                    succeeded.forEach(function(notebook) {
                                        editor.star_notebook(true, {notebook: notebook}).then(function() {
                                            editor.set_notebook_visibility(notebook.id, true);
                                        });
                                    });
                                    if(failed.length)
                                        RCloud.UI.session_pane.post_error("Failed to import notebooks: " + failed.join(', '));
                                });
                            dialog.modal('hide');
                        }
                        function create_import_notebook_dialog() {
                            var body = $('<div class="container"/>').append(
                                $(['<p>Import notebooks from another GitHub instance.</p><p>Currently import does not preserve history.</p>',
                                   '<p>source repo api url:&nbsp;<input type="text" class="form-control-ext" id="import-source" style="width:100%;" value="https://api.github.com"></input></td>',
                                   '<p>notebooks:<br /><textarea class="form-control-ext" style="height: 20%;width: 50%;max-width: 100%" rows="10" cols="30" id="import-gists" form="port"></textarea></p>',
                                   '<p>prefix (e.g. <code>folder/</code> to put notebooks in a folder):&nbsp;<input type="text" class="form-control-ext" id="import-prefix" style="width:100%;"></input>'].join('')));

                            var cancel = $('<span class="btn btn-cancel">Cancel</span>')
                                    .on('click', function() { $(dialog).modal('hide'); });
                            var go = $('<span class="btn btn-primary">Import</span>')
                                    .on('click', do_import);
                            var footer = $('<div class="modal-footer"></div>')
                                    .append(cancel).append(go);
                            var header = $(['<div class="modal-header">',
                                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
                                            '<h3>Import Notebooks</h3>',
                                            '</div>'].join(''));
                            var dialog = $('<div id="import-notebooks-dialog" class="modal fade"></div>')
                                    .append($('<div class="modal-dialog"></div>')
                                            .append($('<div class="modal-content"></div>')
                                                    .append(header).append(body).append(footer)));
                            $("body").append(dialog);

                            // clear gists list but keep the other fields, to aide repetitive operations
                            dialog
                                .on('show.bs.modal', function() {
                                    $('#import-gists').val('');
                                })
                                .on('shown.bs.modal', function() {
                                    $('#import-source').focus().select();
                                });
                            return dialog;
                        }
                        var dialog = $("#import-notebooks-dialog");
                        if(!dialog.length)
                            dialog = create_import_notebook_dialog();
                        dialog.modal({keyboard: true});
                    }
                },
                export_notebook_gist: {
                    sort: 5000,
                    text: "Export Notebook to File",
                    modes: ['edit'],
                    action: function() {
                        return rcloud.get_notebook(shell.gistname(), shell.version(), null, true).then(function(notebook) {
                            notebook = Notebook.sanitize(notebook);
                            var gisttext = JSON.stringify(notebook);
                            download_as_file(notebook.description + ".gist", gisttext, 'text/json');
                            return notebook;
                        });
                    }
                },
                import_notebook_gist: {
                    sort: 6000,
                    text: "Import Notebook from File",
                    modes: ['edit'],
                    action: function() {
                        var that = this;
                        function create_import_file_dialog() {
                            var notebook = null;
                            var notebook_status = null;
                            var notebook_desc_content = null;
                            var import_button = null;
                            function do_upload(file) {
                                notebook_status.hide();
                                notebook_desc.hide();
                                var fr = new FileReader();
                                fr.onloadend = function(e) {
                                    notebook_status.show();
                                    try {
                                        notebook = JSON.parse(fr.result);
                                    }
                                    catch(x) {
                                        notebook_status.text("Invalid notebook format: couldn't parse JSON");
                                        return;
                                    }
                                    if(!notebook.description) {
                                        notebook_status.text('Invalid notebook format: has no description');
                                        notebook = null;
                                        return;
                                    }
                                    if(!notebook.files || _.isEmpty(notebook.files)) {
                                        notebook_status.text('Invalid notebook format: has no files');
                                        notebook = null;
                                        return;
                                    }
                                    notebook_status.text('');
                                    notebook_desc_content.val(notebook.description);
                                    notebook_desc.show();
                                    notebook = Notebook.sanitize(notebook);
                                    ui_utils.enable_bs_button(import_button);
                                };
                                fr.readAsText(file);
                            }
                            function do_import() {
                                if(notebook) {
                                    notebook.description = notebook_desc_content.val();
                                    rcloud.create_notebook(notebook, false).then(function(notebook) {
                                        editor.star_notebook(true, {notebook: notebook}).then(function() {
                                            editor.set_notebook_visibility(notebook.id, true);
                                        });
                                    });
                                }
                                dialog.modal('hide');
                            }
                            var body = $('<div class="container"/>');
                            var file_select = $('<input type="file" id="notebook-file-upload" size="50"></input>');
                            file_select.click(function() { ui_utils.disable_bs_button(import_button); })
                                .change(function() { do_upload(file_select[0].files[0]); });
                            notebook_status = $('<span />');
                            notebook_status.append(notebook_status);
                            var notebook_desc = $('<span>Notebook description: </span>');
                            notebook_desc_content = $('<input type="text" class="form-control-ext" size="50"></input>')
                                .keypress(function(e) {
                                    if (e.which === $.ui.keyCode.ENTER) {
                                        do_import();
                                        return false;
                                    }
                                    return true;
                                });
                            notebook_desc.append(notebook_desc_content);
                            body.append($('<p/>').append(file_select))
                                .append($('<p/>').append(notebook_status.hide()))
                                .append($('<p/>').append(notebook_desc.hide()));
                            var cancel = $('<span class="btn btn-cancel">Cancel</span>')
                                    .on('click', function() { $(dialog).modal('hide'); });
                            import_button = $('<span class="btn btn-primary">Import</span>')
                                .on('click', do_import);
                            ui_utils.disable_bs_button(import_button);
                            var footer = $('<div class="modal-footer"></div>')
                                    .append(cancel).append(import_button);
                            var header = $(['<div class="modal-header">',
                                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>',
                                            '<h3>Import Notebook File</h3>',
                                            '</div>'].join(''));
                            var dialog = $('<div id="import-notebook-file-dialog" class="modal fade"></div>')
                                    .append($('<div class="modal-dialog"></div>')
                                            .append($('<div class="modal-content"></div>')
                                                    .append(header).append(body).append(footer)));
                            $("body").append(dialog);
                            dialog
                                .on('show.bs.modal', function() {
                                    $("#notebook-file-upload")[0].value = null;
                                    notebook_status.text('');
                                    notebook_status.hide();
                                    notebook_desc_content.val('');
                                    notebook_desc.hide();
                                });

                            // keep selected file, in case repeatedly importing is helpful
                            // but do reset Import button!
                            dialog.data("reset", function() {
                                notebook = null;
                                ui_utils.disable_bs_button(import_button);
                            });
                            return dialog;
                        }
                        var dialog = $("#import-notebook-file-dialog");
                        if(!dialog.length)
                            dialog = create_import_file_dialog();
                        else
                            dialog.data().reset();
                        dialog.modal({keyboard: true});
                    }
                },
                export_notebook_r: {
                    sort: 7000,
                    text: "Export Notebook as R Source File",
                    modes: ['edit'],
                    action: function() {
                        return rcloud.get_notebook(shell.gistname(), shell.version()).then(function(notebook) {
                            var strings = [];
                            var parts = [];
                            _.each(notebook.files, function(file) {
                                var filename = file.filename;
                                if(/^part/.test(filename)) {
                                    var number = parseInt(filename.slice(4).split('.')[0]);
                                    if(!isNaN(number)) {
                                        if (file.language === 'R')
                                            parts[number] = "```{r}\n" + file.content + "\n```";
                                        else
                                            parts[number] = file.content;
                                    }
                                }
                            });
                            for (var i=0; i<parts.length; ++i)
                                if (!_.isUndefined(parts[i]))
                                    strings.push(parts[i]);
                            strings.push("");
                            rcloud.purl_source(strings.join("\n")).then(function(purled_lines) {
                                // rserve.js length-1 array special case making our lives difficult again
                                var purled_source = _.isString(purled_lines) ? purled_lines :
                                        purled_lines.join("\n");
                                download_as_file(notebook.description + ".R", purled_source, 'text/plain');
                            });
                        });
                    }
                }
            });
            return this;
        }
    };
})();

RCloud.UI.init = function() {

    RCloud.UI.run_button.init();

    //////////////////////////////////////////////////////////////////////////
    // allow reordering cells by dragging them
    function make_cells_sortable() {
        var cells = $('#output');
        cells.sortable({
            items: "> .notebook-cell",
            start: function(e, info) {
                $(e.toElement).addClass("grabbing");
                // http://stackoverflow.com/questions/6140680/jquery-sortable-placeholder-height-problem
                info.placeholder.height(info.item.height());
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
            handle: " .cell-status",
            scroll: true,
            scrollSensitivity: 40,
            forcePlaceholderSize: true
        });
    }
    make_cells_sortable();

    RCloud.UI.column_sizer.init();

    //////////////////////////////////////////////////////////////////////////
    // autosave when exiting. better default than dropping data, less annoying
    // than prompting
    $(window).bind("unload", function() {
        shell.save_notebook();
        return true;
    });

    RCloud.UI.menus.init();
    RCloud.UI.advanced_menu.init();
    RCloud.UI.navbar.init();
    RCloud.UI.selection_bar.init();

    //////////////////////////////////////////////////////////////////////////
    // edit mode things - move more of them here
    RCloud.UI.find_replace.init();

    // these inits do default setup.  then add-ons modify that setup.
    // then, somewhere, load gets called and they actually fire up
    // (that last step is not so well defined so far)
    RCloud.UI.share_button.init();
    RCloud.UI.notebook_commands.init();
    RCloud.UI.cell_commands.init();
    RCloud.UI.panel_loader.init();

    // adds to advanced menu
    RCloud.UI.import_export.init();

    // keyboard shortcuts:
    RCloud.UI.shortcut_manager.init();

    //////////////////////////////////////////////////////////////////////////
    // view mode things
    ui_utils.prevent_backspace($(document));

    $(document).on('copy', function(e) {
        // only capture for cells and not ace elements
        if($(arguments[0].target).hasClass('ace_text-input') ||
           !$(arguments[0].target).closest($("#output")).size())
            return;
        var sel = window.getSelection();
        var offscreen = $('<pre class="offscreen"></pre>');
        $('body').append(offscreen);
        for(var i=0; i < sel.rangeCount; ++i) {
            var range = sel.getRangeAt(i);
            offscreen.append(range.cloneContents());
        }
        offscreen.find('.nonselectable').remove();
        sel.selectAllChildren(offscreen[0]);
        window.setTimeout(function() {
            offscreen.remove();
        }, 1000);
    });

    // prevent unwanted document scrolling e.g. by dragging
    if(!shell.is_view_mode()) {
        $(document).on('scroll', function() {
            $(this).scrollLeft(0);
            $(this).scrollTop(0);
        });
    };

    // prevent left-right scrolling of notebook area
    $('#rcloud-cellarea').on('scroll', function() {
        $(this).scrollLeft(0);
    });

    // re-truncate notebook title on window resize
    $(window).resize(function(e) {
        shell.refresh_notebook_title();
    });

    // notebook management:
    RCloud.UI.shortcut_manager.add([{
        category: 'Notebook Management',
        id: 'notebook_cell',
        description: 'Saves the current notebook',
        keys: [
            ['command', 's'],
            ['ctrl', 's']
        ],
        action: function() { if(RCloud.UI.navbar.get('save_notebook')) { shell.save_notebook(); } }
    }, {
        category: 'Notebook Management',
        id: 'select_all',
        description: 'Select all',
        keys: [
            ['command', 'a'],
            ['ctrl', 'a']
        ],
        action: function() {
            var selection = window.getSelection();
            selection.removeAllRanges();
            var range = new Range();
            range.selectNode(document.getElementById('output'));
            range.setStartAfter($('.response')[0]);
            selection.addRange(range);
        }
    }, {
        category: 'Notebook Management',
        id: 'history_undo',
        description: 'Steps back through the notebook\'s history',
        keys: [
            ['command', 'z'],
            ['ctrl', 'z']
        ],
        action: function() { editor.step_history_undo(); }
    }, {
        category: 'Notebook Management',
        id: 'history_redo',
        description: 'Steps forwards through the notebook\'s history',
        keys: [
            ['ctrl', 'y'],
            //['ctrl', 'shift', 'z'],
            ['command', 'shift', 'z']
        ],
        action: function() { editor.step_history_redo(); }
    }]);

    // cell management:
    RCloud.UI.shortcut_manager.add([{
        category: 'Cell Management',
        id: 'remove_cells',
        description: 'Removes selected cells',
        keys: [
            ['del']
        ],
        action: function() { shell.notebook.controller.remove_selected_cells(); }
    }, {
        category: 'Cell Management',
        id: 'invert_cells',
        description: 'Invert selected cells',
        keys: [
            ['ctrl', 'shift', 'i'],
            ['command', 'shift', 'i']
        ],
        action: function() { shell.notebook.controller.invert_selected_cells(); }
    }, {
        category: 'Cell Management',
        id: 'crop_cells',
        description: 'Crop cells',
        keys: [
            ['ctrl', 'k'],
            ['command', 'k']
        ],
        action: function() { shell.notebook.controller.crop_cells(); }
    }]);

    // general:
    RCloud.UI.shortcut_manager.add([{
        category: 'General',
        id: 'show_help',
        description: 'Show shortcuts help',
        keys: [
            ['?']
        ],
        action: function() { RCloud.UI.shortcut_dialog.show(); }
    }]);

};

RCloud.UI.left_panel =
    RCloud.UI.collapsible_column("#left-column",
                                 "#accordion-left", "#left-pane-collapser");

RCloud.UI.load_options = function() {
    return rcloud.get_conf_value('smtp.server').then(function(has_mail) {
        // this extra round trip is not ideal.  the load order still needs
        // refinement.
        if(has_mail)
            RCloud.UI.settings_frame.add({
                'subscribe-to-comments': RCloud.UI.settings_frame.checkbox({
                    sort: 5000,
                    default_value: false,
                    label: "Subscribe To Comments",
                    condition: function() {
                    }
                })
            });
        return Promise.all([rcloud.protection.has_notebook_protection(),
                            RCloud.UI.panel_loader.load()])
                    .spread(function(has_prot, _) {
            if(has_prot) {
                var advanced_menu = RCloud.UI.menus.get('advanced_menu');
                advanced_menu.menu.add({
                    manage_groups: {
                        sort: 7000,
                        text: "Manage Groups",
                        modes: ['edit'],
                        action: function(value) {
                            RCloud.UI.notebook_protection.init('group-tab-enabled');
                        }
                    }
                });
            }
            RCloud.UI.left_panel.init();
            RCloud.UI.middle_column.init();
            RCloud.UI.right_panel.init();

            RCloud.UI.command_prompt.init();

            $(".panel-collapse").collapse({toggle: false});

            return Promise.all([RCloud.UI.navbar.load(),
                                RCloud.UI.menus.load(),
                                RCloud.UI.shortcut_manager.load(),
                                RCloud.UI.share_button.load(),
                                RCloud.UI.left_panel.load_options(),
                                RCloud.UI.right_panel.load_options()]);
        });
    });
};

RCloud.UI.menu = (function() {
    var mode_sections_, ui_mode_;
    return {
        filter_mode: function(mode) {
            return function(entry) {
                return entry.modes.indexOf(mode)>=0;
            };
        },
        mode_sections: function(_) {
            if(!arguments.length) {
                if(!mode_sections_)
                    mode_sections_ = {
                        view: {
                            filter: RCloud.UI.menu.filter_mode('view')
                        },
                        edit: {
                            filter: RCloud.UI.menu.filter_mode('edit')
                        }
                    };
                return mode_sections_;
            }
            mode_sections_ = _;
            return this;
        },
        ui_mode: function(_) {
            // this doesn't really belong here but the rest of RCloud doesn't
            // support modes beyond a bool right now anyway.
            if(!arguments.length)
                return ui_mode_ || (shell.is_view_mode() ? 'view' : 'edit');
            ui_mode_ = _;
            return this;
        },
        create: function() {
            var extension_;
            return {
                init: function() {
                    extension_ = RCloud.extension.create({
                        sections: RCloud.UI.menu.mode_sections()
                    });
                },
                add: function(menu_items) {
                    if(extension_)
                        extension_.add(menu_items);
                    return this;
                },
                remove: function(menu_item) {
                    extension_.remove(menu_item);
                    return this;
                },
                check: function(menu_item, check) {
                    var item = extension_.get(menu_item);
                    if(!item || !item.checkbox || !item.checkbox_widget)
                        throw new Error('menu check fail on ' + menu_item);
                    item.checkbox_widget.set_state(check);
                    return this;
                },
                enable: function(menu_item, enable) {
                    var item = extension_.get(menu_item);
                    if(!item || !item.$li)
                        throw new Error('menu disable fail on ' + menu_item);
                    item.$li.toggleClass('disabled', !enable);
                    return this;
                },
                create_checkbox: function(item) {
                    // this is a mess. but it's a contained mess, right? (right?)
                    var ret = $.el.li($.el.a({href: '#', id: item.key}, $.el.i({class: 'icon-check'}), '\xa0', item.text));
                    item.checkbox_widget = ui_utils.checkbox_menu_item($(ret), function() {
                        item.action(true);
                    }, function() {
                        item.action(false);
                    });
                    if(item.value)
                        item.checkbox_widget.set_state(item.value);
                    return ret;
                },
                create_link: function(item) {
                    var ret = $.el.li($.el.a({href: '#', id: item.key}, item.text));
                    return ret;
                },
                create: function(elem) {
                    var that = this;
                    var menu = $('<ul class="dropdown-menu"></ul>');
                    elem.append(menu);
                    var items = extension_.entries(RCloud.UI.menu.ui_mode());
                    menu.append($(items.map(function(item) {
                        var elem;
                        if(item.checkbox)
                            elem = that.create_checkbox(item);
                        else
                            elem = that.create_link(item);
                        item.$li = $(elem);
                        return elem;
                    })));
                    menu.find('li a').click(function() {
                        var item = extension_.get(this.id);
                        if(!item)
                            throw new Error('bad id in advanced menu');
                        if(!item.checkbox)
                            item.action();
                    });
                    return this;
                }
            };
        }
    };
})();

RCloud.UI.menus = (function() {
    var extension_;
    return {
        init: function() {
            extension_ = RCloud.extension.create({
                sections: RCloud.UI.menu.mode_sections()
            });
            this.add({
                discover_divider: {
                    sort: 7000,
                    type: 'divider',
                    modes: ['edit']
                },
                discover: {
                    sort: 8000,
                    type: 'link',
                    href: '/discover.html',
                    text: 'Discover',
                    modes: ['edit']
                },
                logout_divider: {
                    sort: 10000,
                    type: 'divider',
                    modes: ['edit']
                },
                logout: {
                    sort: 12000,
                    type: 'link',
                    href: '/logout.R',
                    text: 'Logout',
                    modes: ['edit']
                }
            });        },
        add: function(items) {
            extension_.add(items);
            return this;
        },
        remove: function(key) {
            extension_.remove(key);
            return this;
        },
        get: function(key) {
            return extension_.get(key);
        },
        create_menu: function(item) {
            var ret = $.el.li({class: 'dropdown'},
                              $.el.a({href: '#', class: 'dropdown-toggle', 'data-toggle': 'dropdown'},
                                     item.title + ' ',
                                     $.el.b({class:"caret"})));
            item.menu.create($(ret));
            return ret;
        },
        create_link: function(item) {
            var attrs = {href: item.href};
            if(item.target) attrs.target = item.target;
            var ret = $.el.li($.el.a(attrs, item.text));
            return ret;
        },
        create_divider: function(item) {
            return $.el.li({class: 'divider-vertical'});
        },
        load: function(mode) {
            var that = this;
            var where = $('#rcloud-navbar-menu');
            return rcloud.get_conf_values('^rcloud\\.menu\\..*').then(function(menus) {
                // fun option-parsing crap
                menus = _.omit(menus, 'r_type', 'r_attributes');
                var add = {};
                for(var key in menus) {
                    var values = menus[key].split(/ *, */);
                    var skey = key.split('.');
                    if(skey.length != 3)
                        throw new Error('submenus not supported yet - invalid menu key '+key);
                    var sort = +values[0],
                        modes = values[1].split(/ *\| */),
                        type = values[2],
                        title = values[3],
                        href = values[4],
                        target = values[5] || '_blank';
                    if(isNaN(sort))
                        throw new Error('bad sort value ' + values[0] + ' in menu key '+key);
                    var value;
                    switch(type) {
                    case 'link':
                        value = {sort: sort, modes: modes, type: type, text: title, href: href, target: target};
                        break;
                    case 'divider':
                        value = {sort: sort, modes: modes, type: type};
                        break;
                    default:
                        throw new Error('invalid menu type ' + type + ' in menu key '+key);
                    }
                    add[skey[2]] = value;
                }
                that.add(add);
                var entries = extension_.entries(RCloud.UI.menu.ui_mode());
                var items = $(entries.map(function(item) {
                    switch(item.type) {
                    case 'divider': return that.create_divider();
                    case 'menu': return that.create_menu(item);
                    case 'link': return that.create_link(item);
                    default: throw new Error('unknown navbar menu entry type ' + item.type);
                    }
                }));
                where.append(items);
            });
            return this;
        }
    };
})();



(function() {

var message_dialog_;
var message_;

RCloud.UI.message_dialog = function(title, message, k) {
    $('#loading-animation').hide();
    if (_.isUndefined(message_dialog_)) {
        var default_button = $("<button type='submit' class='btn btn-primary' style='float:right'>OK</span>"),
            body = $('<div />')
                .append($('<h1 />').append(title));
        message_ = $('<p style="white-space: pre-wrap">' + message + '</p>');
        body.append(message_, default_button);
        body.append('<div style="clear: both;"></div>');
        default_button.click(function(e) {
            e.preventDefault();
            message_dialog_.modal("hide");
        });
        message_dialog_ = $('<div id="message-dialog" class="modal fade" />')
            .append($('<div class="modal-dialog" />')
                    .append($('<div class="modal-content" />')
                            .append($('<div class="modal-body" />')
                                    .append(body))));
        $("body").append(message_dialog_);
        message_dialog_.on("shown.bs.modal", function() {
            default_button.focus();
        });
    }
    else message_.text(message);
    message_dialog_.off("hidden.bs.modal").on("hidden.bs.modal", function() {
        k();
    });
    message_dialog_.modal({keyboard: true});
};

})();

RCloud.UI.middle_column = (function() {
    var result = RCloud.UI.column("#middle-column");

    _.extend(result, {
        update: function() {
            var size = 12 - RCloud.UI.left_panel.colwidth() - RCloud.UI.right_panel.colwidth();
            result.colwidth(size);
            shell.notebook.view.reformat();
        }
    });
    return result;
}());

RCloud.UI.navbar = (function() {
    var extension_, controls_;
    var result = {
        create_button: function(id, title, icon) {
            var button = $.el.button({
                id: id,
                title: title,
                type: 'button',
                class: 'btn btn-link navbar-btn'
            }, $.el.i({
                class: icon
            })), $button = $(button);
            return {
                control: button,
                click: function(handler) {
                    $(button).click(handler);
                    return this;
                },
                hide: function() {
                    $button.hide();
                    return this;
                },
                show: function() {
                    $button.show();
                    return this;
                },
                disable: function() {
                    ui_utils.disable_bs_button($button);
                    return this;
                },
                enable: function() {
                    ui_utils.enable_bs_button($button);
                    return this;
                },
                display: function(title, icon) {
                    $(button).find('i').removeClass().addClass(icon);
                    $(button).attr('title', title);
                    return this;
                }
            };

        },
        create_highlight_button: function(id, title, icon) {
            var result = this.create_button(id, title, icon);
            result.control = $.el.span($.el.span({
                class: 'button-highlight'
            }), result.control);
            result.highlight = function(whether) {
                $(result.control)
                    .find('.button-highlight')
                    .animate({opacity: whether ? 1 : 0}, 250);
                return this;
            };
            return result;
        },
        init: function() {
            // display brand now (won't wait for load/session)
            var header = $('#rcloud-navbar-header');
            header.empty().append('<a class="navbar-brand" href="#">RCloud</a>');
            var cmd_filter = RCloud.extension.filter_field('area', 'commands'),
                view_filter = RCloud.UI.menu.filter_mode('view'),
                edit_filter = RCloud.UI.menu.filter_mode('edit');

            extension_ = RCloud.extension.create({
                sections: {
                    header: {
                        filter: RCloud.extension.filter_field('area', 'header')
                    },
                    view_commands: {
                        filter: function(entry) {
                            return cmd_filter(entry) && view_filter(entry);
                        }
                    },
                    edit_commands: {
                        filter: function(entry) {
                            return cmd_filter(entry) && edit_filter(entry);
                        }
                    }
                }
            });
            this.add({
                shareable_link: {
                    area: 'commands',
                    sort: 1000,
                    modes: ['edit'],
                    create: function() {
                        var share_link_, view_types_;
                        return {
                            control: $.el.span(share_link_ = $.el.a({
                                href: '#',
                                id: 'share-link',
                                title: 'Shareable Link',
                                class: 'btn btn-link navbar-btn',
                                style: 'text-decoration:none; padding-right: 0px',
                                target: '_blank'
                            }, $.el.i({class: 'icon-share'})), $.el.span({
                                class: 'dropdown',
                                style: 'position: relative; margin-left: -2px; padding-right: 12px'
                            }, $.el.a({
                                href: '#',
                                class: 'dropdown-toggle',
                                'data-toggle': 'dropdown',
                                id: 'view-mode'
                            }, $.el.b({class: 'caret'})), view_types_ = $.el.ul({
                                class: 'dropdown-menu view-menu',
                                id: 'view-type'
                            }))),
                            set_url: function(url) {
                                if(share_link_)
                                    $(share_link_).attr('href', url);
                                return this;
                            },
                            set_view_types: function(items) {
                                $(view_types_).append($(items.map(function(item) {
                                    var a = $.el.a({href: '#'}, item.title);
                                    $(a).click(item.handler);
                                    return $.el.li(a);
                                })));
                            }
                        };
                    }
                },
                star_notebook: {
                    area: 'commands',
                    sort: 2000,
                    modes: ['edit'],
                    create: function() {
                        var star_, unstar_, icon_, count_;
                        var button = $.el.button({
                            id: 'star-notebook',
                            title: 'Add to Interests',
                            type: 'button',
                            class: 'btn btn-link navbar-btn',
                            style: 'padding-left: 3px'
                        }, $.el.i({
                            class: 'icon-star-empty'
                        }), $.el.sub(count_ = $.el.span({
                            id: 'curr-star-count'
                        })));
                        icon_ = ui_utils.twostate_icon($(button),
                                                       function() { star_(); },
                                                       function() { unstar_(); },
                                                       'icon-star', 'icon-star-empty');
                        return {
                            control: button,
                            set_star_unstar: function(star, unstar) {
                                star_ = star;
                                unstar_ = unstar;
                                return this;
                            },
                            set_fill: function(filled) {
                                icon_.set_state(filled);
                                return this;
                            },
                            set_count: function(count) {
                                $(count_).text(count);
                                return this;
                            }
                        };
                    }
                },
                fork_notebook: {
                    area: 'commands',
                    sort: 3000,
                    modes: ['edit'],
                    create: function() {
                        var control = RCloud.UI.navbar.create_button('fork-notebook', 'Fork', 'icon-code-fork');
                        $(control.control).click(function() {
                            var is_mine = shell.notebook.controller.is_mine();
                            var gistname = shell.gistname();
                            var version = shell.version();
                            editor.fork_notebook(is_mine, gistname, version);
                        });
                        return control;
                    }
                },
                save_notebook: {
                    area: 'commands',
                    sort: 4000,
                    modes: ['edit'],
                    create: function() {
                        var control = RCloud.UI.navbar.create_button('save-notebook', 'Save', 'icon-save');
                        $(control.control).click(function() {
                            shell.save_notebook();
                        });
                        control.disable();
                        return control;
                    }
                },
                revert_notebook: {
                    area: 'commands',
                    sort: 5000,
                    modes: ['edit'],
                    create: function() {
                        var control = RCloud.UI.navbar.create_button('revert-notebook', 'Revert', 'icon-undo');
                        $(control.control).click(function() {
                            var is_mine = shell.notebook.controller.is_mine();
                            var gistname = shell.gistname();
                            var version = shell.version();
                            editor.revert_notebook(is_mine, gistname, version);
                        });
                        return control;
                    }
                },
                edit_notebook: {
                    area: 'commands',
                    sort: 1000,
                    modes: ['view'],
                    create: function() {
                        var control = RCloud.UI.navbar.create_button('edit-notebook', 'Edit Notebook', 'icon-edit');
                        $(control.control).click(function() {
                            window.location = "edit.html?notebook=" + shell.gistname();
                        });
                        return control;
                    }
                },
                run_notebook: {
                    area: 'commands',
                    sort: 6000,
                    modes: ['edit', 'view'],
                    create: function() {
                        var control = RCloud.UI.navbar.create_highlight_button('run-notebook', 'Run All', 'icon-play');
                        $(control.control).click(function() {
                            RCloud.UI.run_button.run();
                        });
                        return control;
                    }
                }
            });
        },
        add: function(commands) {
            if(extension_)
                extension_.add(commands);
            return this;
        },
        remove: function(command_name) {
            if(extension_)
                extension_.remove(command_name);
            return this;
        },
        get: function(command_name) {
            return extension_ ? extension_.get(command_name) : null;
        },
        control: function(command_name) {
            return controls_ ? controls_[command_name] : null;
        },
        load: function() {
            if(extension_) {
                var brands = extension_.create('header').array;
                var header = $('#rcloud-navbar-header');
                if(brands.length)
                    header.empty().append.apply(header, brands);
                var commands_section = RCloud.UI.menu.ui_mode() + '_commands';
                var commands = extension_.create(commands_section);
                var main = $('#rcloud-navbar-main');
                if(commands.array.length)
                    main.prepend.apply(main, commands.array.map(function(button) {
                        return $.el.li(button.control);
                    }));
                controls_ = commands.map;
            }
            return Promise.resolve(undefined);
        }
    };
    return result;
})();

RCloud.UI.notebook_commands = (function() {
    var icon_style_ = {'line-height': '90%'};
    var star_style_ = _.extend({'font-size': '80%'}, icon_style_);
    var star_states_ = {true: {'class': 'icon-star', title: 'unstar'},
                        false: {'class': 'icon-star-empty', title: 'star'}};

    var commands_ = {};
    var always_commands_, appear_commands_;
    var defaults_ = {
        condition0: function(node) {
            return node.gistname && !node.version;
        },
        condition1: function(node) {
            return true;
        }
    };

    function add_commands(node, span, commands) {
        commands.forEach(function(command) {
            span.append(document.createTextNode(String.fromCharCode(160)));
            span.append(command.create(node));
        });
    }

    function condition_pred(node) {
        return function(command) {
            return _.every(['condition0', 'condition1', 'condition2'], function(c) {
                return !command[c] || command[c](node);
            });
        };
    }

    var result = {
        init: function() {
            this.add({
                star_unstar: {
                    section: 'always',
                    sort: 1000,
                    create: function(node) {
                        var state = editor.i_starred(node.gistname);
                        var star_unstar = ui_utils.fa_button(star_states_[state]['class'],
                                                             function(e) { return star_states_[state].title; },
                                                             'star',
                                                             star_style_,
                                                             true);
                        // sigh, ui_utils.twostate_icon should be a mixin or something
                        // ... why does this code exist?
                        star_unstar.click(function(e) {
                            e.preventDefault();
                            e.stopPropagation(); // whatever you do, don't let this event percolate
                            ui_utils.kill_popovers();
                            var new_state = !state;
                            editor.star_notebook(new_state, {gistname: node.gistname, user: node.user});
                        });
                        star_unstar[0].set_state = function(val) {
                            state = !!val;
                            $(this).find('i').attr('class', star_states_[state].class);
                        };
                        star_unstar.append($.el.sub(String(editor.num_stars(node.gistname))));
                        return star_unstar;
                    }
                },
                history: {
                    section: 'appear',
                    sort: 2000,
                    create: function(node) {
                        var current = editor.current();
                        var disable = current.notebook===node.gistname && current.version;
                        var history = ui_utils.fa_button('icon-time', 'history', 'history', icon_style_, true);
                        // jqtree recreates large portions of the tree whenever anything changes
                        // so far this seems safe but might need revisiting if that improves
                        if(disable)
                            history.addClass('button-disabled');
                        history.click(function() {
                            //hacky but will do for now
                            ui_utils.kill_popovers();
                            ui_utils.fake_hover(node);
                            if(!disable) {
                                editor.show_history(node, true);
                            }
                            return false;
                        });
                        return history;
                    }
                },
                visibility: {
                    section: 'appear',
                    sort: 3000,
                    condition1: function(node) {
                        return node.user === editor.username();
                    },
                    create: function(node) {
                        var make_hidden = ui_utils.fa_button('icon-eye-close', 'hide notebook', 'hidden-notebook', icon_style_, true),
                            make_shown = ui_utils.fa_button('icon-eye-open', 'show notebook', 'shown-notebook', icon_style_, true);
                        if(node.visible)
                            make_shown.hide();
                        else
                            make_hidden.hide();
                        make_hidden.click(function() {
                            ui_utils.fake_hover(node);
                            if(node.user !== editor.username())
                                throw new Error("attempt to set visibility on notebook not mine");
                            else
                                editor.set_notebook_visibility(node.gistname, false);
                        });
                        make_shown.click(function() {
                            ui_utils.fake_hover(node);
                            if(node.user !== editor.username())
                                throw new Error("attempt to set visibility on notebook not mine");
                            else
                                editor.set_notebook_visibility(node.gistname, true);
                            return false;
                        });
                        return make_hidden.add(make_shown);
                    }
                },
                remove: {
                    section: 'appear',
                    sort: 4000,
                    condition1: function(node) {
                        return node.user === editor.username();
                    },
                    create: function(node) {
                        var remove = ui_utils.fa_button('icon-remove', 'remove', 'remove', icon_style_, true);
                        remove.click(function(e) {
                            $('div.popover').remove(); // UGH
                            var yn = confirm("Do you want to remove '"+node.full_name+"'?");
                            if (yn) {
                                e.stopPropagation();
                                e.preventDefault();
                                editor.remove_notebook(node.user, node.gistname);
                            }
                            return false;
                        });
                        return remove;
                    }
                },
                fork_folder: {
                    section: 'appear',
                    sort: 1000,
                    condition0: function(node) {
                        return node.full_name && !node.gistname;
                    },
                    create: function(node) {
                        var fork = ui_utils.fa_button('icon-code-fork', 'fork', 'fork', icon_style_, true);
                        var orig_name = node.full_name, folder_name = editor.find_next_copy_name(orig_name);
                        var orig_name_regex = new RegExp('^' + orig_name);
                        fork.click(function(e) {
                            editor.fork_folder(node, orig_name_regex, folder_name);
                        });
                        return fork;
                    }
                },
                remove_folder: {
                    section: 'appear',
                    sort: 2000,
                    condition0: function(node) {
                        return node.full_name && !node.gistname && node.user === editor.username();
                    },
                    create: function(node) {
                        var remove_folder = ui_utils.fa_button('icon-remove', 'remove folder', 'remove', icon_style_, true);
                        var notebook_names = [];
                        remove_folder.click(function(e) {
                            editor.for_each_notebook(node, null, function(node) {
                                notebook_names.push(node.full_name);
                            });
                            var yn = confirm("Do you want to remove ALL the following notebooks?\n" + notebook_names.join('\n'));
                            if(yn) {
                                var promises = [];
                                editor.for_each_notebook(node, null, function(node) {
                                    promises.push(editor.remove_notebook(node.user, node.gistname));
                                });
                            };
                            return false;
                        });
                        return remove_folder;
                    }
                }
            });
            return this;
        },
        add: function(commands) {
            // extend commands_ by each command in commands, with defaults
            for(var key in commands)
                commands_[key] = _.extend(_.extend({}, defaults_), commands[key]);

            // update the lists of commands (will be applied lots)
            always_commands_ = _.filter(commands_, function(command) {
                return command.section === 'always';
            });
            appear_commands_ = _.filter(commands_, function(command) {
                return command.section === 'appear';
            });
            [always_commands_, appear_commands_].forEach(function(set) {
                set.sort(function(a, b) { return a.sort - b.sort; });
            });
            return this;
        },
        remove: function(command_name) {
            delete commands_[command_name];
            return this;
        },
        icon_style: function() {
            return icon_style_;
        },
        decorate: function($li, node, right) {
            var appeared;
            var $right = $(right);
            var predicate = condition_pred(node);

            function no_clickpast(div) {
                // do not interpret missed click as open notebook
                div.on('mousedown mouseup click', function(e) {
                    e.stopPropagation();
                });
            }

            function do_always() {
                // commands for the right column, always shown
                var always_commands = always_commands_.filter(predicate);
                if(always_commands.length) {
                    var always = $($.el.span({'class': 'notebook-commands-right'}));
                    no_clickpast(always);
                    add_commands(node, always, always_commands);
                    $right.append(always);
                }
            }

            // decorate the notebook commands lazily, on hover
            function do_appear() {
                // commands that appear
                var appear_commands = appear_commands_.filter(predicate);
                if(appear_commands.length) {
                    var appear = $($.el.span({'class': 'notebook-commands appear'}));
                    no_clickpast(appear);
                    add_commands(node, appear, appear_commands);
                    $right.append(appear);
                    $right.find('.notebook-date').toggleClass('disappear', true);
                    appear.hide();
                    $right.append($.el.span({"class": "notebook-commands appear-wrapper"}, appear[0]));
                }
                appeared = true;
            }

            do_always();
            $li.find('*:not(ul)').hover(
                function() {
                    if(!appeared)
                        do_appear();
                    var notebook_info = editor.get_notebook_info(node.gistname);
                    $('.notebook-commands.appear', this).show();
                    $('.notebook-date.disappear', this).css('visibility', 'hidden');
                },
                function() {
                    $('.notebook-commands.appear', this).hide();
                    $('.notebook-date.disappear', this).css('visibility', 'visible');
                });
            return this;
        }
    };
    return result;
})();

RCloud.UI.selection_bar = (function() {

    var $partial_indicator,
        $selection_checkbox,
        $dropdown_toggle,
        $delete_button,
        $cell_selection;

    var reset = function() {
        $selection_checkbox.prop('checked', false);
        $partial_indicator.hide();
    };

    var result = {
        init: function() {

            var $selection_bar = $(RCloud.UI.panel_loader.load_snippet('selection-bar-snippet'));
            $partial_indicator = $selection_bar.find('.cell-selection span');
            $selection_checkbox = $selection_bar.find('.cell-selection input[type="checkbox"]');
            $dropdown_toggle = $selection_bar.find('.dropdown-toggle');
            $delete_button = $selection_bar.find('#selection-bar-delete');
            $cell_selection = $selection_bar.find('.cell-selection');

            $selection_bar
                .find('.btn-default input[type="checkbox"]').click(function(e) {
                    e.stopPropagation();

                    if(!shell.notebook.controller.cell_count()) {
                        e.preventDefault();
                        return;
                    }

                    if($(this).is(':checked')) {
                        shell.notebook.controller.select_all_cells();
                    } else {
                        shell.notebook.controller.clear_all_selected_cells();
                    }
                })
                .end()
                .find('a[data-action]').click(function() {
                    shell.notebook.controller[$(this).attr('data-action')]();
                })
                .end()
                .find('#selection-bar-delete').click(function() {
                    shell.notebook.controller.remove_selected_cells();
                })
                .end();

            $selection_bar.find('div[type="button"].cell-selection').click(function(e) {
                $(this).find('input').trigger('click');
            });
            
            $('#' + $selection_bar.attr('id')).replaceWith($selection_bar);
        },  
        update: function(cells) {

            var cell_count = cells.length,
                selected_count = _.filter(cells, function(cell) { return cell.is_selected(); }).length;

            $selection_checkbox.prop({
                'checked' : selected_count === cell_count && cell_count != 0,
                'disabled' : cell_count === 0
            });

            _.each([$delete_button, $dropdown_toggle, $cell_selection], function(el) { 
                el[cell_count ? 'removeClass' : 'addClass']('disabled');  
            });

            $partial_indicator[selected_count !== cell_count && selected_count !== 0 ? 'show' : 'hide']();     

        },
        hide: function() {
            $('#selection-bar').hide();
            reset();
        },
        show: function() {
            $('#selection-bar').show();
            reset();
        }
    };
    return result;

})();

RCloud.UI.notebook_title = (function() {
    var last_editable_ =  null;
    function version_tagger(node) {
        return function(name) {
            return editor.tag_version(node.gistname, node.version, name)
                .then(function() {
                    return editor.show_history(node.parent, {update: true});
                });
        };
        
    }
    function rename_current_notebook(name) {
        return editor.rename_notebook(name)
            .then(function() {
                result.set(name);
            });
    }
    function rename_notebook_folder(node) {
        return function(name) {
            editor.for_each_notebook(node, name, function(node, name) {
                if(node.gistname === shell.gistname())
                    shell.rename_notebook(name);
                else {
                    rcloud.update_notebook(node.gistname, {description: name}, false)
                        .then(function(notebook) {
                            editor.update_notebook_from_gist(notebook);
                        });
                }
            }, function(child, name) {
                return name + '/' + child.name;
            });
        };
    }
    function fork_rename_folder(node) {
        return function(name) {
            var match = new RegExp('^' + node.full_name);
            editor.fork_folder(node, match, name);
        };
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
    var fork_and_rename = function(forked_gist_name, is_change) {
        var is_mine = shell.notebook.controller.is_mine();
        var gistname = shell.gistname();
        var version = shell.version();
        editor.fork_notebook(is_mine, gistname, version)
            .then(function(v) {
                if(is_change)
                    return rename_current_notebook(forked_gist_name);
                else // if no change, allow default numbering to work
                    return undefined;
            });
    };
    var editable_opts = {
        change: rename_current_notebook,
        select: select,
        ctrl_cmd: fork_and_rename,
        validate: function(name) { return editor.validate_name(name); }
    };

    var result = {
        set: function (text) {
            $("#notebook-author").text(shell.notebook.model.user());
            $('#author-title-dash').show();
            $('#rename-notebook').show();
            $('#loading-animation').hide();
            var is_read_only = shell.notebook.model.read_only();
            var active_text = text;
            var ellipt_start = false, ellipt_end = false;
            var title = $('#notebook-title');
            function sum_li_width(sel) {
                return d3.sum($(sel).map(function(_, el) { return $(el).width(); }));
            }
            var header_plus_menu = $('#rcloud-navbar-header').width() + sum_li_width('#rcloud-navbar-menu li') + 50;
            title.text(text);
            while(text.length>10 && window.innerWidth < header_plus_menu + sum_li_width('#rcloud-navbar-main')) {
                var slash = text.search('/');
                if(slash >= 0) {
                    ellipt_start = true;
                    text = text.slice(slash+1);
                }
                else {
                    ellipt_end = true;
                    text = text.substr(0, text.length - 5);
                }
                title.text((ellipt_start ? '.../' : '') +
                           text +
                           (ellipt_end ? '...' : ''));
            }
            ui_utils.editable(title, $.extend({allow_edit: !is_read_only && !shell.is_view_mode(),
                                               inactive_text: title.text(),
                                               active_text: active_text},
                                              editable_opts));
        },
        update_fork_info: function(fork_of) {
            // fork_of can be an empty array so make sure description is there
            if(fork_of && fork_of.description) {
                var owner = fork_of.owner ? fork_of.owner : fork_of.user;
                var fork_desc = owner.login+ " / " + fork_of.description;
                var url = ui_utils.make_url(shell.is_view_mode() ? 'view.html' : 'edit.html',
                                            {notebook: fork_of.id});
                $("#forked-from-desc").html("forked from <a href='" + url + "'>" + fork_desc + "</a>");
            }
            else
                $("#forked-from-desc").text("");
        },
        make_editable: function(node, $li, editable) {
            function get_title(node, elem) {
                return $('> div > .jqtree-title', elem);
            }
            if(last_editable_ && (!node || node.gistname && last_editable_ !== node))
                ui_utils.editable(get_title(last_editable_, last_editable_.element), 'destroy');
            if(node) {
                var opts = editable_opts;
                if(node.version) {
                    opts = $.extend({}, editable_opts, {
                        change: version_tagger(node),
                        validate: function(name) { return true; }
                    });
                }
                else if(!node.gistname) {
                    opts = $.extend({}, editable_opts, {
                        change: rename_notebook_folder(node),
                        ctrl_cmd: fork_rename_folder(node),
                        validate: function(text) {
                            return editor.validate_name(text);
                        }
                    });
                }
                ui_utils.editable(get_title(node, $li),
                                  $.extend({allow_edit: editable,
                                            inactive_text: node.name,
                                            active_text: node.version ? node.name : node.full_name},
                                           opts));
            }
            if(node && node.gistname)
                last_editable_ = node;
        }
    };
    return result;
})();

// eventually more of editor_tab might land here.  for now, just
// initialization for loadable panel
RCloud.UI.notebooks_frame = {
    body: function() {
        return RCloud.UI.panel_loader.load_snippet('notebooks-snippet');
    },
    heading_content: function() {
        var notebook_inner_panel = RCloud.UI.panel_loader.load_snippet('notebooks-panel-tmp');
        return notebook_inner_panel;
    },
    heading_content_selector: function() {
        return $('#notebooks-panel-inner');
    }
};

RCloud.UI.output_context = (function() {
    function create_context(selector) {
        var sel = $(selector);
        function appender(type) {
            function gen_wrapper(type) {
                switch(type) {
                case 'code':
                    return function(text) {
                        return $('<code></code>').append(text);
                    };
                case 'error':
                    return function(text) {
                        return $('<code style="color: crimson"></code>').append(text);
                    };
                case 'html':
                    return function(text) {
                        return text;
                    };
                default: throw new Error('unknown output type ' + type);
                }
            }
            var wrapper = gen_wrapper(type);
            return function(text) {
                sel.append(wrapper(text));
            };
        }
        return {
            end: function() {
                console.log('not expecting end on custom output context');
            },
            out: appender('code'),
            err: appender('error'),
            msg: appender('code'),
            html_out: appender('html'),
            selection_out: appender('html'),
            deferred_result: null, in: null
        };
    }
    return {
        create: function(selector) {
            var context = create_context(selector);
            var context_id = RCloud.register_output_context(context);
            return context_id;
        },
        close: function(id) {
            RCloud.unregister_output_context(id);
        }
    };
})();

RCloud.UI.panel_loader = (function() {
    var extension_;
    var panels_ = {};

    function collapse_name(name) {
        return 'collapse-' + name;
    }

    function add_panel(opts) {
        var parent_id = 'accordion-' + opts.side;
        var collapse_id = collapse_name(opts.name);
        var heading_attrs = {'class': 'panel-heading clearfix',
                                'data-toggle': 'collapse',
                                'data-parent': '#' + parent_id, // note: left was broken '#accordion'
                                'data-target': '#' + collapse_id};
        var title_span = $.el.span({'class': 'title-offset'},
                                   opts.title),
            icon = $.el.i({'class': opts.icon_class}),
            heading_link = $.el.a({'class': 'accordion-toggle ' + opts.side,
                                   'href': '#' + collapse_id},
                                  icon, '\u00a0', title_span);

        var heading_content = opts.panel.heading_content ? opts.panel.heading_content() : null;
        var heading;
        if(opts.side==='left') {
            heading = $.el.div(heading_attrs,
                               heading_link,
                               heading_content);
        }
        else if(opts.side==='right') {
            heading = $.el.div(heading_attrs,
                               heading_content,
                               heading_link);
        }
        else throw new Error('Unknown panel side ' + opts.side);

        var collapse_attrs = {'id': collapse_id,
                             'class': 'panel-collapse collapse',
                             'data-colwidth': opts.colwidth};
        if(opts.greedy)
            collapse_attrs['data-widgetheight'] = 'greedy';
        var collapse = $.el.div(collapse_attrs,
                                $.el.img({'height': '100%',
                                          'width': '5px',
                                          'src': opts.side==='left' ? '/img/right_bordergray.png' : '/img/left_bordergray.png',
                                          'class': 'panel-shadow ' + opts.side}),
                                opts.panel.body());
        var panel = $.el.div({'class': 'panel panel-default'},
                             heading, collapse);

        $('#' + parent_id).append(panel);
    }

    function add_filler_panel(side) {
        var parent_id = 'accordion-' + side;
        var body = $('<div/>', {'class': 'panel-body',
                                'style': 'border-top-color: transparent; background-color: #777'});
        for(var i=0; i<60; ++i)
            body.append($.el.br());
        var collapse = $.el.div({'class': 'panel-collapse out'},
                                body[0]);
        var panel = $.el.div({'class': 'panel panel-default'},
                             collapse);

        $('#' + parent_id).append(panel);
    }

    return {
        init: function() {
            extension_ = RCloud.extension.create({
                sections: {
                    left: {
                        filter: function(panel) {
                            return panel.side === 'left';
                        }
                    },
                    right: {
                        filter: function(panel) {
                            return panel.side === 'right';
                        }
                    }
                }
            });
            // built-in panels
            this.add({
                Notebooks: {
                    side: 'left',
                    name: 'notebook-tree',
                    title: 'Notebooks',
                    icon_class: 'icon-folder-open',
                    colwidth: 3,
                    greedy: true,
                    sort: 1000,
                    panel: RCloud.UI.notebooks_frame
                },
                Search: {
                    side: 'left',
                    name: 'search',
                    title: 'Search',
                    icon_class: 'icon-search',
                    colwidth: 4,
                    sort: 2000,
                    panel: RCloud.UI.search
                },
                Settings: {
                    side: 'left',
                    name: 'settings',
                    title: 'Settings',
                    icon_class: 'icon-cog',
                    colwidth: 3,
                    sort: 3000,
                    panel: RCloud.UI.settings_frame
                },
                Help: {
                    side: 'left',
                    name: 'help',
                    title: 'Help',
                    icon_class: 'icon-question',
                    colwidth: 5,
                    sort: 4000,
                    panel: RCloud.UI.help_frame
                },
                Assets: {
                    side: 'right',
                    name: 'assets',
                    title: 'Assets',
                    icon_class: 'icon-copy',
                    colwidth: 4,
                    sort: 1000,
                    panel: RCloud.UI.scratchpad
                },
                'File Upload': {
                    side: 'right',
                    name: 'file-upload',
                    title: 'File Upload',
                    icon_class: 'icon-upload-alt',
                    colwidth: 2,
                    sort: 2000,
                    panel: RCloud.UI.upload_frame
                },
                Comments: {
                    side: 'right',
                    name: 'comments',
                    title: 'Comments',
                    icon_class: 'icon-comments',
                    colwidth: 2,
                    sort: 3000,
                    panel: RCloud.UI.comments_frame
                },
                Session: {
                    side: 'right',
                    name: 'session-info',
                    title: 'Session',
                    icon_class: 'icon-info',
                    colwidth: 3,
                    sort: 4000,
                    panel: RCloud.UI.session_pane
                }
            });
        },
        add: function(P) {
            // if we have not been initialized, that means there is no GUI
            if(extension_)
                extension_.add(P);
        },
        remove: function(panel_name) {
            extension_.remove(panel_name);
            return this;
        },
        load_snippet: function(id) {
            // embed html snippets in edit.html as "html scripts"
            // technique described here: http://ejohn.org/blog/javascript-micro-templating/
            return $($('#' + id).html())[0];
        },
        load: function() {
            function do_side(panels, side) {
                function do_panel(p) {
                    add_panel(p);
                    // note: panels are not accessible to extensions for pre-load
                    // customization
                    if(p.panel.init)
                        p.panel.init();
                    if(p.panel.load)
                        p.panel.load();
                    if(p.panel.panel_sizer)
                        $('#' + collapse_name(p.name)).data("panel-sizer",p.panel.panel_sizer);
                    if(p.panel.heading_content_selector)
                        $('#' + collapse_name(p.name)).data("heading-content-selector", p.panel.heading_content_selector());
                }
                var chosen = extension_.entries(side);
                chosen.forEach(do_panel);
                add_filler_panel(side);
            }

            do_side(panels_, 'left');
            do_side(panels_, 'right');

            // this is dumb but i don't want the collapser to show until load time
            $('#left-column').append(this.load_snippet('left-pane-collapser-snippet'));
            $('#right-column').append(this.load_snippet('right-pane-collapser-snippet'));

            return Promise.cast(undefined); // until we are loading opts here
        }
    };
})();


(function() {

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
        // allow manual reset by ESC or clicking away
        progress_dialog.on('hide.bs.modal', function() {
            progress_counter = 0;
            clear_cursor();
        });
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

RCloud.UI.with_progress = function(promise_thunk, delay) {
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
    return Promise.resolve(done)
        .then(promise_thunk)
        .then(function(v) {
            done();
            return v;
        }).catch(function(error) {
            done();
            throw error;
        });
};

RCloud.UI.prevent_progress_modal = function() {
    if (allowed === 1) {
        if (progress_counter > 0) {
            clear_cursor();
            clear_curtain();
        }
    }
    allowed -= 1;
};

RCloud.UI.allow_progress_modal = function() {
    if (allowed === 0) {
        if (progress_counter > 0) {
            set_cursor();
            set_curtain();
        }
    }
    allowed += 1;
};

})();

RCloud.UI.right_panel =
    RCloud.UI.collapsible_column("#right-column",
                                 "#accordion-right", "#right-pane-collapser");

RCloud.UI.run_button = (function() {
    var running_ = false,
        stopping_ = false,
        queue_ = [],
        cancels_ = [];

    function display(title, icon) {
        RCloud.UI.navbar.control('run_notebook').display(title, icon);
    }
    function highlight(whether) {
        RCloud.UI.navbar.control('run_notebook').highlight(whether);
    }

    function start_queue() {
        if(queue_.length === 0) {
            stopping_ = false;
            running_ = false;
            display('Run All', 'icon-play');
            highlight(false);
            return Promise.resolve(undefined);
        }
        else {
            running_ = true;
            var first = queue_.shift();
            display('Stop', 'icon-stop');
            highlight(true);
            return first().then(function() {
                if(stopping_) {
                    stopping_ = false;
                    throw 'stop';
                }
                cancels_.shift();
                return start_queue();
            });
        }
    }
    return {
        init: function() {
            var that = this;
            RCloud.session.listeners.push({
                on_reset: function() {
                    that.on_stopped();
                }
            });
        },
        run: function() {
            if(running_)
                this.stop();
            else
                shell.run_notebook();
        },
        stop: function() {
            if(rcloud.has_compute_separation)
                rcloud.signal_to_compute(2); // SIGINT
            else
                stopping_ = true;
        },
        on_stopped: function() {
            cancels_.forEach(function(cancel) { cancel(); });
            queue_ = [];
            cancels_ = [];
            running_ = false;
            display('Run All', 'icon-play');
            highlight(false);
        },
        enqueue: function(f, cancel) {
            var that = this;
            queue_.push(f);
            cancels_.push(cancel || function() {});
            if(!running_) {
                start_queue()
                    .catch(function(xep) {
                        if(xep === 'stop') {
                            cancels_.shift(); // this one was not a cancel
                            that.on_stopped();
                        }
                        else {
                            console.log(xep);
                            that.on_stopped();
                            // if this was due to a SIGINT, we're done
                            // otherwise we'll need to report this.
                            // stop executing either way.
                            if(!/^ERROR FROM R SERVER: 127/.test(xep))
                                throw xep;
                        }
                    });
            }
        }
    };
})();

RCloud.UI.scratchpad = (function() {
    var binary_mode_; // not editing
    // this function probably belongs elsewhere
    function make_asset_url(model) {
        return window.location.protocol + '//' + window.location.host + '/notebook.R/' +
            model.parent_model.controller.current_gist().id + '/' + model.filename();
    }
    return {
        session: null,
        widget: null,
        exists: false,
        current_model: null,
        change_content: null,
        body: function() {
            return RCloud.UI.panel_loader.load_snippet('assets-snippet');
        },
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
                var LangMode = ace.require("ace/mode/r").Mode;
                var session = widget.getSession();
                that.session = session;
                that.widget = widget;
                var doc = session.doc;
                session.on('change', function() {
                    widget.resize();
                });

                widget.setOptions({
                    enableBasicAutocompletion: true
                });
                session.setMode(new LangMode(false, doc, session));
                session.setUseWrapMode(true);
                widget.resize();
                ui_utils.on_next_tick(function() {
                    session.getUndoManager().reset();
                    widget.resize();
                });
                that.change_content = ui_utils.ignore_programmatic_changes(
                    that.widget, function() {
                        if (that.current_model)
                            that.current_model.parent_model.on_dirty();
                    });
                ui_utils.install_common_ace_key_bindings(widget, function() {
                    return that.current_model.language();
                });
                $("#collapse-assets").on("shown.bs.collapse panel-resize", function() {
                    widget.resize();
                });
            }
            function setup_asset_drop() {
                var showOverlay_;
                //prevent drag in rest of the page except asset pane and enable overlay on asset pane
                $(document).on('dragstart dragenter dragover', function (e) {
                    var dt = e.originalEvent.dataTransfer;
                    if(!dt)
                        return;
                    if (dt.types !== null &&
                        (dt.types.indexOf ?
                         (dt.types.indexOf('Files') != -1 && dt.types.indexOf('text/html') == -1):
                         dt.types.contains('application/x-moz-file'))) {
                        if (!shell.notebook.model.read_only()) {
                            e.stopPropagation();
                            e.preventDefault();
                            $('#asset-drop-overlay').css({'display': 'block'});
                            showOverlay_ = true;
                        }
                        else {
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    }
                });
                $(document).on('drop dragleave', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    showOverlay_ = false;
                    setTimeout(function() {
                        if(!showOverlay_) {
                            $('#asset-drop-overlay').css({'display': 'none'});
                        }
                    }, 100);
                });
                //allow asset drag from local to asset pane and highlight overlay for drop area in asset pane
                $('#scratchpad-wrapper').bind({
                    drop: function (e) {
                        e = e.originalEvent || e;
                        var files = (e.files || e.dataTransfer.files);
                        var dt = e.dataTransfer;
                        if(!shell.notebook.model.read_only()) {
                            RCloud.UI.upload_with_alerts(true, {files: files})
                                .catch(function() {}); // we have special handling for upload errors
                        }
                        $('#asset-drop-overlay').css({'display': 'none'});
                    },
                    "dragenter dragover": function(e) {
                        var dt = e.originalEvent.dataTransfer;
                        if(!shell.notebook.model.read_only())
                            dt.dropEffect = 'copy';
                    }
                });
            }
            var scratchpad_editor = $("#scratchpad-editor");
            if (scratchpad_editor.length) {
                this.exists = true;
                setup_scratchpad(scratchpad_editor);
                setup_asset_drop();
            }
            $("#new-asset > a").click(function() {
                // FIXME prompt, yuck. I know, I know.
                var filename = prompt("Choose a filename for your asset");
                if (!filename)
                    return;
                if (Notebook.is_part_name(filename)) {
                    alert("Asset names cannot start with 'part[0-9]', sorry!");
                    return;
                }
                var found = shell.notebook.model.get_asset(filename);
                if(found)
                    found.controller.select();
                else {
                    // very silly i know
                    var comment_text = function(text, ext) {
                        switch(ext) {
                        case 'css': return '/* ' + text + ' */\n';
                        case 'js': return '// ' + text + '\n';
                        case 'html': return '<!-- ' + text + ' -->\n';
                        default: return '# ' + text + '\n';
                        }
                    };
                    var ext = (filename.indexOf('.')!=-1?filename.match(/\.(.*)/)[1]:"");
                    shell.notebook.controller
                        .append_asset(comment_text("New file " + filename, ext), filename)
                        .spread(function(_, controller) {
                            controller.select();
                            ui_utils.ace_set_pos(RCloud.UI.scratchpad.widget, 2, 1);
                        });
                }
            });
        },
        panel_sizer: function(el) {
            return {
                padding: RCloud.UI.collapsible_column.default_padder(el),
                height: 9000
            };
        },
        // FIXME this is completely backwards
        set_model: function(asset_model) {
            var that = this;
            if(!this.exists)
                return;
            if (this.current_model && !binary_mode_) {
                this.current_model.cursor_position(this.widget.getCursorPosition());
                // if this isn't a code smell I don't know what is.
                if (this.current_model.content(this.widget.getValue())) {
                    this.current_model.parent_model.controller.update_asset(this.current_model);
                }
            }
            this.current_model = asset_model;
            if (!this.current_model) {
                $('#scratchpad-binary').hide();
                $('#scratchpad-editor').show();
                that.change_content("");
                that.widget.resize();
                that.widget.setReadOnly(true);
                $('#scratchpad-editor > *').hide();
                $('#asset-link').hide();
                return;
            }
            this.update_asset_url();
            $('#asset-link').show();
            var content = this.current_model.content();
            if (Notebook.is_binary_content(content)) {
                binary_mode_ = true;
                // ArrayBuffer, binary content: display object
                $('#scratchpad-editor').hide();
                // PDF seems not to be supported properly by browers
                var sbin = $('#scratchpad-binary');
                if(/\.pdf$/i.test(this.current_model.filename()))
                    sbin.html('<p>PDF preview not supported</p>');
                else
                    sbin.html('<object data="' + make_asset_url(this.current_model) + '"></object>');
                sbin.show();
            }
            else {
                // text content: show editor
                binary_mode_ = false;
                that.widget.setReadOnly(false);
                $('#scratchpad-binary').hide();
                $('#scratchpad-editor').show();
                $('#scratchpad-editor > *').show();
                this.change_content(content);
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
                that.language_updated();
                that.widget.resize();
                that.widget.focus();
            }
        },
        // this behaves like cell_view's update_model
        update_model: function() {
            return (this.current_model && !binary_mode_) ?
                this.current_model.content(this.widget.getSession().getValue()) :
                null;
        }, content_updated: function() {
            var changed = false;
            changed = this.current_model.content();
            binary_mode_ = Notebook.is_binary_content(changed);
            if(changed && !binary_mode_) {
                var range = this.widget.getSelection().getRange();
                this.change_content(changed);
                this.widget.getSelection().setSelectionRange(range);
            }
            return changed;
        }, language_updated: function() {
            if(!binary_mode_) {
                var lang = this.current_model.language();
                var LangMode = ace.require(RCloud.language.ace_mode(lang)).Mode;
                this.session.setMode(new LangMode(false, this.session.doc, this.session));
            }
        }, set_readonly: function(readonly) {
            if(!shell.is_view_mode()) {
                if(this.widget && !binary_mode_)
                    ui_utils.set_ace_readonly(this.widget, readonly);
                if(readonly)
                    $('#new-asset').hide();
                else
                    $('#new-asset').show();
            }
        }, update_asset_url: function() {
            if(this.current_model)
                $('#asset-link').attr('href', make_asset_url(this.current_model));
        }, clear: function() {
            if(!this.exists)
                return;
            this.change_content("");
            this.session.getUndoManager().reset();
            this.widget.resize();
        }
    };
})();

RCloud.UI.search = (function() {
var page_size_ = 10;
var search_err_msg = ["<p style=\"color:black;margin:0;\">The search engine in RCloud uses Lucene for advanced search features." ,
    "It appears you may have used one of the special characters in Lucene syntax incorrectly. " ,
    "Please see this <a target=\"_blank\" href=\"http://lucene.apache.org/core/4_10_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#Terms\">link</a> to learn about Lucene syntax. " ,
    "</p><p style=\"color:black;margin:0;\">Or, if you mean to search for the character itself, escape it using a backslash, e.g. \"foo\\:\"</p>"];

function go_to_page(page_num,incr_by){
    //get the element number where to start the slice from
    var start = (parseInt(page_num) * parseInt(incr_by));
    var end = parseInt(start) + parseInt(incr_by);
    var qry = $('#input-text-search').val();
    var sortby= $("#sort-by option:selected").val();
    var orderby= $("#order-by option:selected" ).val();
    $('#input-text-search').blur();
    if(!($('#input-text-search').val() === ""))
        RCloud.UI.search.exec(qry,sortby,orderby,start,end,true);
}

function sortby() {
    return $("#sort-by option:selected").val();
}
function orderby() {
    return $("#order-by option:selected").val();
}
function all_sources() {
    return $("#all-sources").is(':checked');
}

function order_from_sort() {
    var orderby;
    switch(sortby()) {
    case 'starcount':
    case 'updated_at':
        orderby = "desc";
        break;
    case 'user':
    case 'description':
        orderby = "asc";
        break;
    }
    $('#order-by').val(orderby);
}

return {
    body: function() {
        return RCloud.UI.panel_loader.load_snippet('search-snippet');
    },
    init: function() {
        if(!rcloud.search)
            $("#search-wrapper").text("Search engine not enabled on server");
        else {
            $("#search-form").submit(function(e) {
                searchproc();
                return false;
            });
            rcloud.get_gist_sources().then(function(sources) {
                // annoying to load this over again just to get a number, but
                // there's no obvious place to store this
                if(_.isString(sources)) sources = [sources];
                if(sources.length<2) {
                    $('#all-sources').parent().hide();
                }
                else {
                    $("#all-sources").change(function(e) {
                        var val = all_sources();
                        rcloud.config.set_user_option("search-all-sources", val);
                    });
                }
            });
            $("#sort-by").change(function() {
                rcloud.config.set_user_option('search-sort-by', sortby());
                order_from_sort();
                rcloud.config.set_user_option('search-order-by', orderby());
                searchproc();
            });
            $("#order-by").change(function() {
                rcloud.config.set_user_option('search-order-by', orderby());
                searchproc();
            });
            var searchproc=function() {
                var start = 0;
                var qry = $('#input-text-search').val();
                $('#input-text-search').focus();
                if (!($('#input-text-search').val() === "")) {
                    RCloud.UI.search.exec(qry, sortby(), orderby(), start, page_size_);
                } else {
                    $('#paging').html("");
                    $('#search-results').html("");
                    $('#search-summary').html("");
                }
            };
        };
    },
    load: function() {
        return rcloud.config.get_user_option(['search-all-sources', 'search-results-per-page',
                                              'search-sort-by', 'search-order-by'])
            .then(function(opts) {
                $('#all-sources').prop('checked', opts['search-all-sources']);
                if(opts['search-results-per-page']) page_size_ = opts['search-results-per-page'];
                if(!opts['search-sort-by']) opts['search-sort-by'] = 'starcount'; // always init once
                $('#sort-by').val(opts['search-sort-by']);
                if(opts['search-order-by'])
                    $('#order-by').val(opts['search-order-by']);
                else
                    order_from_sort();
            });
    },
    panel_sizer: function(el) {
        var padding = RCloud.UI.collapsible_column.default_padder(el);
        var height = 24 + $('#search-summary').height() + $('#search-results').height() + $('#search-results-pagination').height();
        height += 40; // there is only so deep you can dig
        return {height: height, padding: padding};
    },
    toggle: function(id,togid) {
        $('#'+togid+'').text(function(_,txt) {
            var ret='';
            if ( txt.indexOf("Show me more...") > -1 ) {
                ret = 'Show me less...';
                $('#'+id+'').css('height',"auto");
            }else{
                ret = 'Show me more...';
                $('#'+id+'').css('height',"150px");
            }
            return ret;
        });
        return false;
    },

    exec: function(query, sortby, orderby, start, noofrows, pgclick) {
        function summary(html, color) {
            $('#search-summary').css('color', color || 'black');
            $("#search-summary").show().html($("<h4/>").append(html));
        }
        function err_msg(html, color) {
            $('#search-summary').css("display", "none");
            $('#search-results').css('color', color || 'black');
            $("#search-results-row").show().animate({ scrollTop: $(document).height() }, "slow");
            $("#search-results").show().html($("<h4/>").append(html));
        }
        function create_list_of_search_results(d) {
            var i;
            var custom_msg = '';
            if(d === null || d === "null" || d === "") {
                summary("No Results Found");
            } else if(d[0] === "error") {
                d[1] = d[1].replace(/\n/g, "<br/>");
                if($('#paging').html != "")
                    $('#paging').html("");
                if(d[1].indexOf("org.apache.solr.search.SyntaxError")>-1)
                    custom_msg = search_err_msg.join("");
                err_msg(custom_msg+"ERROR:\n" + d[1], 'darkred');
            } else {
                if(typeof (d) === "string") {
                    d = JSON.parse("[" + d + "]");
                }
                //convert any string type part to json object : not required most of the time
                for(i = 0; i < d.length; i++) {
                    if(typeof (d[i]) === "string") {
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
                var numfound = 0, numpaged = 0, numSources = 1;
                var src_counts = {};
                if(d[0] != undefined) {
                    numpaged = numfound = parseInt(d[0].numFound);
                    // in addition, check that we didn't several parallel sources and adjust accordingly
                    _.each(d, function(o) { src_counts[o.source] = parseInt(o.numFound); });
                    var numTotal = _.reduce(src_counts, function(memo, num){ return memo + num; }, 0);
                    var maxNumFound = _.max(src_counts);
                    numSources = Object.keys(src_counts).length;
                    if (numSources > 1) {
                        numfound = numTotal;
                        numpaged = maxNumFound;
                    }
                }
                var noofpages =  Math.ceil(numpaged/page_size_);
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
                        var notebook_source = d[i].source;
                        var image_string = "<i class=\"icon-star search-star\"><sub>" + star_count + "</sub></i>";
                        d[i].parts = JSON.parse(d[i].parts);
                        var parts_table = "";
                        var inner_table = "";
                        var added_parts = 0;
                        //displaying only 5 parts of the notebook sorted based on relevancy from solr
                        var partslen = d[i].parts.length;
                        var nooflines =0;
                        for(var k = 0; k < d[i].parts.length && added_parts < 5; k++) {
                            inner_table = "";
                            var ks = Object.keys(d[i].parts[k]);
                            if(ks.length > 0 && d[i].parts[k].content !== "") {
                                var content = d[i].parts[k].content;
                                if(typeof content === "string")
                                    content = [content];
                                if(content.length > 0)
                                    parts_table += "<tr><th class='search-result-part-name'>" + d[i].parts[k].filename + "</th></tr>";
                                for(var l = 0; l < content.length; l++) {
                                    if (d[i].parts[k].filename === "comments") {
                                        var split = content[l].split(/ *::: */);
                                        if(split.length < 2)
                                            split = content[l].split(/ *: */); // old format had single colons
                                        var comment_content = split[1] || '';
                                        if(!comment_content)
                                            continue;
                                        var comment_author = split[2] || '';
                                        var display_comment = comment_author ? (comment_author + ': ' + comment_content) : comment_content;
                                        inner_table += "<tr><td class='search-result-comment'><span class='search-result-comment-content'>" + comment_author + ": " + comment_content + "</span></td></tr>";
                                    }
                                    else {
                                        inner_table += "<tr><td class='search-result-code'><code>" + content[l] + "</code></td></tr>";
                                    }
                                }

                                if (d[i].parts[k].filename != "comments") {
                                    nooflines += inner_table.match(/\|-\|/g).length;
                                }
                                added_parts++;
                            }
                            if(inner_table !== "") {
                                inner_table = inner_table.replace(/\|-\|,/g, '<br>').replace(/\|-\|/g, '<br>');
                                inner_table = inner_table.replace(/line_no/g,'|');
                                inner_table = "<table style='width: 100%'>" + inner_table + "</table>";
                                parts_table += "<tr><td>" + inner_table + "</td></tr>";
                            }
                        }
                        var togid = i + "more";
                        var url = ui_utils.make_url('edit.html', {notebook: notebook_id, source: notebook_source});
                        if(parts_table !== "") {
                            if(nooflines > 10) {
                                parts_table = "<div><div style=\"height:150px;overflow: hidden;\" id='"+i+"'><table style='width: 100%'>" + parts_table + "</table></div>" +
                                    "<div style=\"position: relative;\"><a href=\"#\" id='"+togid+"' onclick=\"RCloud.UI.search.toggle("+i+",'"+togid+"');\" style=\"color:orange\">Show me more...</a></div></div>";
                            } else {
                                parts_table = "<div><div id='"+i+"'><table style='width: 100%'>" + parts_table + "</table></div></div>";
                            }
                        }
                        var search_result_class = 'search-result-heading' + (notebook_source ? ' foreign-notebook' : '');
                        search_results += "<table class='search-result-item' width=100%><tr><td width=10%>" +
                            "<a id=\"open_" + i + "\" href=\'" + url +"'\" data-gistname='" + notebook_id + "' data-gistsource='" + notebook_source + "' class='" + search_result_class + "'>" +
                            d[i].user + " / " + d[i].notebook + "</a>" +
                            image_string + "<br/><span class='search-result-modified-date'>modified at <i>" + d[i].updated_at + "</i></span></td></tr>";
                        if(parts_table !== "")
                            search_results += "<tr><td colspan=2 width=100% style='font-size: 12'><div>" + parts_table + "</div></td></tr>";
                        search_results += "</table>";
                    } catch(e) {
                        summary("Error : \n" + e, 'darkred');
                    }
                }
                if(!pgclick) {
                    $('#paging').html("");
                    $("#search-results-pagination").show();
                    if((parseInt(numpaged) - parseInt(page_size_)) > 0) {
                        var number_of_pages = noofpages;
                        $('#current_page').val(0);
                        if (numfound != 0) {
                            var current_link = 0;
                            $("#paging").bootpag({
                                total: number_of_pages,
                                page: 1,
                                maxVisible: 8
                            }).on('page', function (event, num) {
                                go_to_page(num - 1, page_size_);
                            });
                        }
                    }
                }

                var qry = decodeURIComponent(query);
                qry = qry.replace(/</g,'&lt;');
                qry = qry.replace(/>/g,'&gt;');
                if(numfound === 0) {
                    summary("No Results Found");
                } else if(parseInt(numpaged) < page_size_){
                    summary(numfound +" Results Found", 'darkgreen');
                } else {
                    var search_summary = numfound +" Results Found, showing ";
		    if (numSources > 1) { // for multi-sources it gets complicated, just show the page
			search_summary += "page "+ Math.round(start/page_size_ + 1);
		    } else {
			if(numfound-start === 1) {
			    search_summary += (start+1);
			} else if((numfound - noofrows) > 0) {
			    search_summary += (start+1)+" - "+noofrows;
			} else {
			    search_summary += (start+1)+" - "+numfound;
			}
		    }
                    summary(search_summary, 'darkgreen');
                }
                $("#search-results-row").css('display', 'table-row');
                $("#search-results-scroller").scrollTop(0);
                $('#search-results').html(search_results);
                $("#search-results .search-result-heading").click(function(e) {
                    e.preventDefault();
                    var gistname = $(this).attr("data-gistname"), gistsource = $(this).attr("data-gistsource");
                    editor.open_notebook(gistname, null, gistsource, null, e.metaKey || e.ctrlKey);
                    return false;
                });
            }
            $("#collapse-search").trigger("size-changed");
        }

        summary("Searching...");
        if(!pgclick) {
            $("#search-results-row").hide();
            $("#search-results").html("");
        }
        query = encodeURIComponent(query);
        RCloud.UI.with_progress(function() {
            return rcloud.search(query, all_sources(), sortby, orderby, start, page_size_)
                .then(function(v) {
                    create_list_of_search_results(v);
                });
        });
    }
};
})();


RCloud.UI.session_pane = {
    error_dest_: null,
    allow_clear: true,
    body: function() {
        return RCloud.UI.panel_loader.load_snippet('session-info-snippet');
    },
    init: function() {
        var that = this;

        // detect where we will show errors
        this.error_dest_ = $("#session-info");
        if(this.error_dest_.length) {
            this.show_error_area = function() {
                RCloud.UI.right_panel.collapse($("#collapse-session-info"), false, false);
            };
        }
        else {
            this.error_dest_ = $("#output");
            this.show_error_area = function() {};
        }
        RCloud.session.listeners.push({
            on_reset: function() {
                that.clear();
            }
        });

        //////////////////////////////////////////////////////////////////////
        // bluebird unhandled promise handler
        Promise.onPossiblyUnhandledRejection(function(e, promise) {
            that.post_rejection(e);
        });
    },
    panel_sizer: function(el) {
        var def = RCloud.UI.collapsible_column.default_sizer(el);
        if(def.height)
            def.height += 20; // scrollbar height can screw it up
        return def;
    },
    error_dest: function() {
        return this.error_dest_;
    },
    clear: function() {
        if(this.allow_clear)
            $("#session-info").empty();
    },
    append_text: function(msg) {
        // FIXME: dropped here from session.js, could be integrated better
        if(!$('#session-info').length) {
            console.log(['session log; ', msg].join(''));
             return; // workaround for view mode
        }
        // one hacky way is to maintain a <pre> that we fill as we go
        // note that R will happily spit out incomplete lines so it's
        // not trivial to maintain each output in some separate structure
        if (!document.getElementById("session-info-out"))
            $("#session-info").append($("<pre id='session-info-out'></pre>"));
        $("#session-info-out").append(msg);
        RCloud.UI.right_panel.collapse($("#collapse-session-info"), false, false);
        ui_utils.on_next_tick(function() {
            ui_utils.scroll_to_after($("#session-info"));
        });
    },
    post_error: function(msg, dest, logged) { // post error to UI
        $('#loading-animation').hide();
        var errclass = 'session-error';
        if (typeof msg === 'string') {
            msg = ui_utils.string_error(msg);
            errclass = 'session-error spare';
        }
        else if (typeof msg !== 'object')
            throw new Error("post_error expects a string or a jquery div");
        msg.addClass(errclass);
        dest = dest || this.error_dest_;
        if(dest) { // if initialized, we can use the UI
            dest.append(msg);
            this.show_error_area();
            ui_utils.on_next_tick(function() {
                ui_utils.scroll_to_after($("#session-info"));
            });
        }
        if(!logged)
            console.log("pre-init post_error: " + msg.text());
    },
    post_rejection: function(e) { // print exception on stack and then post to UI
        var msg = "";
        // bluebird will print the message for Chrome/Opera but no other browser
        if(!window.chrome && e.message)
            msg += "Error: " + e.message + "\n";
        msg += e.stack;
        console.log(msg);
        this.post_error(msg, undefined, true);
    }
};

RCloud.UI.settings_frame = (function() {
    // options to fetch from server, with callbacks for what to do once we get them
    var options_ = {};
    var body_;
    // the controls, once they are created
    var controls_ = {};
    // are we currently setting option x?
    var now_setting_ = {};


    function set_option_noecho(key, value) {
        // we're about to call user code here, make sure we restore now_setting_
        // if it throws (but propagate the exception)
        try {
            now_setting_[key] = true;
            options_[key].set(value, controls_[key]);
        }
        catch(xep) {
            throw xep;
        }
        finally {
            now_setting_[key] = false;
        }
    }
    var result = {
        body: function() {
            return body_ = $.el.div({id: "settings-body-wrapper", 'class': 'panel-body'},
                            $.el.div({id: "settings-scroller", style: "width: 100%; height: 100%; overflow-x: auto"},
                                    $.el.div({id:"settings-body", 'class': 'widget-vsize'})),
                            $.el.span({class: "settings-reload-msg", style: "display: none"}, "Reload to see changes"));
        },
        panel_sizer: function(el) {
            // fudge it so that it doesn't scroll 4 nothing
            var sz = RCloud.UI.collapsible_column.default_sizer(el);
            return {height: sz.height+5, padding: sz.padding};
        },
        show_reload_msg: function(val) {
            if(val)
                $(body_).find('.settings-reload-msg').show();
            else
                $(body_).find('.settings-reload-msg').hide();
        },
        checkbox: function(opts) {
            opts = _.extend({
                sort: 10000,
                default_value: false,
                needs_reload: false,
                label: "",
                id:"",
                set: function(val) {}
            }, opts);
            return {
                sort: opts.sort,
                default_value: opts.default_value,
                create_control: function(on_change) {
                    var check = $.el.input({type: 'checkbox'});
                    $(check).prop('id', opts.id);
                    var span = $.el.span(opts.label);
                    var label = $.el.label(check, span);
                    var checkboxdiv = $($.el.div({class: 'checkbox'}, label));
                    $(check).change(function() {
                        var val = $(this).prop('checked');
                        on_change(val);
                        if(opts.needs_reload)
                            result.show_reload_msg(true);
                        opts.set(val);
                    });
                    return checkboxdiv;
                },
                set: function(val, control) {
                    val = !!val;
                    control.find('input').prop('checked', val);
                    opts.set(val);
                }
            };
        },
        text_input: function(opts) {
            opts = _.extend({
                sort: 10000,
                default_value: "",
                needs_reload: false,
                label: "",
                id:"",
                parse: function(val) { return val; },
                format: function(val) { return val; },
                set: function(val) {}
            }, opts);
            return {
                sort: opts.sort,
                default_value: opts.default_value,
                create_control: function(on_change) {
                    var input = $.el.input({type: 'text', class: 'form-control-ext'});
                    $(input).prop('id', opts.id);
                    var span = $.el.span(opts.label);
                    var label = $.el.label(span, input);
                    var div = $($.el.div({class: 'settings-input'}, label));
                    function commit() {
                        var val = $(input).val();
                        if(val === div.data('original-value'))
                            return;
                        val = opts.parse(val);
                        on_change(val);
                        if(opts.needs_reload)
                            result.show_reload_msg(true);
                        opts.set(val);
                        val = opts.format(val);
                        $(input).val(val);
                        div.data('original-value', val);
                    }
                    function cancel() {
                        $(input).val(div.data('original-value'));
                    }
                    $(input).keydown(function(e) {
                        if(e.keyCode === $.ui.keyCode.ENTER)
                            commit();
                        else if(e.keyCode === $.ui.keyCode.ESCAPE)
                            cancel();
                    });
                    $(input).blur(function() {
                        commit();
                    });
                    return div;
                },
                set: function(val, control) {
                    opts.set(val);
                    val = opts.format(val);
                    control.find('input').val(val);
                    control.data('original-value', val);
                }
            };
        },
        text_input_vector: function(opts) {
            opts = _.extend({
                parse: function(val) {
                    return val.trim().split(/, */).filter(function(x) { return !!x; });
                },
                format: function(val) {
                    // might be devectorized by rserve.js
                    return val.join ? val.join(', ') : val;
                }
            }, opts);
            return this.text_input(opts);
        },
        init: function() {
            var that = this;
            this.add({
                'show-command-prompt': that.checkbox({
                    sort: 1000,
                    default_value: true,
                    label: "Show Command Prompt",
                    set: function(val) {
                        RCloud.UI.command_prompt.show_prompt(val);
                    }
                }),
                'show-terse-dates': that.checkbox({
                    sort: 2000,
                    default_value: true,
                    needs_reload: true,
                    label: "Show Terse Version Dates",
                    set: function(val) {
                        editor.set_terse_dates(val);
                    }
                }),
                'show-cell-numbers': that.checkbox({
                    sort: 3000,
                    default_value: true,
                    label: "Show Cell Numbers",
                    set: function(val) {
                        shell.notebook.controller.show_cell_numbers(val);
                    }
                }),
                'addons': that.text_input_vector({
                    sort: 10000,
                    needs_reload: true,
                    label: "Enable Extensions"
                }),
                'skip-addons': that.text_input_vector({
                    sort: 11000,
                    needs_reload: true,
                    label: "Disable Extensions"
                }),
                'new-notebook-prefix': that.text_input({
                    sort: 12000,
                    label: "New Notebook Prefix",
                    default_value: editor.new_notebook_prefix(),
                    set: function(val) {
                        editor.new_notebook_prefix(val);
                    },
                    parse: function(val) {
                        // no monkey business: do not allow any empty parts in path, except the last one
                        return val.split('/')
                            .filter(function(x, i, a) { return i==a.length-1 || !Notebook.empty_for_github(x); })
                            .join('/');
                    }
                })
            });
        },
        add: function(S) {
            _.extend(options_, S);
        },
        remove: function(option_name) {
            delete options_[option_name];
        },
        load: function() {
            var that = this;
            var sort_controls = [];
            _.keys(options_).forEach(function(name) {
                var option = options_[name];
                controls_[name] = option.create_control(function(value) {
                    if(!now_setting_[name])
                        rcloud.config.set_user_option(name, value);
                });
                sort_controls.push({sort: option.sort, control: controls_[name]});
            });
            sort_controls = sort_controls.sort(function(a,b) { return a.sort - b.sort; });
            var body = $('#settings-body');
            for(var i=0; i<sort_controls.length; ++i)
                body.append(sort_controls[i].control);

            var option_keys = _.keys(options_);
            if(option_keys.length === 1)
                option_keys.push("foo"); // evade rcloud scalarizing
            return rcloud.config.get_user_option(option_keys)
                .then(function(settings) {
                    for(var key in settings) {
                        if(key==="foo" || key==='r_attributes' || key==='r_type')
                            continue;
                        var value = settings[key] !== null ?
                                settings[key] :
                                options_[key].default_value;
                        set_option_noecho(key, value);
                    }
                });
        }
    };
    return result;
})();


RCloud.UI.share_button = (function() {
    var extension_;
    var default_item_ = null;
    function set_page(title) {
        title = (title && extension_.get(title)) ? title : default_item_;
        var view_type = extension_.get(title);
        if(!title)
            return Promise.reject(new Error('share button view types set up wrong'));
        var page = view_type.page;
        $("#view-type li a").css("font-weight", function() {
            return $(this).text() === title ? "bold" : "normal";
        });
        var opts = {notebook: shell.gistname(),
                    do_path: view_type.do_path,
                    version: shell.version()};
        if(!opts.version) {
            RCloud.UI.navbar.control('shareable_link').set_url(ui_utils.make_url(page, opts));
            return Promise.resolve(undefined);
        }
        else return rcloud.get_tag_by_version(shell.gistname(), opts.version)
            .then(function(t) {
                if(t)
                    opts.tag = t;
                RCloud.UI.navbar.control('shareable_link').set_url(ui_utils.make_url(page, opts));
            });
    }

    return {
        init: function() {
            extension_ = RCloud.extension.create({
                defaults: {
                    create: function() {
                        var that = this;
                        return {
                            title: that.key,
                            handler: function() {
                                rcloud.set_notebook_property(shell.gistname(), "view-type", that.key);
                                set_page(that.key);
                            }
                        };
                    }
                }
            });
            this.add({
                'view.html': {
                    sort: 1000,
                    page: 'view.html'
                },
                'notebook.R': {
                    sort: 2000,
                    page: 'notebook.R',
                    do_path: true
                },
                'mini.html': {
                    sort: 3000,
                    page: 'mini.html'
                },
                'shiny.html': {
                    sort: 4000,
                    page: 'shiny.html'
                }
            });
            return this;
        },
        add: function(view_types) {
            if(extension_)
                extension_.add(view_types);
            return this;
        },
        remove: function(view_type) {
            if(extension_)
                extension_.remove(command_name);
            return this;
        },
        load: function() {
            var that = this;
            var items = extension_.create('all').array;
            default_item_ = items.length ? items[0].title : null;
            RCloud.UI.navbar.control('shareable_link').set_view_types(items);
            return this;
        },
        update_link: function() {
            return rcloud.get_notebook_property(shell.gistname(), "view-type")
                .then(set_page);
        }
    };
})();

RCloud.UI.upload_with_alerts = (function() {
    function upload_ui_opts(opts) {
        if(_.isBoolean(opts))
            opts = {force: opts};
        else if(!_.isObject(opts))
            throw new Error("didn't understand options " + opts);
        opts = $.extend({
            $file: $("#file"),
            $progress: $(".progress"),
            $progress_bar: $("#progress-bar"),
            $upload_results: $("#file-upload-results").length ?
                $("#file-upload-results") :
                RCloud.UI.session_pane.error_dest(),
            $result_panel: $("#collapse-file-upload")
        }, opts);
        return opts;
    }

    function upload_files(to_notebook, options) {
        // we could easily continue optionifying this
        function results_append($div) {
            options.$upload_results.append($div);
            options.$result_panel.trigger("size-changed");
            if(options.$upload_results.length)
                ui_utils.on_next_tick(function() {
                    ui_utils.scroll_to_after(options.$upload_results);
                });
        }

        function result_alert($content) {
            var alert_element = $("<div></div>");
            alert_element.append($content);
            var alert_box = bootstrap_utils.alert({'class': 'alert-danger', html: alert_element});
            results_append(alert_box);
            return alert_box;
        }

        function result_success(message) {
            results_append(
                bootstrap_utils.alert({
                    "class": 'alert-info',
                    text: message,
                    on_close: function() {
                        options.$progress.hide();
                        options.$result_panel.trigger("size-changed");
                    }
                }));
        }

        function asset_react(options) {
            return {
                add: function(file) {
                    result_success("Asset " + file + " added.");
                },
                replace: function(file) {
                    result_success("Asset " + file + " replaced.");
                }
            };
        }

        function file_react(options) {
            return {
                start: function(filename) {
                    options.$progress.show();
                    options.$progress_bar.css("width", "0%");
                    options.$progress_bar.attr("aria-valuenow", "0");
                },
                progress: function(read, size) {
                    options.$progress_bar.attr("aria-valuenow", ~~(100 * (read / size)));
                    options.$progress_bar.css("width", (100 * (read / size)) + "%");
                },
                done: function(is_replace, filename) {
                    result_success("File " + filename + " " + (is_replace ? "replaced." : "uploaded."));
                },
                confirm_replace: Promise.promisify(function(filename, callback) {
                    var overwrite_click = function() {
                        alert_box.remove();
                        callback(null, true);
                    };
                    var p = $("<p>File " + filename + " exists. </p>");
                    var overwrite = bootstrap_utils
                            .button({"class": 'btn-danger'})
                            .click(overwrite_click)
                            .text("Overwrite");
                    p.append(overwrite);
                    var alert_box = result_alert(p);
                    $('button.close', alert_box).click(function() {
                        callback(new Error("Overwrite cancelled"), null);
                    });
                })
            };
        }

        options = upload_ui_opts(options || {});
        if(options.$result_panel.length)
            RCloud.UI.right_panel.collapse(options.$result_panel, false);

        var file_error_handler = function(err) {
            var message = err.message;
            var p, done = true;
            if(message==="empty") {
                p = $("<p>File is empty.</p>");
            }
            else if(message==="Overwrite cancelled") {
                p = $('<p>').append(message);
            }
            else if(message==="badname") {
                p = $("<p>Filename not allowed.</p>");
            }
            else {
                p = $("<p>(unexpected) " + message + "</p>");
                console.log(message, err.stack);
            }
            result_alert(p);
            throw err;
        };


        var promise = to_notebook ?
                RCloud.upload_assets(options, asset_react(options)) :
                RCloud.upload_files(options, file_react(options));

        // this promise is after all overwrites etc.
        return promise.catch(function(err) {
            return file_error_handler(err, options);
        }).then(function() {
            if(options.$progress.length)
                window.setTimeout(function() {
                    options.$progress.hide();
                }, 5000);
        });
    }

    return upload_files;
})();

RCloud.UI.upload_frame = {
    body: function() {
        return RCloud.UI.panel_loader.load_snippet('file-upload-snippet');
    },
    init: function() {
        $("#file").change(function() {
            $("#progress-bar").css("width", "0%");
        });
        $("#upload-submit").click(function() {
            if($("#file")[0].files.length===0)
                return;
            var to_notebook = ($('#upload-to-notebook').is(':checked'));
            RCloud.UI.upload_with_alerts(to_notebook)
                .catch(function() {}); // we have special handling for upload errors
        });
        RCloud.session.listeners.push({
            on_reset: function() {
                $(".progress").hide();
                $("#file-upload-results").empty();
            }
        });
    },
    panel_sizer: function(el) {
        var padding = RCloud.UI.collapsible_column.default_padder(el);
        var height = 24 + $('#file-upload-controls').height() + $('#file-upload-results').height();
        return {height: height, padding: padding};
    }
};


RCloud.UI.notebook_protection_logger = {
    timeout: 0,
    log: function(val) {
        var that = this;
        $('.logging-panel').removeClass('red')
            .removeClass('white')
            .addClass('green');

        $('.logging-panel span').text(val);

        window.clearTimeout(this.timeout);
        this.timeout = setTimeout(function() {
            $('.logging-panel').removeClass('red')
                    .removeClass('green')
                    .addClass('white');
            $('.logging-panel span').html('&nbsp;');
        }, 20000);
    },
    warn: function(val) {
        var that = this;
        $('.logging-panel').removeClass('green')
            .removeClass('white')
            .addClass('red');
        $('.logging-panel span').text(val);

        window.clearTimeout(this.timeout);
        this.timeout = setTimeout(function() {
            $('.logging-panel').removeClass('red')
                    .removeClass('green')
                    .addClass('white');
            $('.logging-panel span').html('&nbsp;');
        }, 20000);
    },
    clear: function(){
        $('.logging-panel').removeClass('red')
                    .removeClass('green')
                    .addClass('white');
        $('.logging-panel span').html('&nbsp;');
    }
};

RCloud.UI.notebook_protection = (function() {

    //set from outside
    this.defaultCryptogroup = null;
    this.defaultNotebook = null;
    this.userId = null;
    this.userLogin = null;

    this.appScope = null;
    this.appInited = false;

    return {

        init: function(state) {

          if(!this.appInited) {

            this.appInited = true;
            this.buildDom();
            var that = this;

            require([
                'angular',
                './../../js/ui/notebook_protection_app',
                'angular-selectize'
              ], function(angular, app, selectize) {
                  'use strict';

                  //var $html = angular.element(document.getElementsByTagName('html')[0]);
                  angular.element(document).ready(function() {
                      _.delay(function() {
                        angular.bootstrap($('#protection-app')[0], ['NotebookProtectionApp']);
                        angular.resumeBootstrap();
                      }, 100);
                      _.delay(function() {
                        that.appScope = angular.element(document.getElementById("protection-app")).scope();
                        that.launch(state);
                        $('#notebook-protection-dialog').modal({keyboard: false});
                      }, 200);
                  });
            });
          }
          else {
            this.launch(state);
            $('#notebook-protection-dialog').modal({keyboard: false});
          }
        },

        launch: function(state) {

          if(state === 'both-tabs-enabled') {
            //restores both tabs to working condition
            $('#protection-app #tab2')
              .removeClass('active');

            $('#protection-app #tab1')
              .removeClass('disabled')
              .addClass('active');

            $('#protection-app #tab1 a')
              .attr('href', '#notebook-tab')
              .attr('data-toggle', 'tab');

            $('#protection-app #tab2 a')
              .tab('show');
            $('#protection-app #tab1 a')
              .tab('show');

            this.appScope.initBoth();
          }
          else if(state === 'group-tab-enabled') {
            //makes it so the first tab is not clickable
            $('#protection-app #tab1')
              .removeClass('active')
              .addClass('disabled');

            $('#protection-app #tab1 a')
              .attr('href', '#')
              .removeAttr('data-toggle');

            $('#protection-app #tab2 a')
              .tab('show');

            this.appScope.initGroups();
          }
        },

        buildDom: function() {

          var body = $('<div class="container"></div>');
          body.append(RCloud.UI.panel_loader.load_snippet('notebook-protection-modal'));

          var header = $(['<div class="modal-header">',
                          '<button type="button" class="close" onClick="(RCloud.UI.notebook_protection.close.bind(RCloud.UI.notebook_protection))()" aria-hidden="true">&times;</button>',
                          '<h3>Notebook Permissions / Group Management</h3>',
                          '</div>'].join(''));
          var dialog = $('<div id="notebook-protection-dialog" class="modal fade"></div>')
            .append($('<div class="modal-dialog"></div>')
            .append($('<div class="modal-content"></div>')
            .append(header).append(body)));
          $("body").append(dialog);

        },

        close: function() {
          this.appScope.cancel();
        }
    };

})();

RCloud.UI.discovery_page = (function() {
    return {
        init: function() {
            require([
                './../../lib/js/imagesloaded',
                './../../lib/js/masonry.pkgd.min'
              ], function(imagesLoaded, Masonry) {

                  'use strict';

                  window.imagesLoaded = imagesLoaded;
                  window.Masonry = Masonry;

                  rcloud.config.get_recent_notebooks().then(function(data){

                      var recent_notebooks = _.chain(data)
                      .pairs()
                      .filter(function(kv) {
                          return kv[0] != 'r_attributes' && kv[0] != 'r_type' && !_.isEmpty(editor.get_notebook_info(kv[0])) ;
                      })
                      .map(function(kv) { return [kv[0], Date.parse(kv[1])]; })
                      .sortBy(function(kv) { return kv[1] * -1; })
                      .first(20)
                      .map(function(notebook) {
                        var current = editor.get_notebook_info(notebook[0]);
                        return {
                          id: notebook[0],
                          time: notebook[1],
                          description: current.description,
                          last_commit: new Date(current.last_commit).toDateString(),
                          username: current.username,
                          num_stars: editor.num_stars(current[0]),
                          image_url: 'notebook.R/' + notebook[0] + '/thumb.png'
                        }
                      })
                      .value();

                      $('progress').attr({
                        max: recent_notebooks.length
                      });

                      var template = _.template(
                          $("#item_template").html()
                      );

                      $('.grid').html(template({
                        notebooks: recent_notebooks
                      })).imagesLoaded()
                        .always(function() {

                          new Masonry( '.grid', {
                            itemSelector: '.grid-item'
                          });

                         

                          $('#progress').fadeOut(200, function() {
                            $('.navbar').fadeIn(200, function() {
                              $('#discovery-app').css('visibility', 'visible');
                              $('body').addClass('loaded');
                            });
                          });
                          
                        })
                        .progress(function(imgLoad, image) {
                          if(!image.isLoaded) {
                            $(image.img).attr('src', './img/missing.png');  
                          }

                          var new_value = +$('progress').attr('value') + 1;

                          $('progress').attr({
                            value: new_value
                          });

                        });
                  });
            });
        }
    };
})();
//# sourceMappingURL=rcloud_bundle.js.map