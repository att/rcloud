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
    function json_k(k) {
        return function(result) {
            var json_result = {};
            try {
                json_result = JSON.parse(result);
            } catch (e) {
                rclient.post_error(e.message);
            }
            // FIXME: I must still call the continuation,
            // because bad things might happen otherwise. But calling
            // this means that I'm polluting the 
            // space of possible JSON answers with the error.
            // For example, right now a return string "{}" is indistinguishable
            // from an error
            k && k(json_result);
        };
    }

    function rcloud_github_handler(command, k) {
        return function(result) {
            if(result.ok)
                k && k(result.content);
            else {
                var message = _.isObject(result) && 'ok' in result
                    ? result.content.message : result.toString();
                rclient.post_error(command + ': ' + message);
                // FIXME: I must still call the continuation,
                // because bad things might happen otherwise. But calling
                // this means that I'm polluting the 
                // space of possible JSON answers with the error.
                // For example, right now a return string "{}" is indistinguishable
                // from an error
                k && k({ error: result.content });
            }
        };
    }

    var rcloud = {};

    function setup_unauthenticated_ocaps() {
        rcloud.anonymous_session_init = function(k) {
            rcloud_ocaps.anonymous_session_init(k || _.identity);
        };

        rcloud.username = function() {
            return $.cookies.get('user');
        };
        rcloud.github_token = function() {
            return $.cookies.get('token');
        };
        rcloud.init_client_side_data = function(k) {
            k = k || _.identity;
            var that = this;
            rcloud_ocaps.prefix_uuid(function(v) {
                that.deferred_knitr_uuid = v;
                k();
            });
        };

        rcloud.get_conf_value = function(key, k) {
            rcloud_ocaps.get_conf_value(key, k);
        };

        rcloud.get_notebook = function(id, version, k) {
            k = rcloud_github_handler("rcloud.get.notebook " + id, k);
            rcloud_ocaps.get_notebook(id, version, function(notebook) {
                k(notebook);
            });
        };

        rcloud.load_notebook = function(id, version, k) {
            k = rcloud_github_handler("rcloud.load.notebook " + id, k);
            rcloud_ocaps.load_notebook(id, version, function(notebook) {
                k(notebook);
            });
        };

        rcloud.call_notebook = function(id, version, k) {
            k = rcloud_github_handler("rcloud.call.notebook " + id, k);
            rcloud_ocaps.call_notebook(id, version, function(notebook) {
                k(notebook);
            });
        };

        rcloud.install_notebook_stylesheets = function(k) {
            rcloud_ocaps.install_notebook_stylesheets(k || _.identity);
        };

        rcloud.get_users = function(user, k) {
            rcloud_ocaps.get_users(user, k || _.identity);
        };

        rcloud.record_cell_execution = function(cell_model) {
            var k = _.identity;
            var json_rep = JSON.stringify(cell_model.json());
            rcloud_ocaps.log.record_cell_execution(rcloud.username(), json_rep, k);
        };

        // javascript.R
        rcloud.setup_js_installer = function(v, k) {
            rcloud_ocaps.setup_js_installer(v, k || _.identity);
        };

        // having this naked eval here makes me very nervous.
        rcloud.modules = {};
        rcloud.setup_js_installer({
            install_js: function(name, content, k) {
                var result = eval(content);
                rcloud.modules[name] = result;
                k(result);
            },
            clear_css: function(current_notebook, k) {
                $(".rcloud-user-defined-css").remove();
                k();
            },
            install_css: function(urls, k) {
                if (_.isString(urls))
                    urls = [urls];
                _.each(urls, function(url) {
                    $("head").append($('<link type="text/css" rel="stylesheet" class="rcloud-user-defined-css" href="' +
                                       url + '"/>'));
                });
                k();
            }
        });

        // notebook.comments.R
        rcloud.get_all_comments = function(id, k) {
            rcloud_ocaps.comments.get_all(id, k || _.identity);
        };

        // debugging ocaps
        rcloud.debug = {};
        rcloud.debug.raise = function(msg, k) {
            rcloud_ocaps.debug.raise(msg, k || _.identity);
        };

        // stars
        rcloud.stars = {};
        rcloud.stars.is_notebook_starred = function(id, k) {
            rcloud_ocaps.stars.is_notebook_starred(id, k);
        };
        rcloud.stars.get_notebook_star_count = function(id, k) {
            rcloud_ocaps.stars.get_notebook_star_count(id, k);
        };
        rcloud.stars.get_multiple_notebook_star_counts = function(id, k) {
            rcloud_ocaps.stars.get_multiple_notebook_star_counts(id, k);
        };

        rcloud.session_cell_eval = function(filename, language, silent, k) {
            rcloud_ocaps.session_cell_eval(filename, language, silent, k);
        };

        rcloud.reset_session = function(k) {
            k = k || _.identity;
            rcloud_ocaps.reset_session(k);
        };

        rcloud.display = {};
        rcloud.display.set_device_pixel_ratio = function(k) {
            rcloud_ocaps.set_device_pixel_ratio(window.devicePixelRatio, k || _.identity);
        };
    }

    function setup_authenticated_ocaps() {
        rcloud.session_init = function(username, token, k) {
            rcloud_ocaps.session_init(username, token, k || _.identity);
        };
        rcloud.search = function(search_string, k) {
            rcloud_ocaps.search(search_string, k || _.identity);
        };
        rcloud.load_user_config = function(user, k) {
            rcloud_ocaps.load_user_config(user, json_k(k));
        };
        rcloud.load_multiple_user_configs = function(users, k) {
            rcloud_ocaps.load_multiple_user_configs(users, json_k(k));
        };
        rcloud.save_user_config = function(user, content, k) {
            rcloud_ocaps.save_user_config(user, JSON.stringify(content), json_k(k));
        };
        rcloud.update_notebook = function(id, content, k) {
            k = rcloud_github_handler("rcloud.update.notebook", k);
            rcloud_ocaps.update_notebook(id, JSON.stringify(content), k);
        };
        rcloud.create_notebook = function(content, k) {
            k = rcloud_github_handler("rcloud.create.notebook", k);
            rcloud_ocaps.create_notebook(JSON.stringify(content), k);
        };
        rcloud.fork_notebook = function(id, k) {
            k = rcloud_github_handler("rcloud.fork.notebook", k);
            rcloud_ocaps.fork_notebook(id, k);
        };
        rcloud.port_notebooks = function(source, notebooks, prefix, k) {
            rcloud_ocaps.port_notebooks(source, notebooks, prefix, k);
        };
        rcloud.get_completions = function(text, pos, k) {
            return rcloud_ocaps.get_completions(text, pos, function(comps) {
                if(_.isString(comps))
                    comps = [comps]; // quirk of rserve.js scalar handling
                // convert to the record format ace.js autocompletion expects
                // meta is what gets displayed at right; name & score might be improved
                k(_.map(comps,
                        function(comp) {
                            return {meta: "local",
                                    name: "library",
                                    score: 3,
                                    value: comp
                                   };
                        }));
            });
        };

        rcloud.rename_notebook = function(id, new_name, k) {
            k = rcloud_github_handler("rcloud.rename.notebook", k);
            rcloud_ocaps.rename_notebook(id, new_name, k);
        };
        rcloud.session_markdown_eval = function(command, language, silent, k) {
            rcloud_ocaps.session_markdown_eval(command, language, silent, k || _.identity);
        };
        rcloud.upload_to_notebook = function(force, on_success, on_failure) {
            on_success = on_success || _.identity;
            on_failure = on_failure || _.identity;
            function do_upload(file) {
                var fr = new FileReader();
                var chunk_size = 1024*1024;
                var f_size = file.size;
                var file_to_upload = new Uint8Array(f_size);
                var cur_pos = 0;
                fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                fr.onload = function(e) {
                    if (e.target.result.byteLength > 0) {
                        // still sending data to user agent
                        var bytes = new Uint8Array(e.target.result);
                        file_to_upload.set(bytes, cur_pos);
                        cur_pos += bytes.byteLength;
                        fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                    } else {
                        // done, push to notebook.
                        rcloud_ocaps.notebook_upload(
                            file_to_upload.buffer, file.name, function(result){
                                on_success(file_to_upload, file, result.content);
                            });
                    }
                };
            }
            if(!(window.File && window.FileReader && window.FileList && window.Blob))
                throw new Error("File API not supported by browser.");
            var file=$("#file")[0].files[0];
            if(_.isUndefined(file))
                throw new Error("No file selected!");
            /*FIXME add logged in user */
            rcloud_ocaps.file_upload.upload_path(function(path) {
                var file=$("#file")[0].files[0];
                if(_.isUndefined(file))
                    throw new Error("No file selected!");
                do_upload(file);
            });
        };
        rcloud.upload_file = function(force, on_success, on_failure) {
            on_success = on_success || _.identity;
            function do_upload(path, file) {
                var upload_name = path + '/' + file.name;
                rcloud_ocaps.file_upload.create(upload_name, force, function(result) {
                    if (RCloud.is_exception(result)) {
                        on_failure(RCloud.exception_message(result));
                        return;
                    }
                    var fr = new FileReader();
                    var chunk_size = 1024*1024;
                    var f_size=file.size;
                    var cur_pos=0;
                    //initiate the first chunk, and then another, and then another ...
                    // ...while waiting for one to complete before reading another
                    fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                    fr.onload = function(e) {
                        if (e.target.result.byteLength > 0) {
                            var bytes = new Uint8Array(e.target.result);
                            rcloud_ocaps.file_upload.write(bytes.buffer, function() {
                                cur_pos += chunk_size;
                                fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                            });
                        } else {
                            rcloud_ocaps.file_upload.close(function(){
                                on_success(path, file);
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
                    rcloud_ocaps.file_upload.upload_path(function(path) {
                        var file=$("#file")[0].files[0];
                        if(_.isUndefined(file))
                            throw new Error("No file selected!");
                        do_upload(path, file);
                    });
                }
            }
        };

        rcloud.post_comment = function(id, content, k) {
            rcloud_ocaps.comments.post(id, content, k || _.identity);
        };

        // publishing notebooks
        rcloud.is_notebook_published = function(id, k) {
            rcloud_ocaps.is_notebook_published(id, k);
        };

        rcloud.publish_notebook = function(id, k) {
            rcloud_ocaps.publish_notebook(id, k || _.identity);
        };
        rcloud.unpublish_notebook = function(id, k) {
            rcloud_ocaps.unpublish_notebook(id, k || _.identity);
        };

        // stars
        rcloud.stars = {};
        rcloud.stars.star_notebook = function(id, k) {
            rcloud_ocaps.stars.star_notebook(id, k || _.identity);
        };
        rcloud.stars.unstar_notebook = function(id, k) {
            rcloud_ocaps.stars.unstar_notebook(id, k || _.identity);
        };
        rcloud.stars.is_notebook_starred = function(id, k) {
            rcloud_ocaps.stars.is_notebook_starred(id, k);
        };
        rcloud.stars.get_notebook_star_count = function(id, k) {
            rcloud_ocaps.stars.get_notebook_star_count(id, k);
        };
        rcloud.stars.get_multiple_notebook_star_counts = function(ids, k) {
            rcloud_ocaps.stars.get_multiple_notebook_star_counts(ids, k);
        };
        rcloud.stars.get_my_starred_notebooks = function(k) {
            rcloud_ocaps.stars.get_my_starred_notebooks(k);
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
        thunk(done);
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
