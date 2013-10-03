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
            k && k(JSON.parse(result));
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
            }
        };
    }

    var rcloud = {};
    rcloud.username = function() {
        return $.cookies.get('user');
    };
    rcloud.github_token = function() {
        return $.cookies.get('token');
    };
    rcloud.session_init = function(username, token, k) {
        rcloud_ocaps.session_init(username, token, k || _.identity);
    };
    rcloud.init_client_side_data = function() {
        var that = this;
        rcloud_ocaps.prefix_uuid(function(v) {
            that.deferred_knitr_uuid = v;
        });
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
    rcloud.get_conf_value = function(key, k) {
        rcloud_ocaps.get_conf_value(key, k);
    };
    rcloud.load_notebook = function(id, version, k) {
        k = rcloud_github_handler("rcloud.get.notebook " + id, k);
        rcloud_ocaps.get_notebook(id, version, function(notebook) {
            rcloud_ocaps.reset_session(function() {
                k(notebook);
            });
        });
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
    rcloud.get_users = function(user, k) {
        rcloud_ocaps.get_users(user, k || _.identity);
    };
    rcloud.get_completions = function(text, pos, k) {
        return rcloud_ocaps.get_completions(text, pos, function(comps) {
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
    rcloud.record_cell_execution = function(cell_model) {
        var k = _.identity;
        var json_rep = JSON.stringify(cell_model.json());
        rcloud_ocaps.log.record_cell_execution(rcloud.username(), json_rep, k);
    };
    rcloud.session_markdown_eval = function(command, silent, k) {
        rcloud_ocaps.session_markdown_eval(command, silent, k || _.identity);
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
                        //This is just temporary, until we add the nice info messages from bootstrap
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

    // javascript.R
    rcloud.setup_js_installer = function(v, k) {
        rcloud_ocaps.setup_js_installer(v, k || _.identity);
    };

    rcloud.modules = {};
    rcloud.setup_js_installer(function(name, content, k) {
        var result = eval(content);
        rcloud.modules[name] = result;
        k(result);
    });

    // notebook.comments.R
    rcloud.get_all_comments = function(id, k) {
        rcloud_ocaps.comments.get_all(id, k || _.identity);
    };
    rcloud.post_comment = function(id, content, k) {
        rcloud_ocaps.comments.post(id, content, k || _.identity);
    };

    // debugging ocaps
    rcloud.debug = {};
    rcloud.debug.raise = function(msg, k) {
        rcloud_ocaps.debug.raise(msg, k);
    };

    // graphics
    rcloud.graphics = {};
    rcloud.graphics.set_device_pixel_ratio = function(ratio, k) {
        rcloud_ocaps.graphics.set_device_pixel_ratio(ratio, k);
    };

    // publishing notebooks
    rcloud.publish_notebook = function(id, k) {
        rcloud_ocaps.publish_notebook(id, k);
    };
    rcloud.unpublish_notebook = function(id, k) {
        rcloud_ocaps.unpublish_notebook(id, k);
    };
    rcloud.is_notebook_published = function(id, k) {
        rcloud_ocaps.is_notebook_published(id, k);
    };

    return rcloud;
};
