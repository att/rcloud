Notebook.Cell.create_controller = function(cell_model)
{
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

/*
            // maybe session.js should do this instead
            // might use unpromisify.js: https://gist.github.com/squaremo/6343228
            var depromisify_input = function(type) {
                return function(prompt, k) {
                    that.get_input(type, prompt)
                        .then(function(ret) {
                            k(null, ret);
                        }).catch(function(error) {
                            k(error.message || error, null);
                        });
                };
            };
*/
            var resulter = this.append_result.bind(this, 'code'),
                context = {start: this.clear_result.bind(this),
                           out: resulter, err: resulter, msg: resulter, // losing "error-ness" here
                           html_out: this.append_result.bind(this, 'html'),
                           in: this.get_input.bind(this, 'in') // depromisify_input('in')
                          },
                context_id = RCloud.register_output_context(context);

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
        append_result: function(type, msg) {
            cell_model.notify_views(function(view) {
                view.add_result(type, msg);
            });
        },
        get_input: function(type, prompt, k) {
            // assume only one view has get_input
            var view = _.find(cell_model.views, function(v) { return v.get_input; });
            if(!view)
                k("cell view does not support input", null); // return Promise.reject(new Error("cell view does not support input"));
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
