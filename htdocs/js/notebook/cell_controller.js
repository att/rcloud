Notebook.Cell.create_controller = function(cell_model)
{
    var result = {
        execute: function() {
            var that = this;
            var language = cell_model.language() || 'Text'; // null is a synonym for Text
            function callback(r) {
                that.set_status_message(r);
            }
            var promise;

            rcloud.record_cell_execution(cell_model);
            if (rcloud.authenticated) {
                promise = rcloud.authenticated_cell_eval(cell_model.content(), language, false);
            } else {
                promise = rcloud.session_cell_eval(
                    Notebook.part_name(cell_model.id(),
                                       cell_model.language()),
                    cell_model.language(),
                    false);
            }
            return promise.then(callback);
        },
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
