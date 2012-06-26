Notebook = {};

Notebook.new_cell = function(content, type)
{
    var notebook_cell_div  = $("<div class='notebook-cell'></div>");
    var source_button = $("<a style='margin:.5em' href='#'>[Show source]</a>");
    var result_button = $("<a style='margin:.5em' href='#'>[Show result]</a>");
    source_button.click(function() {
        result.show_source();
    });
    result_button.click(function() {
        result.show_result();
    });
    var button_float = $("<div style='float: right'></div>");
    notebook_cell_div.append(button_float);
    button_float.append(source_button);
    button_float.append(result_button);

    var markdown_div = $('<pre class="r-sent-command markdown-div"></pre>').html('> ' + content);
    notebook_cell_div.append(markdown_div);

    var r_result_div = $('<div class="r-result-div">Computing...</div>');
    notebook_cell_div.append(r_result_div);
    
    if (type === 'markdown') {
        var wrapped_command = rclient.markdown_wrap_command(content);
        rclient.send_and_callback(wrapped_command[0], function(r) {
            r_result_div.html(r.value[1].value[0]);
            notebook_cell_div
                .find("pre code")
                .each(function(i, e) {
                    hljs.highlightBlock(e);
                });
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            result.show_result();
        });
    } else if (type === 'interactive') {
        var wrapped_command = rclient.markdown_wrap_command("```{r}\n" + content + "\n```\n");
        rclient.send_and_callback(wrapped_command[0], function(r) {
            r_result_div.html(r.value[1].value[0]);
            notebook_cell_div
                .find("pre code")
                .each(function(i, e) {
                    hljs.highlightBlock(e);
                });
            MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            result.show_result();
        });
    } else alert("Can only do markdown for now!");

    var result = {
        show_source: function() {
            source_button.hide();
            result_button.show();
            markdown_div.show();
            r_result_div.hide();
        },
        show_result: function() {
            source_button.show();
            result_button.hide();
            r_result_div.show();
            markdown_div.hide();
        },
        div: function() {
            return notebook_cell_div;
        }
    };

    result.show_result();

    return result;    
};
