Notebook.Cell.create_controller = function(model)
{
    var result = {
        execute: function() {
            var that = this;
            var type = model.type();
            function callback(r) {
                _.each(model.views, function(view) {
                    view.result_updated(r);
                });
            }
            
            if (type === 'markdown') {
                var wrapped_command = rclient.markdown_wrap_command(model.content());
                rclient.send_and_callback(wrapped_command, callback, _.identity);
            } else if (type === 'interactive') {
                var wrapped_command = rclient.markdown_wrap_command("```{r}\n" + model.content() + "\n```\n");
                rclient.send_and_callback(wrapped_command, callback, _.identity);
            } else alert("Can only do markdown or interactive for now!");
        }
    };

    return result;
};
