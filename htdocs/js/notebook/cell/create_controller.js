Notebook.Cell.create_controller = function(cell_model)
{
    var result = {
        execute: function() {
            var that = this;
            var type = cell_model.type();
            function callback(r) {
                _.each(cell_model.views, function(view) {
                    view.result_updated(r);
                });
            }
            
            rclient.record_cell_execution(cell_model);
            if (type === 'markdown') {
                var wrapped_command = rclient.markdown_wrap_command(cell_model.content());
                rclient.send_and_callback(wrapped_command, callback, _.identity);
            } else if (type === 'interactive') {
                var wrapped_command = rclient.markdown_wrap_command("```{r}\n" + cell_model.content() + "\n```\n");
                rclient.send_and_callback(wrapped_command, callback, _.identity);
            } else alert("Can only do markdown or interactive for now!");
        }
    };

    return result;
};
