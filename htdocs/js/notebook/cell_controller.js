Notebook.Cell.create_controller = function(cell_model)
{
    var result = {
        set_status_message: function(msg) {
            _.each(cell_model.views, function(view) {
                view.result_updated(msg);
            });
        },
        change_language: function(language) {
            cell_model.language(language);
        }
    };

    return result;
};
