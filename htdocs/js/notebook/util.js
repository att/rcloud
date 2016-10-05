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

Notebook.read_from_file = function(file, opts) {
    var notebook, 
        fr = new FileReader();
        opts = _.defaults(opts, {
            on_load_end: $.noop,
            on_error: $.noop,
            on_notebook_parse_complete: $.noop
        });

    fr.onloadend = function(e) {
        
        opts.on_load_end();

        try {
            notebook = JSON.parse(fr.result);

            if(!notebook.description) {
                opts.on_error('Invalid notebook format: has no description');
                return;
            }
            else if(!notebook.files || _.isEmpty(notebook.files)) {
                opts.on_error('Invalid notebook format: has no files');
                return;
            }

            notebook = Notebook.sanitize(notebook);
            opts.on_notebook_parsed(notebook);
        }
        catch(x) {
            opts.on_error('Invalid notebook format: couldn\'t parse JSON');
        }
    };

    fr.readAsText(file);
};