Notebook.Cell.create_controller = function(cell_model)
{
    var execution_context_ = null;
    var result = {
        enqueue_execution_snapshot: function() {
            var that = this;
            if(!execution_context_) {
                function appender(type) {
                    return that.append_result.bind(this, type);
                }
                var resulter = appender('code');
                execution_context_ = {start: this.start_output.bind(this),
                                      end: this.end_output.bind(this),
                                      // these should convey the meaning e.g. through color:
                                      out: resulter, err: appender('error'), msg: resulter,
                                      html_out: appender('html'),
                                      selection_out: appender('selection'),
                                      in: this.get_input.bind(this, 'in')
                                     };
            }
            var context_id = RCloud.register_output_context(execution_context_);
            that.set_status_message("Waiting...");
            that.edit_source(false);
            var snapshot = cell_model.get_execution_snapshot();
            RCloud.UI.run_button.enqueue(
                function() {
                    that.set_status_message("Computing...");
                    return cell_model.parent_model.controller.execute_cell_version(context_id, snapshot);
                },
                function() {
                    that.set_status_message("Cancelled!");
                });
        },
        set_status_message: function(msg) {
            cell_model.notify_views(function(view) {
                view.status_updated(msg);
            });
        },
        clear_result: function() {
            cell_model.notify_views(function(view) {
                view.clear_result();
            });
        },
        start_output: function() {
            cell_model.notify_views(function(view) {
                view.start_output();
            });
        },
        append_result: function(type, msg) {
            cell_model.notify_views(function(view) {
                view.add_result(type, msg);
            });
        },
        end_output: function(error) {
            cell_model.notify_views(function(view) {
                if(error)
                    view.add_result('error', error);
                view.end_output();
            });
        },
        get_input: function(type, prompt, k) {
            // assume only one view has get_input
            var view = _.find(cell_model.views, function(v) { return v.get_input; });
            if(!view)
                k("cell view does not support input", null);
            else
                view.get_input(type, prompt, k);
        },
        edit_source: function(whether) {
            cell_model.notify_views(function(view) {
                view.edit_source(whether);
            });
        },
        change_language: function(language) {
            cell_model.language(language);
        }
    };

    return result;
};
