RCloud = Object.assign({
    version: '2.3.0'
}, RCloud);

// FIXME: what is considered an exception - an API error or also cell eval error?
// We can tell them apart now ...
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
    var tb = v['traceback'] ? v['traceback'] : "";
    if (tb.join) tb = tb.join("\n");
    return v.error + "R trace:\n" + tb;
};

//////////////////////////////////////////////////////////////////////////////
// promisification

RCloud.promisify_paths = (function() {
    function rcloud_handler(command, promise_fn) {
        function success(result) {
            if(result && RCloud.is_exception(result)) {
                throw new Error(command + ": " + RCloud.exception_message(result));
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
            ["signal_to_compute"],
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
            ["discovery", "get_notebooks"],
            ["discovery", "get_thumb"],
            ["session_cell_eval"],
            ["reset_session"],
            ["set_device_pixel_ratio"],
            ["api", "enable_echo"],
            ["api", "disable_echo"],
            ["api", "enable_warnings"],
            ["api", "disable_warnings"],
            ["api", "set_url"],
            ["api", "get_url"],
            ["notebook_by_name"],
            ["get_notebook_info"],
            ["get_multiple_notebook_infos"],
            ["languages", "get_list"],
            ["plots", "render"],
            ["plots", "get_formats"],
            ["get_fork_count"],
            ["get_multiple_fork_counts"]
        ];
        RCloud.promisify_paths(rcloud_ocaps, paths);

        rcloud.get_fork_count = rcloud_ocaps.get_fork_countAsync;
        rcloud.get_multiple_fork_counts = rcloud_ocaps.get_multiple_fork_countsAsync;
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

        rcloud.signal_to_compute = function(signal) {
            return rcloud_ocaps.signal_to_computeAsync(signal);
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

        rcloud.call_notebook_unchecked = function(id, version) {
            return rcloud_ocaps.call_notebookAsync(id, version);
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

        rcloud.discovery = {
            get_notebooks: rcloud_ocaps.discovery.get_notebooksAsync,
            get_thumb: rcloud_ocaps.discovery.get_thumbAsync
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
            return rcloud_ocaps.notebook_by_nameAsync(user, path);
        };

        rcloud.get_notebook_info = rcloud_ocaps.get_notebook_infoAsync;
        rcloud.get_multiple_notebook_infos = rcloud_ocaps.get_multiple_notebook_infosAsync;

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
            ["search"],
            ["search_description"],
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
            ["set_notebook_info"],
            ["get_notebook_property"],
            ["set_notebook_property"],
            ["remove_notebook_property"]
        ];
        RCloud.promisify_paths(rcloud_ocaps, paths);

        rcloud.session_init = function(username, token) {
            return rcloud_ocaps.session_initAsync(username, token);
        };

        rcloud.compute_init = function(username, token) {
            return rcloud_ocaps.compute_initAsync(username, token);
        };

        rcloud.update_notebook = function(id, content, is_current) {
            if(is_current === undefined)
                is_current = true;
            return rcloud_github_handler(
                "rcloud.update.notebook",
                rcloud_ocaps.update_notebookAsync(id, content, is_current));
        };

        rcloud.search = rcloud_ocaps.searchAsync; // may be null
        rcloud.search_description = rcloud_ocaps.search_descriptionAsync; // may be null

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
                .then(function(completions) {
                    // convert to the record format ace.js autocompletion expects
                    // meta is what gets displayed at right; name & score might be improved
                    if(completions.values) {
                    if (_.isString(completions.values))
                        completions.values = [completions.values]; // quirk of rserve.js scalar handling
                      return _.map(completions.values,
                                   function(comp) {
                                       return {meta: "local",
                                               name: "library",
                                               score: 3,
                                               position: completions.position,
                                               prefix: completions.prefix,
                                               value: comp
                                              };
                                   });
                    } else {
                      // Handle language extensions that do not provide position of the completion start.
                     if (_.isString(completions))
                        completions = [completions]; // quirk of rserve.js scalar handling
                      return _.map(completions,
                                   function(comp) {
                                       return {meta: "local",
                                               name: "library",
                                               score: 3,
                                               value: comp
                                              };
                                   });
                    }
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
        rcloud.set_notebook_info = function(id, info) {
            if(!info.username) return Promise.reject(new Error("attempt to set info no username"));
            if(!info.description) return Promise.reject(new Error("attempt to set info no description"));
            if(!info.last_commit) return Promise.reject(new Error("attempt to set info no last_commit"));
            return rcloud_ocaps.set_notebook_infoAsync(id, info);
        };
        rcloud.get_notebook_property = rcloud_ocaps.get_notebook_propertyAsync;
        rcloud.set_notebook_property = rcloud_ocaps.set_notebook_propertyAsync;
        rcloud.remove_notebook_property = rcloud_ocaps.remove_notebook_propertyAsync;
    }

    rcloud._ocaps = rcloud_ocaps;
    rcloud.authenticated = rcloud_ocaps.authenticated;
    setup_unauthenticated_ocaps();
    if (rcloud.authenticated)
        setup_authenticated_ocaps();

    return rcloud;
};

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
            rserve.ocap([token, execToken], session_mode, RCloud.version, function(err, ocaps) {
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
                        if(ocaps.rcloud && ocaps.rcloud.hostname)
                            console.log('Connected to rcloud host', ocaps.rcloud.hostname[0]);
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
            shutdown();
        }

        function on_close(msg) {
            if (opts.debug) {
                /*jshint -W087 */
                debugger;
            }
            if (!clean) {
                if(!window.rcloud) // e.g. websocket handshake cancelled
                    RCloud.UI.fatal_dialog("Could not connect to server.", "Retry", window.location.href);
                else if(!rcloud.username()) // anonymous
                    RCloud.UI.fatal_dialog("Your session closed unexpectedly.", "Reload", window.location.href);
                else // logged in
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
                var response = d3.select('#output').selectAll('pre.response').data([msg]);
                response.exit().remove();
                response.enter().append('pre')
                    .attr('class', 'response');
                response
                    .html(d => d);
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

var url_utils = (function() {
  return {
      getQueryParams: function () 
      {
        return (function (a) {
              if (a == "") return {};
              let b = {};
              for (let i = 0; i < a.length; ++i) {
                  let p = a[i].split('=', 2);
                  if (p.length == 1)
                    b[p[0]] = "";
                  else
                    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
              }
              return b;
              })(window.location.search.substr(1).split('&'));
      },
      
      updateHistory: function (params, state) {
        let base = this.getBase();
        let segments = this.getPathSegments();
        let url = this.generateUrlString(base, segments, params);
        let historyState = history.state;
        
        if (!state) {
           window.history.pushState(null, null, url);
        } if (!_.isEqual(state, historyState)) {
           window.history.pushState(state, null, url);
        } else {
           window.history.replaceState(state, null, url);
        }
        return state;
      },
      
      generateUrlString: function (base, segments, params) 
      {
        let sep = '';
        segments = segments || [];
        params = params || {};
        if (!base.endsWith('/') && segments && segments.length > 0) {
          sep = '/';
        }
        let parts = [];
        for (let k in params) {
          if (params[k] !== undefined && params[k] !== null) {
            parts.push(k + '=' + encodeURIComponent(params[k]));
          }
        }

        return base + sep + _.filter(segments, (s) => s !== '').join('/') + '?' + parts.join('&');
      },
      
      getBase: function() 
      {
        return window.location.protocol + '//' + window.location.host;
      },
      
      getPathSegments: function() 
      {
        return _.filter(window.location.pathname.split('/'), (s) => s !== ''); 
      }
  };
})();

var ui_utils = {};

ui_utils.make_url = function(page, opts) {
    opts = opts || {};
    var query_params = url_utils.getQueryParams();
    let segments = [page];

    var base = url_utils.getBase();

    // notebook is a resource so when it changes, any existing query parameters should be cleared up
    if (opts.notebook && opts.notebook !== query_params.notebook) {
      query_params = {};
    }
    else if (opts.new_notebook) {
      query_params = {};
    }
    else {
      // don't override new notebook/version/tag with old
      delete query_params.notebook;
      delete query_params.version;
      delete query_params.tag;
    }

    if (opts.do_path) {
      if (opts.notebook) {
        segments.push(opts.notebook);
        if (opts.version)
          segments.push(opts.version);
      }
      return url_utils.generateUrlString(base, segments, {});
    } else {
      let params = {};
      if (opts.notebook) {
        params.notebook = opts.notebook;
        if (opts.source)
          params.source = opts.source;
        if (opts.tag)
          params.tag = opts.tag;
        else if (opts.version)
          params.version = opts.version;
      } else if (opts.new_notebook) {
        params.new_notebook = true;
      }
      let merged_params = Object.assign(params, query_params);
      return url_utils.generateUrlString(base, segments, merged_params);
    }
    return url;
};

ui_utils.relogin_uri = function(redirect_url) {
  redirect_url = redirect_url || window.location.pathname + window.location.search;
    return window.location.protocol +
        '//' + window.location.host +
        '/login.R?redirect=' +
        encodeURIComponent(redirect_url);
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
    var close_button = $("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>");

    var result = $("<div class='alert alert-danger alert-dismissable'></div>");
    // var text = $("<span></span>");

    result.append(close_button);
    result.append(ui_utils.expandable_error(msg));
    return result;
};

ui_utils.expandable_error = function(msg) {
    var result = $('<div></div>');
    var trace_start = msg.indexOf('R trace:'), details;
    var full_msg = msg;
    if(trace_start !== -1) {
        result.append($("<div></div>").text(msg.slice(0, trace_start)));
        msg = msg.slice(trace_start);
        details = $("<div style='display: none'></div>");
        var shown = false;
        var links = $("<div style='padding-left: 1em'></div>");
        links.append($("<a class='error-link'>expand</a>").click(function() {
            shown = !shown;
            details.toggle(shown);
            $(this).text(shown ? 'collapse' : 'expand');
            RCloud.UI.right_panel.collapse($("#collapse-session-info"), false, false);
        }));
        result.append(links);
        result.append(details);
        if(window.rcloud) rcloud.get_conf_value('support.email').then(function(email) {
            if(!email)
                return;
            var email_error = $("<a class='error-link'>email error</a>");
            email_error.attr('href', 'mailto:' + email +
                             '?subject=' + encodeURIComponent('RCloud error') +
                             '&body=' + encodeURIComponent(full_msg));
            links.append('&emsp;&emsp;', email_error);
        });
    }
    else details = result;
    var detail_text = _.map(msg.split("\n"), function(str) {
        // poor-man replacing 4 spaces with indent
        var el = $("<div></div>").text(str), match;
        if ((match = str.match(/^( {4})+/))) {
            var indent = match[0].length / 4;
            el.css("left", indent +"em");
            el.css("position", "relative");
        }
        return el;
    });
    details.append(detail_text);
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
    //var rows = Math.max(min_rows, Math.min(max_rows, widget.getSession().getScreenLength()));
    var rows = Math.max(min_rows, widget.getSession().getScreenLength());
    var newHeight = lineHeight*rows + widget.renderer.scrollBar.getWidth();
    return newHeight;
};

ui_utils.ace_get_last = function(widget) {
    var session =  widget.getSession(),
        row = session.getLength() - 1,
        column = session.getLine(row).length;

    return {
        row: row,
        column: column
    };
}

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
    var tab_handler = widget.commands.commandKeyBinding.tab;

    widget.commands.removeCommand('gotoline');
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
                var append = shell.new_cell(code, get_language());
                shell.scroll_to_end();
                append.controller.enqueue_execution_snapshot(append.updatePromise);
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
    widget.textInput.setReadOnly(readonly);
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
    function setCaretPosition(position) {
        var range = document.createRange();
        var text_node = elem$.get(0).firstChild;
        range.setStart(text_node, position);
        range.setEnd(text_node, position);
        selectRange(range);
    };
    function getCaretPosition() {
        return window.getSelection().getRangeAt(0);
    };
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
                // allow default action but don't bubble (causing erroneous reselection in notebook tree)
            },
            'keydown.editable': function(e) {
                if(e.keyCode === $.ui.keyCode.ENTER || e.keyCode === $.ui.keyCode.TAB) {
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
                    window.getSelection().removeAllRanges();
                } else if(e.keyCode === $.ui.keyCode.HOME) {
                    setCaretPosition(0);
                } else if(e.keyCode === $.ui.keyCode.END) {
                    setCaretPosition(decode(elem$.text()).length);
                } else if(e.keyCode === $.ui.keyCode.RIGHT) {
                    if(e.ctrlKey || e.altKey) {
                        var afterCaret = elem$.text().substring(getCaretPosition().startOffset);
                        if((afterCaret.match(/ /g) || []).length == 0 || 
                            (afterCaret.match(/ /g) || []).length == 1 && afterCaret[0] == ' ' ||
                            (getCaretPosition().startOffset === 0 && getCaretPosition().endOffset === elem$.text().length)) {
                            e.preventDefault();
                            setCaretPosition(decode(elem$.text()).length);
                        }
                    } else {
                        if(getCaretPosition().startOffset === decode(elem$.text()).length - 1 ||
                            (getCaretPosition().startOffset === 0 && getCaretPosition().endOffset === elem$.text().length)) {
                            setCaretPosition(decode(elem$.text()).length);
                        }
                    }
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

ui_utils.scroll_to_after = function($sel, scroll_opts, $scroller, $offset_elements, scroll_top_offset) {
    // no idea why the plugin doesn't take current scroll into account when using
    // the element parameter version
    var opts = $.extend($.scrollTo.defaults, {'axis':'y'}, scroll_opts);
    if ($sel.length === 0)
        return;
    if(!scroll_top_offset) {
      scroll_top_offset = 0;
    }
    if(!$scroller) {
      $scroller = $sel.parent();
    }
    var elemtoppos = ui_utils.get_top_offset($offset_elements);
    var y = $scroller.scrollTop() + elemtoppos + $sel.position().top + $sel.outerHeight() - scroll_top_offset;
    $scroller.scrollTo(y, opts);
};

ui_utils.get_top_offset = function($offset_elements) {
    var elemtoppos = 0;
    if($offset_elements) {
      $offset_elements.forEach(function(x) {
          elemtoppos += x.position().top;
      });
    }
    return elemtoppos;
};

ui_utils.is_visible_in_scrollable = function($scroller, $offset_elements) {
    if(!$scroller.size())
        return false; // don't scroll
    var height = +$scroller.css("height").replace("px","");
    var elemtoppos = ui_utils.get_top_offset($offset_elements);
    if($($offset_elements[$offset_elements.length-1]).is(":visible")) {
      elemtoppos += $offset_elements[$offset_elements.length-1].outerHeight();
    }
    elemtoppos -= $scroller.get(0).offsetTop;
    return (elemtoppos <= height)
};

ui_utils.scroll_into_view = function($scroller, top_buffer, bottom_buffer, on_complete /* , $elem-offset, $elem-offset ... */) {
    if(arguments.length < 5) {
        console.warn('scroll_into_view needs offset elements');
        return;
    }
    var opts = $.extend($.scrollTo.defaults, { 'axis':'y', 'duration':600 });
    var height = +$scroller.css("height").replace("px","");
    var scrolltop = $scroller.scrollTop();
    if(on_complete) {
      opts.onAfter = function(target, settings) {
        on_complete();
      }
    }

    var elemtop = ui_utils.get_top_offset(Array.prototype.slice.call(arguments, 4));

    if(elemtop > height)
        $scroller.scrollTo( scrolltop + elemtop - height + top_buffer, opts);
    else if(elemtop < 0)
        $scroller.scrollTo( scrolltop + elemtop - bottom_buffer, opts);
    else {
        // no scrolling, so automatically call on_complete if it's defined:
        if(on_complete) {
            on_complete();
        }
    }
};

ui_utils.prevent_backspace = function($doc) {
    // Prevent the backspace key from navigating back.
    // from http://stackoverflow.com/a/2768256/676195
    $doc.unbind('keydown').bind('keydown', function (event) {
        if (event.keyCode === 8) {
            var doPrevent = true;
            var types = ["text", "password", "file", "search", "email", "number", "date", "color", "datetime", "datetime-local", "month", "range", "search", "tel", "time", "url", "week"];
            var d = $(event.srcElement || event.target);
            var disabled = d.prop("readonly") || d.prop("disabled");
            if (!disabled) {
                if (d[0].isContentEditable) {
                    doPrevent = false;
                } else if (d.is("input")) {
                    var type = d.attr("type");
                    if (type) {
                        type = type.toLowerCase();
                    }
                    if (types.indexOf(type) > -1) {
                        doPrevent = false;
                    }
                } else if (d.is("textarea")) {
                    doPrevent = false;
                }
            }
            if (doPrevent) {
                event.preventDefault();
                return false;
            }
        }
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


// loosely based on https://codepen.io/gapcode/pen/vEJNZN
ui_utils.is_ie = function() {
    var ua = window.navigator.userAgent;

    return(ua.indexOf('MSIE ') > 0 ||
           ua.indexOf('Trident/') > 0 ||
           ua.indexOf('Edge/') > 0);
}


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


// copy elements from the notebook, but skip anything .nonselectable
// we have to do this by copying them to an offscreen "buffer" in the DOM
// in order to remove the .nonselectables
ui_utils.select_allowed_elements = function(callback) {
    var sel = window.getSelection();
    var offscreen = $('<div class="offscreen" />'),
        content = $('<pre />');

    offscreen.append(content);
    $('body').append(content);

    for(var i=0; i < sel.rangeCount; ++i) {
        var range = sel.getRangeAt(i);
        content.append(range.cloneContents());
    }

    content.find('.nonselectable').remove();
    // Firefox throws an exception if you try to select children and there are none(!)
    if(content.is(':empty'))
        sel.removeAllRanges();
    else
        sel.selectAllChildren(content[0]);

    window.setTimeout(function() {
        offscreen.remove();
    }, 1000);
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

RCloud.utils.slow_promise = function(promise, sleep) {
    return new Promise(function(resolve, reject) {
        window.setTimeout(function() {
            promise.then(function(result) {
                resolve(result);
            }, function(error) {
                reject(error);
            });
        }, sleep);
    });
};

RCloud.utils.get_url_parameter = function(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
};

RCloud.utils.get_notebook_from_url = function(url) {
    var id = url.match(new RegExp('[?&]notebook=([^&#]*)'));
    return id && id[1];
};

RCloud.utils.clean_r = function(obj) {
    return _.omit(obj, 'r_type', 'r_attributes');
};

RCloud.utils.split_number = function(name) {
    var trnexp = /(\d+)$/;
    
    var res = trnexp.exec(name);
    if(!res) {
       return null;
    }
    
    return [name.slice(0, res.index), res[1]];
};

RCloud.utils.format_date_time_stamp = function(date, diff, is_date_same, for_version, show_terse_dates) {
    function pad(n) { return n<10 ? '0'+n : n; }

    var now = new Date();
    var time_part = '<span class="notebook-time">' + date.getHours() + ':' + pad(date.getMinutes()) + '</span>';
    var date_part = (date.getMonth()+1) + '/' + date.getDate();
    var year_part = date.getFullYear().toString().substr(2,2);

    if(diff < 24*60*60*1000 && is_date_same && show_terse_dates && for_version){
        return time_part;
    } else if(date.getFullYear() === now.getFullYear()) {
        return '<span>' + date_part + ' ' + time_part + '</span>';
    } else {
        return '<span>' + date_part + '/' + year_part + ' ' + time_part + '</span>';
    }
};

RCloud.utils.filter = function(items, conditions) {
    
    _.mixin({
        invokeWith: function() {
            var args = arguments;
            return function(fn) {
                 return fn.apply(null, args);
            };
        }
    });

    if(!_.isArray(items)) {
        items = [items];
    }

    return _.filter(items, _.compose(_.partial(_.all, conditions), _.invokeWith));
    
}

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
        asset_url: function(with_version) {
            var gist = this.parent_model.controller.current_gist();
            var parts = [window.location.protocol + '//' + window.location.host,
                         'notebook.R',
                         gist.id];
            if(with_version)
                parts.push(gist.history[0].version);
            parts.push(this.filename());
            return parts.join('/');
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
    var tab_content = $("<div></div>");
    var filename_span = $("<span style='cursor:pointer'>" + asset_model.filename() + "</span>");
    var remove = ui_utils.fa_button("icon-remove", "remove", '',
                                    { 'position': 'relative',
                                        'left': '2px',
                                        'opacity': '0.75'
                                    }, true);
    var thumb_camera = $('<i class="icon-camera" style="padding-left: 4px; cursor: help;" title="Shown as your notebook\'s thumbnail on the Discover page"></i>');
    tab_content.append(filename_span);
    filename_div.append(tab_content);

    if(is_thumb(asset_model.filename())) {
        tab_content.append(thumb_camera);
    }

    tab_content.append(remove);
    var old_asset_name = filename_span.text();

    var rename_file = function(v) {
        // this is massively inefficient - actually three round-trips to the server when
        // we could have one!  save, create new asset, delete old one
        shell.notebook.controller.save().then(function() {
            var new_asset_name = filename_span.text().trim();
            new_asset_name = new_asset_name.replace(/\s/g, " ");
            var old_asset_content = asset_model.content();
            if (Notebook.is_part_name(new_asset_name)) {
                alert("Asset names cannot start with 'part[0-9]', sorry!");
                filename_span.text(old_asset_name);
                return;
            }

            if(old_asset_name === new_asset_name) {
                filename_span.text(old_asset_name);
            } else {
                if(shell.notebook.model.get_asset(new_asset_name)) {
                    alert('An asset with the name "' + new_asset_name + '" already exists. Please choose a different name.');
                    filename_span.text(old_asset_name);
                } else {
                    shell.notebook.controller
                        .append_asset(old_asset_content, new_asset_name)
                        .spread(function(_, new_controller) {
                            new_controller.select();
                            asset_model.controller.remove(true);

                            if(!is_thumb(old_asset_name) && is_thumb(new_asset_name)) {
                                // wasn't, but now is:
                                thumb_camera.insertBefore(remove);
                            } else if(is_thumb(old_asset_name) && !is_thumb(new_asset_name)) {
                                // was, but now isn't
                                thumb_camera.remove();
                            }
                        });
                }
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
    function is_thumb(filename) {
        return filename === 'thumb.png';
    }
    var editable_opts = {
        change: rename_file,
        select: select,
        validate: function(name) { return editor.validate_name(name); }
    };
    tab_content.click(function() {
        if(!asset_model.active())
            asset_model.controller.select();
    });
    remove.click(function() {
        asset_model.controller.remove();
    });
    var result = {
        filename_updated: function() {
            tab_content.text(asset_model.filename());
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
        is_hidden: function() {
            return asset_model.filename()[0] === '.';
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
var scrollable_area = $('#rcloud-cellarea');

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
    var above_controls_, cell_controls_, left_controls_;
    var edit_mode_; // note: starts neither true nor false
    var highlights_;
    var code_preprocessors_ = []; // will be an extension point, someday
    var running_state_;  // running state
    var autoscroll_notebook_output_;
    var results_processing_context_ = {
      options : {
        no_of_results_in_batch: 20,
        notebook_update_delay : 20,
      },
      results : [],
      stop : false,
      prev_scroll : null,
      result_consumer : null,
      scrolled : false
    };

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
    function set_widget_height(widget_height) {
        outer_ace_div.css('height', widget_height ?
            widget_height : (ui_utils.ace_editor_height(ace_widget_, MIN_LINES) +  EXTRA_HEIGHT_SOURCE) + "px");
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
        above_controls_ = RCloud.UI.cell_commands.decorate('above', cell_commands_above, cell_model, result);
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

            $(':focus').blur();

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
        const markdown = RCloud.language.is_a_markdown(language);
        if(!markdown)
            result.hide_source && result.hide_source(false);
        if(cell_controls_) {
            cell_controls_.controls['language_cell'].set(language);
            cell_controls_.set_flag('markdown', markdown);
        }
        set_background_class(code_div_.find('pre'));
        if(ace_widget_) {
            ace_div.toggleClass('active', true);
            set_background_class(ace_div);
            var LangMode = RCloud.language.ace_mode(language);
            ace_session_.setMode(new LangMode({ suppressHighlighting : false, doc : ace_document_, session : ace_session_, language : language }));
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

    function result_updated() {
        Notebook.Cell.postprocessors.entries('all').forEach(function(post) {
            post.process(result_div_, result);
        });
    }

    function clear_result() {
        result_div_.empty();
        has_result_ = false;
        if(cell_controls_)
            results_button_border(false);
    }
    
    
    function is_in_document() {
      return $.contains(document, notebook_cell_div.get(0));
    }
    
    function is_result_div_visible_in_cellarea() {
        return ui_utils.is_visible_in_scrollable($('#rcloud-cellarea'), [notebook_cell_div, result_div_]);
    }
    
    function scroll() {
        if(!autoscroll_notebook_output_) {
          return;
        }
        var cellarea = $('#rcloud-cellarea');
        
        if(result_div_) {
          var opts = {
            'axis' : 'y',
            'duration' : 0,
            'interrupt' : true,
            'offset' : {top: 10},
          };
          ui_utils.scroll_to_after(result_div_, opts, cellarea, [notebook_cell_div], cellarea.height());
        }
    }
    function consume_result(type, r)  {
          switch(type) {
            case 'selection':
            case 'function_call':
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
            case 'function_call':
                if(_.isFunction(r)) {
                  r(result_div_);
                }
                break;
            case 'deferred_result':
                result_div_.append('<span class="deferred-result">' + r + '</span>');
                break;
            default:
                throw new Error('unknown result type ' + type);
            }
    }
    
    function should_scroll(initial_condition) {
      return initial_condition && !is_result_div_visible_in_cellarea() && !results_processing_context_.scrolled;
    }
      
    function schedule_results_consumer(delay) {
      
        if(!results_processing_context_.stop && results_processing_context_.result_consumer) {
          return;
        }
      
        results_processing_context_.stop = false;
        results_processing_context_.results.length = 0;
        results_processing_context_.result_consumer = function() {
            var counter = 0;
            var scroll_after = is_result_div_visible_in_cellarea();
            results_processing_context_.scrolled = false;
            while(counter < results_processing_context_.options.no_of_results_in_batch) {
              var result = results_processing_context_.results.shift();
              if(!result) {
                break;
              }
              consume_result(result.type, result.result);
              counter++;
              if (should_scroll(scroll_after)) {
                scroll();
              }
            }
            
            if (counter > 0) {
              
              result_updated();
              
              if (should_scroll(scroll_after)) {
                scroll();
              }

              if (is_in_document() && (!results_processing_context_.stop || results_processing_context_.results.length > 0)) {
                window.setTimeout(results_processing_context_.result_consumer, results_processing_context_.options.notebook_update_delay);
              }
              
            } else {
              // no results, let next result re-schedule the consumer
              results_processing_context_.stop = true;
              results_processing_context_.result_consumer = null;
            }
            
        };
        window.setTimeout(results_processing_context_.result_consumer, delay);
    }
    
    function stop_results_consumer(callback) {
      results_processing_context_.stop = true;
      var wait = function() {
        if(is_in_document()) {
          if(results_processing_context_.results.length > 0) {
            setTimeout(wait, results_processing_context_.options.notebook_update_delay);
          } else {
            callback();
          }
        }
      };
      wait();
    }
    
    // start trying to refactor out this repetitive nonsense
    function ace_stuff(div, content, focus) {
        ace.require("ace/ext/language_tools");
        var widget = ace.edit(div[0]);
        var session = widget.getSession();
        widget.$blockScrolling = Infinity;
        widget.setValue(content);
        ui_utils.ace_set_pos(widget, 0, 0); // setValue selects all
        // erase undo state so that undo doesn't erase all
        ui_utils.on_next_tick(function() {
            session.getUndoManager().reset();
        });
        var document = session.getDocument();

        widget.gotoPageUp = function() {
            widget.renderer.layerConfig.height = $('#rcloud-cellarea').height();
            widget.$moveByPage(-1, false);
        };

        widget.gotoPageDown = function() {
            widget.renderer.layerConfig.height = $('#rcloud-cellarea').height();
            widget.$moveByPage(1, false);
        };

        widget.setAutoScrollEditorIntoView = function(enable) {
            if (!enable)
                return;
            var rect;
            var self = widget;
            var shouldScroll = false;
            if (!widget.$scrollAnchor) {
                widget.$scrollAnchor = window.document.createElement("div");
            }
            var scrollAnchor = widget.$scrollAnchor;
            scrollAnchor.style.cssText = "position:absolute;";

            $('#rcloud-cellarea').prepend(scrollAnchor);

            var onChangeSelection = widget.on("changeSelection", function() {
                shouldScroll = true;
            });
            var onBeforeRender = widget.renderer.on("beforeRender", function() {
                if (shouldScroll)
                    rect = self.renderer.container.getBoundingClientRect();
            });
            var onAfterRender = widget.renderer.on("afterRender", function() {
                if (shouldScroll && rect && self.isFocused()) {
                    var renderer = self.renderer;
                    var pos = renderer.$cursorLayer.$pixelPos;
                    var config = renderer.layerConfig;
                    var top = pos.top - config.offset;

                    // shouldScoll  = true  = ^
                    // shouldScroll = false = v
                    if (pos.top >= 0 && top + rect.top < $('#rcloud-cellarea').offset().top) {
                        shouldScroll = true;
                    } else if (pos.top < config.height &&
                        pos.top + rect.top + config.lineHeight > window.innerHeight) {
                        shouldScroll = false;
                    } else {
                        shouldScroll = null;
                    }

                    if (shouldScroll != null) {
                        var ace_div = $(renderer.$cursorLayer.element).closest('.outer-ace-div');
                        var scroll_top = (ace_div.offset().top + $('#rcloud-cellarea').scrollTop()) - $('#rcloud-cellarea').offset().top;
                        scroll_top += pos.top;

                        if(shouldScroll) {
                            $('#rcloud-cellarea').scrollTop(scroll_top);
                        } else {
                            $('#rcloud-cellarea').scrollTop(scroll_top - $('#rcloud-cellarea').height() + config.lineHeight);
                        }
                    }
                    shouldScroll = rect = null;
                }
            });
            widget.setAutoScrollEditorIntoView = function(enable) {
                if (enable)
                    return;
                delete widget.setAutoScrollEditorIntoView;
                widget.removeEventListener("changeSelection", onChangeSelection);
                widget.renderer.removeEventListener("afterRender", onAfterRender);
                widget.renderer.removeEventListener("beforeRender", onBeforeRender);
            };
        };

        widget.setOptions({
            enableBasicAutocompletion: true,
            autoScrollEditorIntoView: true,
            highlightActiveLine: focus,
            highlightGutterLine: focus
        });
        if(!focus)
            widget.renderer.$cursorLayer.element.style.display = "none";
        widget.on('focus', function() {
            widget.setOptions({
                highlightActiveLine: true,
                highlightGutterLine: true
            });
            widget.renderer.$cursorLayer.element.style.display = null;
        });
        widget.on('blur', function() {
            widget.setOptions({
                highlightActiveLine: false,
                highlightGutterLine: false
            });
            widget.getSelection().clearSelection();
            widget.renderer.$cursorLayer.element.style.display = "none";
        });

        widget.setTheme("ace/theme/chrome");
        session.setNewLineMode('unix');
        session.setOption('indentedSoftWrap', false);
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

    function create_edit_widget(focus) {
        if(ace_widget_) return;

        var aaa = ace_stuff(ace_div, cell_model.content(), focus);
        ace_widget_ = aaa.widget;
        ace_session_ = aaa.session;
        ace_document_ = aaa.document;

        ace_session_.on('change', function() {
            set_widget_height();
            ace_widget_.resize();
        });

        ace_widget_.resize();

        ace_widget_.commands.removeCommand('findnext');
        ace_widget_.commands.removeCommand('findprevious');
        ui_utils.install_common_ace_key_bindings(ace_widget_, function() {
            return language;
        });

        var left_handler = ace_widget_.commands.commandKeyBinding.left,
            right_handler = ace_widget_.commands.commandKeyBinding.right,
            up_handler = ace_widget_.commands.commandKeyBinding.up,
            down_handler = ace_widget_.commands.commandKeyBinding.down;

        ace_widget_.commands.addCommands([{
            name: 'executeCell',
            bindKey: {
                win: 'Alt-Return',
                mac: 'Alt-Return',
                sender: 'editor'
            },
            exec: function() {
                result.execute_cell();
            }
        }, {
            name: 'executeCellsFromHere',
            bindKey: {
                win: 'Shift-Alt-Return',
                mac: 'Shift-Alt-Return',
                sender: 'editor'
            },
            exec: function() {
                shell.run_notebook_from(cell_model.id());
            }
        }, {
            name: 'up',
            bindKey: {
                win: 'up',
                mac: 'up'
            },
            exec: function(widget, args, request) {

                var cursor_position = ace_widget_.getCursorPosition();
                var use_default = true;

                if(cursor_position.row === 0 && cursor_position.column === 0) {
                    var prior_cell = cell_model.parent_model.prior_cell(cell_model);

                    if(prior_cell) {
                        prior_cell.set_focus();

                        var prior_widget = prior_cell.views[0].ace_widget();
                        var last = ui_utils.ace_get_last(prior_widget);
                        prior_widget.gotoLine(last.row + 1, 0);

                        use_default = false;
                    }
                }

                if(use_default)
                    up_handler.exec(widget, args, request);
            }
        }, {
            name: 'down',
            bindKey: {
                win: 'down',
                mac: 'down'
            },
            exec: function(widget, args, request) {
                var use_default = true;

                var cursor_position = ace_widget_.getCursorPosition();
                var last = ui_utils.ace_get_last(ace_widget_);

                if(cursor_position.row == last.row && cursor_position.column === last.column) {
                    use_default = false;

                    var subsequent_cell = cell_model.parent_model.subsequent_cell(cell_model);

                    if(subsequent_cell) {
                        subsequent_cell.set_focus();

                        subsequent_cell.views[0].ace_widget()
                            .gotoLine(1, 0);
                    }
                }

                if(use_default)
                    down_handler.exec(widget, args, request);

            }
        }, {
            name: 'navigateToPreviousCell',
            bindKey: {
                win: 'Ctrl-Shift-,',
                mac: 'Ctrl-Shift-,',
                sender: 'editor'
            },
            exec: function() {
                var prior_cell = cell_model.parent_model.prior_cell(cell_model);

                if(prior_cell) {
                    prior_cell.set_focus();
                }
            }
        }, {
            name: 'navigateToNextCell',
            bindKey: {
                win: 'Ctrl-Shift-.',
                mac: 'Ctrl-Shift-.',
                sender: 'editor'
            },
            exec: function() {
                var subsequent_cell = cell_model.parent_model.subsequent_cell(cell_model);

                if(subsequent_cell) {
                    subsequent_cell.set_focus();
                }
            }
        }, {
            name: 'insertCellBefore',
            bindKey: {
                win: 'Ctrl-[',
                mac: 'Cmd-[',
                sender: 'editor'
            },
            exec: function() {
                var insert = shell.insert_cell_before("", cell_model.language(), cell_model.id());
                insert.updatePromise.then(function() {
                    insert.controller.edit_source(true);
                });
            }
        }, {
            name: 'insertCellAfter',
            bindKey: {
                win: 'Ctrl-]',
                mac: 'Cmd-]',
                sender: 'editor'
            },
            exec: function() {
                var insert = shell.insert_cell_after("", cell_model.language(), cell_model.id());
                insert.updatePromise.then(function() {
                    insert.controller.edit_source(true);
                });
            }
        }, {
            name: 'blurCell',
            bindKey: {
                win: 'Escape',
                mac: 'Escape',
                sender: 'editor'
            },
            exec: function() {
                ace_widget_.blur();
            }
        }, {
            name: 'executeAll',
            bindKey: {
                win: 'Ctrl-Shift-Enter',
                mac: 'Ctrl-Shift-Enter',
                sender: 'editor'
            },
            exec: function() {
                RCloud.UI.run_button.run();
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
        var history_ = RCloud.UI.prompt_history();
        var change_prompt = ui_utils.ignore_programmatic_changes(input_widget_, history_.change.bind(history_));

        ui_utils.customize_ace_gutter(input_widget_, function(i) {
            return i===0 ? prompt_text_ : '';
        });
        var up_handler = input_widget_.commands.commandKeyBinding.up,
            down_handler = input_widget_.commands.commandKeyBinding.down;
        input_widget_.commands.addCommands([
            {
                name: 'enter',
                bindKey: 'Return',
                exec: function(ace_widget, args, request) {
                    var input = ace_widget.getValue();
                    result.add_result('code', _.unescape(prompt_text_) + input + '\n');
                    if(input_kont_)
                        input_kont_(null, input);
                    if(input.length)
                        history_.add_entry(input);
                    input_div_.hide();
                    window.clearInterval(input_anim_);
                    input_anim_ = null;
                }
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
                    }
                }
            }
        ]);
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
        if(cell_controls_ && cell_controls_.controls['edit'])
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
                if(changed)
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
            if(running_state_==="unknown" && state==="running") {
                state = "unknown-running";
                has_result_ = false;
            }
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
            schedule_results_consumer(results_processing_context_.options.notebook_update_delay);
            this.toggle_results(true); // always show when updating
            
            results_processing_context_.results.push({
              type : type,
              result : r
            });

        },
        end_output: function(error) {
            if(!has_result_) {
                // the no-output case
                result_div_.empty();
                has_result_ = true;
            }
            var that = this;
            stop_results_consumer(function() {
              that.state_changed(error ? 'error' : running_state_==='unknown-running' ? 'unknown' : 'complete');
              current_result_ = current_error_ = null;
            });
            
        },
        clear_result: clear_result,
        set_readonly: function(readonly) {
            am_read_only_ = readonly;
            if(ace_widget_)
                ui_utils.set_ace_readonly(ace_widget_, readonly );
            [cell_controls_, above_controls_, left_controls_].forEach(function(controls) {
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
        set_autoscroll_notebook_output: function(whether) {
            autoscroll_notebook_output_ = whether;
        },
        on_scroll : function(event) {
          if(results_processing_context_.prev_scroll) {
            results_processing_context_.scrolled = (results_processing_context_.prev_scroll > event.currentTarget.scrollTop);
          }
          results_processing_context_.prev_scroll = event.currentTarget.scrollTop;
        },
        click_to_edit: click_to_edit,

        //////////////////////////////////////////////////////////////////////

        execute_cell: function() {
            cell_model.controller.enqueue_execution_snapshot(cell_model.parent_model.controller.save());
        },
        toggle_edit: function() {
            return this.edit_source(!edit_mode_);
        },
        edit_mode: () => edit_mode_,
        edit_source: function(edit_mode, event, focus) {
            if(focus === undefined) focus = true;
            if(edit_mode === edit_mode_) {
                if(edit_mode && focus)
                    ace_widget_.focus();
                return;
            }
            if(edit_mode) {

                var offset = scrollable_area.scrollTop();

                if(cell_controls_)
                    edit_button_border(true);
                if(RCloud.language.is_a_markdown(language))
                    this.hide_source(false);
                var editor_height = code_div_.height();
                code_div_.hide();
                create_edit_widget(focus);
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
                set_widget_height(editor_height);
                ace_widget_.resize(true);
                if(cell_controls_)
                    cell_controls_.set_flag('edit', true);
                outer_ace_div.show();
                ace_widget_.resize(); // again?!?
                if(focus)
                    ace_widget_.focus();
                if(event) {

                    scrollable_area.scrollTop(offset);

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
        scroll_into_view: function() {
            var renderer = ace_widget_.renderer;
            var rect = renderer.container.getBoundingClientRect();
            var pos = renderer.$cursorLayer.$pixelPos;
            var config = renderer.layerConfig;
            var top = pos.top - config.offset;

            // shouldScroll  = true  = ^
            // shouldScroll = false = v
            if (pos.top >= 0 && top + rect.top < $('#rcloud-cellarea').offset().top) {
                shouldScroll = true;
            } else if (pos.top < config.height &&
                pos.top + rect.top + config.lineHeight > window.innerHeight) {
                shouldScroll = false;
            } else {
                shouldScroll = null;
            }

            if (shouldScroll != null) {
                var ace_div = $(renderer.$cursorLayer.element).closest('.outer-ace-div');
                var scroll_top = (ace_div.offset().top + $('#rcloud-cellarea').scrollTop()) - $('#rcloud-cellarea').offset().top;
                scroll_top += pos.top;

                if(shouldScroll) {
                    $('#rcloud-cellarea').scrollTop(scroll_top);
                } else {
                    $('#rcloud-cellarea').scrollTop(scroll_top - $('#rcloud-cellarea').height() + config.lineHeight);
                }
            }
        },
        is_a_markdown: () => RCloud.language.is_a_markdown(language),
        is_in_view: function() {
            const $cellarea = $('#rcloud-cellarea'),
                  scrollrect = $cellarea[0].getBoundingClientRect(),
                  height = scrollrect.bottom - scrollrect.top,
                  rect = notebook_cell_div[0].getBoundingClientRect();
            const result = rect.top < scrollrect.top + height && rect.bottom > scrollrect.top;
            return result;
        },
        toggle_source: function() {
            return !this.hide_source($(source_div_).is(":visible"));
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
            return whether;
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
            schedule_results_consumer(results_processing_context_.options.notebook_update_delay);
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
                d3.select(input_div_[0])
                    .style('border-color', dir ? '#ffac88' : '#E34234')
                    .transition()
                    .duration(1000)
                    .style('border-color', dir ? '#E34234' : '#ffac88');
                dir = !dir;
            };
            switch_color();
            input_anim_ = window.setInterval(switch_color, 1000);
            if(!autoscroll_notebook_output_)
                ui_utils.scroll_into_view($('#rcloud-cellarea'), 100, 100, null, notebook_cell_div, input_div_);
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
        get_selection: function() {
            return this.ace_widget().getSession().doc.getTextRange(this.ace_widget().selection.getRange());
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
            if(above_controls_)
                above_controls_.set_flag('first', !cell_model.parent_model.prior_cell(cell_model));
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
                                    ui_utils.scroll_into_view($('#rcloud-cellarea'), 100, 100, null, notebook_cell_div, ace_div, hl);
                            }, 0);
                        }
                    });
            }
            else {
                assign_code();
                var $active = code_div_.find('.find-highlight.active, .find-highlight.activereplaced');
                if($active.size())
                    ui_utils.scroll_into_view($('#rcloud-cellarea'), 100, 100, null, notebook_cell_div, code_div_, $active);

            }
            return this;
        },
        select_highlight_range: function(begin, end) {
            this.edit_source(true);
            var ace_range = ui_utils.ace_range_of_character_range(ace_widget_, begin, end);
            ace_widget_.getSelection().setSelectionRange(ace_range);
        }
    });

    result.edit_source(false);
    return result;
}

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
        get_execution_snapshot: function(versionPromise) {
            console.assert(versionPromise);
            // freeze the cell as it is now, to execute it later
            var language = this.language() || 'Text'; // null is a synonym for Text
            return {
                controller: this.controller,
                json_rep: this.json(),
                partname: Notebook.part_name(this.id(), language),
                language: language,
                versionPromise: versionPromise
            };
        },
        set_focus: function() {
            this.notify_views(function(view) {
                view.edit_source(true);
                view.scroll_into_view(true);
            });
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
        hide_cell_result: function() {
            this.notify_views(function(view) {
              view.toggle_results(false);
            });
            return false;
        },
        show_cell_result: function() {
            this.notify_views(function(view) {
              view.toggle_results(true);
            });
            return true;
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
    function update_version(notebook) {
        return notebook.history[0].version;
    }
    var result = {
        enqueue_execution_snapshot: function(updatePromise) {
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
                        function_call: appender('function_call'),
                        in: this.get_input.bind(this, 'in')
                    };
            }
            var context_id = RCloud.register_output_context(execution_context_);
            that.set_run_state("waiting");
            that.edit_source(false);
            var snapshot = cell_model.get_execution_snapshot(updatePromise.then(update_version));
            RCloud.UI.processing_queue.enqueue(
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
        process: function(div, cell) {
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
                      cell.add_result('function_call', function(result_div) {
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
                });
        }
    },
    mathjax: {
        sort: 3000,
        process: function(div) {
            // typeset the math
            // why does passing the div as last arg not work, as documented here?
            // http://docs.mathjax.org/en/latest/typeset.html
            if (!_.isUndefined(window.MathJax))
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
    var autoscroll_notebook_output_;
    var cellarea_ = $('#rcloud-cellarea'), last_top_, STOP_DY = 100;
    function on_rearrange() {
        _.each(result.sub_views, function(view) {
            view.check_buttons();
        });
    }

    function init_cell_view(cell_view) {
        cell_view.set_readonly(model.read_only() || shell.is_view_mode());
        cell_view.set_show_cell_numbers(show_cell_numbers_);
        cell_view.set_autoscroll_notebook_output(autoscroll_notebook_output_);
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
        asset_appended: function(asset_model, new_asset_index) {
            var asset_view = Notebook.Asset.create_html_view(asset_model);
            asset_model.views.push(asset_view);
            if(new_asset_index === undefined){
              $("#asset-list").append(asset_view.div());
              this.asset_sub_views.push(asset_view);
            } else {
              this.asset_sub_views.splice(new_asset_index, 0, asset_view);
              $('#asset-list').find('li:eq(' + new_asset_index + ')').after(asset_view.div());
            }
            asset_view.div().toggleClass('hidden-asset',
                                         !model.show_hidden_assets() && asset_model.controller.is_hidden());
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
        set_autoscroll_notebook_output: function(whether) {
            autoscroll_notebook_output_ = whether;
            _.each(this.sub_views, function(view) {
                view.set_autoscroll_notebook_output(whether);
            });
        },
        show_hidden_assets: function(showhidden) {
            this.asset_sub_views.forEach(function(asset_view) {
                asset_view.div().toggleClass('hidden-asset', asset_view.div()[0].innerText[0] === '.' && !showhidden);
            });
            if(!showhidden && RCloud.UI.scratchpad.current_model &&
               RCloud.UI.scratchpad.current_model.controller.is_hidden()) {
                RCloud.UI.scratchpad.current_model.controller.deselect();
                RCloud.UI.scratchpad.set_model(null);
            }
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
        },
        on_scroll: function(event) {
          if(autoscroll_notebook_output_) {
              _.each(this.sub_views, function(view) {
                view.on_scroll(event);
              });
          }
        },
        auto_activate: function(event) {
            if(shell.notebook.model.read_only()) return;
            const top = cellarea_.scrollTop(), dy = Math.abs(top - last_top_);
            if(last_top_ !== undefined && dy < STOP_DY) {
                model.cells.map(cm => cm.views[0])
                    .filter(cv => cv.is_in_view())
                    .filter(cv => {
                        if(!cv.is_a_markdown()) return true;
                        if(cv.autoactivate_once) return false;
                        return cv.autoactivate_once = true;
                    })
                    .forEach(cv => cv.edit_source(true, null, false));
            }
            last_top_ = top;
        },
        load_options() {
            return rcloud.config.get_user_option(['autoactivate-cells', 'show-hidden-assets']).then(function(opts) {
                let auto = opts['autoactivate-cells'],
                    showhidden = opts['show-hidden-assets'];
                auto = auto===null || auto; // default true
                if(auto) {
                    model.auto_activate(true);
                    RCloud.UI.cell_commands.add({
                        edit: {
                            area: 'cell',
                            sort: 3000,
                            display_flags: ['markdown'],
                            create: function(cell_model, cell_view) {
                                return RCloud.UI.cell_commands.create_button("icon-edit borderable", "toggle source", () => {
                                    if(cell_view.toggle_source())
                                        cell_view.edit_source(true);
                                });
                            }
                        }
                    });
                    window.setInterval(result.auto_activate, 100);
                }
                model.show_hidden_assets(showhidden);
            });
        }
    };
    model.views.push(result);
    cellarea_.on('scroll', function(event) { result.on_scroll(event); });
    return result;
};

// these functions in loops are okay
/*jshint -W083 */
Notebook.create_model = function()
{
    var readonly_ = false,
        show_hidden_assets_,
        auto_activate_,
        user_ = "",
        last_selected_ = undefined;

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

            var new_asset_index = this.assets.findIndex(function(a2) {
                return asset_model.change_object().filename.localeCompare(
                    a2.change_object().filename, undefined, {sensitivity: 'base'}) <= 0;
            });
            if(new_asset_index < 0)
                this.assets.push(asset_model);
            else
                this.assets.splice(new_asset_index, 0, asset_model);

            if(!skip_event)
                _.each(this.views, function(view) {
                    view.asset_appended(asset_model, new_asset_index);
                });
            return changes;
        },
        cell_count: function() {
            return this.cells.length;
        },
        selected_count: function() {
            return _.filter(this.cells, function(cell) { return cell.is_selected(); }).length;
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
        hide_selected_cells_results: function() {
            if(!this.get_selected_cells().length) {
              _.each(this.cells, function(cell) {
                  cell.hide_cell_result();
              });
            } else {
              _.each(this.get_selected_cells(), function(cell) {
                  cell.hide_cell_result();
              });
            }
        },
        show_selected_cells_results: function() {
            if(!this.get_selected_cells().length) {
              _.each(this.cells, function(cell) {
                  cell.show_cell_result();
              });
            } else {
              _.each(this.get_selected_cells(), function(cell) {
                  cell.show_cell_result();
              });
            }
        },
        clear_all_selected_cells: function() {
            _.each(this.cells, function(cell) {
                cell.deselect_cell();
            });
            RCloud.UI.selection_bar.update(this.cells);
        },
        get_selected_cells: function() {
            return this.cells.filter(function(cell) { return cell.is_selected(); });
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
        can_crop_cells: function() {
            return this.selected_count() && this.selected_count() !== this.cell_count();
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
                last_selected_ = post_index;
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
        subsequent_cell: function(cell_model) {
            var index = this.cells.indexOf(cell_model);
            if(index < this.cells.length - 1)
                return this.cells[index + 1];
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

            var select_range = function(lower, upper) {
                clear_all();
                var items = [];
                for(var loop = lower; loop <= upper; loop++) {
                    that.cells[loop].select_cell();
                }
            };

            if(modifiers.is_toggle) {
                cell_model.toggle_cell();
                last_selected_ = this.cells.indexOf(cell_model);
            } else if(modifiers.is_exclusive) {
                var the_only_selected = cell_model.is_selected() && this.get_selected_cells().length === 1;
                clear_all();
                if(!the_only_selected) {
                  cell_model.toggle_cell();
                  last_selected_ = this.cells.indexOf(cell_model);
                } else {
                  last_selected_ = undefined;
                }
            } else /* is_range */ {

                var start = this.cells.indexOf(cell_model),
                    end = last_selected_;

                select_range(Math.min(start, end), Math.max(start, end));
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
        auto_activate: function(autoactivate) {
            if(autoactivate !== undefined)
                auto_activate_ = autoactivate;
            return auto_activate_;
        },
        show_hidden_assets: function(showhidden) {
            if(showhidden !== undefined) {
                show_hidden_assets_ = showhidden;
                _.each(this.views, function(view) {
                    view.show_hidden_assets(showhidden);
                });
            }
            return show_hidden_assets_;
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
        current_update_,
        notebook_dirty_ = false,
        session_dirty_ = false,
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
                    notebook_dirty_ = false;
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

    function is_collaborator(notebook, user) {
        return notebook.collaborators && notebook.collaborators.find(function(c) { return c.login === user; });
    }

    function on_load(version, notebook) {
        // the git backend should determine readonly but that's another huge refactor
        // and it would require multiple usernames, which would be a rather huge change
        var ninf;
        if(!shell.is_view_mode()) {
            ninf = editor.get_notebook_info(notebook.id);
        }
        var is_read_only = ninf && ninf.source ||
                version !== null ||
                (notebook.user.login !== rcloud.username() && !is_collaborator(notebook, rcloud.username())) ||
                shell.is_view_mode();

        current_gist_ = notebook;
        current_update_ = Promise.resolve(notebook);
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
                asset_controller = asset_controller || (model.show_hidden_assets() || !result.is_hidden()) && result;
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
    // back to what we are presently displaying (current_gist_) or from to_notebook
    // if this has been specified;
    function find_changes_from(notebook, to_notebook) {
        function change_object(obj) {
            obj.name = function(n) { return n; };
            return obj;
        }
        var changes = [];

        // notebook files, current files
        var nf = notebook.files,
            cf = _.extend({}, to_notebook ? to_notebook.files : current_gist_.files); // dupe to keep track of changes

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
            return current_update_;
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
        current_update_ = rcloud.update_notebook(gistname, gist)
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
        // return RCloud.utils.slow_promise(current_update_, 5000);
        return current_update_;
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
        if(!notebook_dirty_) {
            var saveb = RCloud.UI.navbar.control('save_notebook');
            saveb && saveb.enable();
            notebook_dirty_ = true;
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
        session_dirty: function(_) {
            if(arguments.length) {
                session_dirty_ = _;
                return this;
            }
            return session_dirty_;
        },
        append_asset: function(content, filename, user_appended) {
            var cch = append_asset_helper(content, filename, user_appended);
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
        selected_count: function() {
            return model.selected_count();
        },
        append_cell: function(content, type, id) {
            var cch = append_cell_helper(content, type, id);
            return {
                controller: cch.controller,
                updatePromise: update_notebook(refresh_buffers().concat(cch.changes))
                    .then(default_callback())
            };
        },
        insert_cell: function(content, type, id) {
            var cch = insert_cell_helper(content, type, id);
            return {
                controller: cch.controller,
                updatePromise: update_notebook(refresh_buffers().concat(cch.changes))
                    .then(default_callback())
            };
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
        get_selected_cells: function() {
            return model.get_selected_cells();
        },
        crop_cells: function() {
            if(!this.can_crop_cells())
                return Promise.resolve(null);

            var changes = refresh_buffers().concat(model.crop_cells());
            RCloud.UI.command_prompt.focus();
            return update_notebook(changes)
                .then(default_callback());
        },
        can_crop_cells: function() {
            return model.can_crop_cells();
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
        hide_cells_results: function() {
            model.hide_selected_cells_results();
        },
        show_cells_results: function() {
            model.show_selected_cells_results();
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
            function crunch_quotes(left, right, language) {
                var begin = new RegExp("^```{" + language.toLowerCase() + "}");
                var end = /```\n$/;
                if(end.test(left) && begin.test(right))
                    return left.replace(end, '') + right.replace(begin, '');
                else return left + right;
            }
            function create_code_block(language, content) {
              return '```{' + language.toLowerCase()+ '}\n' + opt_cr(content) + '```\n';
            }
            // note we have to refresh everything and then concat these changes onto
            // that.  which won't work in general but looks like it is okay to
            // concatenate a bunch of change content objects with a move or change
            // to one of the same objects, and an erase of one
            var new_content, changes = refresh_buffers();

            var RMARKDOWN = "RMarkdown";
            var MARKDOWN = "Markdown";

            function isMarkdown(language) {
              var MARKDOWN_CELLS = [MARKDOWN.toLowerCase(), RMARKDOWN.toLowerCase()];
              return MARKDOWN_CELLS.indexOf(language.toLowerCase()) >= 0;
            }

            // this may have to be multiple dispatch when there are more than two languages
            if(prior.language() === cell_model.language()) {
                new_content = crunch_quotes(opt_cr(prior.content()),
                                            cell_model.content(), prior.language());
                prior.content(new_content);
                changes = changes.concat(model.update_cell(prior));
            } else {
                if(!isMarkdown(prior.language()) && !isMarkdown(cell_model.language())) {
                    // Different languages are combined, none of them is markdown
                    new_content = create_code_block(prior.language(), prior.content()) +
                                                create_code_block(cell_model.language(), cell_model.content());
                    changes = changes.concat(model.change_cell_language(prior, MARKDOWN));
                    changes[changes.length-1].content = new_content;
                } else {
                    if(isMarkdown(prior.language()) && isMarkdown(cell_model.language())) {
                      // Rmarkdown and markdown cells get joined - RMarkdown wins
                      new_content = crunch_quotes(opt_cr(prior.content()),
                                                  cell_model.content(),
                                                  RMARKDOWN);
                      changes = changes.concat(model.change_cell_language(prior, RMARKDOWN));
                    } else if(isMarkdown(prior.language())) {
                      new_content = opt_cr(prior.content()) +
                                    create_code_block(cell_model.language(), cell_model.content());
                    } else {
                      new_content = create_code_block(prior.language(), prior.content()) +
                                    opt_cr(cell_model.content());
                      changes = changes.concat(model.change_cell_language(prior, cell_model.language()));
                    }
                }
                prior.content(new_content);
                changes = changes.concat(model.update_cell(prior));
            }
            _.each(prior.views, function(v) { v.clear_result(); v.hide_source(false); });
            changes = changes.concat(model.remove_cell(cell_model));
            return update_notebook(changes)
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
        pull_and_replace_notebook: function(from_notebook) {
            if(from_notebook.files['encrypted.notebook.content.bin.b64'])
                return Promise.reject(new Error("Can't pull from encrypted notebook"));
            model.read_only(false);
            var changes = find_changes_from(current_gist_, from_notebook);
            return apply_changes_and_load(changes, shell.gistname());
        },
        merge_notebook: function(changes) {
            return apply_changes_and_load(changes, shell.gistname());
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
            if(!notebook_dirty_)
                return Promise.resolve(current_update_);
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
            session_dirty_ = true;
            rcloud.record_cell_execution(info.json_rep);
            var cell_eval = rcloud.authenticated ? rcloud.authenticated_cell_eval : rcloud.session_cell_eval;
            return info.versionPromise.then(function(version) {
                return cell_eval(context_id, info.partname, info.language, version, false).then(execute_cell_callback);
            });
        },
        run_all: function() {
            var updatePromise = this.save();
            _.each(model.cells, function(cell_model) {
                cell_model.controller.enqueue_execution_snapshot(updatePromise);
            });
            return updatePromise;
        },
        run_from: function(cell_id) {
            var process = false;
            var updatePromise = this.save();
            _.each(model.cells, function(cell_model) {
                if(process || cell_model.id() === cell_id) {
                    process = true;
                    cell_model.controller.enqueue_execution_snapshot(updatePromise);
                }
            });
            return updatePromise;
        },
        run_cells: function(cell_ids) {
            var updatePromise = this.save();
            _.each(model.cells, function(cell_model) {
                if(cell_ids.indexOf(cell_model.id()) > -1) {
                    cell_model.controller.enqueue_execution_snapshot(updatePromise);
                }
            });
            return updatePromise;
        },
        show_cell_numbers: function(whether) {
            _.each(model.views, function(view) {
                view.set_show_cell_numbers(whether);
            });
            return this;
        },
        autoscroll_notebook_output: function(whether) {
            _.each(model.views, function(view) {
                view.set_autoscroll_notebook_output(whether);
            });
            return this;
        },
        //////////////////////////////////////////////////////////////////////

        is_mine: function() {
            return rcloud.username() === model.user() || is_collaborator(this.current_gist(), rcloud.username());
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

Notebook.read_from_file = function(file, opts) {
    var notebook, 
        fr = new FileReader();
        opts = _.defaults(opts, {
            on_load_end: $.noop,
            on_error: $.noop,
            on_notebook_parse_complete: $.noop
        });

    fr.onloadend = function(e) {
        
        opts.on_load_end();

        try {
            notebook = JSON.parse(fr.result);

            if(!notebook.description) {
                opts.on_error('Invalid notebook format: has no description');
                return;
            }
            else if(!notebook.files || _.isEmpty(notebook.files)) {
                opts.on_error('Invalid notebook format: has no files');
                return;
            }

            notebook = Notebook.sanitize(notebook);
            opts.on_notebook_parsed(notebook);
        }
        catch(x) {
            opts.on_error('Invalid notebook format: couldn\'t parse JSON');
        }
    };

    fr.readAsText(file);
};

RCloud.discovery_model = function () {

    var notebooks_ = {};

    function clean_r(obj) {
        delete obj.r_attributes;
        delete obj.r_type;
        return obj;
    }

    return {
        get_notebooks : function(anonymous, notebook_ids) {

            var promise;
            notebook_ids = _.filter(notebook_ids, function(id) { return id.length && id[0] !== 'r'; });

            // get only the items that we don't currently have:
            var ids = _.difference(notebook_ids, Object.keys(notebooks_));

            if(ids.length) {

                promise = Promise.all([
                    rcloud.get_multiple_notebook_infos(ids),
                    rcloud.stars.get_multiple_notebook_star_counts(ids),
                    anonymous ? Promise.resolve([]) : rcloud.stars.get_my_starred_notebooks(),
                    rcloud.get_multiple_fork_counts(ids)
                ]).spread(function(notebooks, stars, my_starred_notebooks, forks) {
                    notebooks = clean_r(notebooks);

                    // populate #stars/forks whether or not we got results
                    Object.keys(notebooks).forEach(function(id) {
                        notebooks[id].stars = stars[id] || 0;
                        notebooks[id].forks = forks[id] || 0;
                    });

                    _.extend(notebooks_, notebooks);

                    // has the current user starred it?
                    _.each(my_starred_notebooks, function(id) {
                        if(notebooks_[id])
                            notebooks_[id].is_starred_by_me = true;
                    });
                });

            } else {
                promise = Promise.resolve();
            }

            return promise.then(function() {
                return _.pick(notebooks_, notebook_ids);
            });
        }
    };
}();

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

// a gist id is 20 or 32 chars of hex
Notebook.valid_gist_id = function(str) {
    return str.match(/^[a-f0-9]*$/i) !== null &&
        [20,32].indexOf(str.length) !== -1;
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

    if(oob_sends[v[0]])
        oob_sends[v[0]].apply(null, v.slice(1));
    else console.log("unknown OOB send arrived: ['"+v[0]+"']" + (oob_sends[v[0]]?'':' (unhandled)'));
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
        rclient.post_response(hello[0]);
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
    not_first: function() {
        this.first_session_ = false;
        return Promise.resolve(undefined);
    },
    // FIXME rcloud.with_progress is part of the UI.
    reset: function(redirect_url) {
        this.first_session_ = false;
        this.listeners.forEach(function(listener) {
            listener.on_reset();
        });
        on_connect_error_handler = build_on_connect_error_handler(redirect_url);
        return RCloud.UI.with_progress(function() {
            var anonymous = rclient.allow_anonymous_;
            rclient.close();
            return rclient_promise(anonymous, on_connect_error_handler);
        });
    },
    init: function(allow_anonymous, on_connect_error_handler) {
        this.first_session_ = true;
        on_connect_error_handler = build_on_connect_error_handler();
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
            var mode = (languages_[language] && languages_[language].ace_mode) || languages_.Text.ace_mode;
            return (ace.require(mode) || ace.require(languages_.Text.ace_mode)).Mode; 
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
            return langs_.slice(); // protect internal state
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

        var use_filenames = false, replace_filenames = {};
        if(options.filenames && options.files.length === options.filenames.length) {
            use_filenames = true;
            for(var loop = 0; loop < options.filenames.length; loop++) {
                replace_filenames[options.files[loop].name] = options.filenames[loop];
            }
        }

        return RCloud.utils.promise_sequence(
            options.files,
            function(file) {
                if(file.size > 2.5e6)
                    return Promise.reject(new Error('File ' + file.name + ' rejected: maximum asset size is 2.5MB'));
                return text_or_binary_reader()(file)
                    .then(function(content) {
                        if(_.isString(content) && Notebook.empty_for_github(content))
                            throw new Error("empty");
                        return upload_asset(use_filenames ? replace_filenames[file.name] : file.name, content);
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

RCloud.UI = Object.assign({}, RCloud.UI);
RCloud.UI.tree = Object.assign({}, RCloud.UI.tree);
RCloud.UI.addons = Object.assign({}, RCloud.UI.addons);

RCloud.UI.event = (function(sender) {

    var event = function(sender) {
        this._sender = sender;
        this._listeners = [];
    }

    event.prototype = {
        attach : function (listener) {
            this._listeners.push(listener);
        },
        notify : function (args) {
            var index;

            for (index = 0; index < this._listeners.length; index += 1) {
                this._listeners[index](this._sender, args);
            }
        }
    };

    return event;

})();

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
                    disabled_reason: "The notebook source does not support a web interface",
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
                        
                        if(result === null) {
                          return;
                        }
                        
                        if(!result || result.trim() === "") {
                          alert('Please provide Notebook ID.');
                        } else {
                          shell.open_from_github(result);
                        }
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
                    disabled_reason: "You can't publish someone else's notebook",
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
                    action(control, e);
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
                    above: {
                        filter: RCloud.extension.filter_field('area', 'above')
                    },
                    cell: {
                        filter: RCloud.extension.filter_field('area', 'cell')
                    },
                    prompt: {
                        filter: RCloud.extension.filter_field('area', 'prompt')
                    },
                    left: {
                        filter: RCloud.extension.filter_field('area', 'left')
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
                            var insert = shell.insert_cell_before("", cell_model.language(), cell_model.id());
                            insert.controller.edit_source(true);
                        });
                    }
                },
                join: {
                    area: 'above',
                    sort: 2000,
                    enable_flags: ['modify'],
                    display_flags: ['!first'],
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
                            cell_view.edit_source(true);
                        });
                    }
                },
                run: {
                    area: 'cell',
                    sort: 2000,
                    create: function(cell_model, cell_view) {
                        return that.create_button("icon-play", "run", function(control, e) {
                            if(e.shiftKey) {
                                shell.run_notebook_from(cell_model.id());
                            } else {
                                cell_view.execute_cell();
                            }
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
                remove: {
                    area: 'cell',
                    sort: 5000,
                    enable_flags: ['modify'],
                    create: function(cell_model) {
                        return that.create_button("icon-trash", "remove", function() {
                            cell_model.parent_model.controller.remove_cell(cell_model);
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
            return create_command_set(area, div, cell_model, cell_view);
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
    $(sel_accordion).data('collapsible-column', result);
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
            collapsibles().on('shown.bs.collapse', function() {  
                 var iframes = $(this).find('iframe');
                 if (iframes) {
                   for (var i = 0; i < iframes.length; i++) {
                    var iframe = iframes.get(i);
                    if(iframe.contentDocument && iframe.contentDocument.location) {
                      iframe.contentDocument.location.reload(true);
                    }
                   }
                 }
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
                $el = $('#' + id);

                var fixed_header = $el.find(".panel-fixed-header");

                if(fixed_header.length) {
                    var header_height = fixed_header.outerHeight();
                    $el.find('.panel-scrollable-content').height(heights[id] - header_height);
                } else {
                    $el.find(".panel-body").height(heights[id]);                        
                }

                //$el.find(".panel-body").height(heights[id]);                                        

                $el.trigger('panel-resize');
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
            $(sel_collapser).attr('title', 'Expand Pane');
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
            $(sel_collapser).attr('title', 'Collapse Pane');
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
        fixed_header$ = body$.find('.panel-fixed-header'),
        scrollable_content$ = body$.find('.panel-scrollable-content'),
        padding = el$.outerHeight() - el$.height() +
            body$.outerHeight() - body$.height() + 
            (fixed_header$.length ? scrollable_content$.outerHeight() - scrollable_content$.height() : 0);
    return padding;
};

RCloud.UI.collapsible_column.default_sizer = function(el) {
    var el$ = $(el),
        $izer = el$.find(".widget-vsize"),
        height = $izer.height(); 
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
        command_bar_ = null,
        ace_widget_,
        ace_session_;

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
        widget.$blockScrolling = Infinity;
        ace_widget_ = widget;
        set_ace_height();
        var RMode = ace.require("ace/mode/r").Mode;
        var session = widget.getSession();
        ace_session_ = session;
        var doc = session.doc;
        widget.setOptions({
            enableBasicAutocompletion: true
        });
        session.on('change', set_ace_height);

        widget.setTheme("ace/theme/chrome");
        session.setNewLineMode('unix');
        session.setOption('indentedSoftWrap', false);
        session.setUseWrapMode(true);
        widget.resize();
        var change_prompt = ui_utils.ignore_programmatic_changes(widget, history_.change.bind(history_));
        function execute(widget, args, request) {
            var code = session.getValue();
            if(code.length) {
                RCloud.UI.command_prompt.history().add_entry(code);
                var append = shell.new_cell(code, language_);
                shell.scroll_to_end();
                append.controller.enqueue_execution_snapshot(append.updatePromise);
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
            var prop = history_.init(shell.gistname());
            if(!_.contains(RCloud.language.available_languages(), prop.lang)) {
              var default_lang = RCloud.language.available_languages()[0];
              console.error("Language " + prop.lang + " is not available. Using " + default_lang + " to restore prompt widget.");
              prop = {cmd: '', lang: default_lang};
            }
            change_prompt(prop.cmd);
            result.language(prop.lang);
            var r = last_row(widget);
            ui_utils.ace_set_pos(widget, r, last_col(widget, r));
        }

        function set_language(language) {
            var LangMode = RCloud.language.ace_mode(language);
            session.setMode(new LangMode({ suppressHighlighting : false, doc : session.doc, session : session, language : language }));
            widget.focus();
        }

        ui_utils.install_common_ace_key_bindings(widget, result.language.bind(result));

        var up_handler = widget.commands.commandKeyBinding.up,
            down_handler = widget.commands.commandKeyBinding.down;
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
            }, {
            name: 'blurCell',
                bindKey: {
                    win: 'Escape',
                    mac: 'Escape'
                },
                exec: function() {
                    ace_widget_.blur();
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
                            var append = shell.new_cell("", language_);
                            append.controller.edit_source(true);
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
            history_ = RCloud.UI.prompt_history();
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
        },
        ace_widget: function() {
            return ace_widget_;
        },
        get_selection: function() {
            if(!show_prompt_) {
                return undefined;
            } else {
                return ace_session_.doc.getTextRange(ace_widget_.selection.getRange());
            }
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
        RCloud.UI.find_replace.hide_replace();
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
var default_button_;
var ignore_button_;
var action_;

RCloud.UI.fatal_dialog = function(message, label, href_or_function) { // no href -> just close
    $('#loading-animation').hide();
    action_ = href_or_function;
    if (_.isUndefined(fatal_dialog_)) {
        default_button_ = $("<button type='submit' class='btn btn-primary' style='float:right'>" + label + "</span>");
        ignore_button_ = $("<span class='btn' style='float:right'>Ignore</span>");
        var body = $('<div />')
                .append('<h1>Aw, shucks</h1>');
        message_ = $('<p style="white-space: pre-wrap"></p>');
        message_.append(ui_utils.expandable_error(message));
        body.append(message_, default_button_);
        body.append(ignore_button_);
        body.append('<div style="clear: both;"></div>');
        default_button_.click(function(e) {
            e.preventDefault();
            if(_.isString(action_))
                window.location = action_;
            else if(_.isFunction(action_)) {
                fatal_dialog_.modal("hide");
                action_();
            }
            else
                fatal_dialog_.modal("hide");
        });
        ignore_button_.click(function() {
            fatal_dialog_.modal("hide");
        });
        fatal_dialog_ = $('<div id="fatal-dialog" class="modal fade" />')
            .append($('<div class="modal-dialog" />')
                    .append($('<div class="modal-content" />')
                            .append($('<div class="modal-body" />')
                                    .append(body))));
        $("body").append(fatal_dialog_);
        fatal_dialog_.on("shown.bs.modal", function() {
            default_button_.focus();
        });
    }
    fatal_dialog_.modal({keyboard: false});
};

})();

RCloud.UI.find_replace = (function() {

    var find_dialog_ = null, regex_,
        find_form_, find_details_,
        find_input_, find_match_, match_index_, match_total_, replace_input_, replace_stuff_,
        match_case_opt_, match_word_opt_,
        find_next_, find_last_, replace_next_, replace_all_, close_,
        highlights_shown_ = false, replace_mode_ = false,
        find_cycle_ = null, replace_cycle_ = null,
        has_focus_ = false,
        matches_ = [], active_match_,
        change_interval_,
        regex_group = 0,
        replace_shown_ = false;

    function toggle_find_replace(replace, opts) {
        if(_.isUndefined(opts)) {
            opts = {};
        }

        function find_next_on_keycode(e) {
            if(e.keyCode===$.ui.keyCode.ENTER || (!ui_utils.is_a_mac() && e.keyCode === 114 /* f3 */)) {
                e.preventDefault();
                e.stopPropagation();
                if(e.shiftKey)
                    find_previous();
                else
                    find_next();
                return false;
            }
            return undefined;
        }
        replace_shown_ = replace;

        var dialog_was_shown = find_dialog_ && find_dialog_.css("display") !== 'none';
        if(!find_dialog_) {

            var markup = $(_.template(
                $("#find-in-notebook-snippet").html()
            )({}));

            $('#middle-column').prepend(markup);

            find_dialog_ = $(markup.get(0));
            find_form_ = markup.find('#find-form');
            find_details_ = markup.find('#find-details');
            find_input_ = markup.find('#find-input');
            match_case_opt_ = markup.find('#match-case-opt');
            match_word_opt_ = markup.find('#match-word-opt');
            var find_options_menu_ = markup.find('#find-options-menu');
            find_match_ = markup.find('#match-status');
            match_index_ = markup.find('#match-index');
            match_total_ = markup.find('#match-total');
            find_next_ = markup.find('#find-next');
            find_last_ = markup.find('#find-last');
            replace_input_ = markup.find('#replace-input');
            replace_next_ = markup.find('#replace');
            replace_all_ = markup.find('#replace-all');
            replace_stuff_ = markup.find('.replace');
            close_ = markup.find('#find-close');

            var close_bootstrap_dropdowns = function(e) {
                var dropdowns = $('.dropdown-menu');
                dropdowns.each(function(i, x) {
                  if($(x).is(":visible")) {
                    $(x.parentElement).find(".dropdown-toggle").dropdown('toggle');
                  }
                });
            };
            
            var toggle_highlight_details_menu_button = function(option) {
                if(option.get(0).checked) {
                  $('#find-options-menu > .btn').addClass('active');
                } else {
                  $('#find-options-menu > .btn').removeClass('active');
                }
            };
            
            find_input_.on('change', function(e) {
                e.preventDefault();
                e.stopPropagation();
                generate_matches();
            });
            find_options_menu_.on('hide.bs.dropdown', function (e) {
                var target = $(e.target);
                var keepOpenElements = target.find("[data-keepOpen='true']");
                if (keepOpenElements.length) {
                    keepOpenElements.each(function(i, x) { $(x).attr("data-keepOpen", false); });
                    return false;
                } else {
                    return true;
                }
            });
            
            find_options_menu_.find(".checkbox").on('click', function(e) {
                $(this).attr("data-keepOpen", true);
            });
            
            match_case_opt_.on('change', function(e) {
                toggle_highlight_details_menu_button(match_case_opt_);
                generate_matches();
            });
            
            match_word_opt_.on('change', function(e) {
                toggle_highlight_details_menu_button(match_word_opt_);
                generate_matches();
            });

            find_details_.click(function() { find_input_.focus(); });
            find_input_.click(function(e) { 
              e.stopPropagation(); 
              close_bootstrap_dropdowns();
            }); // click cursor

            // disabling clear results on blur for firefox, since its implementation
            // is either the only unbroken one or the only broken one (unclear)
            if(navigator.userAgent.toLowerCase().indexOf('firefox') === -1) {
                find_form_.on('focusout', function(e) {
                    setTimeout(function() {

                        if($(document.activeElement).closest(find_form_).length === 0) {
                            has_focus_ = false;
                            clear_highlights();
                        }
                    }, 100);
                });

                find_form_.on('focusin', function(e) {
                    if(!has_focus_) {
                        // save so that any new content since last save is matched:
                        shell.save_notebook();

                        generate_matches(find_input_.data('searchagain') ? active_match_ : undefined);

                    }

                    has_focus_ = true;
                });
            }

            find_next_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                close_bootstrap_dropdowns();
                find_next();
                return false;
            });

            find_last_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                close_bootstrap_dropdowns();
                find_previous();
                return false;
            });

            replace_next_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                close_bootstrap_dropdowns();
                replace_next();
            });

            replace_all_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                close_bootstrap_dropdowns();
                replace_all();
                return false;
            });

            find_cycle_ = ['find-input', 'find-last', 'find-next'];
            replace_cycle_ = ['find-input', 'find-last', 'find-next', 'replace-input', 'replace', 'replace-all'];

            find_cycle_.push('find-close');
            replace_cycle_.push('find-close');

            find_input_.keydown(find_next_on_keycode);
            replace_input_.keydown(find_next_on_keycode);

            find_form_.keydown(function(e) {
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
                    hide_dialog();
                }
                return undefined;
            });

            find_form_.find('input').focus(function() {
                window.setTimeout(function() {
                    this.select();
                }.bind(this), 0);
            });

            close_.click(function() {
                hide_dialog();
            });
        }

        find_dialog_.show();

        if(replace)
            replace_stuff_.show();
        else
            replace_stuff_.hide();

        if(!change_interval_) {
            change_interval_ = setInterval(function() {
                // get the value:
                var old_value = find_input_.data('value'),
                    new_value = find_input_.val();

                if(new_value !== old_value) {
                    generate_matches();
                    find_input_.data('value', new_value);
                }
            }, 250);
        }

        if(!highlights_shown_) {
            var active_cell_selection = get_active_cell_selection();
            if(active_cell_selection !== null) {
                find_input_.val(active_cell_selection);
            } else {
                ui_utils.select_allowed_elements();
                var text = window.getSelection().toString();

                if(text) {
                    find_input_.val(text);
                }
            }
        }

        generate_matches(opts.search_again ? active_match_ : undefined);

        if(opts && opts.search_again) {

            // get the cursor index:
            var cursor_details = get_active_cell_cursor_details(opts.next);

            if(matches_.length && cursor_details) {

                var match_index, found_match;

                found_match = _.find(matches_, function(match) {
                    return (match.index === cursor_details.cell_index && match.begin >= cursor_details.cursor_index) ||
                        match.index > cursor_details.cell_index;

                });

                if(found_match) {
                    match_index = matches_.findIndex(function(match) {
                        return match.begin === found_match.begin &&
                            match.end === found_match.end &&
                            match.index === found_match.index;
                    });

                    if(opts.previous) {
                        match_index = match_index - 1;

                        if(match_index < 0) {
                            match_index = matches_.length - 1;
                        }
                    }

                } else if(matches_.length) {
                    // no match from this point on:
                    if(opts.next) {
                        match_index = 0;
                    } else {
                        match_index = matches_.length - 1;
                    }
                }

                generate_matches(match_index);
            }

        }

        if(highlights_shown_) {
            if(opts.next) {
                find_next();
            } else if(opts.previous) {
                find_previous();
            }
        }

        if(replace && dialog_was_shown) {
            replace_input_.focus();
        } else {
            find_input_.focus();
        }

        highlights_shown_ = true;
        replace_mode_ = replace;
    }

    function generate_matches(match_index) {
        active_match_ = undefined;
        findOpts = {
          filter : find_input_.val(),
          matchCase : match_case_opt_.get(0).checked,
          matchWord : match_word_opt_.get(0).checked
        };
        build_regex(findOpts);
        highlight_all();

        if(find_input_.val().length) {
            active_match_ = _.isUndefined(match_index) ? 0 : match_index;
            show_matches();
            active_transition('activate');
        } else {
            active_match_ = undefined;
            hide_matches();
        }

        var current_match;

        if(matches_.length === 0) {
            current_match = '0';
        } else if(!_.isUndefined(match_index)) {
            current_match = (match_index + 1).toString();
        } else {
            current_match = '1';
        }

        // matches_
        find_match_[matches_.length === 0 ? 'addClass' : 'removeClass']('no-matches');
        show_match_details(current_match, matches_.length);
    }

    function matches_exist() {
        return matches_.length !== 0 && !isNaN(active_match_);
    }

    function hide_matches() {
        find_match_.css('visibility', 'hidden');
    }

    function show_matches() {
        find_match_.css('visibility', 'visible');
    }

    function show_match_details(match_index, match_total) {
        match_index_.text(match_index);
        match_total_.text(match_total);
    }

    function clear_highlights() {
        hide_matches();
        active_match_ = undefined;
        build_regex(null);
        highlight_all();
        highlights_shown_ = false;
    }
    function hide_dialog() {

        if(!shell.notebook.model.read_only()) {
            var current_match = matches_[active_match_];

            if(current_match && shell.notebook.model.cells[current_match.index]) {
                var view = shell.notebook.model.cells[current_match.index].views[0];
                view.select_highlight_range(current_match.begin, current_match.end);
            }
        }

        // if search again is invoked after the dialog is hidden:
        find_input_.data('searchagain', find_input_.val());

        clearInterval(change_interval_);
        change_interval_ = null;
        clear_highlights();
        find_dialog_.hide();
    }
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
    function escapeRegExp(string) {
        // regex option will skip this
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    function build_regex(findOpts) {
        if(!(findOpts && findOpts.filter && findOpts.filter.length > 0)) {
          regex_ = null;
          return;
        }
        var modifiers = "g";
        if(!findOpts.matchCase) {
          modifiers = modifiers + "i";
        }
        var filter = escapeRegExp(findOpts.filter);
        regex_group = 0;
        if(findOpts.matchWord) {
          filter = "\\b(" + filter + ")\\b";
          regex_group = 1;
        }
        regex_ = new RegExp(filter, modifiers);
    }
    function update_match_cell(match) {
        var matches = matches_.filter(function(m) { return m.filename === match.filename; });
        shell.notebook.model.cells[match.index].notify_views(function(view) {
            view.change_highlights(matches);
        });
    }
    function get_focussed_cell() {
        var focussed_cell = _.find(shell.notebook.model.cells, function(cell) {
            return !_.isUndefined(cell.views[0].ace_widget()) && cell.views[0].ace_widget().textInput.isFocused();
        });

        if(focussed_cell) {
            // find the index of the cell:
            for(var loop = 0; shell.notebook.model.cells.length; loop++) {
                if(shell.notebook.model.cells[loop].filename() === focussed_cell.filename()) {
                    focussed_cell.index = loop;
                    break;
                }
            }
        }

        return focussed_cell;
    }
    function get_active_cell_cursor_details(use_end) {
        var focussed_cell = get_focussed_cell();

        if(!focussed_cell) {
            return undefined;
        }

        var widget = focussed_cell.views[0].ace_widget();
        var sel = widget.getSelectionRange();
        return {
            cell_index: focussed_cell.index,
            cursor_index: widget.session.doc.positionToIndex(use_end ? sel.end : sel.start)
        };
    }
    function get_active_cell_selection() {
        var focussed_cell = get_focussed_cell();

        if(focussed_cell) {
            return focussed_cell.views[0].get_selection();
        }

        // command prompt inactive for view:
        if(RCloud.UI.command_prompt.ace_widget() && RCloud.UI.command_prompt.ace_widget().textInput.isFocused())
            return RCloud.UI.command_prompt.get_selection();

        return null;
    }
    function active_transition(transition) {
        if(matches_exist()) {
            var match = matches_[active_match_];

            if(match) {
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
    }
    function highlight_cell(cell) {
        var matches = [];
        if(regex_) {
            var content = cell.content(), match;
            while((match = regex_.exec(content))) {
              var shift = match[0].indexOf(match[regex_group]);
                matches.push({
                    begin: match.index + shift,
                    end: match.index+match[regex_group].length + shift,
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
    function find_next(reason) {
        active_transition(reason || 'deactivate');

        if(matches_exist()) {
            active_match_ = (active_match_ + matches_.length + 1) % matches_.length;
            show_match_details(active_match_ + 1, matches_.length);
        } else {
            active_match_ = 0;
        }

        active_transition('activate');
    };
    function find_previous() {
        active_transition('deactivate');

        if(matches_exist()) {
            active_match_ = (active_match_ + matches_.length - 1) % matches_.length;
            show_match_details(active_match_ + 1, matches_.length);
        } else {
            active_match_ = 0;
        }

        active_transition('activate');
    };
    function replace_next() {
        if(matches_exist()) {
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
    };
    function replace_current() {
        if(!matches_exist())
            return null;

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
    function replace_all() {
        if(matches_exist()) {
            active_transition('deactivate');
            replace_rest();
        }
        else
            replace_everywhere(find_input_.val(), replace_input_.val());
        return false;
    };
    function replace_everywhere(find, replace) {
        // gw: I can't figure out how this will ever get hit (how would we not have
        // matches?), but I obviously thought we needed completely different logic for this
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
            RCloud.UI.shortcut_manager.add([{
                category: 'Search/Replace',
                id: 'notebook_find',
                description: 'Find text',
                keys: {
                    mac: [
                        ['command', 'f']
                    ],
                    win: [
                        ['ctrl', 'f']
                    ]
                },
                action: function() {
                    toggle_find_replace(false);
                }
            }, {
                category: 'Search/Replace',
                id: 'notebook_find_next',
                description: 'Find text (next)',
                keys: {
                    mac: [
                        ['command', 'g']
                    ],
                    win: [
                        ['ctrl', 'g'],
                        ['f3']
                    ]
                },
                action: function() {
                    toggle_find_replace(false, {
                        next: true,
                        search_again: true
                    });
                }
            }, {
                category: 'Search/Replace',
                id: 'notebook_find_previous',
                description: 'Find text (previous)',
                keys: {
                    mac: [
                        ['command', 'shift', 'g']
                    ],
                    win: [
                        ['ctrl', 'shift', 'g'],
                        ['shift', 'f3']
                    ]
                },
                action: function() {
                   toggle_find_replace(false, {
                        previous: true,
                        search_again: true
                   });
                }
            }, {
                category: 'Search/Replace',
                id: 'notebook_replace',
                description: 'Replace text',
                keys: {
                    mac: [
                        ['command', 'option', 'f']
                    ],
                    win: [
                        ['ctrl', 'h']
                    ]
                },
                modes: ['writeable'],
                action: function() { toggle_find_replace(!shell.notebook.model.read_only()); }
            }, {
                category: 'Search/Replace',
                id: 'notebook_replace_text_match',
                description: 'Replace next match',
                keys: {
                    win_mac: [
                        ['alt', 'r']
                    ]
                },
                modes: ['writeable'],
                element_scope: '#find-form',
                action: function() {
                    if(replace_shown_) {
                        replace_next();
                    }
                }
            }, {
                category: 'Search/Replace',
                id: 'notebook_replace_text_all',
                description: 'Replace all matches',
                keys: {
                    win_mac: [
                        ['alt', 'a']
                    ]
                },
                modes: ['writeable'],
                element_scope: '#find-form',
                action: function() {
                    if(replace_shown_) {
                        replace_all();
                    }
                }
            }, {
                category: 'Search/Replace',
                id: 'notebook_goto_previous_match',
                description: 'Go to previous search match',
                keys: {
                    mac: [
                        ['shift', 'enter']
                    ],
                    win: [
                        ['shift', 'enter'],
                        ['shift', 'f3']
                    ]
                }
            }, {
                category: 'Search/Replace',
                id: 'notebook_goto_next_match',
                description: 'Go to next search match',
                keys: {
                    mac: [
                        ['enter']
                    ],
                    win: [
                        ['enter'],
                        ['f3']
                    ]
                }
            }]);
        },
        hide_replace: function() {
            if(replace_stuff_) {
                replace_stuff_.hide();
            }
        },
        clear_highlights: function() {
            clear_highlights();
        }
    };
    return result;
})();

RCloud.UI.shortcut_manager = (function() {

    var extension_;

    function get_by_id(id) {
        return _.find(extension_.sections.all.entries, function(s) {
            return s.id === id;
        });
    };

    function modify(ids, func) {
        if (!_.isArray(ids)) {
            ids = [ids];
        }

        _.each(ids, function(id) {
            var shortcut = get_by_id(id);
            if (shortcut) {
                func(shortcut);
            }
        });
    };

    function is_active(shortcut) {
        return shortcut.enabled && 
            _.contains(shortcut.modes, shell.notebook.model.read_only() ? 'readonly' : 'writeable') &&
            _.contains(shortcut.on_page, shell.is_view_mode() ? 'view' : 'edit') &&
            (!_.isFunction(shortcut.is_active) || (_.isFunction(shortcut.is_active) && shortcut.is_active()));
    }

    function convert_extension(shortcuts) {
        var shortcuts_to_add, obj = {};
        var existing_shortcuts = extension_.sections.all.entries;

        if (!_.isArray(shortcuts)) {
            shortcuts_to_add = [shortcuts];
        } else {
            shortcuts_to_add = shortcuts;
        }

        _.each(shortcuts_to_add, function(shortcut) {

            var can_add = true;

            var shortcut_to_add = _.defaults(shortcut, {
                category: 'General',
                modes: ['writeable', 'readonly'],
                on_page: ['view', 'edit'],
                ignore_clash: false,
                enable_in_dialogs: false,
                enabled: true
            });

            // clean-up:
            var is_mac = ui_utils.is_a_mac();

            if(shortcut.keys) {
                if (shortcut.keys.hasOwnProperty('win_mac')) {
                    shortcut.bind_keys = shortcut.keys.win_mac;
                } else {
                    shortcut.bind_keys = shortcut.keys[is_mac ? 'mac' : 'win'];
                }
            }

            // click keys, click on target + keys:
            if (shortcut.click_keys) {
                if(shortcut.click_keys.hasOwnProperty('win_mac')) {
                    shortcut.click_keys.keys = shortcut.click_keys.win_mac;
                } else if(shortcut.click_keys.hasOwnProperty('win') || shortcut.click_keys.hasOwnProperty('mac')) {
                    // optional for click_keys:
                    shortcut.click_keys.keys = shortcut.click_keys[is_mac ? 'mac' : 'win'];
                }
            }

            // if this is a shortcut that needs to be added:
            if ((shortcut.bind_keys && shortcut.bind_keys.length) || 
                shortcut.click_keys) {

                shortcut_to_add.key_desc = [];

                // construct the key bindings:
                if(shortcut.bind_keys) {
                    for (var i = 0; i < shortcut.bind_keys.length; i++) {

                        // ensure consistent order across definitions:
                        var bind_keys = _
                            .chain(shortcut.bind_keys[i])
                            .map(function(element) {
                                return element.toLowerCase(); })
                            .sortBy(function(element) {
                                var rank = {
                                    "command": 1,
                                    "ctrl": 2,
                                    "shift": 3
                                };
                                return rank[element];
                            }).value();

                        // so that they can be compared:
                        shortcut_to_add.key_desc.push(bind_keys.join('+'));
                    }
                }

                // with existing shortcuts:
                if (!shortcut_to_add.ignore_clash) {
                    for (var loop = 0; loop < existing_shortcuts.length; loop++) {

                        if (existing_shortcuts[loop].ignore_clash)
                            continue;

                        if (_.intersection(existing_shortcuts[loop].key_desc, shortcut_to_add.key_desc).length > 0) {
                            console.warn('Keyboard shortcut "' + shortcut_to_add.description +
                                '" cannot be registered because its keycode clashes with an existing shortcut id "' +
                                existing_shortcuts[loop].id + '" in the "' + existing_shortcuts[loop].category + '" category.');
                            can_add = false;
                            break;
                        }
                    }
                }

                if (can_add) {

                    if (_.isUndefined(shortcut.action)) {
                        shortcut_to_add.create = function() {};
                    } else {
                        shortcut_to_add.create = function() {
                            _.each(shortcut_to_add.key_desc, function(binding) {

                                var func_to_bind = function(e) {

                                    if (is_active(get_by_id(shortcut_to_add.id))) {
                                        
                                        // anything that means the shortcut shouldn't be active?
                                        var enable = true;

                                        if(!shortcut.enable_in_dialogs && $('.modal').is(':visible')) {
                                            enable = false;
                                        }

                                        if(shortcut.element_scope) {

                                            var parent_element = $(shortcut.element_scope);
                                            var focus_element = $(':focus');

                                            if(parent_element.length && focus_element.length) {
                                                enable = $.contains(parent_element.get(0), focus_element.get(0));
                                            } else {
                                                enable = false;
                                            }
                                        }

                                        if(enable) {
                                            e.preventDefault();
                                            shortcut.action(e);
                                        }
                                    }
                                };

                                if (shortcut_to_add.global) {
                                    window.Mousetrap.bindGlobal(binding, func_to_bind);
                                } else {
                                    window.Mousetrap().bind(binding, func_to_bind);
                                }
                            });
                        }
                    }

                    if (can_add) {
                        obj[shortcut.id] = shortcut_to_add;

                        // add to the existing shortcuts so that it can be compared:
                        existing_shortcuts.push(shortcut_to_add);
                    }

                }
            }
        });

        return obj;
    };

    var result = {

        init: function() {

            // based on https://craig.is/killing/mice#api.stopCallback
            window.Mousetrap.prototype.stopCallback = function(e, element, combo) {

                //console.log(e, element, combo);

                // this only executes if the shortcut is *not* defined as global
                var search_values = ['mousetrap', 'ace_text-input'],
                    has_modifier = e.metaKey || e.ctrlKey || e.altKey || e.keyCode === 114; /* f3, special case */

                // allow the event to be handled:
                if (has_modifier && search_values.some(function(v) {
                        return (' ' + element.className + ' ').indexOf(' ' + v + ' ') > -1;
                    }))
                    return false;

                // prevent on form fields and content editables:
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
            if (extension_) {
                extension_.add(convert_extension(s));
            }

            return this;
        },
        load: function() {
            if (extension_) {
                extension_.create('all');
            }
        },
        disable: function(ids) {
            modify(ids, function(s) {
                s.enabled = false;
            });
        },
        disable_all: function() {
            this.disable(_.pluck(extension_.sections.all.entries, 'id'));
        },
        enable: function(ids) {
            modify(ids, function(s) {
                s.enabled = true;
            });
        },
        get_registered_shortcuts_by_category: function(sort_items) {

            var rank = _.map(sort_items, (function(item, index) {
                return { key: item, value: index + 1 } }));
            rank = _.object(_.pluck(rank, 'key'), _.pluck(rank, 'value'));

            var available_shortcuts = _.filter(_.sortBy(extension_.sections.all.entries, function(shortcut) {
                    return shortcut.category + shortcut.description; }),
                function(s) {
                    return is_active(s); });

            return _.sortBy(_.map(_.chain(available_shortcuts).groupBy('category').value(), function(item, key) {
                return { category: key, shortcuts: item };
            }), function(group) {
                return rank[group.category];
            });
        }
    };

    return result;
})();

RCloud.UI.shortcut_dialog = (function() {

    var shortcuts_by_category_ = [];

    var result = {

        show: function() {

            $('#loading-animation').hide();

            var template_data = [];

            if(shortcuts_by_category_) {
                shortcuts_by_category_ = RCloud.UI.shortcut_manager.get_registered_shortcuts_by_category([
                'Code Editor',
                'Code Prompt',
                'Cell Management',
                'Notebook Management',
                'Search/Replace',
                'General']);
            }

            var get_key = function(key) {
                var replacement =  _.findWhere([
                    { initial: 'option', replace_with: 'opt' },
                    { initial: 'command', replace_with: 'cmd' }
                ], { initial : key });
              
                return replacement ? replacement.replace_with : key;
            };

            _.each(shortcuts_by_category_, function(group) {

                var key_group = {
                    name: group.category,
                    shortcuts: []
                };

                _.each(group.shortcuts, function(shortcut) {

                    var current_shortcut = {
                        description : shortcut.description,
                        keys: []
                    };
 
                    _.each(shortcut.bind_keys, function(keys) {
                        keys = _.map(keys, function(key) { 
                            return get_key(key);
                        });
                        current_shortcut.keys.push(keys.join(' '));
                    });

                    if(shortcut.click_keys) {
                        current_shortcut.keys.push({
                            keys: _.map(shortcut.click_keys.keys, function(key) { return get_key(key); }).join(' '),
                            target: shortcut.click_keys.target
                        });
                    }

                    key_group.shortcuts.push(current_shortcut);

                });

                template_data.push(key_group);
            });

            var content_template = _.template(
                $("#shortcut_dialog_content_template").html()
            );

            var dialog_content = content_template({
                categories : template_data
            });

            $('#shortcut-content').html(dialog_content);
       
            $('#shortcut-dialog').modal({
                keyboard: false
            });
        }
    };

    return result;

})();

RCloud.UI.ace_shortcuts = (function() {

    var result = {
        init: function() {

            var ace_shortcuts = [{
                category: 'Code prompt',
                id: 'code_prompt_execute',
                description: 'Create cell and execute code',
                keys: { 
                    win_mac: [
                        ['enter'], ['alt', 'enter']
                    ]
                }
            }, {
                category: 'Code prompt',
                id: 'code_prompt_history_back',
                description: 'Go back in code history',
                keys: { 
                    win_mac: [
                        ['up']
                    ]
                }
            }, {
                category: 'Code prompt',
                id: 'code_prompt_history_forwards',
                description: 'Go forwards in code history',
                keys: { 
                    win_mac: [
                        ['down']
                    ]
                }
            }, {                           
                category: 'Code Editor',
                id: 'code_editor_execute',
                description: 'Execute code',
                keys: { 
                    win_mac: [
                        ['alt', 'enter']
                    ]
                }
            }, {
                category: 'Code Editor',
                id: 'code_editor_autocomplete',
                description: 'Suggest autocompletion',
                keys: { 
                    win_mac: [
                        ['ctrl', '.'], ['tab']
                    ]
                }
            }, {
                category: 'Code Editor',
                id: 'code_editor_execute_selection_or_line',
                description: 'Execute selection or line',
                keys: { 
                    mac: [
                        ['command', 'enter'] 
                    ],
                    win: [
                        ['ctrl', 'enter']
                    ]
                }
            }, {
                category: 'Code Editor',
                id: 'code_editor_cursor_start_of_line',
                description: 'Cursor at beginning of line',
                keys: { 
                    mac: [
                        ['ctrl', 'a'] 
                    ]
                },
            }, {
                category: 'Code Editor',
                id: 'code_editor_cursor_end_of_line',
                description: 'Cursor at end of line',
                keys: { 
                    mac: [
                        ['ctrl', 'e'] 
                    ]
                }
            },

            // line operations:
            {
                category: 'Code Editor',
                id: 'ace_remove_line',
                description: 'Remove line',
                keys: { 
                    mac: [
                        ['cmd', 'd'] 
                    ],
                    win: [
                        ['ctrl', 'd']
                    ]
                }
            },          
            {
                category: 'Code Editor',
                id: 'ace_copy_lines_down',
                description: 'Copy lines down',
                keys: { 
                    mac: [
                        ['cmd', 'option', 'down'] 
                    ],
                    win: [
                        ['alt', 'shift', 'down']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_remove_line',
                description: 'Copy lines up',
                keys: { 
                    mac: [
                        ['cmd', 'option', 'up'] 
                    ],
                    win: [
                        ['alt', 'shift', 'up']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_move_lines_down',
                description: 'Move lines down',
                keys: { 
                    mac: [
                        ['option', 'down'] 
                    ],
                    win: [
                        ['alt', 'down']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_move_lines_up',
                description: 'Move lines up',
                keys: { 
                    mac: [
                        ['option', 'up'] 
                    ],
                    win: [
                        ['alt', 'up']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_remove_to_line_end',
                description: 'Remove to line end',
                keys: { 
                    mac: [
                        ['ctrl', 'k'] 
                    ],
                    win: [
                        ['alt', 'delete']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_remove_to_line_start',
                description: 'Remove to line start',
                keys: { 
                    mac: [
                        ['cmd', 'backspace'] 
                    ],
                    win: [
                        ['alt', 'backspace']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_remove_word_left',
                description: 'Remove word left',
                keys: { 
                    mac: [
                        ['option', 'backspace'],
                        ['ctrl', 'option', 'backspace']
                    ],
                    win: [
                        ['ctrl', 'backspace']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_remove_word_right',
                description: 'Remove word right',
                keys: { 
                    mac: [
                        ['option', 'delete'] 
                    ],
                    win: [
                        ['ctrl', 'delete']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_split_line',
                description: 'Split line',
                keys: { 
                    mac: [
                        ['ctrl', 'o'] 
                    ]
                }
            },

            // selection
            {
                category: 'Code Editor',
                id: 'ace_select_all',
                description: 'Select all',
                keys: { 
                    mac: [
                        ['cmd', 'a'] 
                    ],
                    win: [
                        ['ctrl', 'a']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_left',
                description: 'Select left',
                keys: { 
                    win_mac: [
                        ['shift', 'left'] 
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_right',
                description: 'Select right',
                keys: { 
                    win_mac: [
                        ['shift', 'right'] 
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_word_left',
                description: 'Select word left',
                keys: { 
                    mac: [
                        ['option', 'shift', 'left'] 
                    ],
                    win: [
                        ['ctrl', 'shift', 'left']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_word_right',
                description: 'Select word right',
                keys: { 
                    mac: [
                        ['option', 'shift', 'right'] 
                    ],
                    win: [
                        ['ctrl', 'shift', 'right']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_line_start',
                description: 'Select line start',
                keys: { 
                    win_mac: [
                        ['shift', 'home'] 
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_line_end',
                description: 'Select line end',
                keys: { 
                    win_mac: [
                        ['shift', 'end'] 
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_line_end',
                description: 'Select to line end',
                keys: { 
                    mac: [
                        ['option', 'shift', 'right'] 
                    ],
                    win: [
                        ['alt', 'shift', 'right']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_line_start',
                description: 'Select to line start',
                keys: { 
                    mac: [
                        ['option', 'shift', 'left'] 
                    ],
                    win: [
                        ['alt', 'shift', 'left']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_up',
                description: 'Select up',
                keys: { 
                    win_mac: [
                        ['shift', 'up'] 
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_down',
                description: 'Select down',
                keys: { 
                    win_mac: [
                        ['shift', 'down'] 
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_page_up',
                description: 'Select page up',
                keys: { 
                    win_mac: [
                        ['shift', 'pageup'] 
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_page_down',
                description: 'Select page down',
                keys: { 
                    win_mac: [
                        ['shift', 'pagedown'] 
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_to_start',
                description: 'Select to start',
                keys: { 
                    mac: [
                        ['command', 'shift', 'up'] 
                    ],
                    win: [
                        ['ctrl', 'shift', 'home']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_to_end',
                description: 'Select to end',
                keys: { 
                    mac: [
                        ['command', 'shift', 'down'] 
                    ],
                    win: [
                        ['ctrl', 'shift', 'end']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_duplicate_selection',
                description: 'Duplicate selection',
                keys: { 
                    mac: [
                        ['command', 'shift', 'd'] 
                    ],
                    win: [
                        ['ctrl', 'shift', 'd']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_select_to_matching_bracket',
                description: 'Select to matching bracket',
                keys: { 
                    win: [
                        ['ctrl', 'shift', 'p']
                    ]
                }
            },

            // go to:
            {
                category: 'Code Editor',
                id: 'ace_go_to_left',
                description: 'Go to left',
                keys: { 
                    mac: [
                        ['left'],
                        ['ctrl', 'b']
                    ],
                    win: [
                        ['left']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_right',
                description: 'Go to right',
                keys: { 
                    mac: [
                        ['right'],
                        ['ctrl', 'f']
                    ],
                    win: [
                        ['right']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_word_left',
                description: 'Go to word left',
                keys: { 
                    mac: [
                        ['option', 'left'] 
                    ],
                    win: [
                        ['ctrl', 'left']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_word_right',
                description: 'Go to word right',
                keys: { 
                    mac: [
                        ['option', 'right'] 
                    ],
                    win: [
                        ['ctrl', 'right']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_go_line_up',
                description: 'Go line up',
                keys: { 
                    mac: [
                        ['up'],
                        ['ctrl', 'p']
                    ],
                    win: [
                        ['up']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_go_line_down',
                description: 'Go line down',
                keys: { 
                    mac: [
                        ['down'],
                        ['ctrl', 'n']
                    ],
                    win: [
                        ['down']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_line_start',
                description: 'Go to line start',
                keys: { 
                    mac: [
                        ['command', 'left'],
                        ['home'],
                        ['ctrl', 'a']
                    ],
                    win: [
                        ['alt', 'left'],
                        ['home']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_line_end',
                description: 'Go to line end',
                keys: { 
                    mac: [
                        ['command', 'right'],
                        ['end'],
                        ['ctrl', 'e']
                    ],
                    win: [
                        ['alt', 'right'],
                        ['end']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_page_up',
                description: 'Go to page up',
                keys: { 
                    mac: [
                        ['option', 'pageup']
                    ],
                    win: [
                        ['pageup']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_page_down',
                description: 'Go to page down',
                keys: { 
                    mac: [
                        ['option', 'pagedown'],
                        ['ctrl', 'v']
                    ],
                    win: [
                        ['pagedown']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_start',
                description: 'Go to start',
                keys: { 
                    mac: [
                        ['command', 'home'],
                        ['command', 'up']
                    ],
                    win: [
                        ['ctrl', 'home']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_end',
                description: 'Go to end',
                keys: { 
                    mac: [
                        ['command', 'end'],
                        ['command', 'down']
                    ],
                    win: [
                        ['ctrl', 'end']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_go_to_matching_bracket',
                description: 'Go to matching bracket',
                keys: { 
                    win: [
                        ['ctrl', 'p']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_scroll_page_down',
                description: 'Scroll page down',
                keys: { 
                    mac: [
                        ['option', 'pagedown']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_scroll_page_up',
                description: 'Scroll page up',
                keys: { 
                    mac: [
                        ['option', 'pageup']
                    ]
                }
            },

            // find/replace

            // folding

            // other:
            {
                category: 'Code Editor',
                id: 'ace_indent',
                description: 'Indent',
                keys: { 
                    win_mac: [
                        ['tab']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_outdent',
                description: 'Outdent',
                keys: { 
                    win_mac: [
                        ['shift', 'tab']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_undo',
                description: 'Undo',
                keys: { 
                    mac: [
                        ['command', 'z']
                    ],
                    win: [
                        ['ctrl', 'z']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_redo',
                description: 'Redo',
                keys: { 
                    mac: [
                        ['command', 'shift', 'z'],
                        ['command', 'y']
                    ],
                    win: [
                        ['ctrl', 'y'],
                        ['ctrl', 'shift', 'z']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_toggle_comment',
                description: 'Toggle comment',
                keys: { 
                    mac: [
                        ['command', '/']
                    ],
                    win: [
                        ['ctrl', '/']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_change_to_lower_case',
                description: 'Change to lower case',
                keys: { 
                    win_mac: [
                        ['ctrl', 'shift', 'u']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_change_to_upper_case',
                description: 'Change to upper case',
                keys: { 
                    win_mac: [
                        ['ctrl', 'u']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_insert',
                description: 'Overwrite',
                keys: { 
                    win_mac: [
                        ['insert']
                    ]
                }
            },
            {
                category: 'Code Editor',
                id: 'ace_delete',
                description: 'Delete',
                keys: { 
                    win_mac: [
                        ['delete']
                    ]
                }
            }];

            _.each(ace_shortcuts, function(s) { s.ignore_clash = true; s.modes = ['writeable']; });

            RCloud.UI.shortcut_manager.add(ace_shortcuts);

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

        $("#show-shortcuts").click(function(e) {
            e.preventDefault();
            RCloud.UI.shortcut_dialog.show();
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

        var my_selector = $("#collapse-help");

        // where am I?
        var left_or_right = my_selector.closest('.panel-group').attr('id').includes('left')
            ? 'left' : 'right';

        RCloud.UI[left_or_right + '_panel'].collapse($("#collapse-help"), false);
        
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
            var save_dropdown = $('<span class="dropdown"></div>');
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
        function thumb_button() {
            var thumb_button = ui_utils.fa_button("icon-camera", "set as thumb");
            thumb_button.click(function() {
                RCloud.UI.scratchpad.update_thumb();
                RCloud.UI.thumb_dialog.display_image(url);
            });
            return thumb_button;
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
            if(window.shell && !shell.notebook.model.read_only())
                image_commands.append(thumb_button());
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

    var export_only_selected_files_;

    function download_as_file(filename, content, mimetype) {
        var file = new Blob([content], {type: mimetype});
        saveAs(file, filename); // FileSaver.js
    }

    function get_selected_files() {

        var files = [];

        if(export_only_selected_files_) {
            var selected = shell.get_selected_cells();

            files = selected.map(function(cell) {
                return cell.filename();
            });

            return Promise.resolve(files);
        }  else {
            return Promise.resolve([]);
        }
    }

    function prune_files(notebook, filesToKeep) {
        if(filesToKeep && filesToKeep.length) {
            // remove the files that aren't required:
            _.difference(Object.keys(notebook.files), filesToKeep).forEach(function(fileToRemove) {
                delete notebook.files[fileToRemove];
            });
        }
        return notebook;
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

                                    var promises = [];

                                    succeeded.forEach(function(notebook) {
                                        promises.push(editor.star_notebook(true, {notebook: notebook}).then(function() {
                                            return editor.set_notebook_visibility(notebook.id, true, function(){});
                                        }));
                                    });

                                    Promise.all(promises).then(function() {
                                        editor.highlight_imported_notebooks(succeeded);
                                    });

                                    if(failed.length)
                                        RCloud.UI.session_pane.post_error("Failed to import notebooks: " + failed.join(', '));
                                    dialog.modal('hide');
                                });
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
                        rcloud.protection.get_notebook_cryptgroup(shell.gistname()).then(function(cryptgroup) {
                            if(cryptgroup)
                                alert("Exporting protected notebooks is not supported at this time (and will always export in the clear)");
                            else get_selected_files().then(function(files) {
                                return rcloud.get_notebook(shell.gistname(), shell.version(), null, true).then(function(notebook) {
                                    notebook = Notebook.sanitize(notebook);
                                    notebook = prune_files(notebook, files);
                                    var gisttext = JSON.stringify(notebook);
                                    download_as_file(notebook.description + ".gist", gisttext, 'text/json');
                                    return notebook;
                                });
                            });
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

                                Notebook.read_from_file(
                                    file, {
                                        on_load_end: function() {
                                            notebook_status.show();
                                        },
                                        on_error: function(message) {
                                            notebook_status.text(message);
                                        },
                                        on_notebook_parsed: function(read_notebook) {
                                            notebook = read_notebook;
                                            notebook_status.text('');
                                            notebook_desc_content.val(notebook.description);
                                            notebook_desc.show();
                                            ui_utils.enable_bs_button(import_button);
                                        }
                                    }
                                );
                            }
                            function do_import() {

                                var desc = notebook_desc_content.val();

                                if(notebook && desc.length > 0) {
                                    notebook.description = desc;

                                    rcloud.create_notebook(notebook, false).then(function(notebook) {
                                        editor.star_notebook(true, {notebook: notebook}).then(function() {
                                            editor.set_notebook_visibility(notebook.id, true);

                                            // highlight the node:
                                            editor.highlight_imported_notebooks(notebook);
                                        });
                                    });

                                    dialog.modal('hide');
                                }
                            }

                            var body = $('<div class="container"/>');
                            var file_select = $('<input type="file" id="notebook-file-upload" size="50"></input>');

                            file_select
                                .click(function() {
                                    ui_utils.disable_bs_button(import_button);
                                    [notebook_desc, notebook_status].forEach(function(el) { el.hide(); });
                                    file_select.val(null);
                                })
                                .change(function() {
                                    do_upload(file_select[0].files[0]);
                                });

                            notebook_status = $('<span />');
                            notebook_status.append(notebook_status);

                            var notebook_desc = $('<span>Notebook description: </span>');
                            notebook_desc_content = $('<input type="text" class="form-control-ext" size="50" id="import-notebook-description"></input>')
                                .on('change paste keyup', function(e) {

                                    var desc_length = $(this).val().length;

                                    if(desc_length) {
                                        ui_utils.enable_bs_button(import_button);
                                    } else {
                                        ui_utils.disable_bs_button(import_button);
                                    }

                                    if (e.which === $.ui.keyCode.ENTER && desc_length) {
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
                        return get_selected_files().then(function(files) {
                            rcloud.get_notebook(shell.gistname(), shell.version()).then(function(notebook) {
                                var strings = [];
                                var parts = [];
                                notebook = prune_files(notebook, files);
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
                        });
                    }
                }
            });
            return this;
        },
        export_only_selected_files: function(val) {
            export_only_selected_files_ = val;
        }
    };
})();

RCloud.UI.pull_and_replace = (function() {

    var dialog_ = $('#pull-changes-dialog'),
        select_by_ = $('#pull-changes-by'),
        pull_notebook_file_ = $('#pull-notebook-file'),
        pull_notebook_url_ = $('#pull-notebook-url'),
        pull_notebook_id_ = $('#pull-notebook-id'),
        error_selector_ = '#pull-error',
        btn_pull_ = dialog_.find('.btn-primary.show-changes'),
        inputs_ = [pull_notebook_file_, pull_notebook_url_, pull_notebook_id_],
        notebook_from_file_,
        same_notebook_error_ = 'You cannot pull from your current notebook; the source must be a different notebook.',
        invalid_notebook_id_error_ = 'Invalid notebook ID.',
        not_found_notebook_error_ = 'The notebook could not be found.',
        show_dialog = function() {
            rcloud.get_notebook_property(shell.gistname(), 'pull-changes-by').then(function(val) {
                if(val && val.indexOf(':') !== -1) {

                    // split and set:
                    var separatorIndex = val.indexOf(':');
                    var type = val.substring(0, separatorIndex);
                    var value = val.substring(separatorIndex + 1);

                    // update pulled by method:
                    update_pulled_by(type, value);
                }
                else {
                    update_pulled_by('url');
                }

                dialog_.modal({
                    keyboard: true
                });
            });
        },
        reset_dialog = function() {

            // reset pulling state:
            reset_pulling_state();

            inputs_.forEach(function(input) {
                input.val('');
            });

            notebook_from_file_ = undefined;

            // default to URL for the next time:
            update_pulled_by('url');
        },
        update_pulled_by = function(pulled_method, value) {
            clear_error();
            select_by_.val(pulled_method);
            $(dialog_).find('div[data-by]').hide();
            $(dialog_).find('div[data-by="' + pulled_method + '"]').show();

            if(!_.isUndefined(value)) {
                // and set the value coming in:
                get_input().val(pulled_method === 'file' ? '' : value);
            }
        },
        upload_file = function(file) {
            Notebook.read_from_file(file, {
                on_load_end: function() {
                    // TODO
                },
                on_error: function(message) {
                    notebook_from_file_ = undefined;
                    show_error(message);
                },
                on_notebook_parsed: function(read_notebook) {
                    notebook_from_file_ = read_notebook;
                }
            });
        },
        do_pull = function() {
            function get_notebook_by_id(id) {
                if(!Notebook.valid_gist_id(id)) {
                    return Promise.reject(new Error(invalid_notebook_id_error_));
                } else if(id.toLowerCase() === shell.gistname().toLowerCase()) {
                    return Promise.reject(new Error(same_notebook_error_));
                }
                return rcloud.get_notebook(id);
            };

            var method = get_method();

            var get_notebook_func, notebook;

            update_when_pulling();

            if(method === 'id') {
                get_notebook_func = get_notebook_by_id;
            } else if(method === 'file') {
                get_notebook_func = function() {
                    if(notebook_from_file_) {
                        return Promise.resolve(notebook_from_file_);
                    } else {
                        return Promise.reject(new Error('No file to upload'));
                    }
                };
            } else if(method === 'url') {
                get_notebook_func = function(url) {
                    var id = RCloud.utils.get_notebook_from_url(url);
                    if(!id) {
                        return Promise.reject(new Error('Invalid URL'));
                    } else return get_notebook_by_id(id);
                };
            }

            var value = get_input().val();
            get_notebook_func(value).then(function(notebook) {
                return Promise.all([
                    rcloud.set_notebook_property(shell.gistname(), 'pull-changes-by', method + ':' + value),
                    editor.pull_and_replace_notebook(notebook).then(function() {
                        reset_dialog();
                        dialog_.modal('hide');
                    })
                ]);
            }).catch(function(e) {
                reset_pulling_state();

                if(e.message.indexOf('Not Found (404)') !== -1) {
                    show_error(not_found_notebook_error_);
                } else {
                    show_error(e.message);
                }
            });

        },
        get_method = function() {
            return select_by_.val();
        },
        get_input = function() {
            return $('#pull-notebook-' + get_method());
        },
        clear_error = function() {
            $(error_selector_).remove();
        },
        show_error = function(errorText) {
            clear_error();

            $('<div />', {
                id: error_selector_.substring(1),
                text: errorText
            }).appendTo($(dialog_).find('div[data-by="' + get_method() + '"]'));

        },
        has_error = function() {
            return $(error_selector_).length;
        },
        update_when_pulling = function() {
            btn_pull_.text('Pulling');
            dialog_.addClass('pulling');
        },
        reset_pulling_state = function() {
            btn_pull_.text('Pull');
            dialog_.removeClass('pulling');
        };

    return {
        init: function() {
            RCloud.UI.advanced_menu.add({
                 pull_and_replace_notebook: {
                    sort: 3000,
                    text: "Pull and Replace Notebook",
                    modes: ['edit'],
                    disabled_reason: "You can't pull and replace into a read only notebook",
                    action: function() {
                        show_dialog();
                    }
                }
            });

            $(dialog_).on('hide.bs.modal', function(){
                reset_dialog();
            });

            select_by_.change(function() {
                pull_notebook_file_.val(null);
                update_pulled_by($(this).val());
            });

            pull_notebook_file_.click(function() {
                clear_error();
                pull_notebook_file_.val(null);
                notebook_from_file_ = undefined;
            }).change(function() {
                upload_file(pull_notebook_file_[0].files[0]);
            });

            [pull_notebook_url_, pull_notebook_id_, select_by_, pull_notebook_file_].forEach(function(control) {
                control.keydown(function(e) {
                    if(e.keyCode === $.ui.keyCode.ENTER) {
                        do_pull();
                        e.preventDefault();
                    }
                });
            });

            btn_pull_.click(do_pull);

            return this;
        }
    };
})();

RCloud.UI.init = function() {

    RCloud.UI.processing_queue.init();
    RCloud.UI.run_button.init();
    RCloud.UI.stop_button.init();

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
            helper: 'clone',
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

    // shortcuts:
    RCloud.UI.shortcut_manager.init();
    RCloud.UI.ace_shortcuts.init();

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
    RCloud.UI.pull_and_replace.init();
    Object.keys(RCloud.UI.addons).forEach((key) => {
       RCloud.UI.addons[key].init();
    });
    
    //////////////////////////////////////////////////////////////////////////
    // view mode things
    ui_utils.prevent_backspace($(document));

    $(document).on('copy', function(e) {
        // only capture for cells and not ace elements
        if($(arguments[0].target).hasClass('ace_text-input') ||
           !$(arguments[0].target).closest($("#output")).size())
            return;

        ui_utils.select_allowed_elements();
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
        description: 'Save the current notebook',
        keys: {
            mac: [ 
                ['command', 's']
            ],
            win: [
                ['ctrl', 's']
            ]
        },
        modes: ['writeable'],
        action: function() { if(RCloud.UI.navbar.get('save_notebook')) { shell.save_notebook(); } }
    }, {
        category: 'Notebook Management',
        id: 'select_all',
        description: 'Select all',
        keys: {
            mac: [
                ['command', 'a']
            ],
            win: [
                ['ctrl', 'a']
            ]
        },
        modes: ['writeable'],
        action: function(e) {

            if(!$(e.target).parents('#find-form').length) {
                var selection = window.getSelection();
                selection.removeAllRanges();
                var range = new Range();
                range.selectNode(document.getElementById('output'));
                range.setStartAfter($('.response')[0]);
                selection.addRange(range);
            } else {
                $(e.target).select();
            }

        }
    }, {
        category: 'Notebook Management',
        id: 'history_undo',
        description: 'Step back through the notebook\'s history',
        keys: {
            mac: [
                ['command', 'alt', 'z']
            ],
            win: [
                ['ctrl', 'alt', 'z']
            ]
        },
        on_page: ['edit'],
        action: function() { editor.step_history_undo(); }
    }, {
        category: 'Notebook Management',
        id: 'history_redo',
        description: 'Step forwards through the notebook\'s history',
        keys: {
            mac: [
                ['command', 'shift', 'z']
            ],
            win: [
                ['ctrl', 'y']
            ]
        },
        on_page: ['edit'],
        action: function() { editor.step_history_redo(); }
    }, {
        category: 'Notebook Management',
        id: 'history_revert',
        description: 'Revert a notebook',
        keys: {
            mac: [
                ['command', 'e']
            ],
            win: [
                ['ctrl', 'e']
            ]
        },
        on_page: ['edit'],
        is_active: function() {
            return shell.notebook.controller.is_mine() && shell.notebook.model.read_only();
        },
        action: function() {
            if(this.is_active()) {
                editor.revert_notebook(shell.notebook.controller.is_mine(), shell.gistname(), shell.version());
            }
        }
    }, {
        category: 'Cell Management',
        id: 'notebook_run_all',
        description: 'Run all cells',
        keys: {
            win_mac: [
                ['ctrl', 'shift', 'enter']
            ]
        },
        action: function() { RCloud.UI.run_button.run(); }
    }]);

    // cell management:
    RCloud.UI.shortcut_manager.add([{
        category: 'Cell Management',
        id: 'remove_cells',
        description: 'Remove selected cells',
        keys: {
            mac: [
                ['command', 'backspace']
            ],
            win: [
                ['ctrl', 'del'],
                ['ctrl', 'backspace']
            ]
        },
        modes: ['writeable'],
        action: function() { shell.notebook.controller.remove_selected_cells(); }
    }, {
        category: 'Cell Management',
        id: 'invert_cells',
        description: 'Invert selected cells',
        keys: {
            mac: [
                ['command', 'shift', 'i']
            ],
            win: [
                ['ctrl', 'shift', 'i']
            ]
        },
        modes: ['writeable'],
        action: function() {
            shell.notebook.controller.invert_selected_cells();
            $(':focus').blur();
        }
    }, {
        category: 'Cell Management',
        id: 'crop_cells',
        description: 'Crop cells',
        keys: {
            mac: [
                ['command', 'k']
            ],
            win: [
                ['ctrl', 'k']
            ]
        },
        modes: ['writeable'],
        action: function() { shell.notebook.controller.crop_cells(); }
    }, {
        category: 'Cell Management',
        id: 'arrow_next_cell_down',
        description: 'Enter next cell (from last line of current)',
        keys: {
            win_mac: [
                ['down']
            ]
        },
        modes: ['writeable']
    }, {
        category: 'Cell Management',
        id: 'arrow_previous_cell_up',
        description: 'Enter previous cell (from first line of current)',
        keys: {
            win_mac: [
                ['up']
            ]
        },
        modes: ['writeable']
    }, {
        category: 'Cell Management',
        id: 'goto_previous_cell',
        description: 'Go to previous cell',
        keys: {
            win_mac: [
                ['ctrl', 'shift', '<']
            ]
        },
        modes: ['writeable']
    }, {
        category: 'Cell Management',
        id: 'goto_next_cell',
        description: 'Go to next cell',
        keys: {
            win_mac: [
                ['ctrl', 'shift', '>']
            ]
        },
        modes: ['writeable']
    }, {
        category: 'Cell Management',
        id: 'insert_cell_before',
        description: 'Insert cell before current',
        keys: {
            win: [
                ['ctrl', '[']
            ],
            mac: [
                ['command', '[']
            ]
        },
        modes: ['writeable'],
        action: function() { }
    }, {
        category: 'Cell Management',
        id: 'insert_cell_after',
        description: 'Insert cell after current',
        keys: {
            win: [
                ['ctrl', ']']
            ],
            mac: [
                ['command', ']']
            ]
        },
        modes: ['writeable'],
        action: function() { }
    }, {
        category: 'Cell Management',
        id: 'run_selected_cells',
        description: 'Run the selected cells',
        click_keys: {
            target: 'Play button',
            win: [
                ['ctrl']
            ],
            mac: [
                ['command']
            ]
        }
    }, {
        category: 'Cell Management',
        id: 'cell_run_from_here',
        description: 'Run from this cell on',
        keys: {
            win_mac: [
                ['shift', 'alt', 'enter']
            ]
        },
        click_keys: {
            target: 'Play button',
            win_mac: [
                ['shift']
            ]
        },
        modes: ['writeable']
    }, {
        category: 'Cell Management',
        id: 'show_results_of_cells',
        description: 'Show results of selected/all cells',
        click_keys: {
            target: 'Hide results button',
            win: [
                ['ctrl']
            ],
            mac: [
                ['command']
            ]
        }
    }, {
        category: 'Cell Management',
        id: 'blur_cell',
            description: 'Blur Cell/Command Prompt',
        keys: {
            win_mac: [
                ['esc']
            ]
        },
        modes: ['writeable']
    }, {
        category: 'Cell Management',
        id: 'select_cell',
        description: 'Select individual cell',
        click_keys: {
            target: 'Cell title'
        }
    }, {
        category: 'Cell Management',
        id: 'toggle_select_cell',
        description: 'Toggle cell selection',
        click_keys: {
            target: 'Cell title',
            win: ['ctrl'],
            mac: ['command']
        }
    }, {
        category: 'Cell Management',
        id: 'select_cell_range',
        description: 'Select range of cells',
        click_keys: {
            target: 'Cell title',
            win_mac: ['shift']
        }
    }]);

    // general:
    RCloud.UI.shortcut_manager.add([{
        category: 'General',
        id: 'show_help',
        description: 'Show shortcuts help',
        keys: {
            win_mac: [
                ['?']
            ]
        },
        modes: ['writeable', 'readonly'],
        action: function(e) {
            RCloud.UI.shortcut_dialog.show();
        }
    }, {
        category: 'General',
        id: 'close_modal',
        description: 'Close dialog',
        keys: {
            win_mac: [
                ['esc']
            ]
        },
        ignore_clash: true,
        enable_in_dialogs: true,
        global: true,
        action: function() { $('.modal').modal('hide'); }
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

            if(!shell.is_view_mode()) {
                RCloud.UI.incremental_search.init();
            }

            RCloud.UI.command_prompt.init();

            $(".panel-collapse").collapse({toggle: false});

            return Promise.all([RCloud.UI.navbar.load(),
                                RCloud.UI.menus.load(),
                                RCloud.UI.shortcut_manager.load(),
                                RCloud.UI.share_button.load(),
                                shell.notebook.view.load_options(),
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

                    if(!enable) {
                        if(item.disabled_reason) {
                            item.$li.find('a').attr('title', item.disabled_reason);
                        }
                    } else {
                        item.$li.find('a').removeAttr('title');
                    }
                    item.disabled = !enable;

                    item.$li.toggleClass('disabled', !enable);
                    return this;
                },
                create_checkbox: function(item) {
                    // this is a mess. but it's a contained mess, right? (right?)
                    var ret = $.el.li($.el.a({href: '#', id: item.key}, $.el.i({class: 'icon-check'}), '\xa0', item.text));
                    item.checkbox_widget = ui_utils.checkbox_menu_item($(ret), function() {
                        item.disabled || item.action(true);
                    }, function() {
                        item.disabled || item.action(false);
                    });
                    if(item.value)
                        item.checkbox_widget.set_state(item.value);
                    return ret;
                },
                create_link: function(item) {
                    var ret = $.el.li($.el.a({href: '#', id: item.key }, item.text));
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
                        if(item.disabled)
                            that.enable(item, false);
                        item.$li = $(elem);
                        return elem;
                    })));
                    menu.find('li a').click(function() {
                        var item = extension_.get(this.id);
                        if(!item)
                            throw new Error('bad id in advanced menu');
                        if(!item.checkbox)
                            item.disabled || item.action();
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
                    target: '_blank',
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
            result.highlight_color = "rgb(255, 255, 170)";
            result.icon_class = icon;
            result.dark_color = "#222";
            result.original_color = null;
            result.highlighted = false;
            result.highlight = function(whether) {
                var that = this;
                var duration = 100, hold = 500, first_hold = duration;
                that.highlighted = whether;
                if(!that.original_color) {
                  that.original_color = $($(result.control).find('.' + result.icon_class)).css('color');
                }
                function animation_loop() {
                    var el = $(that.control).find('.' + that.icon_class);
                    if(that.highlighted) {
                        if(!el.is(':animated')) {
                            var sel = d3.select(el[0]);
                            sel
                                .transition().duration(duration)
                                .style('color', that.dark_color)
                                .transition().duration(first_hold)
                                .transition().duration(duration)
                                .style('color', that.highlight_color)
                                .transition().duration(hold)
                                .each('end', function() {
                                    if(that.highlighted) {
                                        first_hold = hold;
                                        animation_loop();
                                    } else {
                                        sel.transition().duration(duration)
                                            .style('color', that.original_color);
                                    }
                                });
                        }
                    }
                }
                if(that.highlighted)
                    animation_loop();
                return this;
            };
            return result;
        },
        init: function() {
            // display brand now (won't wait for load/session)
            var header = $('#rcloud-navbar-header');
            header.empty().append('<a class="navbar-brand" href="/edit.html">RCloud</a>');
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
                        var view_types_;
                        var share_link_ = $.el.a({
                                href: '#',
                                id: 'share-link',
                                title: 'Shareable Link',
                                class: 'btn btn-link navbar-btn',
                                style: 'text-decoration:none; padding-right: 0px',
                                target: '_blank'
                            }, $.el.i({class: 'icon-share'}));
                        $(share_link_).on('click', function(x) { shell.save_notebook();});
                        return {
                            control: $.el.span(share_link_, $.el.span({
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
                            open: function() {
                                if(share_link_) {
                                    $(share_link_)[0].click();
                                }
                                return this;
                            },
                            set_view_types: function(items) {
                                $(view_types_).append($(items.map(function(item) {
                                    var a = $.el.a({href: '#'}, item.title);
                                    $(a).click(item.handler);
                                    return $.el.li(a);
                                })));
                            },
                            set_title: function(title) {
                                $(share_link_).attr('title', title);
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
                            title: 'Star Notebook',
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
                                $(this.control).attr('title', filled ? 'Unstar Notebook' : 'Star Notebook');
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
                        $(control.control).click(function(e) {
                            var is_mine = shell.notebook.controller.is_mine();
                            var gistname = shell.gistname();
                            var version = shell.version();
                            
                            if(e.metaKey || e.ctrlKey) {
                              editor.fork_notebook(is_mine, gistname, version, false).then(function(notebook) {
                                var url = ui_utils.make_url('edit.html', {notebook: notebook.id});
                                window.open(url, "_blank");
                              });
                            } else {
                              editor.fork_notebook(is_mine, gistname, version, true);
                            }
                            
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
                        $(control.control).click(function(e) {
                          if(e.metaKey || e.ctrlKey) {
                            var selected = shell.get_selected_cells().map (function(x) { return x.id(); });
                            if(selected.length) {
                              shell.run_notebook_cells(selected);
                            }
                          } else {
                            RCloud.UI.run_button.run();
                          }
                        });
                        return control;
                    }
                },
                stop_notebook: {
                    area: 'commands',
                    sort: 7000,
                    modes: ['edit', 'view'],
                    create: function() {
                        var control = RCloud.UI.navbar.create_button('stop-notebook', 'Stop', 'icon-stop');
                        $(control.control).click(function(e) {
                            RCloud.UI.stop_button.stop();
                        });
                        control.disable();
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
    var merge_icon_style_ = {'line-height': '90%', 'padding-right': '3px'};
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
                        var make_hidden = ui_utils.fa_button('icon-eye-close', 'hide notebook', 'hide-notebook', icon_style_, true),
                            make_shown = ui_utils.fa_button('icon-eye-open', 'show notebook', 'show-notebook', icon_style_, true);
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
                    sort: 5000,
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
                fork_notebook: {
                    section: 'appear',
                    sort: 2500,
                    create: function(node) {
                        var fork = ui_utils.fa_button('icon-code-fork', 'fork notebook', 'fork', icon_style_, true);
                        fork.click(function(e) {
                            editor.fork_notebook(node.user === editor.username(), node.gistname, node.version, true);
                        });
                        return fork;
                    }
                },
                fork_folder: {
                    section: 'appear',
                    sort: 1000,
                    condition0: function(node) {
                        return node.full_name && !node.gistname;
                    },
                    create: function(node) {
                        var fork = ui_utils.fa_button('icon-code-fork', 'fork folder', 'fork', icon_style_, true);
                        fork.click(function(e) {
                            var orig_name = node.full_name, orig_name_regex = new RegExp('^' + orig_name);
                            editor.find_next_copy_name(orig_name).then(function(folder_name) {
                                editor.fork_folder(node, orig_name_regex, folder_name);
                            });
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
                            } else {
                                notebook_names = [];
                                return false;
                            }
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
        merge_icon_style: function() {
            return merge_icon_style_;
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
            $li.find('div.jqtree-element').hover(
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
        $crop_button,
        $toggle_results_button,
        $cell_selection,
        $selected_details,
        $selected_count,
        $cell_count;

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
            $crop_button = $selection_bar.find('#selection-bar-crop');
            $toggle_results_button = $selection_bar.find('#selection-bar-toggle-results');
            $cell_selection = $selection_bar.find('.cell-selection');
            $selected_details = $delete_button.find('span');
            $selected_count = $selection_bar.find('#selected-count');
            $cell_count = $selection_bar.find('#cell-count');

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
                .end()
                .find('#selection-bar-crop').click(function() {
                    shell.notebook.controller.crop_cells();
                })
                .end()
                .find('#selection-bar-toggle-results').click(function(e) {
                  if(e.metaKey || e.ctrlKey) {
                    shell.notebook.controller.show_cells_results();
                  } else {
                    shell.notebook.controller.hide_cells_results();
                  }
                })
                .end();

            $selection_bar.find('div[type="button"].cell-selection').click(function(e) {
                $(this).find('input').trigger('click');
            });
            
            $('#' + $selection_bar.attr('id')).replaceWith($selection_bar);
        },  
        update: function(cells) {

            var cell_count = cells.length,
                selected_count = shell.notebook.controller.selected_count();

            $selection_checkbox.prop({
                'checked' : selected_count === cell_count && cell_count != 0,
                'disabled' : cell_count === 0
            });

            // checkbox/dropdown enabled status based on cell count:
            _.each([$dropdown_toggle, $cell_selection], function(el) { 
                el[cell_count ? 'removeClass' : 'addClass']('disabled');  
            });

            $partial_indicator[selected_count !== cell_count && selected_count !== 0 ? 'show' : 'hide']();   

            // delete/crop buttons' enabled status based on selection count:
            $delete_button[selected_count ? 'removeClass' : 'addClass']('disabled');
            $crop_button[shell.notebook.controller.can_crop_cells() ? 'removeClass' : 'addClass']('disabled');

            // delete details:
            $selected_count.text(selected_count);
            $cell_count.text(cell_count);
            $selected_details[selected_count !== 0 ? 'show' : 'hide']();
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
                    rename_current_notebook(name);
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
        update_fork_info: function(fork_id) {
            var url = ui_utils.make_url(shell.is_view_mode() ? 'view.html' : 'edit.html',
                                        {notebook: fork_id});
            if(fork_id) {
                rcloud.get_notebook_info(fork_id).then(function(info) {
                    var fork_desc = (info.username || 'unknown') + " / " + (info.description || 'unknown');
                    $("#forked-from-desc").html("forked from <a href='" + url + "'>" + fork_desc + "</a>");
                }).catch(function(error) {
                    if(/does not exist or has not been published/.test(error))
                        $("#forked-from-desc").html("forked from <a href='" + url + "'>(unknown notebook)</a>");
                    else
                        $("#forked-from-desc").text("");
                });
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
        var notebook_inner_panel = RCloud.UI.panel_loader.load_snippet('notebooks-panel-heading');
        return notebook_inner_panel;
    },
    heading_content_selector: function() {
        return $('#notebooks-panel-controls');
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
                        return $.el.pre($.el.code(text));
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
    var panel_data_ = {};
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
            heading = $.el.div(
                               heading_attrs,
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

            panel_data_ = {
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
                'File Upload': {
                    side: 'left',
                    name: 'file-upload',
                    title: 'File Upload',
                    icon_class: 'icon-upload-alt',
                    colwidth: 2,
                    sort: 2000,
                    panel: RCloud.UI.upload_frame
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
                Comments: {
                    side: 'left',
                    name: 'comments',
                    title: 'Comments',
                    icon_class: 'icon-comments',
                    colwidth: 2,
                    sort: 4000,
                    panel: RCloud.UI.comments_frame
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
                Search: {
                    side: 'right',
                    name: 'search',
                    title: 'Search',
                    icon_class: 'icon-search',
                    colwidth: 4,
                    sort: 2000,
                    panel: RCloud.UI.search
                },
                Help: {
                    side: 'right',
                    name: 'help',
                    title: 'Help',
                    icon_class: 'icon-question',
                    colwidth: 5,
                    sort: 3000,
                    panel: RCloud.UI.help_frame
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
            };
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

            var that = this;

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

            // alternative layout?
            return rcloud.config.get_user_option('panel-layout-by-size').then(function(layoutBySize) {

                // default to true:
                if(layoutBySize === null) {
                    layoutBySize = true;
                }

                if(!layoutBySize) {

                    var update_panel = function update_panel(panel, side, sort) {
                        panel_data_[panel].side = side;
                        panel_data_[panel].sort = sort;
                    };

                    // adjust:
                    _.each(['Notebooks', 'Search', 'Settings', 'Help'], function(panel, index) {
                        update_panel(panel, 'left', (index + 1) * 1000);
                    });

                    _.each(['Assets', 'File Upload', 'Comments', 'Session'], function(panel, index) {
                        update_panel(panel, 'right', (index + 1) * 1000);
                    });

                }

                that.add(panel_data_);

                do_side(panels_, 'left');
                do_side(panels_, 'right');

                // this is dumb but i don't want the collapser to show until load time
                $('#left-column').append(that.load_snippet('left-pane-collapser-snippet'));
                $('#right-column').append(that.load_snippet('right-pane-collapser-snippet'));

                return Promise.cast(undefined); // until we are loading opts here
            });
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

RCloud.UI.prompt_history = function() {
    var entries_ = [], alt_ = [];
    var curr_ = 0;
    function curr_cmd() {
        return alt_[curr_] || (curr_<entries_.length ? entries_[curr_] : "");
    }
    var prefix_ = null;
    var result = {
        init: function(save_name) {
            if(save_name) {
                prefix_ = "rcloud.history." + save_name + ".";
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
            }
            else prefix_ = null;
            return {"cmd":curr_cmd(),"lang":last_lang};
        },
        add_entry: function(cmd) {
            if(cmd==="") return;
            alt_[entries_.length] = null;
            entries_.push(cmd);
            alt_[curr_] = null;
            curr_ = entries_.length;
            if(prefix_)
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
            alt_[curr_] = cmd;
            if(prefix_)
                window.localStorage[prefix_+curr_+".alt"] = cmd;
        }
    };
    return result;
};

RCloud.UI.right_panel =
    RCloud.UI.collapsible_column("#right-column",
                                 "#accordion-right", "#right-pane-collapser");

RCloud.UI.processing_queue = (function() {
    var running_ = false,
        stopping_ = false,
        queue_ = [],
        cancels_ = [],
        runningPromise = null;
        onStartCallbacks = [];
        finallyCallbacks = [];

  return {
        init: function() {
            var that = this;
            RCloud.session.listeners.push({
                on_reset: function() {
                    that.on_stopped();
                }
            });
        },
        is_running: function() {
          return running_;
        },
        is_stopping: function() {
          return stopping_;
        },
        start_queue: function() {
            var that = this;
            if(queue_.length === 0) {
                stopping_ = false;
                running_ = false;
                return Promise.resolve(undefined);
            } else {
                running_ = true;
                var processingChain = Promise.resolve(undefined).then(function(x) {
                  onStartCallbacks.forEach(function(callback) {
                    callback(x);
                  });
                  return x;
                });
                var first = queue_.shift();
                return processingChain.then(first).then(function() {
                    if(stopping_) {
                        stopping_ = false;
                        throw 'stop';
                    }
                    cancels_.shift();
                    return that.start_queue();
                });
            }
        },
        stop: function() {
            if(running_) {
              if(rcloud.has_compute_separation)
                  rcloud.signal_to_compute(2); // SIGINT
              else
                  stopping_ = true;
            }
        },
        stopGracefully: function() {
            if(running_) {
              stopping_ = true;
            }
        },
        on_stopped: function() {
            cancels_.forEach(function(cancel) { cancel(); });
            queue_ = [];
            cancels_ = [];
            running_ = false;
            runningPromise = null;
        },
        addFinallyCallback: function(callback) {
          finallyCallbacks.push(callback);
        },
        addOnStartCallback: function(callback) {
          onStartCallbacks.push(callback);
        },
        enqueue: function(f, cancel) {
            var that = this;
            queue_.push(f);
            cancels_.push(cancel || function() {});
            if(!running_) {
                runningPromise = that.start_queue()
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
                    }).finally(function(x) {
                      finallyCallbacks.forEach(function(callback) { callback(x)});
                      return x;
                    });
            }
            return runningPromise;
        }
    };
})();

RCloud.UI.run_button = (function() {
    
    var do_reset_ = false;
    var is_scheduling_ = false;

    function highlight(whether) {
        RCloud.UI.navbar.control('run_notebook').highlight(whether);
    }
    
    function enable(whether) {
      // if(whether) {
      //   RCloud.UI.navbar.control('run_notebook').enable();
      // } else {
      //   RCloud.UI.navbar.control('run_notebook').disable();
      // }
    }
    function schedule(ignored) {
        return (
            do_reset_ && shell.notebook.controller.session_dirty() ?
                RCloud.session.reset().then(function() {
                    shell.notebook.controller.session_dirty(false);
                    return rcloud.load_notebook(shell.gistname(), shell.version());
                }) :
            Promise.resolve(undefined))
            .then(function() {
                return shell.run_notebook();
            });
    }
    return {
        init: function() {
            var that = this;
            RCloud.session.listeners.push({
                on_reset: function() {
                    that.on_stopped();
                }
            });
            RCloud.UI.processing_queue.addOnStartCallback(function(x) {
              enable(false);
              highlight(true);
            });
            RCloud.UI.processing_queue.addFinallyCallback(function(x) {
              that.on_stopped();
            });
        },
        
        run: function() {
            var runNotebook = Promise.resolve(undefined);
            if(!RCloud.UI.processing_queue.is_running() && !is_scheduling_) {
              is_scheduling_ = true;
              runNotebook = runNotebook.then(schedule).finally(function(x) {
                      is_scheduling_ = false;
                    });
            }
            return runNotebook;
        },
        on_stopped: function() {
          highlight(false);
          enable(true);
        },
        reset_on_run: function(v) {
            if(!arguments.length)
                return do_reset_;
            do_reset_ = v;
            return this;
        }
    };
})();

RCloud.UI.stop_button = (function() {

    function enable(whether) {
      if(whether) {
        RCloud.UI.navbar.control('stop_notebook').enable();
      } else {
        RCloud.UI.navbar.control('stop_notebook').disable();
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
            RCloud.UI.processing_queue.addOnStartCallback(function(x) {
              enable(true);
            });
            RCloud.UI.processing_queue.addFinallyCallback(function(x) {
              that.on_stopped();
            });
        },
        on_stopped: function() {
          enable(false);
        },
        stop: function() {
            RCloud.UI.processing_queue.stop();
        }
    };
})();

RCloud.UI.scratchpad = (function() {
    var binary_mode_; // not editing
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
                widget.$blockScrolling = Infinity;
                that.session = session;
                that.widget = widget;
                var doc = session.doc;
                session.on('change', function() {
                    widget.resize();
                });

                widget.setOptions({
                    enableBasicAutocompletion: true
                });

                widget.commands.addCommands([{
                    name: 'blurCell',
                    bindKey: {
                        win: 'Escape',
                        mac: 'Escape'
                    },
                    exec: function() {
                        that.widget.blur();
                    }
                }]);

                session.setMode(new LangMode({ suppressHighlighting : false, doc : doc, session : session, language : "R" }));
                session.setNewLineMode('unix');
                session.setOption('indentedSoftWrap', false);
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

                RCloud.UI.thumb_dialog.init();

                $('#update-thumb').click(RCloud.UI.scratchpad.update_thumb);
            }
            function setup_asset_drop() {
                var showOverlay_;
                //prevent drag in rest of the page except asset pane and enable overlay on asset pane
                $(document).on('dragstart dragenter dragover', function (e) {

                    if(RCloud.UI.thumb_dialog.is_visible())
                        return;

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

                filename = filename.trim();

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

                var sbin = $('#scratchpad-binary'),
                    extension = this.current_model.filename().substr(this.current_model.filename().lastIndexOf('.') + 1);

                if(['bmp', 'jpg', 'jpeg', 'png', 'gif'].indexOf(extension.toLowerCase()) !== -1) {
                    sbin.html('<div><img src="' + this.current_model.asset_url(true) + '"/></div>"');
                    sbin.find('div').removeClass('embed');
                } else if('pdf' === extension.toLowerCase()) {
                    sbin.html('<div><object><embed type="application/pdf" src="' + this.current_model.asset_url(true) + '" /></object></div>');
                    sbin.find('div').addClass('embed');
                } else {
                    sbin.html('<div><p>Preview not supported for this file type</p></div>');
                    sbin.find('div').removeClass('embed');
                }

                sbin.show();
            }
            else {
                // text content: show editor
                binary_mode_ = false;
                that.widget.setReadOnly(shell.notebook.model.read_only());
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
                var LangMode = RCloud.language.ace_mode(lang);
                this.session.setMode(new LangMode({ suppressHighlighting : false, doc : this.session.doc, session : this.session, language : lang }));
            }
        }, set_readonly: function(readonly) {
            if(!shell.is_view_mode()) {
                if(this.widget && !binary_mode_)
                    ui_utils.set_ace_readonly(this.widget, readonly);

                $('#new-asset, #update-thumb')[readonly ? 'hide' : 'show']();
            }
        }, update_asset_url: function() {
            if(this.current_model)
                $('#asset-link').attr('href', this.current_model.asset_url());
        }, update_thumb: function() {
            // select the thumb in the assets:
            var thumb = shell.notebook.model.get_asset('thumb.png');

            if(thumb) {
                thumb.controller.select();
            }

            RCloud.UI.thumb_dialog.show();
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
    "Please see this <a target=\"_blank\" href=\"http://lucene.apache.org/core/7_1_0/queryparser/org/apache/lucene/queryparser/classic/package-summary.html#Terms\">link</a> to learn about Lucene syntax. " ,
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
            case 'score':
            orderby = "desc";
            break;
            case 'user':
            case 'description':
            orderby = "asc";
            break;
        }
        $('#order-by').val(orderby);
    }

    function extract_error(msg) {
        if(/Bad Request/.test(msg))
            return 'Syntax error in query';
        else if(/Couldn't connect to server/.test(msg))
            return "Couldn't connect to notebook search server (solr)";
        else return "Unknown error (see browser log)";
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
                if(!opts['search-sort-by']) opts['search-sort-by'] = 'score'; // always init once
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
                
                console.log(d);
                
                var i;
                var custom_msg = '';
                if(d === null || d === "null" || d.n_notebooks === "0") {
                    summary("No Results Found");
                } else if(d[0] === "error") {
                    d[1] = d[1].replace(/\n/g, "<br/>");
                    if($('#paging').html != "")
                        $('#paging').html("");
                    if(d[1].indexOf("org.apache.solr.search.SyntaxError")>-1)
                        custom_msg = search_err_msg.join("");
                    err_msg(custom_msg+"ERROR:\n" + d[1], 'darkred');
                } else {
                    
                    //iterating for all the notebooks got in the result/response
                    try {
                        numpaged = numfound = parseInt(d.n_notebooks);
                        var qtime = d.QTime;
                        var noofpages =  Math.ceil(numpaged/page_size_);
                        
                        var template = _.template(
                            $("#search_results_template").html()
                        );
                                                
                    } catch(e) {
                        summary("Error : \n" + e, 'darkred');
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
                        // if (numSources > 1) { // for multi-sources it gets complicated, just show the page
                        //     search_summary += "page "+ Math.round(start/page_size_ + 1);
                        // } else {
                            if(numfound-start === 1) {
                                search_summary += (start+1);
                            } else if((numfound - noofrows) > 0) {
                                search_summary += (start+1)+" - "+noofrows;
                            } else {
                                search_summary += (start+1)+" - "+numfound;
                            }
                        //}
                        summary(search_summary, 'darkgreen');
                    }
                    $("#search-results-row").css('display', 'table-row');
                    $("#search-results-scroller").scrollTop(0);
                    $("#search-results").html(template({notebooks: d.notebooks}))
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
                })
                .catch(function(error) {
                    console.log('search error', error);
                    summary(extract_error(error), 'darkred');
                });
            });
        }
    };
})();


RCloud.UI.session_pane = {
    error_dest_: null,
    clear_session_: null,
    allow_clear: true,
    BUFFER_LIMIT: 10000,
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

        // manual clearing:
        this.clear_session_ = $('#clear-session');
        if(this.clear_session_.length) {
            this.clear_session_.click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                that.clear();
            });
        }

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
    should_scroll: function() {
        var scroll_bottom = $('#session-info-panel').scrollTop() + $('#session-info-panel').height() - $('#session-info-out').height();
        return scroll_bottom > -10;
    },
    scroll_to_end: function() {
        ui_utils.on_next_tick(function() {
            ui_utils.scroll_to_after($("#session-info"), {duration: 0});
        });
    },
    append_text: function(msg) {
        // FIXME: dropped here from session.js, could be integrated better
        if(!$('#session-info').length) {
            console.log('session log: ', msg);
            return; // workaround for view mode
        }
        // one hacky way is to maintain a <pre> that we fill as we go
        // note that R will happily spit out incomplete lines so it's
        // not trivial to maintain each output in some separate structure
        if (!document.getElementById("session-info-out"))
            $("#session-info").append($("<pre id='session-info-out'></pre>"));
        var $info_out = $("#session-info-out");
        var currtext = $info_out.text();
        if(currtext.length > this.BUFFER_LIMIT) {
            currtext = currtext.slice(currtext.length - this.BUFFER_LIMIT / 2);
            $info_out.text(currtext);
            console.log('truncated session log');
        }
        var scroll = this.should_scroll();
        $info_out.append(msg);
        RCloud.UI.right_panel.collapse($("#collapse-session-info"), false, false);
        if(scroll)
            this.scroll_to_end();
    },
    post_error: function(msg, dest, logged) { // post error to UI
        $('#loading-animation').hide();
        dest = dest || this.error_dest_;
        if(!dest || !dest.length) {
            if(typeof msg === 'object')
                msg = msg.text();
            RCloud.UI.fatal_dialog(msg, "Login", ui_utils.relogin_uri());
        }
        else {
            var errclass = 'session-error';
            if (typeof msg === 'string') {
                msg = ui_utils.string_error(msg);
                errclass = 'session-error spare';
            }
            else if (typeof msg !== 'object')
                throw new Error("post_error expects a string or a jquery div");
            var scroll = this.should_scroll();
            msg.addClass(errclass);
            dest.append(msg);
            this.show_error_area();
            if(scroll)
                this.scroll_to_end();
        }
        if(!logged) {
            if(typeof msg === 'object')
                msg = msg.text();
            console.log("pre-init post_error: " + msg);
        }
    },
    post_rejection: function(e) { // print exception on stack and then post to UI
        var msg = "";
        if(RCloud.is_exception(e))
            msg = RCloud.exception_message(e);
        else if(Array.isArray(e))
            // some Rserve errors are not properly formed exceptions
            msg = e.join(', ');
        else if(e.message) {
            // bluebird will print the message for Chrome/Opera but no other browser
            if(!window.chrome && e.message)
                msg += "Error: " + e.message + "\n";
            msg += e.stack;
        }
        console.log(msg);
        this.post_error(msg, undefined, true);
    },
    heading_content: function() {
        return RCloud.UI.panel_loader.load_snippet('session-info-panel-heading');
    },
    heading_content_selector: function() {
        return $('#session-panel-controls');
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
                    return val.trim().split(/[, ]+/).filter(function(x) { return !!x; });
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
                'color-recent-notebooks-by-modification-date': that.checkbox({
                    sort: 3500,
                    default_value: false,
                    needs_reload: true,
                    label: "Color recent notebooks by modification date",
                    set: function(val) {
                        editor.color_recent_notebooks_by_modification_date(val);
                    }
                }),
                'show-folder-dates': that.checkbox({
                    sort: 3750,
                    default_value: false,
                    needs_reload: true,
                    label: "Show folder date for date ordered tree",
                    set: function(val) {
                        editor.set_show_folder_dates(val);
                    }
                }),
                'panel-layout-by-size': that.checkbox({
                    sort: 4000,
                    default_value: true,
                    needs_reload: true,
                    label: "Arrange panels by size"
                }),
                'clear-r-session-when-run-all': that.checkbox({
                    sort: 5000,
                    default_value: true,
                    label: "Clear R Session when entire notebook is run",
                    set: function(val) {
                        RCloud.UI.run_button.reset_on_run(val);
                    }
                }),
                'export-only-selected-cells': that.checkbox({
                    sort: 6000,
                    default_value: true,
                    label: "Export only selected cells",
                    set: function(val) {
                        RCloud.UI.import_export.export_only_selected_files(val);
                    }
                }),
                'autoactivate-cells': that.checkbox({
                    sort: 6400,
                    default_value: true,
                    label: "Auto-activate cells",
                    needs_reload: true
                }),
                'autoscroll-notebook-output': that.checkbox({
                    sort: 6500,
                    default_value: true,
                    label: "Autoscroll notebook",
                    set: function(val) {
                        shell.notebook.controller.autoscroll_notebook_output(val);
                    }
                }),
                'show-hidden-assets': that.checkbox({
                    sort: 6600,
                    default_value: false,
                    label: "Show hidden assets",
                    set: function(val) {
                        shell.notebook.model.show_hidden_assets(val);
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

    function set_view_type(title) {
        title = (title && extension_.get(title)) ? title : default_item_;
        if(!title)
            return Promise.reject(new Error('share button view types set up wrong'));
        set_tooltip(title);
        return rcloud.set_notebook_property(shell.gistname(), "view-type", title);
    }

    function set_tooltip(title) {
        RCloud.UI.navbar.control('shareable_link').set_title('Shareable Link: ' + title);
    }

    function get_view_type_name(gistname) {
        return rcloud.get_notebook_property(gistname, "view-type").then(function(title) {
            title = (title && extension_.get(title)) ? title : default_item_;
            if(!title)
                return Promise.reject(new Error('share button view types set up wrong'));
            return title;
        });
    }

    function get_view_type(gistname) {
        return get_view_type_name(gistname).then(function(title) {
            var view_type = extension_.get(title);
            return view_type;
        });
    }

    function resolve_view_url(gistname, version, viewtype) {
        var notebook_options = null;
        if(version) {
            notebook_options = rcloud.get_tag_by_version(gistname, version)
                .then(function(tag) {
                    var opts = {notebook: gistname,
                                version: version};
                    if(tag) {
                        opts.tag = tag;
                    }
                    return opts;
                });
        } else {
            notebook_options = Promise.resolve(undefined).then(function(x) {
                return { notebook: gistname };
            });
        }

        var viewtype_promise = viewtype ? Promise.resolve(extension_.get(viewtype)) : get_view_type(gistname);

        return Promise.join(notebook_options, viewtype_promise,
                    function(opts, view_type) {
                        var page = view_type.page;
                        opts.do_path = view_type.do_path;
                        return ui_utils.make_url(page, opts);
                    });
    }

    function highlight(title) {
        if(title) {
            $("#view-type li a").css("font-weight", function() {
                return $(this).text() === title ? "bold" : "normal";
            });
        }
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
                                set_view_type(that.key);
                                highlight(that.key);
                                return resolve_view_url(shell.gistname(), shell.version(), that.key).then(function(url) {
                                    var shareable_link = RCloud.UI.navbar.control('shareable_link');
                                    shareable_link.set_url(url);
                                    shareable_link.open();
                                });
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
            return resolve_view_url(shell.gistname(), shell.version()).then(function(url) {
                var shareable_link = RCloud.UI.navbar.control('shareable_link');
                shareable_link.set_url(url);
            }).then(function() {
                return get_view_type_name(shell.gistname()).then(function(title) {
                    set_tooltip(title);
                    highlight(title);
                });
            });
        },
        resolve_view_link: function(gistname, version) {
            return resolve_view_url(gistname, version);
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
        if(options.$result_panel.length && options.show_result !== false)
            // instead of RCloud.UI.right_panel - this could be better encapsulated!
            options.$result_panel.parent().parent().data('collapsible-column').collapse(options.$result_panel, false);

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
            if($("#file")[0].files.length===0) {
              $("#upload-submit").prop('disabled', true);
            } else {
              $("#upload-submit").prop('disabled', false);
            }
        });
        $("#upload-submit").prop('disabled', true);
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
                $("#upload-submit").prop('disabled', true);
            }
        });
    },
    panel_sizer: function(el) {
        var padding = RCloud.UI.collapsible_column.default_padder(el);
        var height = 24 + $('#file-upload-controls').height() + $('#file-upload-results').height();
        return {height: height, padding: padding};
    }
};


RCloud.UI.thumb_dialog = (function() {

    var $dialog_ = $('#thumb-dialog'),
        $drop_zone_ = $('#thumb-drop-overlay'),
        $instruction_ = $drop_zone_.find('.inner'),
        $footer_ = $dialog_.find('.modal-footer'),
        $update_ok_ = $footer_.find('.btn-primary'),
        $drop_zone_remove_ = $('#thumb-remove'),
        $thumb_upload_ = $('#thumb-upload'),
        $selected_file_ = $('#selected-file'),
        $upload_success_ = $('#upload-success'),
        added_file_ = null,
        thumb_filename_ = 'thumb.png';

    var utils = {
        is_visible: function() {
            return $dialog_.is(':visible');
        },
        set_image: function(img_src) {
            var selector = $drop_zone_;
            if(selector.find('img').length === 0) {
                selector.append($('<img/>'));
            }

            selector.find('img').attr({
                'src' : img_src
            });

            return selector;
        },
        reset: function() {
            // remove selected thumb
            $drop_zone_.removeClass('active dropped');
            $drop_zone_.find('img').remove();
            added_file_ = null;
            ui_utils.disable_bs_button($update_ok_);

            // reset size of drop zone:
            $drop_zone_.css('height', $drop_zone_.data('height') + 'px');
        },
        verify: function(selected_file) {
            var valid = selected_file.length === 1 && selected_file[0].type === 'image/png';

            if(!valid) {
                $instruction_.effect('shake');
            }

            return valid;
        },
        display_image: function(data_url) {
            $drop_zone_.addClass('dropped');
            this.set_image(data_url);

            // show the complete:
            $upload_success_.show();

            setTimeout(function() {

                $upload_success_.animate({
                    'margin-top': '0px', 'opacity' : '0'
                }, {
                    duration: 'fast',
                    complete: function() {
                        $upload_success_.css({ 'opacity' :  '1.0', 'margin-top' : '35px' }).hide();
                    }
                });

            }, 1500);
        },
        upload: function(file) {
            // process:
            added_file_ = file;
            ui_utils.enable_bs_button($update_ok_);
            var that = this;

            var reader = new FileReader();
            reader.onload = function(e) {
                that.display_image(e.target.result);
            };

            reader.readAsDataURL(added_file_);
        },
        setup_paste: function() {

            var that = this;

            $(document).on('paste', function(event){

                if(!that.is_visible())
                    return;

                var items = (event.clipboardData || event.originalEvent.clipboardData).items;

                var thumb = _.find(items, function(item) {
                    return item.kind === 'file';
                });

                if(thumb && that.verify([thumb])) {
                    that.upload(thumb.getAsFile());
                }
            });
        },
        setup_asset_drop: function() {

            var showOverlay_, that = this;

            $(document).on('dragstart dragenter dragover', function (e) {

                if(!that.is_visible())
                    return;

                var dt = e.originalEvent.dataTransfer;

                if(!dt)
                    return;

                if (dt.types !== null && (dt.types.indexOf ?
                     (dt.types.indexOf('Files') != -1 && dt.types.indexOf('text/html') == -1) :
                     dt.types.contains('application/x-moz-file'))) {
                    if (!shell.notebook.model.read_only()) {
                        e.stopPropagation();
                        e.preventDefault();
                        $drop_zone_.addClass('active');
                        showOverlay_ = true;
                    } else {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }
            });

            $(document).on('drop dragleave', function (e) {

                if(!that.is_visible())
                    return;

                e.stopPropagation();
                e.preventDefault();
                showOverlay_ = false;
                setTimeout(function() {
                    if(!showOverlay_) {
                        $drop_zone_.removeClass('active');
                    }
                }, 100);
            });

            $drop_zone_.bind({
                drop: function (e) {

                    e = e.originalEvent || e;
                    var files = (e.files || e.dataTransfer.files);

                    if(that.verify(files)) {
                        that.upload(files[0]);
                    }
                },
                "dragenter dragover": function(e) {
                    var dt = e.originalEvent.dataTransfer;
                    if(!shell.notebook.model.read_only())
                        dt.dropEffect = 'copy';
                }
            });
        },
        init: function() {

            var that = this;

            $dialog_.on('hidden.bs.modal', function() {
                that.reset();
            });

            $footer_.find('.btn-cancel').on('click', function() {
                $dialog_.modal('hide');
                that.reset();
            });

            ui_utils.disable_bs_button($update_ok_);
            $update_ok_.on('click', function() {
                $dialog_.modal('hide');

                if(added_file_) {
                    RCloud.UI.upload_with_alerts(true, {
                        files: [added_file_],
                        filenames: [thumb_filename_],
                        show_result: false
                    }).catch(function() {}); // we have special handling for upload errors
                }

                that.reset();
            });

            $drop_zone_remove_.click(function() {
                that.reset();
            });

            $thumb_upload_.click(function() {
                $selected_file_.click();
            });

            $selected_file_.change(function(evt) {
                if(that.verify(evt.target.files)) {
                    that.upload(evt.target.files[0]);
                    // reset so identical file next time would trigger a change:
                    $selected_file_.val('');
                }
            });

            this.setup_asset_drop();
            this.setup_paste();
        },
        show: function() {

            $drop_zone_.removeClass('active');

            $dialog_.modal({
                keyboard: true
            });
        }
    };

    // http://stackoverflow.com/a/30407840
    function dataURLtoBlob(dataurl) {
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }

    return {
        init: function() {
            utils.init();
        },
        show: function() {
            utils.show();
        },
        is_visible: function() {
            return utils.is_visible();
        },
        display_image: function(data_url) {
            utils.display_image(data_url);
            added_file_ = dataURLtoBlob(data_url);
            ui_utils.enable_bs_button($update_ok_);
        }
    };
})();

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

    var Masonry_;

    var metric_handler = function() {

        var $el_ = $('#metric-type');
        var types_ = ['recently.modified', 'most.popular'];
        var default_type_ = types_[0];

        function set_active_link(metric_type) {
            $el_.find('li').removeClass('active');
            $el_.find('a[data-type="' + metric_type + '"]').parent().addClass('active');
        }

        function get_links() {
            return $el_.find('a');
        }

        function initialise_links() {
            _.each(get_links(), function(link) {
                // give the links proper URLs
                $(link).attr('href', '?metric=' + $(link).attr('data-type'));
            });
        }

        var updateQueryStringParam = function (key, value) {
            var baseUrl = [location.protocol, '//', location.host, location.pathname].join(''),
                param = '?' + key + '=' + value;

            window.history.pushState({ path : baseUrl + param  }, '', baseUrl + param);
        };

        var get_qs_metric = function() {
            var qs_metric = RCloud.utils.get_url_parameter('metric');

            return types_.indexOf(qs_metric) > -1 ? qs_metric : default_type_;
        };

        return {
            init: function(opts) {

                initialise_links();

                get_links().click(function(e) {

                    e.preventDefault();

                    var metric_type = $(this).attr('data-type');

                    set_active_link(metric_type);

                    updateQueryStringParam('metric', metric_type);

                    if(_.isFunction(opts.change)) {
                        opts.change(metric_type);
                    }
                });

                window.addEventListener('popstate', function(e) {
                    if(_.isFunction(opts.change)) {
                        var metric_type = get_qs_metric();
                        set_active_link(metric_type);
                        opts.change(metric_type);
                    }
                });

                var qs_metric = get_qs_metric();
                set_active_link(qs_metric);

                if(_.isFunction(opts.oncomplete)) {
                    opts.oncomplete(qs_metric);
                }
            }
        };
    };

    var discovery = {

        load_current_metric: function(current_metric) {

            var data, missing_img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAMAAAC3Ycb+AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAURQTFRF6PH06fH0+fv8w9fd+vz94+3xxtne5O7xwNXbx9nf9fn64u3w5/Dzwtbc5u/yxdjeydvgz9/k4ezv1eTo9vr73+vu3Ons8vf4+vz84+7x6/P13entx9rf5vDy7/X32efr9vn6wdbb3ert8vf5zd7jzN3i8/j59Pj51uTo8Pb48fb4zt/k0ODlytzh9/r7w9fc1+Xp0+LnwdXb1OPn2+js4ezw4Ozv7vT2yNrg2ebq6PHz6vL0xNjdy9zh2Obq2OXq2ufr0+Lm7fT20uLm6vL17PT25vDzyNvg+Pr73urt5/Hz8/f57vX36fL0+fz8xtnf8ff4zN7i1uXp9Pj6xNfd3Ojs3uru+Pv77PP1+Pv84Ovv1OPo0uHm0eHlzt7jy93i8Pb30ODk6/L17PP21ePo5O7yydvh5O/y0eHm4+3wv9Ta5e/yk3jLJAAACxdJREFUeNrs3f1bFNcVwPGjKLvruu4CAlKwCAFFgfAiWrWAUNpQkzZGY22jpmn63nv//9+rxii7DLszc8/MnNn5nufJ88TnYYZzzsfx7p25c1emxROGQuQ8IoY43l4fiBjyOC/iEbHk4cUjYsnjPQgidjx+AkHEjMcHEESsePwMgogRj48giNjw+ASCiAmPEyCIWPA4CYKIAY8uEESK9+gGQaRwjx4QRIr26AVBpGCPUyCIFOtxGgSRQj0iQBAp0iMKBJECPSJBECnOIxoEkcI8zgBBpCiPs0AQKcjjTBBEivE4GwSRQjz6gCBShEc/EEQK8OgLgkj+Hv1BEMndYwAIInl7DAJBJGePgSCI5OsxGASRXD1igCCSp0ccEERy9IgFgkh+HvFAEMnNIyYIInl5xAVBJCeP2CCI5OMRHwSRXDwSgCCSh0cSEERy8EgEgkj2HslAEMncIyEIIll7JAVBJOt+iUfEkkdyEESy7ZV4RCx5pAFBJMs+iUfEkkc6EESy65F4RCx5pAVBJKv+iEfEkkd6EESy6Y14RCx5hIAgkkVfxCNiySMMBBH9nohHxJJHKAgi2v0Qj4glj3AQRHR7IR4RSx4aIIho9kE8IpY8dEAQ0euBeERMdUA8IqbqF4+IqerFI2KqdvGImKpcPCKm6haPiKmqxSNiqmbxiJiqWDwipuoVj4ipasUjYqpW8YiYqlQ8IqbqFI+IqSrFI2KqRvGImKpQPCKm6hOPiKnqxCNiqjbxiJiqTDwipuoSj4ipqsQjYqom8YiYqkg8IqbqEY+IqWrEI2KqFvGImKpEPCKm6hCPiKkqxCNiqgbxiJiqQDwipvIXj4ip7MUjYip38YiYylw8IqbyFo+Iqax5v9waPy0AhAAEEAIQQAhAACEAAYQAhBhqkCdjoy5VtJcXAVGP2poLiLuAKMfFOeeGSKT0ILVAD+dmAdGMv4Z6uAeAKMa8C48/AaIWMyMKIMuAqMWWgoer1wDRGtE3+ne68S7aA0UeA6IUryMZlv95MPuq+a/uH202m5OTs1Pzb+qnjxgDROkCiRpB5u4PnNf3HrILiE48jLob8p/Bx021eg66B4hKLEeAvIpz4GbPQQ8B0YhmxHAwEu/fup6j1gDRiJWIC+Tf8Q7tGXzmANGI9QiQmOPzgtmZSIlBavWoD73/i3Pofbt3T0oMshM5yYs1p5joPep7QMLjv9HT7jifmObSfRYApG90IjQ2Go2lycHzEMN3T4oEqc0vNV44ozHSWN5vVgtkZcMZj4WtWnVAmh1Xgng6XhWQi21Xiti4XxGQjitJjM5UAmTFlSa+rwJIbaQ8INv3KgCy70oUExUAWSoTyHoFQBplAmlVAGSkTCAOkPd/L8c2n48tRI6yP0zsrxw+yA/kIiDO7b2/jzQeMV1Z+nCHabYBSH4gox9uIp1eKvr802fnPUByA/n4isDDPssRaqMD1i0uHW4uLi5Ovv1vZ2Ws8wKQ1CCfPtj0PKcdmRnwXOPn6Bydfio7/vjZCCCpQEY//ehGv/sYZ1wijYkzn2TsLG0DEgTS/aM73ecZizp4wCPDmZUXgKiB9PT68PTAsRrjfvlmGxAlkJ63mN+cGjomY/3+2t1tQFRANrvP07O4dyP+UoXxPUA0QH7oHg66P4J1mkly2KwDEg7i5k+epvsN3KOESUy2AQkHaZ24CromjfWDxFnMdAAJBnHtj5P4iZMDcyvN6/+1Z4AEgzj34/ulOVPHXTP4yXSJjAESDuLcbqPR/VJa62XaTJ4BogByajYYsF3JHiD6IPMBqdQagGiDhL0heH8BEF2QucAV0fuAqIJsB6+HXgVEEyR8HdugLYUASQLyVCGdx4DogUxp5PMAEC2QPZV8pgDRAlHawbIDiA5IRymhHUB0QA60MhoFRANkQy2ju4BogOhtq3QPEA2QJ3oprQMSDqK5Q8kEIOEgmruJjgMSDrKvmdMuIMEgqi8sLwESCrKhmtNrQEJBOqo57QASCqK7Q/g4IKEgyl9WVAckEGRTN6kNQAJBDnSTagMSCDKlm9QDQAABBJAMQXZ0k5oDJBBE+Vs/GNRDQZ7rJtUCJBDkSDWnGjP1UJAl1ZwmAQkF0f1enHlAQkG2VXM6AiT4AdVLzZzWAQkGUb3dWwckGERzR90pFjmEgywopnQIiMJCuXm9lNqAKIDofTX9IktJNUDqTa2MfgRE5XUErW8uqLUAUQHRWt37mhd2lF5p01no0P8LZgBJANJWyec5L32qvRatMYoM2DkAkCQgLYUV12tsHKC4tcaz4GyesNeJ6m5AodP1gTtmAZIMpBW4HdDAfRcBSbiB2YOgXObZUU59i7+Q9xJeLgCiDuIOU2cyHuP8gCQGST0bae46QLIASSkyHmv7d0BSgKRaNTcZ7+SApAFxq4k3J51qOUCyA3GN+8mS2Ip7YkDSgbiFJMvhm+sOkIxBnNuLPWmfWHCAZA/i6luxRpLFRN+jC0h6EOdad2cG/fbZ9WSnBOTko/K6SxqtN/1G99r+cdITAuLcx7HgiUsTxyvN6F+8s9pKfjZATtwuXHYpo702/6r70pi9u76d6lSAfLoVcuSCorG8unq4srK6unrcTn8WQN5F52Dm4sGcsxCAGAtAAAEEkBKFH36Qp2XyaFUAZKlMIMcVAHlcJpCtCoDUWuXxqI9XACT+07riY81XAaQ2VxaP3WYlQHyzJJ98FyZ9NUD8vVJcI7t5exQH4mtbC+bH87WLvjogb//Zmlg3PENsd7buFdCUIkEIQAAhAAGEAAQQAhBACEAIQAAhAAGEAAQQAhBACEAIQAAhAAGEAAQQYqhBbn9+xWRPzl04V0mQ21evGP1bWqSI4GFLRPCwJVIUyJ2rtsfWwkQED1sigoctEcHDlkgRIHdulGOOVohIASDflMSjGBHBw5ZI7iDTJfIoQkTwsCWSM8j0Je8RsQNSPo/cRXIF+ayEHnmLCB62RAQPWyKChy0RwcOWSF4gX5XaI0cRwcOWSD4gN7/1HhE7IMPgkZdIHiA3b3mPiB2QYfHIR0TwsCWSOcitIfLIQ0TwsCWSMcitm94jYgdk+DwyF8kU5Nsh9MhaRPCwJZIhyKWvvEfEDsjwemQqkhnIpc+8R8QOyHB7ZCgieNgSETxsiQgetkSyALk07T0idkCq4pGNiOBhS0Qd5EaFPLIQETxsiSiD3PjGe0TsgFTPQ11EFeTGHe8RsQNytZIeyiKChy0RwcOWiBbIlau3vUfEDEjFPRRFBA9bIiogVz6vvIeaiOBhS0Q0PP6GhpqI4GFLRMI9fomEoojgYUtE8LAlEgZy5fd4KIsIHrZEQkCu46EvInjYEkkPcp3xPAsR4fqwJZIW5Pqf8chERNJ6/IGuZyIieNgSSQVy/Ts8shIRPGyJpAC5fv5XdDszEcHDlkhikC/wyFRE8LAlkhDki+/wyFZEuD5siQgetkSSgFw+/xv6m7WI4GFLRPCwJSJ42BIRPGyJCB62RCSmx+/oaT4igoctEcHDlojgYUtE8LAlIoM9/kEncxQRPGyJyCCPv9DFXEX6g1z+Go+cRQQPWyL9QC5f+wX9y1tE8LAlcjbIl3gUISJ42BI5C+TLr/EoRES4PmyJRIM8wqMoEcHDlkgUyCPGj+JEhOvDlojgYUvkFMijC3+nUwWKCB62RHpA5MJv6VKhIoKHLZEuELmGR9EiwvVhS0TwsCUiJzx+TW+KFxE8bInIx/EcDxMiwvVhS0TwsCUiP/0BDysigoctEXn3P3+kG2ZExJ+7hochEeH6sCUieJgSmf6/AAMAF4/8wMtS1yoAAAAASUVORK5CYII=';
            current_metric = current_metric || 'recently.modified';

            $('body').addClass('loading');

            var anonymous = !rcloud.username();

            return rcloud.discovery.get_notebooks(current_metric).then(function(discover_data) {
                data = discover_data;

                // get the detailed notebook info:
                return RCloud.discovery_model.get_notebooks(anonymous, Object.keys(data.values));

            }).then(function(notebooks) {

                var notebook_pairs = _.chain(data.values)
                        .pairs()
                        .filter(function(kv) {
                            return kv[0] != 'r_attributes' && kv[0] != 'r_type' &&
                                !_.isEmpty(notebooks[kv[0]]);
                        });

                // assumes we always want descending, among other things
                if(data.sort === 'date') {
                    notebook_pairs = notebook_pairs
                        .map(function(kv) { return [kv[0], Date.parse(kv[1])]; })
                        .sortBy(function(kv) { return kv[1] * -1; });
                } else if(data.sort === 'number') {
                    notebook_pairs = notebook_pairs.sortBy(function(kv) {
                        return kv[1] * -1;
                    });
                }

                var get_path_and_name = function(notebook_description) {
                    if(!notebook_description || notebook_description.lastIndexOf('/') == -1) {
                        return {
                            path: undefined,
                            name: notebook_description
                        };
                    } else {
                        return {
                            path: notebook_description.substring(0, notebook_description.lastIndexOf('/')),
                            name: notebook_description.substring(notebook_description.lastIndexOf('/') + 1)
                        };
                    }
                };

                // temporary limit of 100:
                notebook_pairs = notebook_pairs.value();
                if(notebook_pairs.length > 100) {
                    notebook_pairs = notebook_pairs.slice(0, 100);
                }

                var notebook_data_promises = notebook_pairs
                        .map(function(notebook) {
                            var current = notebooks[notebook[0]];
                            var desc = get_path_and_name(current.description);
                            return rcloud.discovery.get_thumb(notebook[0]).then(function(thumb_src){
                                return {
                                    id: notebook[0],
                                    time: notebook[1],
                                    description: desc.name,
                                    folder_path: desc.path,
                                    last_commit: current.last_commit,
                                    last_commit_date: new Date(current.last_commit).toDateString(),
                                    page: anonymous ? 'view.html' : 'edit.html',
                                    username: current.username,
                                    stars: current.stars,
                                    star_icon: !_.isUndefined(current.is_starred_by_me) && current.is_starred_by_me ? 'icon-star' : 'icon-star-empty',
                                    forks: current.forks,
                                    image_src: thumb_src || missing_img
                                };
                            });
                        });

                return Promise.all(notebook_data_promises).then(function(page_notebooks) {

                    var template = _.template(
                        $("#item_template").html()
                    );

                    $('.grid').html(template({
                        notebooks: page_notebooks
                    })).imagesLoaded(function() {
                        new Masonry_( '.grid', {
                            itemSelector: '.grid-item',
                            transitionDuration: 0
                        });

                        if(!$('.body').hasClass('loaded')) {
                            $('body').addClass('loaded');
                        }
                    
                        $('body').scrollTop(0).removeClass('loading');

                    });
                });
            });
        },

        init: function() {
            return new Promise(function(resolve, reject) {
                require([
                    'imagesloaded.pkgd.min',
                    'masonry.pkgd.min'
                ], function(imagesLoaded, Masonry) {
                    'use strict';

                    Masonry_ = Masonry;

                    var metric = new metric_handler();

                    metric.init({
                        change: function(metric) {
                            discovery.load_current_metric(metric);
                        },
                        oncomplete: function(metric) {
                            resolve(discovery.load_current_metric(metric));
                        }
                    });

                }, reject);
            });
        }
    };

    return discovery;
})();


RCloud.UI.notebook_tree_search_service = (function() {

    var notebook_tree_search_service = function() {
        "use strict";
    };

    notebook_tree_search_service.prototype = {
        get_results: function(params) {
            // params.notebook
            // params.username
            return new Promise(function(resolve) {
                return rcloud.search_description(params.notebook).then(function(res) {
                    resolve(
                        _.map(res.response.docs, function(item) {
                            return {
                                id: item.id,
                                author: item.user,
                                name: item.description,
                                star_count: item.starcount,
                                updated_at: item.updated_at
                            }
                        }));
                });
            });
        }
    };

    return notebook_tree_search_service;

})();

RCloud.UI.incremental_search = (function() { 
    
    var _template,
        _resultsTemplate,
        _elementSelector,
        _inputsSelector,
        _resultsSelector,
        _resultItemSelector,
        _dialogVisible = false,
        _dialog = undefined,
        _search_service = new RCloud.UI.notebook_tree_search_service();

    function toggle_incremental_search() {
        if(!_dialogVisible) {
            _dialog.modal({keyboard: true});
        }

        _dialogVisible = true;
    }
    
    var result = {
        init: function() {

            _template = _.template($('#tree-finder-template').html()),
            _resultsTemplate = _.template($('#tree-finder-result-template').html()),
            _elementSelector = '#tree-finder-dialog',
            _inputsSelector = _elementSelector + ' input',
            _resultsSelector = _elementSelector + ' .results',
            _resultItemSelector = _resultsSelector + '> p';
            _search_service = new RCloud.UI.notebook_tree_search_service();

            if(rcloud.search) {
                RCloud.UI.shortcut_manager.add([{
                    category: 'Incremental Search',
                    id: 'incremental_search',
                    description: 'Show incremental search',
                    keys: {
                        win_mac: [
                            ['alt', 's']
                        ]
                    },
                    action: function() {
                        toggle_incremental_search();
                    }
                }]);
            }

            $('body').append(_template({
                // pass data in here
            }));

            _dialog = $(_elementSelector);

            $(_dialog).on('shown.bs.modal', function() {
                $($(_inputsSelector)[0]).focus();
            });

            $(_dialog).on('hidden.bs.modal', function () {
                $(_elementSelector).modal('hide');
                $(_inputsSelector).val('');
                $(_resultsSelector).html('');
                _dialogVisible = false;
            });

            $(_inputsSelector).on('keyup', function() {
                var entries = [];
                
                $(_inputsSelector).map(function(index) {
                    entries.push($(this).val());
                });

                if(_.any(entries, function(entry) { return entry.length; })) {
                    _search_service.get_results({
                        notebook: entries[0],
                        username: entries[1]                        
                    }).then(function(results) {
                        $(_resultsSelector).html(_resultsTemplate({
                            notebooks: results
                        }));
                    });
                } else {
                    $(_resultsSelector).html('');
                }
            });

            $(_resultsSelector).on('click', 'p', function() {

                var selected_id = $(this).data('id');

                rcloud.config.get_current_notebook().then(function(res) {
                    if(res.notebook !== selected_id) {
                        // todo: open notebook,
                        // (if it's a different ID from the current open notebook)
                        editor.load_notebook(selected_id);
                    }

                    $(_elementSelector).modal('hide');
                });

                
            })
        }
    };

    return result;
})();

RCloud.UI.date_filter = (function(selector) {

    var date_filter = function(selector) {
        this.$el_ = $(selector + ' select');
        this.on_change = new RCloud.UI.event(this);

        var that = this;
        this.$el_.on('change', function() {
            that.on_change.notify({
                prop: 'tree-filter-date',
                value: $(this).val()
            });
        });

        this.val = function(value) {
            this.$el_.val(value);
        }
    };

    return date_filter;

})();

RCloud.UI.notebook_tree_model = (function(username, show_terse_dates, show_folder_dates) {

    var notebook_tree_model = function(username, show_terse_dates, show_folder_dates) {

        "use strict";

        // major key is adsort_order and minor key is name (label)
        this.order = {
            HEADER: 0, // at top (unused)
            NOTEBOOK: 1,
            MYFOLDER: 2,
            SUBFOLDER: 4
        };

        this.orderType = {
            DEFAULT: 0,
            DATE_DESC: 1
        };

        this.username_ = username;
        this.show_terse_dates_ = show_terse_dates;
        this.show_folder_dates_ = show_folder_dates;
        this.path_tips_ = false; // debugging tool: show path tips on tree

        this.tree_data_ = [];
        this.histories_ = {}; // cached notebook histories
        this.notebook_info_ = {}; // all notebooks we are aware of
        this.num_stars_ = {}; // number of stars for all known notebooks
        this.fork_count_ = {};
        this.my_stars_ = {}; // set of notebooks starred by me
        this.my_friends_ = {}; // people whose notebooks i've starred
        this.featured_ = []; // featured users - samples, intros, etc
        this.invalid_notebooks_ = {};
        this.current_ = null; // current notebook and version
        this.gist_sources_ = null; // valid gist sources on server
        this.lazy_load_ = {}; // which users need loading

        this.sorted_by_ = this.orderType.DEFAULT;
        this.matches_filter_ = [];
        this.empty_folders_ = [];
        this.folder_last_commits = {};

        // functions that filter the tree:
        this.tree_filters_ = {
            tree_filter_date: function() { return true; }
        };

        this.CONFIG_VERSION = 1;

        this.on_initialise_tree = new RCloud.UI.event(this);
        this.on_load_by_user = new RCloud.UI.event(this);
        this.on_open_and_select = new RCloud.UI.event(this);
        this.on_load_children = new RCloud.UI.event(this);
        this.on_add_node_before = new RCloud.UI.event(this);
        this.on_append_node = new RCloud.UI.event(this);
        this.on_update_node = new RCloud.UI.event(this);
        this.on_remove_node = new RCloud.UI.event(this);
        this.on_fake_hover = new RCloud.UI.event(this);
        this.on_select_node = new RCloud.UI.event(this);
        this.on_load_data = new RCloud.UI.event(this);
        this.on_show_history = new RCloud.UI.event(this);
        this.on_open_node = new RCloud.UI.event(this);
        this.remove_history_nodes = new RCloud.UI.event(this);
        this.on_update_sort_order = new RCloud.UI.event(this);
        this.on_update_show_nodes = new RCloud.UI.event(this);
        this.on_settings_complete = new RCloud.UI.event(this);
    };

    notebook_tree_model.prototype = {

        username: function() {
            return this.username_;
        },

        show_terse_dates: function(show_terse_dates) {
            if(arguments.length) {
                this.show_terse_dates_ = show_terse_dates;
            } else {
                return this.show_terse_dates_;
            }
        },

        path_tips: function() {
            return this.path_tips_;
        },

        set_current: function(current) {
            this.current_ = current;
        },

        get_current: function() {
            return this.current_;
        },

        get_current_notebook_histories: function() {
            return this.histories_[this.current_.notebook];
        },

        get_current_notebook_history_index: function() {
            var that = this;
            return this.current_.version === null ?
                0 :
                this.find_index(this.get_current_notebook_histories(), function(h) {
                    return h.version === that.current_.version;
                });
        },

        get_history_by_index: function(index) {
            return this.histories_[this.current_.notebook][index];
        },

        get_previous: function() {
            // no version at latest:
            var current_index = this.current_.version === null ? 0 : this.get_current_notebook_history_index.call(this);

            if(current_index === this.get_current_notebook_histories().length - 1) {
                return undefined;   // already at first
            } else {
                return this.get_history_by_index(current_index + 1).version;
            }
        },

        get_next: function(){
            var current_index = this.get_current_notebook_history_index();

            if(current_index === 0) {
                return undefined;
            } else {
                return current_index - 1 === 0 ? null : this.get_history_by_index(current_index - 1).version;
            }
        },

        get_gist_sources: function() {
            return this.gist_sources_;
        },

        // work around oddities of rserve.js
        each_r_list: function(list, f) {
            for(var key in list)
                if(key!=='r_attributes' && key!=='r_type')
                    f(key);
        },

        r_vector: function(value) {
            return _.isArray(value) ? value : [value];
        },

        //  Model functions
        someone_elses: function(name) {
            return name + "'s Notebooks";
        },

        get_notebook_star_count: function(gistname) {
            return this.num_stars_[gistname] || 0;
        },

        set_notebook_star_count: function(gistname, count) {
            this.num_stars_[gistname] = count;
        },

        notebook_star_count_exists: function(notebook_id) {
            return _.has(this.num_stars_, notebook_id);
        },

        is_notebook_starred_by_current_user: function(gistname) {
            return this.my_stars_[gistname] || false;
        },

        has_notebook_info: function(gistname) {
            return this.notebook_info_[gistname];
        },

        get_notebook_info: function(gistname) {
            return this.notebook_info_[gistname] || {};
        },

        set_notebook_info: function(gistname, value) {
            this.notebook_info_[gistname] = value;
        },

        set_visibility: function(gistname, visible) {
            var entry = this.notebook_info_[gistname] || {};
            entry.visible = visible;
            this.notebook_info_[gistname] = entry;
            return rcloud.set_notebook_visibility(gistname, visible);
        },

        add_interest: function(user, gistname) {
            if(!this.my_stars_[gistname]) {
                this.my_stars_[gistname] = true;
                this.my_friends_[user] = (this.my_friends_[user] || 0) + 1;
            }
        },

        remove_interest: function(user, gistname) {
            if(this.my_stars_[gistname]) {
                delete this.my_stars_[gistname];
                if(--this.my_friends_[user] === 0)
                    delete this.my_friends_[user];
            }
        },

        get_my_star_count_by_friend:function(user) {
            return this.my_friends_[user];
        },

        user_is_friend: function(user) {
            return this.my_friends_[user];
        },

        get_notebooks_by_user: function(username) {
            var that = this;
            var already_know = _.pick(that.notebook_info_, _.filter(Object.keys(that.notebook_info_), function(id) {
                    return that.notebook_info_[id].username === username && !that.notebook_info_[id].recent_only;
                }));

            return rcloud.config.all_user_notebooks(username)
                .then(that.get_infos_and_counts)
                .then(function(notebooks_stars) {
                    // merge these notebooks and stars
                    _.extend(that.notebook_info_, notebooks_stars.notebooks);
                    _.extend(that.num_stars_, notebooks_stars.num_stars);
                    // additionally, merge any notebooks we already knew about back into the list
                    _.extend(notebooks_stars.notebooks, already_know);
                    return notebooks_stars.notebooks;
                });
        },

        remove_notebook_view: function(user, gistname) {

            var that = this;

            function do_remove(id) {
                var node = that.get_node_by_id(id);
                if(node) {
                    that.remove_node(node);
                } else {
                    console.log("tried to remove node that doesn't exist: " + id);
                }
            }

            if(this.my_friends_[user]) {
                do_remove(this.node_id('friends', user, gistname));
            }

            do_remove(this.node_id('alls', user, gistname));
        },

        populate_users: function(all_the_users) {
            var that = this;
            if(_.isString(all_the_users))
                all_the_users = [all_the_users];
            all_the_users.forEach(function(u) {
                that.lazy_load_[u] = true;
            });
            return {
                label: 'All Notebooks',
                id: '/alls',
                children: _.map(all_the_users, function(u) {
                    return that.lazy_node('alls', u);
                }).sort(this.compare_nodes.bind(this))
            };
        },

        populate_friends: function(all_the_users) {
            var that = this;
            return {
                label: 'People I Starred',
                id: '/friends',
                children: all_the_users.filter(function(u) {
                    return that.my_friends_[u]>0;
                }).map(function(u) {
                    return that.lazy_node('friends', u);
                }).sort(this.compare_nodes.bind(this))
            };
        },

        get_folder_last_commit_date: function(node_id) {
            return this.folder_last_commits[node_id];
        },

        get_most_recent_child: function(node) {

            var that = this,
                latest_commit = null,
                node_chain = [],
                pluck_node_data = function(child) {
                    return {
                        id: child.id,
                        last_commit: child.last_commit
                    };
                }, insert_into_chain = function(parent) {

                    var existing_parent_root_chain = _.findWhere(node_chain, { parent_id : parent.id });

                    if(!existing_parent_root_chain) {
                        node_chain.push({
                            parent_id: parent.id,
                            children: _.map(parent.children, function(child) {
                                return pluck_node_data(child)
                            })
                        });
                    }

                    _.each(parent.children, function(child) {

                        var matching = _.filter(node_chain, function(parent_children) {
                            return parent.id != parent_children.parent_id &&
                                _.pluck(parent_children.children, 'id').indexOf(parent.id) != -1;
                        });

                        _.each(matching, function(chain) {
                            chain.children.push(pluck_node_data(child));
                        });
                    });
                }, get_children = function(parent) {

                if (parent && parent.children) {

                    insert_into_chain(parent);

                    _.each(parent.children, function(child) {
                        if(child.last_commit > latest_commit) {
                            latest_commit = child.last_commit;
                        }

                        get_children(child);

                    });
                }
            };

            get_children(node);

            _.each(node_chain, function(chain) {
                that.folder_last_commits[chain.parent_id] = _.max(_.pluck(chain.children, 'last_commit'));
            });

            return latest_commit;
        },

        is_date_sorted: function() {
            return this.sorted_by_ === this.orderType.DATE_DESC;
        },

        compare_nodes: function(a, b) {

            var so = a.sort_order - b.sort_order,
                that = this;
            if(so) {
                return so;
            }
            else {
                var alab = a.name || a.label,
                    blab = b.name || b.label;

                if(this.sorted_by_ === this.orderType.DEFAULT ||
                !(a.sort_order === this.order.NOTEBOOK && b.sort_order === this.order.NOTEBOOK)) {
                    // cut trailing numbers and sort separately
                    var amatch = RCloud.utils.split_number(alab),
                    bmatch = RCloud.utils.split_number(blab);

                    if(amatch && bmatch && amatch[0] == bmatch[0]) {
                        var an = +amatch[1], bn = +bmatch[1];
                        return an - bn;
                    }

                    var lc = alab.localeCompare(blab);
                    if(lc === 0) {
                        // put a folder with the same name as a notebook first
                        if(a.children) {
                            if(b.children)
                                throw new Error("uh oh, parallel folders");
                            return -1;
                        }
                        else if(b.children)
                            return 1;
                        // make sort stable on gist id (creation time would be better)
                        lc = a.gistname.localeCompare(b.gistname);
                    }

                    return lc;

                } else {

                    var get_date = function(node) {
                        if(!node.last_commit && !node.children) {
                            return Infinity;
                        } else {
                            return node.last_commit ? new Date(node.last_commit) : that.get_most_recent_child(node);
                        }
                    };

                    return get_date(b) - get_date(a);
                }
            }
        },

        lazy_node: function(root, user) {
            var mine = user === this.username_;
            var id = this.node_id(root, user);
            return {
                label: mine ? "My Notebooks" : this.someone_elses(user),
                id: id,
                sort_order: mine ? this.order.MYFOLDER : this.order.SUBFOLDER,
                children: [{ label : 'loading...' }],
                user: user,
                root: root
            };
        },

        populate_interests: function(my_stars_array) {

            var that = this;

            function create_user_book_entry_map(books) {
                var users = {};
                _.each(books,
                    function(book){
                        var entry = that.notebook_info_[book];
                        if(!entry) {
                            that.invalid_notebooks_[book] = null;
                            return users;
                        }
                        if(!entry.username || entry.username === "undefined" ||
                            !entry.description || !entry.last_commit) {
                            that.invalid_notebooks_[book] = entry;
                            return users;
                        }
                        var user = users[entry.username] = users[entry.username] || {};
                        user[book] = entry;
                        return users;
                    });
                return users;
            }

            var interests = create_user_book_entry_map(Object.keys(my_stars_array));
            var user_nodes = [];
            for (var username in interests) {
                var user_notebooks = interests[username];
                for(var gistname in user_notebooks) {
                    this.add_interest(username, gistname);
                    // sanitize... this shouldn't really happen...
                    if(!user_notebooks[gistname].description)
                        user_notebooks[gistname].description = "(no description)";
                }

                var notebook_nodes = this.convert_notebook_set('interests', username, user_notebooks);
                var id = this.node_id('interests', username);
                var mine = username === this.username_;
                var node = {
                    label: mine ? "My Notebooks" : this.someone_elses(username),
                    id: id,
                    sort_order: mine ? this.order.MYFOLDER : this.order.SUBFOLDER,
                    children: this.as_folder_hierarchy(notebook_nodes, id).sort(this.compare_nodes.bind(this))
                };
                user_nodes.push(node);
            }
            return {
                label: 'Notebooks I Starred',
                id: '/interests',
                children: user_nodes.sort(this.compare_nodes.bind(this))
            };
        },

        as_folder_hierarchy: function(nodes, prefix, name_prefix) {
            var that = this;
            function is_in_folder(v) { return v.label.match(/([^/]+)\/(.+)/); }
            var in_folders = nodes;
            // tired of seeing the "method 'match' of undefined" error
            if(_.some(in_folders, function(entry) {
                return entry.label === undefined || entry.label === null;
            }))
            throw new Error("incomplete notebook entry (has it been shown yet?)");
            in_folders = _.filter(in_folders, is_in_folder);
            in_folders = _.map(in_folders, function(v) {
                var m = v.label.match(/([^/]+)\/(.+)/);
                var r = _.clone(v);
                r.folder_name = m[1];
                r.label = m[2];
                return r;
            });
            in_folders = _.groupBy(in_folders, function(v) {
                return v.folder_name;
            });
            in_folders = _.map(in_folders, function(v, k) {
                var children = _.map(v, function(o) {
                    return _.omit(o, "folder_name");
                });
                var id = prefix + '/' + k,
                    full_name = (name_prefix ? name_prefix + '/' : '')  + k;
                return {
                    label: k,
                    full_name: full_name,
                    user: v[0].user,
                    sort_order: that.order.NOTEBOOK,

                    id: id,
                    children: that.as_folder_hierarchy(children, id, full_name)
                };
            });
            var outside_folders = _.filter(nodes, function(v) {
                return !is_in_folder(v);
            });
            outside_folders.forEach(function(v) {
                v.full_name = (name_prefix ? name_prefix + '/' : '')  + v.label;
            });

            var result = outside_folders.concat(in_folders).sort(this.compare_nodes.bind(this));

            return result;
        },

        convert_notebook_set: function(root, username, set) {
            var notebook_nodes = [];
            var that = this;
            for(var name in set) {
                var attrs = set[name];
                var result = {
                    label: attrs.description,
                    gistname: name,
                    user: username,
                    root: root,
                    visible: attrs.visible,
                    source: attrs.source,
                    last_commit: attrs.last_commit ? new Date(attrs.last_commit) : 'none',
                    id: that.node_id(root, username, name),
                    sort_order: that.order.NOTEBOOK,
                    fork_desc:attrs.fork_desc
                };
                notebook_nodes.push(result);
            }
            return notebook_nodes;
        },

        node_id: function(root, username, gistname, version) {
            var ret = '';
            for(var i=0; i < arguments.length; ++i)
                ret = ret + '/' + arguments[i];
            return ret;
        },

        load_user_notebooks: function(username) {
            var that = this,
                merge_filter_matches = function(details) {
                    that.matches_filter_ = _.union(that.matches_filter_, details.matching_notebooks);
                    that.empty_folders_ = _.union(that.empty_folders_, details.empty_folders);
                };

            if(!that.lazy_load_[username])
                return Promise.resolve();

            return that.get_notebooks_by_user(username).then(function(notebooks) {
                // load "alls" tree for username, and duplicate to friends tree if needed
                var pid = that.node_id("alls", username);
                var root = that.get_node_by_id(pid);

                var notebook_nodes = that.convert_notebook_set("alls", username, notebooks);
                var alls_data = that.as_folder_hierarchy(notebook_nodes, pid).sort(that.compare_nodes.bind(that));

                merge_filter_matches(that.get_filter_matches([{
                    children: alls_data
                }]));

                delete that.lazy_load_[username];

                // add nodes to the model:
                that.load_tree_data(alls_data, pid);

                var duplicate_data;
                if(that.my_friends_[username]) {
                    // update model for friend's notebooks:
                    var ftree = that.duplicate_tree_data(root, that.transpose_notebook('friends'));

                    merge_filter_matches(that.get_filter_matches([{
                        children: ftree
                    }]));

                    // add nodes to the model:
                    that.load_tree_data(ftree.children, that.node_id('friends', username));

                    // for the view:
                    duplicate_data = ftree.children;
                }

                that.on_load_by_user.notify({
                    pid: that.node_id('alls', username),
                    data: alls_data,
                    duplicate_data: duplicate_data,
                    duplicate_parent_id: that.node_id('friends', username)
                });
            });
        },

        add_notebook_info: function(user, gistname, entry) {
            if(!this.notebook_info_[gistname])
                this.notebook_info_[gistname] = {};
            _.extend(this.notebook_info_[gistname], entry);
            var p = rcloud.set_notebook_info(gistname, entry);
            if(user === this.username())
                p = p.then(function() { rcloud.config.add_notebook(gistname); });
            return p;
        },

        tag_notebook_version: function(id, version, tag) {
            var history = this.histories_[id];

            for(var i=0; i<history.length; ++i) {
                if (history[i].version === version) {
                    history[i].tag = tag;
                }
                if(history[i].tag === tag && history[i].version != version) {
                    history[i].tag = undefined;
                }
            }
        },

        update_notebook/*_model*/: function(user, gistname, description, time) {
            var that = this;
            return that.load_user_notebooks(user).then(function() {
                var entry = that.notebook_info_[gistname] || {};

                entry.username = user;
                entry.description = description;
                entry.last_commit = time;

                that.add_notebook_info(user, gistname, entry);
                return entry; // note: let go of promise
            });
        },

        update_notebook_from_gist: function(result, history, selroot) {
            var user = result.user.login, gistname = result.id;
            var that = this;
            // we only receive history here if we're at HEAD, so use that if we get
            // it.  otherwise use the remembered history if any.  otherwise
            // update_history_nodes will do an async call to get the history.
            if(history)
                that.histories_[gistname] = history;

            return that.update_notebook/*_model*/(user, gistname,
                                        result.description,
                                        result.updated_at || result.history[0].committed_at)
                .then(function(entry) {
                    return that.update_notebook_view(user, gistname, entry, selroot);
                });
        },

        // special case for #1867: skip user level of tree for featured users
        skip_user_level: function(root) {
            return root === 'featured' && this.featured_.length === 1;
        },

        update_tree_node: function(node, data) {

            _.extend(node, data);

            this.on_update_node.notify({
                node: node,
                data: data
            });
        },

        set_node_open_status: function(node, is_open) {
            var tree_node = this.get_node_by_id(node.id);
            tree_node.is_open = is_open;
        },

        remove_node: function(node) {

            var parent = this.get_parent(node.id);

            this.on_fake_hover.notify({
                node: node
            });

            // remove node from model:
            parent.children = _.without(parent.children, _.findWhere(parent.children, {
                id: node.id
            }));

            this.remove_node_notify({
                node: node
            });

            this.remove_empty_parents(parent);

            if(node.root === 'interests' && node.user !== this.username_ && parent.children.length === 0){
                // remove node from model:
                var interests_node = this.get_node_by_id('/interests');
                interests_node.children = _.without(interests_node.children, _.findWhere(interests_node.children, {
                    id: parent.id
                }));

                // remove from tree:
                this.remove_node_notify({
                    node: parent
                });

            }
        },

        remove_node_notify: function(args) {

            // might be a noop, but no side-effects if not found:
            this.matches_filter_ = _.without(this.matches_filter_, args.node.id);

            this.on_remove_node.notify(args);
        },

        unstar_notebook_view: function(user, gistname, selroot) {
            var inter_id = this.node_id('interests', user, gistname);
            var node = this.get_node_by_id(inter_id); // that.$tree_.tree('getNodeById', inter_id);
            if(!node) {
                console.log("attempt to unstar notebook we didn't know was starred", inter_id);
                return;
            }
            //this.remove_tree_node(node);
            this.remove_node(node);
            return this.update_notebook_view(user, gistname, this.get_notebook_info(gistname), selroot);
        },

        update_notebook_view: function(user, gistname, entry, selroot) {

            var that = this;

            function open_and_select(node) {
                if(that.current_.version) {
                    //$tree_.tree('openNode', node);
                    var id = that.skip_user_level(node.root) ?
                            that.node_id(node.root, gistname, that.current_.version) :
                            that.node_id(node.root, user, gistname, that.current_.version);
                    //var n2 = $tree_.tree('getNodeById', id);

                    var n2 = that.get_node_by_id(id);

                    if(!n2)
                        throw new Error('tree node was not created for current history');
                    node = n2;
                }
                that.on_select_node.notify({
                    node: node
                });
            }

            var p, i_starred = that.my_stars_[gistname] || false;
            var promises = [];

            if(selroot === true)
                selroot = that.featured_.indexOf(user) >=0 ? 'featured' :
                    i_starred ? 'interests' :
                    that.my_friends_[user] ? 'friends': 'alls';

            if(i_starred) {
                p = that.update_tree_entry('interests', user, gistname, entry, true);
                if(selroot==='interests')
                    p = p.then(open_and_select);
                promises.push(p);
            }

            if(gistname === that.current_.notebook) {
                var starn = RCloud.UI.navbar.control('star_notebook');
                if(starn) {
                    starn.set_fill(i_starred);
                    starn.set_count(that.num_stars_[gistname]);
                }
            }

            if(that.my_friends_[user]) {
                p = that.update_tree_entry('friends', user, gistname, entry, true);
                if(selroot==='friends')
                    p = p.then(open_and_select);
                promises.push(p);
            }

            if(that.featured_.indexOf(user)>=0) {
                p = that.update_tree_entry('featured', user, gistname, entry, true);
                if(selroot==='featured')
                    p = p.then(open_and_select);
                promises.push(p);
            }

            p = that.update_tree_entry('alls', user, gistname, entry, true);
            if(selroot==='alls')
                p = p.then(open_and_select);
            promises.push(p);

            return Promise.all(promises);
        },

        find_sort_point: function(data, parent) {
            // this could be a binary search but linear is probably fast enough
            // for a single insert, and it also could be out of order
            if(parent.children) {
                for(var i = 0; i < parent.children.length; ++i) {
                    var child = parent.children[i];

                    var so = this.compare_nodes.call(this, data, child);
                    if(so < 0) {
                        return {
                            child: child,
                            position: i
                        };
                    }
                }
            }

            return undefined;
        },

        insert_in_order: function(node_to_insert, parent) {

            // verify whether this node matches the current filter:
            if(node_to_insert.gistname) {
                if(RCloud.utils.filter(node_to_insert, _.values(this.tree_filters_)).length == 1) {
                    this.matches_filter_.push(node_to_insert.id);
                }
            }

            if(typeof parent === 'string') {
                parent = this.get_node_by_id(parent);
            }

            var before = this.find_sort_point(node_to_insert, parent);

            if(before) {
                // splice children:
                parent.children.splice(before.position, 0, node_to_insert);

                this.on_add_node_before.notify({
                    node_to_insert: node_to_insert,
                    existing_node: before.child
                });

                return node_to_insert;

            } else {
                // add node to model:
                if(!parent.children) {
                    parent.children = [];
                }

                parent.children.push(node_to_insert);

                this.on_append_node.notify({
                    node_to_insert: node_to_insert,
                    parent_id: parent.id
                });

                return node_to_insert;
            }
        },

        traverse: function() {
            function traverse(o) {
                for (var i in o) {
                    if (!!o[i] && typeof(o[i])=="object") {
                        console.log('traverse output: ', o[i]);
                        traverse(o[i]);
                    }
                }
            }
            traverse(this.tree_data_);
        },

        get_filter_matches: function(notebooks) {
            // do the filtering:
            var matching_notebooks = [],
            that = this,
            empty_folders = [],
            current_matches = [],
            set_status = function(notebooks, matches_filter) {
                _.each(notebooks, function(n) {
                    n.matches_filter = matches_filter;
                });
            },
            get_matching_notebooks = function(o) {
                for(var i in o) {
                    if (!!o[i] && typeof(o[i])=="object") {
                        if(o[i].hasOwnProperty('children')) {

                            current_matches = _.filter(o[i].children, function(child) {
                                return child.gistname && !child.version;
                            });

                            set_status(current_matches, false);

                            current_matches = RCloud.utils.filter(current_matches, _.values(that.tree_filters_));

                            if(current_matches && current_matches.length) {
                                matching_notebooks.push.apply(matching_notebooks, current_matches);
                                // these match:
                                set_status(current_matches, true);

                                // this is a folder with children; ensure that any parent folders
                                // that were previously marked as hidden are removed:
                                if(!o[i].gistname) {
                                    var ancestors = [];
                                    _.each(empty_folders, function(folder) {
                                        if(o[i].id.startsWith(folder.id)) {
                                            ancestors.push(folder);
                                        }
                                    });

                                    empty_folders = _.difference(empty_folders, ancestors);
                                }
                            } else {
                                // this is a folder with no matching notebooks:
                                if(!o[i].gistname) {
                                    empty_folders.push(o[i]);
                                }
                            }
                        }

                        get_matching_notebooks(o[i]);
                    }
                }
            };

            get_matching_notebooks(notebooks);

            return {
                matching_notebooks: _.pluck(matching_notebooks, 'id'),
                empty_folders: _.pluck(empty_folders, 'id')
            };
        },

        sanitize_tree_setting: function(setting_key, value) {
            var settings = [
                { key: 'tree-filter-date', default_value: 'all', valid_values: ['all', 'last7', 'last30',
                                                                                'last3months', 'last6months', 'lastyear', 'last2years']},
                { key: 'tree-sort-order', default_value: 'name', valid_values: ['name', 'date_desc' ]}
            ];

            var setting = _.findWhere(settings, { key: setting_key });

            if(!setting) {
                console.warn('Unknown setting_key "', setting_key, '"');
                return value;
            } else {

                if(value == null) {
                    value = '';
                }

                return setting.valid_values.indexOf(value.toLocaleLowerCase()) >= 0 ?
                    value.toLocaleLowerCase() : setting.default_value;
            }
        },

        update_filter: function(filter_props) {
            if(filter_props.prop == 'tree-filter-date') {
                var cutoff;
                switch(filter_props.value) {
                case null:
                case 'all':
                    break;
                case 'last7':
                    cutoff = d3.time.day.offset(new Date(), -7);
                    break;
                case 'last30':
                    cutoff = d3.time.month.offset(new Date(), -1);
                    break;
                case 'last3months':
                    cutoff = d3.time.month.offset(new Date(), -3);
                    break;
                case 'last6months':
                    cutoff = d3.time.month.offset(new Date(), -6);
                    break;
                case 'lastyear':
                    cutoff = d3.time.year.offset(new Date(), -1);
                    break;
                case 'last2years':
                    cutoff = d3.time.year.offset(new Date(), -2);
                    break;
                default:
                    console.warn('Unknown value for date filter type passed to notebook_tree_model.update_filter(...)');
                }
                var that = this;
                this.tree_filters_[filter_props.prop] = cutoff ? function(item) {
                    return item.gistname == that.current_.notebook || item.last_commit > cutoff;
                } : function() { return true; };
            }

            var details = this.get_filter_matches(this.tree_data_);
            this.matches_filter_ = details.matching_notebooks;
            this.empty_folders_ = details.empty_folders;

            this.on_update_show_nodes.notify({
                nodes: this.matches_filter_,
                empty_folders: this.empty_folders_,
                filter_props: filter_props
            });

            rcloud.config.set_user_option(filter_props.prop, filter_props.value);
        },

        does_notebook_match_filter: function(notebook_id) {
            return this.matches_filter_.indexOf(notebook_id) != -1;
        },

        does_folder_have_matching_descendants: function(folder_id) {
            return this.empty_folders_.indexOf(folder_id) == -1;
        },

        update_sort_type: function(sort_type, reorder_nodes) {
            var to_sort_by, that = this;
            if(sort_type.toLocaleLowerCase() == 'date_desc') {
                to_sort_by = this.orderType.DATE_DESC;
            } else {
                to_sort_by = this.orderType.DEFAULT;
            }

            if(this.sorted_by_ != to_sort_by) {
                // update sort
                this.sorted_by_ = to_sort_by;

                if(reorder_nodes) {
                    var nodes_and_children = [];

                    var update_children = function(o) {
                        for(var i in o) {
                            if (!!o[i] && typeof(o[i])=="object") {

                                if(o[i].hasOwnProperty('children')) {

                                    // don't reorder history nodes:
                                    if(o[i].children.length && !o[i].children[0].version) {
                                        o[i].children.sort(that.compare_nodes.bind(that));
                                    }

                                    nodes_and_children.push({
                                        node_id: o[i].id,
                                        children: o[i].children
                                    });
                                }

                                update_children(o[i]);
                            }
                        }
                    };

                    update_children(this.tree_data_);

                    this.on_update_sort_order.notify({
                        tree_data: this.tree_data_,
                        sort_type: sort_type
                    });
                }

                rcloud.config.set_user_option("tree-sort-order", sort_type);
            }
        },

        get_node_by_id: function(id) {

            var found;

            function traverse(o) {
                for (var i in o) {
                    if (!!o[i] && typeof(o[i])=="object") {
                        if(o[i].id === id) {
                            found = o[i];
                            break;
                        }
                        traverse(o[i] );
                    }
                }
            }

            traverse(this.tree_data_);
            return found;
        },

        get_parent: function(id) {

            function find_child_by_id(node) {
                return _.find(node.children, function(c) {
                    return c.id === id;
                });
            }

            function getObject(theObject, id) {
                var found_parent = null;
                if(theObject instanceof Array) {
                    for(var i = 0; i < theObject.length; i++) {
                        found_parent = getObject(theObject[i], id);
                        if (found_parent) {
                            break;
                        }
                    }
                } else {
                    for(var prop in theObject) {
                        if(prop === 'id' && theObject.hasOwnProperty('children')) {
                            var child = find_child_by_id(theObject);

                            if(child)
                                return theObject;
                        }
                        if(theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
                            found_parent = getObject(theObject[prop], id);
                            if (found_parent) {
                                break;
                            }
                        }
                    }
                }
                return found_parent;
            }

            return getObject(this.tree_data_, id);
        },

        load_tree_data: function(data, parent) {
            var parent_node = this.get_node_by_id(parent);

            if(parent_node) {
                parent_node.children = data;
            }
        },

        duplicate_tree_data: function(tree, f) {
            console.assert(!tree.user || !this.lazy_load_[tree.user]);
            var t2 = f(tree);
            if(tree.children) {
                var ch2 = [];
                for(var i=0; i<tree.children.length; ++i)
                    ch2.push(this.duplicate_tree_data(tree.children[i], f));
                t2.children = ch2;
            }
            return t2;
        },

        transpose_notebook: function(destroot, splice_user) {
            var srcroot = '/alls/';
            if(splice_user)
                srcroot += splice_user + '/';
            return function(datum) {
                //if(datum.delay_children)
                //   load_children(datum);
                var d2 = _.pick(datum, "label", "name", "full_name", "gistname", "user", "visible", "source", "last_commit", "sort_order", "version");
                d2.id = datum.id.replace(srcroot, '/'+destroot+'/');
                d2.root = destroot;
                return d2;
            };
        },

        update_tree: function(root, user, gistname, path, last_chance, create) {

            var that = this;
            if(!root)
                throw new Error("need root");
            if(!user)
                throw new Error("need user");
            if(!gistname)
                throw new Error("need gistname");

            var skip_user = this.skip_user_level(root);

            // make sure parents exist
            var parid = skip_user ? this.node_id(root) : this.node_id(root, user),
                parent = this.get_node_by_id(parid), //that.$tree_.tree('getNodeById', parid),
                pdat = null,
                node = null;

            if(!parent) {

                var mine = user === this.username_; // yes it is possible I'm not my own friend
                parent = this.get_node_by_id(this.node_id(root)); // that.$tree_.tree('getNodeById', node_id(root));

                if(!parent) {
                    throw new Error("root '" + root + "' of notebook tree not found!");
                }

                if(!skip_user) {
                    pdat = {
                        label: mine ? "My Notebooks" : this.someone_elses(user),
                        id: this.node_id(root, user),
                        sort_order: mine ? this.order.MYFOLDER : this.order.SUBFOLDER
                    };
                    parent = this.insert_in_order(pdat, parent);
                }
            }

            if(parent.delay_children) {
                delete parent.delay_children;
                this.on_load_children.notify({
                    node: parent
                });
            }

            // create folder path:
            while('children' in path) {
                node = this.get_node_by_id(path.id); // that.$tree_.tree('getNodeById', path.id);
                if(!node) {
                    pdat = _.omit(path, 'children');
                    node = this.insert_in_order(pdat, parent);
                }
                parent = node;
                path = path.children[0];
            }

            var data = path;
            var id = skip_user ? that.node_id(root, gistname) : that.node_id(root, user, gistname);
            node = that.get_node_by_id(id); // that.$tree_.tree('getNodeById', id);

            if(!node && !create) {
                return null;
            }

            var children;
            data.gistname = gistname;
            data.id = id;
            data.root = root;
            data.user = user;

            // update parents' position according to date:
            var update_node_position = function(parent, node, data) {

                // remove from model:
                parent.children = _.without(parent.children, _.findWhere(parent.children, {
                    id: node.id
                }));

                that.remove_node_notify({
                    node: node
                });

                if(data) {
                    // assign:
                    node = that.insert_in_order(data, parent);
                } else {
                    that.insert_in_order(node, parent);
                }
            };

            if(node) {
                children = node.children;

                if(last_chance) {
                    last_chance(node); // hacky
                }

                var dp = this.get_parent(node.id);

                if(dp === parent && node.label === data.label && this.sorted_by_ !== this.orderType.DATE_DESC) {
                    this.update_tree_node(node, data);
                } else {

                    // remove from model:
                    dp.children = _.without(dp.children, _.findWhere(dp.children, {
                        id: node.id
                    }));

                    this.remove_node_notify({
                        node: node
                    });

                    node = this.insert_in_order(data, parent);

                    this.remove_empty_parents(dp);

                    if(this.sorted_by_ === this.orderType.DATE_DESC) {

                        var current_node = node;

                        do {
                            parent = this.get_parent(current_node.id);

                            if([that.order.NOTEBOOK, that.order.MYFOLDER].indexOf(parent.sort_order) == -1) {
                                parent = null;
                            } else {
                                update_node_position(parent, current_node,
                                    current_node.id === data.id ? data : undefined);
                            }

                            current_node = parent;

                        } while(parent);
                    }
                }

            } else {
                node = that.insert_in_order(data, parent);

                if(this.sorted_by_ === this.orderType.DATE_DESC) {
                    var current_node = node;

                    do {
                        parent = this.get_parent(current_node.id);

                        if([that.order.NOTEBOOK, that.order.MYFOLDER].indexOf(parent.sort_order) == -1) {
                            parent = null;
                        } else {
                            update_node_position(parent, current_node,
                                current_node.id === data.id ? data : undefined);

                            if(node.id === current_node.id) {
                                node = current_node;
                            }
                        }

                        current_node = parent;

                    } while(parent);
                }
            }

            return node;
        },

        remove_empty_parents: function(dp) {

            if(dp) {
                // remove any empty notebook hierarchy
                while(!dp.children.length && dp.sort_order === this.order.NOTEBOOK) {
                    var dp2 = this.get_parent(dp.id);

                    // remove from model:
                    dp2.children = _.without(dp2.children, _.findWhere(dp2.children, {
                        id: dp.id
                    }));

                    this.remove_node_notify({
                        node: dp,
                        fake_hover: false
                    });

                    dp = dp2;
                }
            }
        },

        update_tree_entry: function(root, user, gistname, entry, create) {
            var that = this;
            var data = {user: user,
                        label: entry.description,
                        last_commit: new Date(entry.last_commit),
                        sort_order: this.order.NOTEBOOK,
                        source: entry.source,
                        visible: entry.visible};

            // always show the same number of history nodes as before
            var whither = 'hide', where = null;
            var inter_path = that.as_folder_hierarchy([data],
                that.skip_user_level(root) ? that.node_id(root) : that.node_id(root, user))[0];

            var node = that.update_tree(root, user, gistname, inter_path,
                                function(node) {
                                    if(node.children && node.children.length) {
                                        whither = 'index';
                                        where = node.children.length;
                                        if(node.children[where-1].id.startsWith('showmore'))
                                            --where;
                                    }
                                }, create);

            if(!node){
                return Promise.resolve(null); // !create
            }

            // if we're looking at an old version, make sure it's shown
            if(gistname === this.current_.notebook && this.current_.version) {
                whither = 'sha';
                where = this.current_.version;
            }

            return this.update_history_nodes(node, whither, where);
        },

        toggle_folder_friendness: function(user) {
            var parent;
            if(this.my_friends_[user]) {
                var anode = this.get_node_by_id(this.node_id('alls', user));
                var ftree;
                if(anode)
                    ftree = this.duplicate_tree_data(anode, this.transpose_notebook('friends'));
                else { // this is a first-time load case
                    var mine = user === this.username_;
                    ftree = {
                        label: mine ? "My Notebooks" : this.someone_elses(user),
                        id: this.node_id('friends', user),
                        sort_order: mine ? this.order.MYFOLDER : this.order.SUBFOLDER
                    };
                }
                parent = this.get_node_by_id(this.node_id('friends'));
                var node = this.insert_in_order(ftree, parent);

                this.on_load_data.notify({
                    children: ftree.children,
                    node: node
                });
            }
            else {
                var n2 = this.get_node_by_id(this.node_id('friends', user));

                // remove this node from the model:
                parent = this.get_parent(n2.id);
                parent.children = _.without(parent.children, _.findWhere(parent.children, {
                    id: n2.id
                }));

                this.remove_node_notify({
                    node: n2
                });
            }
        },

        find_index: function(collection, filter) {
            for (var i = 0; i < collection.length; i++) {
                if(filter(collection[i], i, collection))
                    return i;
            }
            return -1;
        },

        find_next_copy_name: function (username, description) {
            var that = this;
            return this.load_user_notebooks(username)
                .then(function() {

                    // get folder parent or user trunk
                    var pid = description.indexOf('/') === -1 ?
                            that.node_id("alls", username) :
                            that.node_id("alls", username, description.replace(/\/[^\/]*$/,''));

                    var parent = that.get_node_by_id(pid);// $tree_.tree('getNodeById', pid);

                    if(parent === undefined) {
                        return description;
                    }

                    var map = _.object(_.map(parent.children, function(c) {
                        return [c.full_name, true];
                    }));

                    if(!map[description]) {
                        return description;
                    }

                    var match, base, n;

                    if((match = RCloud.utils.split_number(description))) {
                        base = match[0];
                        n = +match[1];
                    } else {
                        base = description + ' ';
                        n = 1;
                    }

                    var copy_name;
                    do
                        copy_name = base + (++n);
                    while(map[copy_name]);

                    return copy_name;
                });
        },

        // add_history_nodes
        // whither is 'hide' - erase all,
        // 'index' - show thru index,
        // 'sha' - show thru sha,
        // 'more' - show INCR more
        update_history_nodes: function(node, whither, where) {
            var INCR = 5;
            var debug_colors = false;
            var ellipsis = null;
            var that = this;

            function curr_count() {
                var n = node.children.length;
                return ellipsis ? n-1 : n;
            }

            var show_sha = function(history, sha) {
                var sha_ind = that.find_index(history, function(hist) {
                    return hist.version===sha;
                });

                if(sha_ind < 0) {
                    throw new Error("didn't find sha " + where + " in history");
                }

                return sha_ind + INCR - 1; // show this many including curr (?)
            };

            if(!node.children) {
                node.children = [];
            }

            if(node.children && node.children.length && node.children[node.children.length-1].id.startsWith('showmore')) {
                ellipsis = node.children[node.children.length-1];
            }

            function process_history(nshow) {

                function do_color(dat, color) {
                    if(debug_colors)
                        dat.color = color;
                }

                function get_date_diff(d1,d2) {
                    d1 = new Date(d1);
                    d2 = new Date(d2);
                    var diff = d1 - d2;
                    var min_same = d1.getMinutes() === d2.getMinutes();
                    var hour_same = d1.getHours() === d2.getHours();
                    var isDateSame = d1.toLocaleDateString() === d2.toLocaleDateString();
                    if(diff <= 60*1000 && hour_same && min_same && this.show_terse_dates_)
                        return null;
                    else
                        return RCloud.utils.format_date_time_stamp(d1, diff, isDateSame, true, this.show_terse_dates_);
                }

                function display_date_for_entry(i) {
                    var hist = history[i];
                    var d;
                    if(i+1 < history.length) {
                        d = get_date_diff.call(this, hist.committed_at, history[i + 1].committed_at);
                    }
                    else
                        d = new Date(hist.committed_at);
                    return d || 'none';
                }

                function make_hist_node(color, i, force_date) {
                    var hist = history[i];
                    var hdat = {};
                    _.extend(hdat, node);
                    delete hdat.children;
                    var sha = hist.version.substring(0, 10);
                    hdat.committed_at = new Date(hist.committed_at);
                    hdat.last_commit = force_date ? hdat.committed_at : display_date_for_entry.call(this, i);
                    hdat.label = hist.tag ? hist.tag : sha;
                    hdat.version = hist.version;
                    hdat.id = node.id + '/' + hdat.version;
                    do_color(hdat, color);
                    return hdat;
                }

                function update_hist_node(node, i) {
                    var hist = history[i];
                    var sha = hist.version.substring(0, 10);
                    var attrs = {
                        label: hist.tag ? hist.tag : sha
                    };

                    this.on_update_node.notify({
                        node: node,
                        data: attrs
                    });
                }

                var history = that.histories_[node.gistname].slice(1); // first item is current version

                if(!history) {
                    return;
                }

                nshow = Math.min(nshow, history.length);

                if(debug_colors) {
                    for(var ii = 0, ee = curr_count(); ii<ee; ++ii) {
                        this.on_update_node.notify({
                            node: node.children[i],
                            data: {
                                color: ''
                            }
                        });
                    }
                }

                // remove forced date on version above ellipsis, if any
                if(ellipsis) {
                    this.on_update_node.notify({
                        node: node.children[node.children.length - 2],
                        data: {
                            last_commit: display_date_for_entry(node.children.length-2)
                        }
                    });
                }

                // insert at top
                var nins,
                    insf = null,
                    history_node,
                    starting = node.children.length === 0;

                if(!starting) {
                    var first = node.children[0];
                    nins = that.find_index(history, function(h) { return h.version==first.version; });
                    insf = function(dat) {

                        node.children.splice(nins - 1 /* children */, 0, dat);

                        this.on_add_node_before.notify({
                            node_to_insert: dat,
                            existing_node: first
                        });
                    };
                } else {
                    nins = nshow;
                    insf = function(dat) {

                        if(!node.children) {
                            node.children = [];
                        }

                        node.children.push(dat);

                        this.on_append_node.notify({
                            node_to_insert: dat,
                            parent_id: node.id
                        });
                    };
                }

                for(var i=0; i<nins; ++i){
                    history_node = make_hist_node.call(this, 'green', i, starting && i==nins-1);
                    insf.call(that, history_node);
                }

                var count = curr_count();

                // updates
                for(i = nins; i<count; ++i){
                    update_hist_node.call(that, node.children[i], i);
                }

                // add or trim bottom
                if(count < nshow) { // top up
                    if(ellipsis) {
                        insf = function(dat) {
                            node.children.splice(node.children.length - 1, 0, dat);

                            this.on_add_node_before.notify({
                                node_to_insert: dat,
                                existing_node: ellipsis
                            });
                        };
                    } else {
                        insf = function(dat) {

                            if(!node.children) {
                                node.children = [];
                            }

                            node.children.push(dat);

                            this.on_append_node.notify({
                                node_to_insert: dat,
                                parent_id: node.id
                            });
                        };
                    }

                    for(i=count; i<nshow; ++i) {
                        history_node = make_hist_node('mediumpurple', i, i==nshow-1);
                        insf.call(that, history_node);
                    }
                } else if(count > nshow) { // trim any excess
                    node.children = node.children.splice(0, nshow);

                    this.remove_history_nodes.notify({
                        node: node,
                        from_index: nshow
                    });
                    ellipsis = null;
                }

                // hide or show ellipsis
                if(ellipsis) {
                    if(nshow === history.length) {
                        //that.$tree_.tree('removeNode', ellipsis);

                        var parent = this.get_parent(ellipsis.id);

                        parent.children = _.without(parent.children, _.findWhere(parent.children, {
                            id: ellipsis.id
                        }));

                        this.remove_node_notify({
                            node: ellipsis
                        });

                        ellipsis = null;
                    }
                } else {
                    if(nshow < history.length) {
                        var data = {
                            label: '...',
                            id: 'showmore-' + node.id    // unique name
                        };
                        //ellipsis = that.$tree_.tree('appendNode', data, node);

                        node.children.push(data);

                        this.on_append_node.notify({
                            node_to_insert: data,
                            parent_id: node.id
                        });
                    }
                }
            }

            var nshow;
            if(whither==='hide') {
                // reset:
                node.children = [];
                this.remove_history_nodes.notify({
                node: node
                });
                return Promise.resolve(node);
            } else if(whither==='index') {
                nshow = Math.max(where, INCR);
            } else if(whither==='same') {
                nshow = curr_count();
            } else if(whither==='more') {
                nshow = curr_count() + INCR;
            } else if(whither==='sha') {
                if(that.histories_[node.gistname]) {
                    nshow = show_sha(that.histories_[node.gistname], where);
                }
            } else {
                throw new Error("update_history_nodes don't understand how to seek '" + whither + "'");
            }

            if(that.histories_[node.gistname]) {
                process_history.call(that, nshow);
                return Promise.resolve(node);
            } else {
                return rcloud.load_notebook(node.gistname, null).then(function(notebook) {
                    that.histories_[node.gistname] = notebook.history;

                    if(whither === 'sha') {
                        nshow = show_sha(that.histories_[node.gistname], where);
                    }

                    process_history.call(that, nshow);
                    return node;
                }.bind(that));
            }
        },

        get_infos_and_counts: function(ids) {
            return Promise.all([
                rcloud.stars.get_multiple_notebook_star_counts(ids),
                rcloud.get_multiple_notebook_infos(ids)
            ]).spread(function(counts, infos) {
                return {
                    notebooks: RCloud.utils.clean_r(infos),
                    num_stars: RCloud.utils.clean_r(counts)
                };
            });
        },

        get_starred_info: function() {
            var that = this;
            return rcloud.stars.get_my_starred_notebooks()
                .then(that.get_infos_and_counts);
        },

        get_recent_info: function() {
            var that = this;
            return rcloud.config.get_recent_notebooks()
                .then(function(recents) {
                    return that.get_infos_and_counts(Object.keys(recents));
                });
        },

        get_featured: function() {
            var that = this;
            return rcloud.config.get_alluser_option('featured_users').then(function(featured) {
                that.featured_ = featured || [];

                if(_.isString(that.featured_))
                    that.featured_ = [that.featured_];

                if(!that.featured_.length)
                    return null;

                return that.get_notebooks_by_user(that.featured_[0]).then(function(notebooks) {
                    var notebook_nodes = that.convert_notebook_set('featured', that.featured_[0], notebooks).map(function(notebook) {
                        notebook.id = '/featured/' + notebook.gistname;
                        return notebook;
                    });

                    return {
                        label: 'RCloud Sample Notebooks',
                        id: '/featured',
                        children: that.as_folder_hierarchy(notebook_nodes, that.node_id('featured')).sort(that.compare_nodes.bind(that))
                    };
                });

            });
        },

        update_history: function(tree_node, opts) {

            var that = this;

            if(_.isBoolean(opts)) {
                opts = {
                    toggle: opts
                };
            }

            var whither = opts.update ? 'same' : 'more',
                node = that.get_node_by_id(tree_node.id);

            if(node.children && node.children.length) {
                if(!tree_node.is_open) {
                    that.on_open_node.notify({
                        node: node
                    });

                    return Promise.resolve(undefined);
                }

                if(opts.toggle) {
                whither = 'hide';
                }
            }

            return that.update_history_nodes(node, whither, null)
                .then(function(node) {

                    var history_len = 0;
                    if(that.histories_[node.gistname]) {
                        history_len = that.histories_[node.gistname].length;
                    }

                    that.on_show_history.notify({
                        node: node,
                        history_len: history_len
                    });

                    node.is_open = true;
                });
        },

        load_everything: function() {

            var that = this,
                opts;
            return Promise.all([
                rcloud.get_users(),
                that.get_starred_info(),
                that.get_recent_info(),
                rcloud.get_gist_sources(),
                rcloud.config.get_user_option(['notebook-path-tips', 'tree-sort-order', 'tree-filter-date'])
            ]).spread(function(all_the_users, starred_info, recent_info, gist_sources, user_options) {
                opts = user_options;

                that.path_tips_ = user_options['notebook-path-tips'];

                that.gist_sources_ = gist_sources;
                _.extend(that.notebook_info_, starred_info.notebooks);
                for(var r in recent_info.notebooks) {
                    // add a special flag for notebooks that we only know about from recent list
                    // we won't show them in the tree until they're opened
                    if(!that.notebook_info_[r]) {
                        that.notebook_info_[r] = recent_info.notebooks[r];
                        that.notebook_info_[r].recent_only = true;
                    }
                }
                _.extend(that.num_stars_, recent_info.num_stars); // (not currently needed)
                all_the_users = _.union(all_the_users, _.compact(_.pluck(starred_info.notebooks, 'username')));

                var featured_tree;

                return Promise.all([rcloud.config.get_current_notebook(),
                                    that.get_featured()
                                    ])
                    .spread(function(current, featured_notebooks) {
                        that.current_ = current;
                        that.num_stars_ = starred_info.num_stars;
                        featured_tree = featured_notebooks;

                    })
                    .then(function() {

                        var alls_root = that.populate_users(all_the_users);

                        return [
                            featured_tree,
                            that.populate_interests(starred_info.notebooks),
                            that.populate_friends(all_the_users),
                            alls_root
                        ].filter(function(t) { return !!t; });

                    });
            })
            .then(function(data) {

                // initial assignment:
                this.tree_data_ = data;

                // sanitize tree options:
                _.each(['tree-sort-order', 'tree-filter-date'], function(setting_key) {
                    opts[setting_key] = that.sanitize_tree_setting(setting_key, opts[setting_key]);
                });

                this.update_filter({
                    prop: 'tree-filter-date',
                    value: opts['tree-filter-date']
                });

                this.update_sort_type('name', true);
                //this.update_sort_type(opts['tree-sort-order'], true);

                this.on_initialise_tree.notify({
                    data: data
                });

                this.on_settings_complete.notify(opts);

            }.bind(that))
            .then(function() {
                for(var book in this.invalid_notebooks_) {
                    var entry = this.invalid_notebooks_[book];
                    if(!entry)
                        console.log("notebook metadata for " + book + " is missing.");
                    else
                        console.log("notebook metadata for " + book + " has invalid entries: " + JSON.stringify(_.pick(entry, "username","description","last_commit","visible","source")));
                }
            }.bind(that))
            .catch(rclient.post_rejection);
        }
    };

    return notebook_tree_model;

})();

RCloud.UI.notebook_tree_view = (function(model) {

    var notebook_tree_view = function(model) {

        "use strict";

        this.model_ = model;
        this.$tree_ = null;
        this.tree_controls_root_selector = '#tree-controls';
        this.$sort_order_select_ = $('#tree_sort_order');
        this.date_filter_ = new RCloud.UI.date_filter('#tree-filter-by');

        this.on_notebook_open = new RCloud.UI.event(this);

        var view_obj = this;

        var append_node = function(parent) {
            if (parent && parent.children) {
                _.each(parent.children, function(child) {
                    view_obj.$tree_.tree('appendNode', child, view_obj.$tree_.tree('getNodeById', parent.id));
                    append_node(child);
                });
            }
        };

        // attach view component listeners:
        this.date_filter_.on_change.attach(function(sender, args) {
            view_obj.model_.update_filter(args);
        });

        // future listeners conform to args = { prop, value }
        //
        // this.another_filter_.on_change.attach(function(sender, args) {
        //     view_obj.model_.update_filter(args);
        // });

        // attach model listeners
        this.model_.on_settings_complete.attach(function(sender, args) {
            $(view_obj.tree_controls_root_selector).find('[data-settingkey]').each(function() {
                var settingKey = $(this).data('settingkey');
                var settingValue = args[settingKey];

                if(settingValue != null) {
                    $(this).val(settingValue);
                }
            });
        });

        this.model_.on_initialise_tree.attach(function(sender, args) {

            var start_widget_time = window.performance ? window.performance.now() : 0;
            view_obj.$tree_ = $("#editor-book-tree");

            //console.info('loading tree data: ', args.data);

            view_obj.$sort_order_select_.on('change', view_obj.change_sort_order.bind(view_obj));

            view_obj.$tree_.tree({
                data: args.data,
                onCreateLi: view_obj.on_create_tree_li.bind(view_obj),
                selectable: true,
                useContextMenu: false,
                keyboardSupport: false
            });

            view_obj.$tree_.bind('tree.click', view_obj.tree_click.bind(view_obj));
            view_obj.$tree_.bind('tree.open', view_obj.tree_open.bind(view_obj));
            view_obj.$tree_.bind('tree.close', view_obj.tree_close.bind(view_obj));

            if(start_widget_time)
                console.log('load tree took ' + (window.performance.now() - start_widget_time));

            var interests = view_obj.$tree_.tree('getNodeById', "/interests");
            view_obj.$tree_.tree('openNode', interests);
        });

        this.model_.on_update_sort_order.attach(function(sender, args) {
            if(view_obj.$tree_) {
                var state = view_obj.$tree_.tree('getState');
                view_obj.$tree_.tree('loadData', args.tree_data);
                view_obj.$tree_.tree('setState', state);
            }

            view_obj.$sort_order_select_.val(args.sort_type);
        });

        this.model_.on_update_show_nodes.attach(function(sender, args) {
            if(view_obj.$tree_) {
                view_obj.$tree_.tree('getTree').iterate(function(node) {
                    if(node.gistname) {
                        if(_.find(args.nodes, function(node_id) {
                            return node.id.startsWith(node_id);
                        })) {
                            $(node.element).show();
                        } else {
                            $(node.element).hide();
                        }
                    } else {
                        if(node.sort_order === 1) {
                            if(args.empty_folders.indexOf(node.id) != -1) {
                                $(node.element).hide();
                            } else {
                                $(node.element).show();
                            }
                        }
                    }

                    return true;
                });
            }

            if(args.filter_props.prop == 'tree-filter-date') {
                view_obj.date_filter_.val(args.filter_props.value);
            }
        });

        this.model_.on_load_by_user.attach(function(sender, args) {

            var root = view_obj.$tree_.tree('getNodeById', args.pid);
            view_obj.$tree_.tree('loadData', args.data, root);

            if(args.duplicate_data) {
                view_obj.$tree_.tree('loadData', args.duplicate_data,
                view_obj.$tree_.tree('getNodeById', args.duplicate_parent_id));
            }
        });

        this.model_.on_open_and_select.attach(function(sender, args) {
            var node = args.node;

            if(args.isHistorical) {
                view_obj.$tree_.tree('openNode',
                    view_obj.$tree_.tree('getNodeById', args.node.id));

                node = view_obj.$tree_.tree('getNodeById', args.id);

                if(!node)
                    throw new Error('tree node was not created for current history');
            } else {
                node = view_obj.$tree_.tree('getNodeById', args.id);
            }

            view_obj.select_node(node);
        });

        this.model_.on_select_node.attach(function(sender, args) {
            var node = view_obj.$tree_.tree('getNodeById', args.node.id);
            view_obj.$tree_.tree('selectNode', node);
            view_obj.scroll_into_view(node).then(function() {
                if(node.user === sender.username_)
                    RCloud.UI.notebook_title.make_editable(node, node.element, true);
                else
                    RCloud.UI.notebook_title.make_editable(null);
            });
        });

        this.model_.on_load_children.attach(function(sender, args) {
            console.warn('redundant code?');
            view_obj.$tree_.tree('loadData', args.node.delay_children, args.node);
        });

        this.model_.on_add_node_before.attach(function(sender, args) {
            view_obj.$tree_.tree('addNodeBefore',
                args.node_to_insert,
                view_obj.$tree_.tree('getNodeById', args.existing_node.id));

            append_node(args.node_to_insert);
        });

        this.model_.on_append_node.attach(function(sender, args) {

            view_obj.$tree_.tree('appendNode', args.node_to_insert, view_obj.$tree_.tree('getNodeById', args.parent_id));

            append_node(args.node_to_insert);
        });

        this.model_.on_load_data.attach(function(sender, args) {
            view_obj.$tree_.tree('loadData', args.children,
                view_obj.$tree_.tree('getNodeById', args.node.id));
        });

        this.model_.on_update_node.attach(function(sender, args) {
            view_obj.$tree_.tree('updateNode',
                view_obj.$tree_.tree('getNodeById', args.node.id), args.data);
        });

        this.model_.on_remove_node.attach(function(sender, args) {
            var node = view_obj.$tree_.tree('getNodeById', args.node.id);

            if(args.fake_hover) {
                ui_utils.fake_hover(node);
            }
            view_obj.$tree_.tree('removeNode', node);
        });

        this.model_.on_fake_hover.attach(function(sender, args) {
            ui_utils.fake_hover(view_obj.$tree_.tree('getNodeById', args.node.id));
        });

        this.model_.on_open_node.attach(function(sender, args) {
            view_obj.$tree_.tree('openNode', view_obj.$tree_.tree('getNodeById', args.node.id));
        });

        this.model_.on_show_history.attach(function(sender, args) {
            if(args.history_len === 1) { // FIXME: should be via UI.notebook_commands
                $(".history i", $(view_obj.$tree_.tree('getNodeById', args.node.id).element)).addClass("button-disabled");
            }

            view_obj.$tree_.tree('openNode',
                view_obj.$tree_.tree('getNodeById', args.node.id));
        });

        this.model_.remove_history_nodes.attach(function(sender, args) {
            var i, node = view_obj.$tree_.tree('getNodeById', args.node.id);

            if (node.children) {
                if(args.from_index) {
                    // remove everything from:
                    for(i = node.children.length - 1; i >= args.from_index; --i) {
                        view_obj.$tree_.tree('removeNode', node.children[i]);
                    }
                } else {
                    // get rid of everything:
                    for (i = node.children.length-1; i >= 0; i--) {
                        view_obj.$tree_.tree('removeNode', node.children[i]);
                    }
                }
            }
        });
    };

    notebook_tree_view.prototype = {

        change_sort_order: function(event) {
            var val = $(event.target).val();
            this.model_.update_sort_type(val, true);
            this.scroll_into_view(this.$tree_.tree('getSelectedNode'));
        },

        tree_click: function(event) {

            if(event.node.id.startsWith('showmore')){
                //show_history(event.node.parent, false);
                this.model_.update_history(event.node.parent, false);
            } else if(event.node.gistname) {
                if(event.click_event.metaKey || event.click_event.ctrlKey) {
                    this.on_notebook_open.notify({
                        gistname: event.node.gistname,
                        version: event.node.version,
                        source: event.node.source,
                        selroot: true,
                        new_window: true
                    });
                } else {
                    // it's weird that a notebook exists in two trees but only one is selected (#220)
                    // just select - and this enables editability
                    /*jshint eqnull:true */
                    if(event.node.gistname === this.model_.get_current().notebook &&
                        event.node.version == this.model_.get_current().version && event.node.version == null) { // deliberately null-vague here
                        this.select_node(event.node);
                    } else {
                        this.on_notebook_open.notify({
                            // gistname, version, source, selroot, new_window
                            gistname: event.node.gistname,
                            version: event.node.version || null,
                            source: event.node.source,
                            selroot: event.node.root,
                            new_window: false
                        });
                    }
                    /*jshint eqnull:false */
                }
            } else {
                if(!event.node.is_open) {
                    this.$tree_.tree('openNode', event.node);
                    ui_utils.fake_hover(event.node);
                }

                this.model_.set_node_open_status(event.node, event.node.is_open);
            }

            return false;
        },

        select_node: function(node) {
            var that = this;
            that.scroll_into_view(node).then(function() {
                that.$tree_.tree('selectNode', node);
                if(node.user === that.model_.username_)
                    RCloud.UI.notebook_title.make_editable(node, node.element, true);
                else
                    RCloud.UI.notebook_title.make_editable(null);
            });
        },

        scroll_into_view: function(node) {
            var that = this;
            return new Promise(function(resolve) {
                var p = node.parent;
                while(p) {
                    that.$tree_.tree('openNode', p);
                    p = p.parent;
                }
                ui_utils.scroll_into_view(that.$tree_, 50, 100, function() {
                    resolve();
                }, $(node.element));
            });
        },

        remove_node: function(node) {
            var parent = node.parent;
            ui_utils.fake_hover(node);
            $tree_.tree('removeNode', node);
            this.remove_empty_parents(parent);
            if(node.root === 'interests' && node.user !== this.model_.username_ && parent.children.length === 0)
                $tree_.tree('removeNode', parent);
        },

        remove_empty_parents: function(dp) {
            // remove any empty notebook hierarchy
            while(dp.children.length===0 && dp.sort_order === this.model_.order.NOTEBOOK) {
                var dp2 = dp.parent;
                $tree_.tree('removeNode', dp);
                dp = dp2;
            }
        },

        reselect_node: function(f) {
            var selected_node = $tree_.tree('getSelectedNode');
            return f().then(function() {
                var node_to_select = $tree_.tree('getNodeById', selected_node.id);

                if(node_to_select)
                    this.select_node(node_to_select);
                else console.log('sorry, neglected to highlight ' + selected_node.id);
            });
        },

        tree_open: function(event) {
            var n = event.node;

            // notebook folder name only editable when open
            if(n.full_name && n.user === this.model_.username() && !n.gistname) {
                RCloud.UI.notebook_title.make_editable(n, n.element, true);
            }

            $('#collapse-notebook-tree').trigger('size-changed');

            if(n.user && this.model_.lazy_load_[n.user])
                this.model_.load_user_notebooks(n.user);
        },

        tree_close: function(event) {
            var n = event.node;
            // notebook folder name only editable when open
            if(n.full_name && !n.gistname) {
                RCloud.UI.notebook_title.make_editable(n, n.element, false);
            }
        },

        display_date: function(ds) {
            // return an element
            return $(this.display_date_html(ds))[0];
        },

        display_date_html: function(ds) {
            if(ds==='none')
                return '';
            if(typeof ds==='string')
                return ds;
            var date = new Date(ds);
            var now = new Date();
            var diff = now - date;
            return RCloud.utils.format_date_time_stamp(date, diff, true, false, this.model_.show_terse_dates());
        },

        highlight_node: function(node) {
            var that = this;
            return function() {
                return new Promise(function(resolve) {
                    var p = node.parent;
                    while(p.sort_order === that.model_.order.NOTEBOOK) {
                        that.$tree_.tree('openNode', p);
                        p = p.parent;
                    }
                    ui_utils.scroll_into_view(that.$tree_, 150, 150, function() {
                        $(node.element).closest('.jqtree_common').effect('highlight', { color: '#fd0' }, 1500, function() {
                            resolve();
                        });
                    }, $(node.element));
                });
            };
        },

        highlight_notebooks: function(notebooks) {

            var that = this,
                nodes = _.map(_.isArray(notebooks) ? notebooks : [notebooks], function(notebook) {
                // HACKY: the view shouldn't need to know how to generate an ID (model's repsonsibility):
                return that.$tree_.tree('getNodeById', '/' + ['interests', that.model_.username_, notebook.id].join('/'));
            });

            // get promises:
            nodes.map(function(node) {
                return that.highlight_node(node);
            }).reduce(function(cur, next) {
                return cur.then(next);
            }, Promise.resolve()).then(function() {});
        },

        on_create_tree_li: function(node, $li) {

            var element = $li.find('.jqtree-element'),
                title = element.find('.jqtree-title');

            title.css('color', node.color);

            if(this.model_.path_tips()) {
                element.attr('title', node.id);
            }

            if(node.gistname) {
                if(node.source) {
                    title.addClass('foreign-notebook');
                } else if(!node.visible) {
                    title.addClass('hidden-notebook');
                }
            }

            if(node.version || node.id === 'showmore') {
                title.addClass('history');
            }

            var date, date_element, is_folder;

            if(node.last_commit) {
                date = node.last_commit;
            } else if(this.model_.show_folder_dates_ && this.model_.is_date_sorted()) {
                var folder_commit = this.model_.get_folder_last_commit_date(node.id);

                if(folder_commit) {
                    date = folder_commit;
                    is_folder = true;
                }
            }

            if(date) {
                date_element = $.el.span({'class': is_folder ? 'notebook-date folder' : 'notebook-date'},
                    this.display_date(date));
            }

            var right = $.el.span({'class': 'notebook-right'}, date_element);
            // if it was editable before, we need to restore that - either selected or open folder tree node
            if(node.user === this.model_.username_ && (this.$tree_.tree('isNodeSelected', node) ||
                                        !node.gistname && node.full_name && node.is_open)) {
                RCloud.UI.notebook_title.make_editable(node, $li, true);
            }

            RCloud.UI.notebook_commands.decorate($li, node, right);

            element.append(right);

            if(node.gistname || (!node.gistname && node.sort_order == 1)) {
                var display;
                if(node.gistname) {
                    display = this.model_.does_notebook_match_filter(node.id);
                } else if(node.version) {
                    display = true;
                } else {
                    display = this.model_.does_folder_have_matching_descendants(node.id);
                }

                if(node.version) {
                    element.show();
                } else {
                    element.parent()[display ? 'show' : 'hide']();
                }
            }
        }
    };

    return notebook_tree_view;

})();

RCloud.UI.notebook_tree_controller = (function(model, view) {

    var notebook_tree_controller = function(model, view) {

        "use strict";

        this.model_ = model;
        this.view_ = view;
        this.show_terse_dates_ = false;
        this.on_notebook_open = new RCloud.UI.event(this);

        var controller_obj = this;

        this.view_.on_notebook_open.attach(function(sender, args) {
            controller_obj.on_notebook_open.notify(args);
        });
    };

    notebook_tree_controller.prototype = {

        get_tree_data: function() {
            return this.model_.tree_data_;
        },

        set_current: function(current) {
            this.model_.set_current(current);
        },

        get_current: function() {
            return this.model_.get_current();
        },

        get_previous: function() {
            return this.model_.get_previous();
        },

        get_next: function() {
            return this.model_.get_next();
        },

        get_gist_sources: function() {
            return this.model_.get_gist_sources();
        },

        get_notebook_star_count: function(gistname) {
            return this.model_.get_notebook_star_count(gistname);
        },

        set_notebook_star_count: function(gistname, count) {
            this.model_.set_notebook_star_count(gistname, count);
        },

        notebook_star_count_exists: function(notebook_id) {
            return this.model_.notebook_star_count_exists(notebook_id);
        },

        is_notebook_starred_by_current_user: function(gistname) {
            return this.model_.is_notebook_starred_by_current_user(gistname);
        },

        has_notebook_info: function(gistname) {
            return this.model_.has_notebook_info(gistname);        
        },

        get_notebook_info: function(gistname) {
            return this.model_.get_notebook_info(gistname);
        },

        set_notebook_info: function(gistname, value) {
            this.model_.set_notebook_info(gistname, value);
        },

        add_interest: function(user, gistname) {
            this.model_.add_interest(user, gistname);
        },

        get_my_star_count_by_friend: function(user) {
            return this.model_.get_my_star_count_by_friend(user);
        },

        user_is_friend: function(user) {
            return this.model_.user_is_friend(user);
        },

        remove_interest: function(user, gistname) {
            this.model_.remove_interest(user, gistname);
        },

        show_terse_dates: function(show_terse_dates) {
            this.model_.show_terse_dates(show_terse_dates);
        },

        set_visibility: function(gistname, visible) {
            return this.model_.set_visibility(gistname, visible);
        },

        load_everything: function() {
            return this.model_.load_everything();
        },

        highlight_notebooks: function(notebooks) {
            this.view_.highlight_notebooks(notebooks);
        },

        select_history_node: function(node) {
            this.select_node(node);
            $(node.element).find('.jqtree-element:eq(0)').trigger('click');
        },

        update_notebook_view: function(user, gistname, entry, selroot) {
            return this.model_.update_notebook_view(user, gistname, entry, selroot);
        },

        unstar_notebook_view: function(user, gistname, selroot) {
            this.model_.unstar_notebook_view(user, gistname, selroot);
        },

        update_notebook_from_gist: function(result, history, selroot) {
            return this.model_.update_notebook_from_gist(result, history, selroot);
        },

        tag_notebook_version: function(id, version, tag) {
            this.model_.tag_notebook_version(id, version, tag);
        },

        toggle_folder_friendness: function(user) {
            this.model_.toggle_folder_friendness(user);
        },

        show_history: function(node, opts) {
            this.model_.update_history(node, opts);
        },

        // way too subtle. shamelessly copying OSX Finder behavior here (because they're right).
        find_next_copy_name: function (username, description) {
            return this.model_.find_next_copy_name(username, description);
        },

        remove_notebook_view: function(user, gistname) {
            this.model_.remove_notebook_view(user, gistname);
        },

        traverse: function() {
            this.model_.traverse();
        },

        update_sort_type: function(sort_type) {
            this.model_.update_sort_type(sort_type);
        }
    };

    return notebook_tree_controller;

})();

//# sourceMappingURL=rcloud_bundle.js.map