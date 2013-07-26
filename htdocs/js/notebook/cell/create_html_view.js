(function() {

function fa_button(which, title)
{
    return $("<span class='fontawesome-button'><i class='" +
             which +
             "'></i></span>").tooltip({
                 title: title,
                 delay: { show: 250, hide: 0 }
             });
}

function create_markdown_cell_html_view(cell_model)
{
    var notebook_cell_div  = $("<div class='notebook-cell'></div>");

    //////////////////////////////////////////////////////////////////////////
    // button bar
    var source_button = fa_button("icon-edit", "source");
    var result_button = fa_button("icon-picture", "result");
    var hide_button   = fa_button("icon-resize-small", "hide");
    var remove_button = fa_button("icon-trash", "remove");
    var run_md_button = fa_button("icon-repeat", "run");

    function update_model() {
        return cell_model.content(widget.getSession().getValue());
    }
    function enable(el) {
        el.removeClass("button-disabled");
    }
    function disable(el) {
        el.addClass("button-disabled");
    }

    source_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            result.show_source();
        }
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
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            cell_model.parent_model.controller.remove_cell(cell_model);

            // twitter bootstrap gets confused about its tooltips if parent element
            // is deleted while tooltip is active; let's help it
            $(".tooltip").remove();
        }
    });
    function execute_cell() {
        r_result_div.html("Computing...");
        var new_content = update_model();
        result.show_result();
        if(new_content)
            cell_model.parent_model.controller.update_cell(cell_model);
        cell_model.controller.execute();
    }
    run_md_button.click(function(e) {
        execute_cell();
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
    var cell_buttons_div = $('<div style="position: absolute; right:-0.5em; top:-0.5em"></div>');
    var insert_cell_button = fa_button("icon-plus-sign", "insert cell");
    inner_div.append(cell_buttons_div);
    cell_buttons_div.append(insert_cell_button);
    insert_cell_button.click(function(e) {
        shell.insert_markdown_cell_before(cell_model.id);
    });

    var ace_div = $('<div style="width:100%; height:100%"></div>');
    inner_div.append(markdown_div);
    markdown_div.append(ace_div);
    var widget = ace.edit(ace_div[0]);
    var RMode = require("mode/rmarkdown").Mode;
    var session = widget.getSession();
    var doc = session.doc;
    widget.getSession().setMode(new RMode(false, doc, session));

    widget.setTheme("ace/theme/chrome");
    widget.getSession().setUseWrapMode(true);
    widget.resize();

    widget.commands.addCommand({
        name: 'sendToR',
        bindKey: {
            win: 'Ctrl-Return',
            mac: 'Command-Return',
            sender: 'editor'
        },
        exec: function(widget, args, request) {
            execute_cell();
        }
    });

    var r_result_div = $('<div class="r-result-div"><span style="opacity:0.5">Computing ...</span></div>');
    inner_div.append(r_result_div);

    // FIXME this is a terrible hack created simply so we can scroll
    // to the end of a div. I know no better way of doing this..
    var end_of_div_span = $('<span></span>');
    inner_div.append(end_of_div_span);

    var current_mode;

    var result = {

        //////////////////////////////////////////////////////////////////////
        // pubsub event handlers

        content_updated: function() {
            var position = widget.getCursorPosition();
            var changed = widget.getSession().setValue(cell_model.content());
            widget.getSelection().moveCursorToPosition(position);
            return changed;
        },
        self_removed: function() {
            notebook_cell_div.remove();
        },
        result_updated: function(r) {
            r_result_div.hide();
            r_result_div.html(r);
            r_result_div.slideDown(150);

            // There's a list of things that we need to do to the output:
            var uuid = rcloud.wplot_uuid;

            // capture interactive graphics
            inner_div.find("pre code")
                .contents()
                .filter(function() {
                    return this.nodeValue.indexOf(uuid) !== -1;
                }).parent().parent()
                .each(function() {
                    var uuids = this.childNodes[0].childNodes[0].data.substr(8,73).split("|");
                    var that = this;
                    rcloud.resolve_deferred_result(uuids[1], function(data) {
                        $(that).replaceWith(function() {
                            return shell.handle(data[0], data);
                        });
                    });
                });
            // highlight R
            inner_div
                .find("pre code")
                .each(function(i, e) {
                    hljs.highlightBlock(e);
                });

            // typeset the math
            if (!_.isUndefined(MathJax))
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

            this.show_result();
            end_of_div_span[0].scrollIntoView();
        },

        //////////////////////////////////////////////////////////////////////

        hide_buttons: function() {
            button_float.css("display", "none");
            cell_buttons_div.css("display", "none");
        },
        show_buttons: function() {
            button_float.css("display", null);
            cell_buttons_div.css("display", null);
        },

        show_source: function() {
            notebook_cell_div.css({'height': '70%'});
            disable(source_button);
            enable(result_button);
            enable(hide_button);
            enable(remove_button);
            editor_row.show();

            markdown_div.show();
            r_result_div.hide();
            widget.resize();
            widget.focus();

            current_mode = "source";
        },
        show_result: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            disable(result_button);
            enable(hide_button);
            enable(remove_button);

            editor_row.hide();
            markdown_div.hide();
            r_result_div.slideDown(150, function() {
                end_of_div_span[0].scrollIntoView();
            }); // show();
            current_mode = "result";
        },
        hide_all: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            enable(result_button);
            disable(hide_button);
            enable(remove_button);

            editor_row.hide();
            if (current_mode === "result") {
                r_result_div.slideUp(150); // hide();
            } else {
                markdown_div.slideUp(150); // hide();
            }
        },
        /*
        // this doesn't make sense: changes should go through controller
        remove_self: function() {
            cell_model.parent_model.remove_cell(cell_model);
            notebook_cell_div.remove();
        },
        */
        div: function() {
            return notebook_cell_div;
        },
        update_model: function() {
            return update_model();
        },
        focus: function() {
            widget.focus();
        },
        get_content: function() { // for debug
            return cell_model.content();
        }
    };

    result.show_result();
    result.content_updated();
    return result;
};

