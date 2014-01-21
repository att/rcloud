(function() {

function create_markdown_cell_html_view(language) { return function(cell_model) {
    var notebook_cell_div  = $("<div class='notebook-cell'></div>");

    //////////////////////////////////////////////////////////////////////////
    // button bar

    var insert_cell_button = ui_utils.fa_button("icon-plus-sign", "insert cell");
    var source_button = ui_utils.fa_button("icon-edit", "source");
    var result_button = ui_utils.fa_button("icon-picture", "result");
    // var hide_button   = ui_utils.fa_button("icon-resize-small", "hide");
    var remove_button = ui_utils.fa_button("icon-trash", "remove");
    var run_md_button = ui_utils.fa_button("icon-play", "run");
    var gap = $('<div/>').html('&nbsp;').css({'line-height': '25%'});

    function update_model() {
        return cell_model.content(widget.getSession().getValue());
    }
    var enable = ui_utils.enable_fa_button;
    var disable = ui_utils.disable_fa_button;

    insert_cell_button.click(function(e) {
        shell.insert_markdown_cell_before(cell_model.id);
    });
    source_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            result.show_source();
        }
    });
    result_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled"))
            result.show_result();
    });
    // hide_button.click(function(e) {
    //     if (!$(e.currentTarget).hasClass("button-disabled"))
    //         result.hide_all();
    // });
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
        if(new_content!==null) // if any change (including removing the content)
            cell_model.parent_model.controller.update_cell(cell_model);
        rcloud.with_progress(function(done) {
            cell_model.controller.execute(function() {
                done();
            });
        });
    }
    run_md_button.click(function(e) {
        execute_cell();
    });

    var button_float = $("<div class='cell-controls'></div>");
    var col = $('<table/>');
    $.each([run_md_button, source_button, result_button/*, hide_button*/, gap, remove_button],
           function() {
               col.append($('<tr/>').append($('<td/>').append($(this))));
           });
    button_float.append(col);
    notebook_cell_div.append(button_float);

    var insert_button_float = $("<div class='cell-insert-control'></div>");
    insert_button_float.append(insert_cell_button);
    notebook_cell_div.append(insert_button_float);

    //////////////////////////////////////////////////////////////////////////

    var inner_div = $("<div></div>");
    var clear_div = $("<div style='clear:both;'></div>");
    notebook_cell_div.append(inner_div);
    notebook_cell_div.append(clear_div);

    var markdown_div = $('<div style="position: relative; width:100%; height:100%"></div>');

    var ace_div = $('<div style="width:100%; height:100%"></div>');
    ace_div.css({'background-color': language === 'R' ? "#E8F1FA" : "#F7EEE4"});
    if (language === 'R') {
        inner_div.addClass("r-language-pseudo");
    } else {
        inner_div.addClass("rmarkdown-language-pseudo");
    }


    // ace_div.css({'background-color': language === 'R' ? "#B1BEA4" : "#F1EDC0"});
    inner_div.append(markdown_div);
    markdown_div.append(ace_div);
    ace.require("ace/ext/language_tools");
    var widget = ace.edit(ace_div[0]);
    var RMode = require(language === 'R' ? "ace/mode/r" : "ace/mode/rmarkdown").Mode;
    var session = widget.getSession();
    widget.setValue(cell_model.content());
    ui_utils.ace_set_pos(widget, 0, 0); // setValue selects all
    // erase undo state so that undo doesn't erase all
    window.setTimeout(function() {
        session.getUndoManager().reset();
    }, 0);
    var doc = session.doc;
    widget.setReadOnly(cell_model.parent_model.read_only());
    widget.setOptions({
        enableBasicAutocompletion: true
    });
    session.setMode(new RMode(false, doc, session));
    session.on('change', function() {
        notebook_cell_div.css({'height': ui_utils.ace_editor_height(widget) + "px"});
        widget.resize();
    });

    widget.setTheme("ace/theme/chrome");
    session.setUseWrapMode(true);
    widget.resize();

    ui_utils.install_common_ace_key_bindings(widget);
    widget.commands.addCommands([{
        name: 'sendToR',
        bindKey: {
            win: 'Ctrl-Return',
            mac: 'Command-Return',
            sender: 'editor'
        },
        exec: function(widget, args, request) {
            execute_cell();
        }
    }]);
    var change_content = ui_utils.ignore_programmatic_changes(widget, function() {
        cell_model.parent_model.on_dirty();
    });

    var r_result_div = $('<div class="r-result-div"><span style="opacity:0.5">Computing ...</span></div>');
    inner_div.append(r_result_div);

    var current_mode;

    var result = {

        //////////////////////////////////////////////////////////////////////
        // pubsub event handlers

        content_updated: function() {
            var range = widget.getSelection().getRange();
            var changed = change_content(cell_model.content());
            widget.getSelection().setSelectionRange(range);
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
            var uuid = rcloud.deferred_knitr_uuid;

            if (cell_model.language() === 'R' && inner_div.find("pre code").length === 0) {
                r_result_div.prepend("<pre><code>" + cell_model.content() + "</code></pre>");
            }

            // fix image width so that retina displays are set correctly
            inner_div.find("img")
                .each(function(i, img) { img.style.width = img.width / window.devicePixelRatio; });

            // capture deferred knitr results
            inner_div.find("pre code")
                .contents()
                .filter(function() {
                    return this.nodeValue ? this.nodeValue.indexOf(uuid) !== -1 : false;
                }).parent().parent()
                .each(function() {
                    var that = this;
                    var uuids = this.childNodes[0].childNodes[0].data.substr(8,65).split("|");
                    // FIXME monstrous hack: we rebuild the ocap from the string to
                    // call it via rserve-js
                    var ocap = [uuids[1]];
                    ocap.r_attributes = { "class": "OCref" };
                    var f = rclient._rserve.wrap_ocap(ocap);

                    f(function(future) {
                        if (RCloud.is_exception(future)) {
                            var data = RCloud.exception_message(future);
                            $(that).replaceWith(function() {
                                return rclient.string_error(data);
                            });
                        } else {
                            var data = future();
                            $(that).replaceWith(function() {
                                return data;
                            });
                        }
                    });
                    // rcloud.resolve_deferred_result(uuids[1], function(data) {
                    //     $(that).replaceWith(function() {
                    //         return shell.handle(data[0], data);
                    //     });
                    // });
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

            // this is kinda bad
            if (!shell.notebook.controller._r_source_visible) {
                Notebook.hide_r_source(inner_div);
            }

            this.show_result();
        },
        set_readonly: function(readonly) {
            widget.setReadOnly(readonly);
        },

        //////////////////////////////////////////////////////////////////////

        hide_buttons: function() {
            button_float.css("display", "none");
            insert_button_float.hide();
        },
        show_buttons: function() {
            button_float.css("display", null);
            insert_button_float.show();
        },

        show_source: function() {
            /*
             * Some explanation for the next poor soul
             * that might come across this great madness below:
             *
             * ACE appears to have trouble computing properties such as
             * renderer.lineHeight. This is unfortunate, since we want
             * to use lineHeight to determine the size of the widget in the
             * first place. The only way we got ACE to work with
             * dynamic sizing was to set up a three-div structure, like so:
             *
             * <div id="1"><div id="2"><div id="3"></div></div></div>
             *
             * set the middle div (id 2) to have a style of "height: 100%"
             *
             * set the outer div (id 1) to have whatever height in pixels you want
             *
             * make sure the entire div structure is on the DOM and is visible
             *
             * call ace's resize function once. (This will update the
             * renderer.lineHeight property)
             *
             * Now set the outer div (id 1) to have the desired height as a
             * funtion of renderer.lineHeight, and call resize again.
             *
             * Easy!
             *
             */
            // do the two-change dance to make ace happy
            notebook_cell_div.css({'height': ui_utils.ace_editor_height(widget) + "px"});
            markdown_div.show();
            widget.resize(true);
            notebook_cell_div.css({'height': ui_utils.ace_editor_height(widget) + "px"});
            widget.resize(true);
            disable(source_button);
            enable(result_button);
            // enable(hide_button);
            enable(remove_button);
            //editor_row.show();

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
            // enable(hide_button);
            enable(remove_button);

            //editor_row.hide();
            markdown_div.hide();
            r_result_div.slideDown(150); // show();
            current_mode = "result";
        },
        hide_all: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            enable(result_button);
            // disable(hide_button);
            enable(remove_button);

            //editor_row.hide();
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
    return result;
}};

var dispatch = {
    Markdown: create_markdown_cell_html_view("Markdown"),
    R: create_markdown_cell_html_view("R")
};

Notebook.Cell.create_html_view = function(cell_model)
{
    return dispatch[cell_model.language()](cell_model);
};

})();
