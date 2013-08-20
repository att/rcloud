rcloud = {};

rcloud.init_client_side_data = function()
{
    var that = this;
    rclient.send_and_callback("rcloud.prefix.uuid()", function(data) {
        that.wplot_uuid = data;
    });
};

rcloud.username = function()
{
    return $.cookies.get('user');
};

rcloud.github_token = function()
{
    return $.cookies.get('token');
};

rcloud.search = function(search_string, k)
{
    var that = this;
    if (_.isUndefined(k)) k = _.identity;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.search", search_string), k);
};

rcloud.load_user_config = function(user, k)
{
    if (_.isUndefined(k)) k = _.identity;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.load.user.config", user), function(result) {
            k && k(JSON.parse(result));
        });
};

rcloud.load_multiple_user_configs = function(users, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.load.multiple.user.configs", users), function(result) {
            k && k(JSON.parse(result));
        });
};


rcloud.save_user_config = function(user, content, k)
{
    if (_.isUndefined(k)) k = _.identity;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.save.user.config", user,
                          JSON.stringify(content)),
        function(result) {
            k && k(JSON.parse(result));
        });
};

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

rcloud.load_notebook = function(id, version, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.get.notebook", id, version),
        rcloud_github_handler("rcloud.get.notebook " + id, k)
    );
};

rcloud.update_notebook = function(id, content, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.update.notebook", id, JSON.stringify(content)),
        rcloud_github_handler("rcloud.update.notebook", k)
    );
};

rcloud.create_notebook = function(content, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.create.notebook", JSON.stringify(content)),
        rcloud_github_handler("rcloud.create.notebook", k)
    );
};

rcloud.fork_notebook = function(id, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.fork.notebook", id),
        rcloud_github_handler("rcloud.fork.notebook", k)
    );
};

rcloud.resolve_deferred_result = function(uuid, k)
{
    var cmd = rclient.r_funcall("rcloud.fetch.deferred.result", uuid);
    rclient.send_and_callback(cmd, k);
};

rcloud.get_users = function(user, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.get.users", user),
        k);
};

rcloud.rename_notebook = function(id, new_name, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.rename.notebook", id, new_name),
        rcloud_github_handler("rcloud.rename.notebook", k)
    );
};

rcloud.upload_file = function() 
{
    function do_upload(path, file) {
        var upload_name = path + '/' + file.name;
        rclient.createFile(upload_name);
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
                rclient.writeFile(bytes, function() {
                    cur_pos += chunk_size;
                    fr.readAsArrayBuffer(file.slice(cur_pos, cur_pos + chunk_size));
                });
            } else {
                //This is just temporary, until we add the nice info messages from bootstrap
                rclient.closeFile(function(){
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
            rclient.send_and_callback(
                rclient.r_funcall("rcloud.upload.path"), function(path) {
                    var file=$("#file")[0].files[0];
                    if(_.isUndefined(file))
                        throw new Error("No file selected!");
                    do_upload(path, file);
                });
        }
    }
};
