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
            ["config", "all_notebooks_multiple_users"],
            ["config", "all_users_all_notebooks_infos"],
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
            all_notebooks_multiple_users: rcloud_ocaps.config.all_notebooks_multiple_usersAsync,
            all_users_all_notebooks_infos: rcloud_ocaps.config.all_users_all_notebooks_infosAsync,
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
