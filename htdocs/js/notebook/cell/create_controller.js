Notebook.Cell.create_controller = function(cell_model)
{
    var result = {
        execute: function(k) {
            var that = this;
            var language = cell_model.language();
            function callback(r) {
                _.each(cell_model.views, function(view) {
                    view.result_updated(r);
                });
                k && k();
            }

            rcloud.record_cell_execution(cell_model);
            rcloud.session_markdown_eval(cell_model.content(), language, false, callback);
        }
    };

    return result;
};
