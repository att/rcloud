rcloud = {};

rcloud.username = function()
{
    return $.cookies.get('user');
};

rcloud.get_initial_file_list = function()
{
    rclient.binary_send("rcloud.list.initial.filenames(\"" + this.username() + "\")", false);
    // rclient.binary_send("wplot(c(1,2,3,4))", false);
}; 
