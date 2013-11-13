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
            if (rcloud.authenticated) {
                rcloud.session_markdown_eval(cell_model.content(), language, false, callback);
            } else {
                rcloud.session_cell_eval(Notebook.part_name(cell_model.id,
                                                            cell_model.language()),
                                         cell_model.language(),
                                         false,
                                         callback);
            }
        }
    };

    return result;
};
