Notebook.Cell.create_controller = function(cell_model)
{
    var result = {
        execute: function(k) {
            var that = this;
            var language = cell_model.language();
            function callback(r) {
                that.set_status_message(r);
                k && k();
            }

            rcloud.record_cell_execution(cell_model);

            if (language === 'Markdown') {
                rcloud.session_markdown_eval(cell_model.content(), false, callback);
                // var wrapped_command = rclient.markdown_wrap_command(cell_model.content());
                // rclient.send_and_callback(wrapped_command, callback, _.identity);
            } else if (language === 'R') {
                rcloud.session_markdown_eval("```{r}\n" + cell_model.content() + "\n```\n", false, callback);
                // var wrapped_command = rclient.markdown_wrap_command("```{r}\n" + cell_model.content() + "\n```\n");
                // rclient.send_and_callback(wrapped_command, callback, _.identity);
            } else alert("Don't know language '" + language + "' - can only do Markdown or R for now!");
        },
        set_status_message: function(msg) {
            _.each(cell_model.views, function(view) {
                view.result_updated(msg);
            });
        }
    };

    return result;
};
