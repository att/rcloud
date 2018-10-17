Notebook.Cell.create_controller = function(cell_model)
{
    var execution_context_ = null;
    function update_version(notebook) {
        return notebook.history[0].version;
    }
    var result = {
        enqueue_execution_snapshot: function(updatePromise) {
            var that = this;
            if(!execution_context_) {
                function appender(type) {
                    return that.append_result.bind(this, type);
                }
                var resulter = appender('code');
                execution_context_ =
                    {
                        end: this.end_output.bind(this),
                        // these should convey the meaning e.g. through color:
                        out: resulter, err: appender('error'), msg: resulter,
                        html_out: appender('html'),
                        deferred_result: appender('deferred_result'),
                        selection_out: appender('selection'),
                        js_out: appender('js'),
                        in: this.get_input.bind(this, 'in')
                    };
            }
            var context_id = RCloud.register_output_context(execution_context_);
            that.set_run_state("waiting");
            that.edit_source(false);
            var snapshot = cell_model.get_execution_snapshot(updatePromise.then(update_version));
            RCloud.UI.processing_queue.enqueue(
                function() {
                    that.set_run_state("running");
                    return cell_model.parent_model.controller.execute_cell_version(context_id, snapshot);
                },
                function() {
                    that.set_run_state("cancelled");
                });
        },
        set_run_state: function(msg) {
            cell_model.notify_views(function(view) {
                view.state_changed(msg);
            });
        },
        clear_result: function() {
            cell_model.notify_views(function(view) {
                view.clear_result();
            });
        },
        append_result: function(type, msg) {
            cell_model.notify_views(function(view) {
                view.add_result(type, msg);
            });
        },
        end_output: function(error) {
            cell_model.notify_views(function(view) {
                if(error && error !== true)
                    view.add_result('error', error);
                view.end_output(error);
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
