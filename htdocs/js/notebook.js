Notebook = {};

Notebook.new_cell = function(content, type)
{
    var notebook_cell_div  = $("<div class='notebook-cell'></div>");

    //////////////////////////////////////////////////////////////////////////
    // button bar
    var source_button = $("<span class='fontawesome-button'><i class='icon-edit' alt='Show Source'></i></span>");
    var result_button = $("<span class='fontawesome-button'><i class='icon-picture' alt='Show Result'></i></span>");
    var hide_button   = $("<span class='fontawesome-button'><i class='icon-resize-small' alt='Hide cell'></i></span>");
    var remove_button = $("<span class='fontawesome-button'><i class='icon-trash' alt='Remove cell'></i></span>");
    var run_md_button = $("<span class='fontawesome-button'><i class='icon-repeat' alt='Re-execute'></i></span>");

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
    run_md_button.click(function(e) {
        r_result_div.html("Computing...");
        result.execute(widget.getSession().getValue());
        result.show_result();
    });

    // Ace sets its z-index to be 1000; 
    // "and thus began the great z-index arms race of 2012"
    var button_float = $("<div style='position:relative; float: right; z-index:10000'></div>");
    var row1 = $("<div style='margin:0.5em;'></div>");
    var editor_row = $("<div style='margin:0.5em;'></div>");
    row1.append(source_button);
    row1.append(result_button);
    row1.append(hide_button);
    row1.append(remove_button);
    button_float.append(row1);
    editor_row.append(run_md_button);
    editor_row.hide();
    button_float.append(editor_row);

    notebook_cell_div.append(button_float);

    //////////////////////////////////////////////////////////////////////////

    var inner_div = $("<div></div>");
    var clear_div = $("<div style='clear:both;'></div>");
    notebook_cell_div.append(inner_div);
    notebook_cell_div.append(clear_div);


    var markdown_div = $('<div style="position: relative; width:100%; height:100%"></div>');
    var ace_div = $('<div style="width:100%; height:100%"></div>');
    inner_div.append(markdown_div);
    markdown_div.append(ace_div);
    var widget = ace.edit(ace_div[0]);
    widget.setTheme("ace/theme/chrome");
    widget.getSession().setUseWrapMode(true);
    widget.resize();

    var r_result_div = $('<div class="r-result-div">Computing...</div>');
    inner_div.append(r_result_div);
    
    var result = {
        execute: function(value) {
            if (type === 'markdown') {
                widget.getSession().setValue(value);
                var wrapped_command = rclient.markdown_wrap_command(value);
                rclient.send_and_callback(wrapped_command[0], function(r) {
                    r_result_div.html(r.value[1].value[0]);
                    inner_div
                        .find("pre code")
                        .each(function(i, e) {
                            hljs.highlightBlock(e);
                        });
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    this.show_result();
                });
            } else if (type === 'interactive') {
                widget.getSession().setValue(value);
                var wrapped_command = rclient.markdown_wrap_command("```{r}\n" + value + "\n```\n");
                rclient.send_and_callback(wrapped_command[0], function(r) {
                    r_result_div.html(r.value[1].value[0]);
                    inner_div
                        .find("pre code")
                        .each(function(i, e) {
                            hljs.highlightBlock(e);
                        });
                    MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    this.show_result();
                });
            } else alert("Can only do markdown or interactive for now!");
        },
        show_source: function() {
            notebook_cell_div.css({'height': '70%'});
            disable(source_button);
            enable(result_button);
            enable(hide_button);
            enable(remove_button);
            editor_row.show();

            markdown_div.show();
            widget.resize();
            r_result_div.hide();
        },
        show_result: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            disable(result_button);
            enable(hide_button);
            enable(remove_button);

            editor_row.hide();
            markdown_div.hide();
            r_result_div.show();
        },
        hide_all: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            enable(result_button);
            disable(hide_button);
            enable(remove_button);

            editor_row.hide();
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

    result.execute(content);
    result.show_result();

    return result;    
};
