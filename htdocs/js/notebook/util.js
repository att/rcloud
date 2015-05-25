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
