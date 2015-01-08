Notebook.Cell.create_controller = function(cell_model)
{
    var result = {
        enqueue_execution_snapshot: function() {
            var that = this;
            that.set_status_message("Waiting...");
            var snapshot = cell_model.get_execution_snapshot();
            RCloud.UI.run_button.enqueue(
                function() {
                    that.set_status_message("Computing...");
                    return cell_model.parent_model.controller.execute_cell_version(snapshot);
                },
                function() {
                    that.set_status_message("Cancelled!");
                });
        },
        set_status_message: function(msg) {
            _.each(cell_model.views, function(view) {
                view.status_updated(msg);
            });
        },
        set_result: function(msg) {
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
