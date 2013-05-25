rcloud = {};

rcloud.init_client_side_data = function()
{
    var that = this;
/*
    rcloud.get_user_filenames(function(data) {
        that.user_filenames = data;

        //////////////////////////////////////////////////////////////////
        // debugging info
        var filenames = data;
        var userfiles_float = d3.select("#internals-user-files");
        userfiles_float.append("h3").text("User files");
        userfiles_float.append("ul")
            .selectAll("li")
            .data(filenames)
            .enter()
            .append("li").text(function(i) { return i; });
    });
*/
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

/*
rcloud.get_user_filenames = function(k)
{
    if (_.isUndefined(k)) k = _.identity;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.list.initial.filenames", this.username()), k);
};
*/ 

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
        rclient.r_funcall("rcloud.load.user.config", user), k);
}

rcloud.save_user_config = function(user, content, k)
{
    if (_.isUndefined(k)) k = _.identity;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.save.user.config", user, content), k);
}

rcloud.load_notebook = function(id, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.get.notebook", id), k);
}

rcloud.update_notebook = function(id, content, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.update.notebook", id, JSON.stringify(content)), k);
}

rcloud.get_all_user_filenames = function(k)
{
    debugger;
    var that = this;
    if (_.isUndefined(k)) k = _.identity;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.list.all.initial.filenames"), k);
}; 

rcloud.load_user_file = function(user, filename, k)
{
    debugger;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.load.user.file", user, filename), k);
};

rcloud.save_to_user_file = function(user, filename, content, k)
{
    debugger;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.save.to.user.file", user, filename, content),
                          k);
};

rcloud.create_user_file = function(filename, k)
{
    debugger;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.create.user.file", rcloud.username(), filename), k);
};

rcloud.resolve_deferred_result = function(uuid, k)
{
    var cmd = rclient.r_funcall("rcloud.fetch.deferred.result", uuid);
    rclient.send_and_callback(cmd, k);
};
