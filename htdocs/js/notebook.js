Notebook = {};

Notebook.new_cell = function(content, type)
{
    var notebook_cell_div  = $("<div class='notebook-cell'></div>");
    var inner_div = $("<div></div>");
    var clear_div = $("<div style='clear:both;'></div>");
    notebook_cell_div.append(inner_div);
    notebook_cell_div.append(clear_div);
    var source_button = $("<span class='fontawesome-button'><i class='icon-edit' alt='Show Source'></i></span>");
    var result_button = $("<span class='fontawesome-button'><i class='icon-picture' alt='Show Result'></i></span>");
    var hide_button   = $("<span class='fontawesome-button'><i class='icon-resize-small' alt='Hide cell'></i></span>");
    var remove_button = $("<span class='fontawesome-button'><i class='icon-trash' alt='Remove cell'></i></span>");

    function enable(el) {
        el.removeClass("button-disabled");
    }
    function disable(el) {
        el.addClass("button-disabled");
    }

    source_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled"))
            result.show_source();
    });
    result_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled"))
            result.show_result();
    });
    hide_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled"))
            result.hide_all();
    });
    remove_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled"))
            result.remove_self();
    });
    var button_float = $("<div style='float: right'></div>");
    inner_div.append(button_float);
    button_float.append(source_button);
    button_float.append(result_button);
    button_float.append(remove_button);
    button_float.append(hide_button);

    var markdown_div = $('<pre class="r-sent-command markdown-div"></pre>').html('> ' + content);
    inner_div.append(markdown_div);

    var r_result_div = $('<div class="r-result-div">Computing...</div>');
    inner_div.append(r_result_div);
    
    if (type === 'markdown') {
        var wrapped_command = rclient.markdown_wrap_command(content);
        rclient.send_and_callback(wrapped_command[0], function(r) {
            r_result_div.html(r.value[1].value[0]);
            inner_div
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
            inner_div
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
            disable(source_button);
            enable(result_button);
            enable(hide_button);
            enable(remove_button);

            markdown_div.show();
            r_result_div.hide();
        },
        show_result: function() {
            enable(source_button);
            disable(result_button);
            enable(hide_button);
            enable(remove_button);

            markdown_div.hide();
            r_result_div.show();
        },
        hide_all: function() {
            enable(source_button);
            enable(result_button);
            disable(hide_button);
            enable(remove_button);

            markdown_div.hide();
            r_result_div.hide();
        },
        remove_self: function() {
            notebook_cell_div.remove();
        },
        div: function() {
            return notebook_cell_div;
        }
    };

    result.show_result();

    return result;    
};
