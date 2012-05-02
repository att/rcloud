rcloud = {};

rcloud.username = function()
{
    return $.cookies.get('user');
};

rcloud.get_initial_file_list = function()
{
    rclient.send_and_callback(
        "rcloud.list.initial.filenames(\"" + this.username() + "\")",
        function(data) {
            var filenames = data.value;
            var userfiles_float = d3.select("#internals-user-files");
            userfiles_float.append("h3").text("User files");
            userfiles_float.append("ul")
                .selectAll("li")
                .data(filenames)
                .enter()
                .append("li").text(function(i) { return i; });
        });
}; 
