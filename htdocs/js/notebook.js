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

    // Ace sets its z-index to be 1000; 
    // "and thus began the great z-index arms race of 2012"
    var button_float = $("<div style='margin:0.5em; position:relative; float: right; z-index:10000'></div>");
    button_float.append(source_button);
    button_float.append(result_button);
    button_float.append(hide_button);
    button_float.append(remove_button);
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
    widget.getSession().setValue(content);
    widget.getSession().setUseWrapMode(true);
    widget.resize();

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
            notebook_cell_div.css({'height': '70%'});
            disable(source_button);
            enable(result_button);
            enable(hide_button);
            enable(remove_button);

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
