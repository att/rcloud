RCloud = {};

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
            that.wplot_uuid = v;
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
    rcloud.load_notebook = function(id, version, k) {
        k = rcloud_github_handler("rcloud.get.notebook " + id, k);
        rcloud_ocaps.get_notebook(id, version, k);
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
    rcloud.resolve_deferred_result = function(uuid, k) {
        rcloud_ocaps.fetch_deferred_result(uuid, k || _.identity);
    };
    rcloud.get_users = function(user, k) {
        rcloud_ocaps.get_users(user, k || _.identity);
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
    rcloud.upload_file = function() {
        function do_upload(path, file) {
            var upload_name = path + '/' + file.name;
            rcloud_ocaps.file_upload.create(upload_name, _.identity);
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
                    rcloud_ocaps.file_upload.write(bytes, function() {
                        cur_pos += chunk_size;
                        fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                    });
                } else {
                    //This is just temporary, until we add the nice info messages from bootstrap
                    rcloud_ocaps.file_upload.close(function(){
                        alert.show("File uploaded successfully!");
                    });
                }
            };
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
    return rcloud;
};

// rcloud.upload_file = function() 
// {
//     function do_upload(path, file) {
//         var upload_name = path + '/' + file.name;
//         rclient.createFile(upload_name);
//         var fr = new FileReader();
//         var chunk_size = 1024*1024;
//         var f_size=file.size;
//         var cur_pos=0;
//         //initiate the first chunk, and then another, and then another ...
//         // ...while waiting for one to complete before reading another
//         fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
//         fr.onload = function(e) {
//             if (e.target.result.byteLength > 0) {
//                 var bytes = new Uint8Array(e.target.result);
//                 rclient.writeFile(bytes, function() {
//                     cur_pos += chunk_size;
//                     fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
//                 });
//             } else {
//                 //This is just temporary, until we add the nice info messages from bootstrap
//                 rclient.closeFile(function(){
//                             alert.show("File uploaded successfully!");
//                         });
//             }
//         };
//     }
//     if(!(window.File && window.FileReader && window.FileList && window.Blob))
//         throw "File API not supported by browser.";
//     else {
//         var file=$("#file")[0].files[0];
//         if(_.isUndefined(file))
//             throw "No file selected!";
//         else {
//             /*FIXME add logged in user */
//             rclient.send_and_callback(
//                 rclient.r_funcall("rcloud.upload.path"), function(path) {
//                     var file=$("#file")[0].files[0];
//                     if(_.isUndefined(file))
//                         throw new Error("No file selected!");
//                     do_upload(path, file);
//                 });
//         }
//     }
// };

// rcloud.search = function(search_string, k)
// {
//     if (_.isUndefined(k)) k = _.identity;
//     rclient.send_and_callback(
//         rclient.r_funcall("rcloud.search", search_string), k);
// };

// rcloud.load_user_config = function(user, k)
// {
//     if (_.isUndefined(k)) k = _.identity;
//     rclient.send_and_callback(
//         rclient.r_funcall("rcloud.load.user.config", user), function(result) {
//             k && k(JSON.parse(result));
//         });
// };

// rcloud.load_multiple_user_configs = function(users, k)
// {
//     rclient.send_and_callback(
//         rclient.r_funcall("rcloud.load.multiple.user.configs", users), function(result) {
//             k && k(JSON.parse(result));
//         });
// };

// rcloud.save_user_config = function(user, content, k)
// {
//     if (_.isUndefined(k)) k = _.identity;
//     rclient.send_and_callback(
//         rclient.r_funcall("rcloud.save.user.config", user,
//                           JSON.stringify(content)),
//         function(result) {
//             k && k(JSON.parse(result));
//         });
// };

// rcloud.load_notebook = function(id, version, k)
// {
//     rclient.send_and_callback(
//         rclient.r_funcall("rcloud.get.notebook", id, version),
//         rcloud_github_handler("rcloud.get.notebook " + id, k)
//     );
// };

// rcloud.update_notebook = function(id, content, k)
// {
//     rclient.send_and_callback(
//         rclient.r_funcall("rcloud.update.notebook", id, JSON.stringify(content)),
//         rcloud_github_handler("rcloud.update.notebook", k)
//     );
// };

// rcloud.create_notebook = function(content, k)
// {
//     rclient.send_and_callback(
//         rclient.r_funcall("rcloud.create.notebook", JSON.stringify(content)),
//         rcloud_github_handler("rcloud.create.notebook", k)
//     );
// };

// rcloud.create_notebook = function(content, k)
// {
//     rclient.send_and_callback(
//         rclient.r_funcall("rcloud.create.notebook", JSON.stringify(content)),
//         rcloud_github_handler("rcloud.create.notebook", k)
//     );
// };

// rcloud.fork_notebook = function(id, k)
// {
//     rclient.send_and_callback(
//         rclient.r_funcall("rcloud.fork.notebook", id),
//         rcloud_github_handler("rcloud.fork.notebook", k)
//     );
// };

// rcloud.fork_notebook = function(id, k)
// {
//     rclient.send_and_callback(
//         rclient.r_funcall("rcloud.fork.notebook", id),
//         rcloud_github_handler("rcloud.fork.notebook", k)
//     );
// };

// rcloud.resolve_deferred_result = function(uuid, k)
// {
//     var cmd = rclient.r_funcall("rcloud.fetch.deferred.result", uuid);
//     rclient.send_and_callback(cmd, k);
// };

// rcloud.get_users = function(user, k)
// {
//     rclient.send_and_callback(
//         rclient.r_funcall("rcloud.get.users", user),
//         k);
// };

// rcloud.rename_notebook = function(id, new_name, k)
// {
//     rclient.send_and_callback(
//         rclient.r_funcall("rcloud.rename.notebook", id, new_name),
//         rcloud_github_handler("rcloud.rename.notebook", k)
//     );
// };