function create_interactive_cell_html_view(cell_model)
{
    var notebook_cell_div  = $("<div class='notebook-cell'></div>");

    //////////////////////////////////////////////////////////////////////////
    // button bar
    var source_button = $("<span class='fontawesome-button'><i class='icon-edit'></i></span>").tooltip({ title: "source" });
    var result_button = $("<span class='fontawesome-button'><i class='icon-picture'></i></span>").tooltip({ title: "result" });
    var hide_button   = $("<span class='fontawesome-button'><i class='icon-resize-small'></i></span>").tooltip({ title: "hide" });
    var remove_button = $("<span class='fontawesome-button'><i class='icon-trash'></i></span>").tooltip({ title: "remove" });

    function update_model() {
        return cell_model.content($(input).val());
    }
    function enable(el) {
        el.removeClass("button-disabled");
    }
    function disable(el) {
        el.addClass("button-disabled");
    }

    source_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            result.show_source();
        }
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
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            cell_model.parent_model.controller.remove_cell(cell_model);

            // twitter bootstrap gets confused about its tooltips if parent element
            // is deleted while tooltip is active; let's help it
            $(".tooltip").remove();
        }
    });
    function execute_cell() {
        r_result_div.html("Computing...");
        var new_content = update_model();
        result.show_result();
        if(new_content)
            cell_model.parent_model.controller.update_cell(cell_model);
        cell_model.controller.execute();
    }

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
    editor_row.hide();
    button_float.append(editor_row);

    notebook_cell_div.append(button_float);

    //////////////////////////////////////////////////////////////////////////

    var inner_div = $("<div></div>");
    var clear_div = $("<div style='clear:both;'></div>");
    notebook_cell_div.append(inner_div);
    notebook_cell_div.append(clear_div);

    var markdown_div = $('<div style="position: relative; width:100%;"></div>');
    var cell_buttons_div = $('<div style="position: absolute; right:-0.5em; top:-0.5em"></div>');
    var insert_cell_button = fa_button("icon-plus-sign", "insert cell");
    inner_div.append(cell_buttons_div);
    cell_buttons_div.append(insert_cell_button);
    insert_cell_button.click(function(e) {
        shell.insert_markdown_cell_before(cell_model.id);
    });

    var ace_div = $('<div style="width:100%; margin-left: 0.5em; margin-top: 0.5em"></div>');
    inner_div.append(markdown_div);
    markdown_div.append(ace_div);

    var input = $('<input type="text" style="width:88%"/>');
    ace_div.append(input);
    // http://stackoverflow.com/questions/699065
    input.keypress(function(e) {
        if (e.which === 13) {
            execute_cell();
            e.preventDefault();
            return false;
        }
        return true;
    });

    var r_result_div = $('<div class="r-result-div"></div>');
    inner_div.append(r_result_div);
    var end_of_div_span = $('<span></span>');
    inner_div.append(end_of_div_span);
    var current_mode;

    var result = {

        //////////////////////////////////////////////////////////////////////
        // pubsub event handlers

        content_updated: function() {
            input.val(cell_model.content());
        },
        self_removed: function() {
            notebook_cell_div.remove();
        },
        result_updated: function(r) {
            r_result_div.hide();
            r_result_div.html(r);
            r_result_div.slideDown(150);

            // There's a list of things that we need to do to the output:
            var uuid = rcloud.wplot_uuid;

            // capture interactive graphics
            inner_div.find("pre code")
                .contents()
                .filter(function() {
                    return this.nodeValue.indexOf(uuid) !== -1;
                }).parent().parent()
                .each(function() {
                    var uuids = this.childNodes[0].childNodes[0].data.substr(8,73).split("|");
                    var that = this;
                    rcloud.resolve_deferred_result(uuids[1], function(data) {
                        $(that).replaceWith(function() {
                            return shell.handle(data[0], data, that);
                        });
                    });
                });
            // highlight R
            inner_div
                .find("pre code")
                .each(function(i, e) {
                    hljs.highlightBlock(e);
                });

            // typeset the math
            if (!_.isUndefined(MathJax))
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

            this.show_result();
            end_of_div_span[0].scrollIntoView();
        },

        //////////////////////////////////////////////////////////////////////

        hide_buttons: function() {
            button_float.css("display", "none");
            cell_buttons_div.css("display", "none");
        },
        show_buttons: function() {
            button_float.css("display", null);
            cell_buttons_div.css("display", null);
        },

        show_source: function() {
            notebook_cell_div.css({'height': ''});
            disable(source_button);
            enable(result_button);
            enable(hide_button);
            enable(remove_button);
            editor_row.show();

            markdown_div.show();
            r_result_div.hide();
            input.focus();

            current_mode = "source";
        },
        show_result: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            disable(result_button);
            enable(hide_button);
            enable(remove_button);

            editor_row.hide();
            markdown_div.hide();
            r_result_div.slideDown(150, function() {
                end_of_div_span[0].scrollIntoView();
            });
            current_mode = "result";
        },
        hide_all: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            enable(result_button);
            disable(hide_button);
            enable(remove_button);

            editor_row.hide();
            if (current_mode === "result") {
                r_result_div.slideUp(150); // hide();
            } else {
                markdown_div.slideUp(150); // hide();
            }
        },
        /*
        // this doesn't make sense: changes should go through controller
        remove_self: function() {
            cell_model.parent_model.remove_cell(cell_model);
            notebook_cell_div.remove();
        },
        */
        div: function() {
            return notebook_cell_div;
        },
        update_model: function() {
            return update_model();
        },
        focus: function() {
            input.focus();
        },
        get_content: function() { // for debug
            return cell_model.content();
        }
    };

    result.show_result();
    result.content_updated();
    return result;
}

var dispatch = {
    Markdown: create_markdown_cell_html_view,
    R: create_markdown_cell_html_view
};

Notebook.Cell.create_html_view = function(cell_model)
{
    return dispatch[cell_model.language()](cell_model);
};

})();
