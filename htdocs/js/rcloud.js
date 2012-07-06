rcloud = {};

rcloud.init_client_side_data = function()
{
    var that = this;
    rcloud.get_user_filenames(function(data) {
        that.user_filenames = data.value;

        //////////////////////////////////////////////////////////////////
        // debugging info
        var filenames = data.value;
        var userfiles_float = d3.select("#internals-user-files");
        userfiles_float.append("h3").text("User files");
        userfiles_float.append("ul")
            .selectAll("li")
            .data(filenames)
            .enter()
            .append("li").text(function(i) { return i; });
    });
    rclient.send_and_callback("wplot.uuid", function(data) {
        that.wplot_uuid = data.value[0];
    });
};

rcloud.username = function()
{
    return $.cookies.get('user');
};

rcloud.get_user_filenames = function(k)
{
    if (_.isUndefined(k)) k = _.identity;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.list.initial.filenames", this.username()), k);
}; 

rcloud.search = function(search_string, k)
{
    var that = this;
    if (_.isUndefined(k)) k = _.identity;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.search", search_string), k);
};

rcloud.get_all_user_filenames = function(k)
{
    var that = this;
    if (_.isUndefined(k)) k = _.identity;
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.list.all.initial.filenames"), k);
}; 

rcloud.load_user_file = function(user, filename, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.load.user.file", user, filename), k);
};

rcloud.save_to_user_file = function(user, filename, content, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.save.to.user.file", user, filename, content),
                          k);
};

rcloud.create_user_file = function(filename, k)
{
    rclient.send_and_callback(
        rclient.r_funcall("rcloud.create.user.file", rcloud.username(), filename), k);
};

rcloud.resolve_deferred_result = function(uuid, k)
{
    var cmd = rclient.r_funcall("rcloud.fetch.deferred.result", uuid);
    rclient.send_and_callback(cmd, k);
};
