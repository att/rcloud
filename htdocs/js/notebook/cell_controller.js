Notebook.Cell.create_controller = function(cell_model)
{
    var execution_context_ = null;
    var result = {
        execute: function() {
            var that = this;
            var language = cell_model.language() || 'Text'; // null is a synonym for Text
            function callback() {
                // note: no result!
                _.each(cell_model.parent_model.execution_watchers, function(ew) {
                    ew.run_cell(cell_model);
                });
            }
            rcloud.record_cell_execution(cell_model);

            if(!execution_context_) {
                var resulter = this.append_result.bind(this, 'code');
                execution_context_ = {start: this.start_output.bind(this),
                                      end: this.end_output.bind(this),
                                      // these should convey the meaning e.g. through color:
                                      out: resulter, err: resulter, msg: resulter,
                                      html_out: this.append_result.bind(this, 'html'),
                                      in: this.get_input.bind(this, 'in')
                                     };
            }
            var context_id = RCloud.register_output_context(execution_context_);

            var promise;
            if (rcloud.authenticated) {
                promise = rcloud.authenticated_cell_eval(context_id, cell_model.content(), language, false);
            } else {
                promise = rcloud.session_cell_eval(context_id,
                    Notebook.part_name(cell_model.id(),
                                       cell_model.language()),
                    cell_model.language(),
                    false);
            }
            return promise.then(callback);
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
        end_output: function() {
            cell_model.notify_views(function(view) {
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
