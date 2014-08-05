(function() {

var languages = {
    "R": { 'background-color': "#E8F1FA",
           'ace_mode': "ace/mode/r" },
    "Markdown": { 'background-color': "#F7EEE4",
                  'ace_mode': "ace/mode/rmarkdown" },
    "Python": { 'background-color': "#E8F1FA",
                'ace_mode': "ace/mode/python" }
    // ,
    // "Bash": { 'background-color': "#00ff00" }
};

var non_language = { 'background-color': '#dddddd',
                     'ace_mode': 'ace/mode/text' };

function ensure_image_has_hash(img)
{
    if (img.dataset.sha256)
        return img.dataset.sha256;
    var hasher = new sha256(img.getAttribute("src"), "TEXT");
    img.dataset.sha256 = hasher.getHash("SHA-256", "HEX");
    return img.dataset.sha256;
}

function create_markdown_cell_html_view(language) { return function(cell_model) {
    var EXTRA_HEIGHT = 27;
    var notebook_cell_div  = $("<div class='notebook-cell'></div>");
    update_div_id();
    notebook_cell_div.data('rcloud.model', cell_model);

    //////////////////////////////////////////////////////////////////////////
    // button bar

    var insert_cell_button = ui_utils.fa_button("icon-plus-sign", "insert cell");
    var join_button = ui_utils.fa_button("icon-link", "join cells");
    var source_button = ui_utils.fa_button("icon-edit", "source");
    var result_button = ui_utils.fa_button("icon-picture", "result");
    var split_button = ui_utils.fa_button("icon-unlink", "split cell");
    var remove_button = ui_utils.fa_button("icon-trash", "remove");
    var run_md_button = ui_utils.fa_button("icon-play", "run");
    var gap = $('<div/>').html('&nbsp;').css({'line-height': '25%'});

    function update_model() {
        return cell_model.content(widget.getSession().getValue());
    }
    function update_div_id() {
        notebook_cell_div.attr('id', Notebook.part_name(cell_model.id(), cell_model.language()));
    }
    function set_widget_height() {
        notebook_cell_div.css({'height': (ui_utils.ace_editor_height(widget) + EXTRA_HEIGHT) + "px"});
    }
    var enable = ui_utils.enable_fa_button;
    var disable = ui_utils.disable_fa_button;

    var has_result = false;

    insert_cell_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            shell.insert_cell_before(cell_model.language(), cell_model.id());
        }
    });
    join_button.click(function(e) {
        join_button.tooltip('destroy');
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            shell.join_prior_cell(cell_model);
        }
    });
    split_button.click(function(e) {
        if (!$(e.currentTarget).hasClass("button-disabled")) {
            var range = widget.getSelection().getRange();
            var point1, point2;
            point1 = ui_utils.character_offset_of_pos(widget, range.start);
            if(!range.isEmpty())
                point2 = ui_utils.character_offset_of_pos(widget, range.end);
            shell.split_cell(cell_model, point1, point2);
        }
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

        RCloud.UI.with_progress(function() {
            return cell_model.controller.execute();
        });
    }
    run_md_button.click(function(e) {
        execute_cell();
    });
    var cell_status = $("<div class='cell-status'></div>");
    var button_float = $("<div class='cell-controls'></div>");
    cell_status.append(button_float);
    cell_status.append($("<div style='clear:both;'></div>"));
    var col = $('<table/>').append('<tr/>');
    var select_lang = $("<select class='form-control'></select>");
    function add_language_selector(lang) {
        languages[lang].element = $("<option></option>").text(lang);
        select_lang.append(languages[lang].element);
    }
    _.each(languages, function(value, key) {
        add_language_selector(key);
    });
    if(!languages[language]) { // unknown language: add it
        languages[language] = _.clone(non_language);
        add_language_selector(language);
    }
    var lang_info = languages[language];
    $(lang_info.element).attr('selected', true);
    select_lang.on("change", function() {
        var l = select_lang.find("option:selected").text();
        cell_model.parent_model.controller.change_cell_language(cell_model, l);
        result.clear_result();
    });

    col.append($("<div></div>").append(select_lang));
    $.each([run_md_button, source_button, result_button, gap, split_button, remove_button],
           function() {
               col.append($('<td/>').append($(this)));
           });

    button_float.append(col);
    notebook_cell_div.append(cell_status);

    var insert_button_float = $("<div class='cell-insert-control'></div>");
    insert_button_float.append(join_button);
    insert_button_float.append(insert_cell_button);
    notebook_cell_div.append(insert_button_float);

    //////////////////////////////////////////////////////////////////////////

    var inner_div = $("<div></div>");
    var clear_div = $("<div style='clear:both;'></div>");
    notebook_cell_div.append(inner_div);
    notebook_cell_div.append(clear_div);

    var outer_ace_div = $('<div class="outer-ace-div"></div>');

    var ace_div = $('<div style="width:100%; height:100%;"></div>');
    ace_div.css({ 'background-color': lang_info["background-color"] });

    inner_div.append(outer_ace_div);
    outer_ace_div.append(ace_div);
    ace.require("ace/ext/language_tools");
    var widget = ace.edit(ace_div[0]);
    var RMode = ace.require(language === 'R' ? "ace/mode/r" : "ace/mode/rmarkdown").Mode;
    var session = widget.getSession();
    widget.setValue(cell_model.content());
    ui_utils.ace_set_pos(widget, 0, 0); // setValue selects all
    // erase undo state so that undo doesn't erase all
    ui_utils.on_next_tick(function() {
        session.getUndoManager().reset();
    });
    var doc = session.doc;
    var am_read_only = "unknown";
    widget.setOptions({
        enableBasicAutocompletion: true
    });
    session.setMode(new RMode(false, doc, session));
    session.on('change', function() {
        set_widget_height();
        widget.resize();
    });

    widget.setTheme("ace/theme/chrome");
    session.setUseWrapMode(true);
    widget.resize();

    ui_utils.add_ace_grab_affordance(widget.container);

    ui_utils.install_common_ace_key_bindings(widget, function() {
        return language;
    });
    widget.commands.addCommands([{
        name: 'sendToR',
        bindKey: {
            win: 'Alt-Return',
            mac: 'Alt-Return',
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
            // note: it's inconsistent, but not clearing the result for every
            // change, just particular ones, because one may want to refer to
            // the result if just typing but seems unlikely for other changes
            var range = widget.getSelection().getRange();
            var changed = change_content(cell_model.content());
            widget.getSelection().setSelectionRange(range);
            return changed;
        },
        self_removed: function() {
            notebook_cell_div.remove();
        },
        id_updated: update_div_id,
        language_updated: function() {
            language = cell_model.language();
            lang_info = languages[language];
            if(!lang_info) throw new Error("tried to set language to unknown language " + language);
            ace_div.css({ 'background-color': lang_info["background-color"] });
            select_lang.val(cell_model.language());
        },
        result_updated: function(r) {
            has_result = true;
            r_result_div.hide();
            r_result_div.html(r);
            r_result_div.slideDown(150);

            // There's a list of things that we need to do to the output:
            var uuid = rcloud.deferred_knitr_uuid;

            if (cell_model.language() === 'R' && inner_div.find("pre code").length === 0) {
                r_result_div.prepend("<pre><code class='r'>" + cell_model.content() + "</code></pre>");
            }

            // click on code to edit
            var code_div = $("code.r,code.py", r_result_div);
            code_div.off('click');
            if(!shell.is_view_mode()) {
                // distinguish between a click and a drag
                // http://stackoverflow.com/questions/4127118/can-you-detect-dragging-in-jquery
                code_div.on('mousedown', function(e) {
                    $(this).data('p0', { x: e.pageX, y: e.pageY });
                }).on('mouseup', function(e) {
                    var p0 = $(this).data('p0');
                    if(p0) {
                        var p1 = { x: e.pageX, y: e.pageY },
                            d = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
                        if (d < 4) {
                            result.show_source();
                        }
                    }
                });
            }

            // we use the cached version of DPR instead of getting window.devicePixelRatio
            // because it might have changed (by moving the user agent window across monitors)
            // this might cause images that are higher-res than necessary or blurry.
            // Since using window.devicePixelRatio might cause images
            // that are too large or too small, the tradeoff is worth it.
            var dpr = rcloud.display.get_device_pixel_ratio();
            // fix image width so that retina displays are set correctly
            inner_div.find("img")
                .each(function(i, img) {
                    function update() { img.style.width = img.width / dpr; }
                    if (img.width === 0) {
                        $(img).on("load", update);
                    } else {
                        update();
                    }
                });

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

                    f(function(err, future) {
                        var data;
                        if (RCloud.is_exception(future)) {
                            data = RCloud.exception_message(future);
                            $(that).replaceWith(function() {
                                return ui_utils.string_error(data);
                            });
                        } else {
                            data = future();
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
                    // only highlight things which have
                    // defined classes coming from knitr and markdown
                    if (e.classList.length === 0)
                        return;
                    hljs.highlightBlock(e);
                });

            // typeset the math
            if (!_.isUndefined(MathJax))
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);

            // this is kinda bad
            if (!shell.notebook.controller._r_source_visible) {
                Notebook.hide_r_source(inner_div);
            }

            // Workaround a persistently annoying knitr bug:
            // https://github.com/att/rcloud/issues/456

            _($("img")).each(function(img, ix, $q) {
                ensure_image_has_hash(img);
                if (img.getAttribute("src").substr(0,10) === "data:image" &&
                    img.getAttribute("alt").substr(0,13) === "plot of chunk" &&
                    ix > 0 &&
                    img.dataset.sha256 === $q[ix-1].dataset.sha256) {
                    $(img).css("display", "none");
                }
            });

            this.show_result();
        },
        clear_result: function() {
            has_result = false;
            disable(result_button);
            this.show_source();
        },
        set_readonly: function(readonly) {
            am_read_only = readonly;
            ui_utils.set_ace_readonly(widget, readonly);
            if (readonly) {
                disable(remove_button);
                disable(insert_cell_button);
                disable(split_button);
                disable(join_button);
                $(widget.container).find(".grab-affordance").hide();
                select_lang.prop("disabled", "disabled");
            } else {
                enable(remove_button);
                enable(insert_cell_button);
                enable(split_button);
                enable(join_button);
                select_lang.prop("disabled", false);
            }
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
            outer_ace_div.show();
            widget.resize(true);
            set_widget_height();
            widget.resize(true);
            disable(source_button);
            if(has_result)
                enable(result_button);
            // enable(hide_button);
            if (!am_read_only) {
                enable(remove_button);
                enable(split_button);
            }
            //editor_row.show();

            outer_ace_div.show();
            r_result_div.hide();
            widget.resize(); // again?!?
            widget.focus();

            current_mode = "source";
        },
        show_result: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            disable(result_button);
            disable(split_button);
            // enable(hide_button);
            if (!am_read_only) {
                enable(remove_button);
            }

            //editor_row.hide();
            outer_ace_div.hide();
            r_result_div.slideDown(150); // show();
            current_mode = "result";
        },
        hide_all: function() {
            notebook_cell_div.css({'height': ''});
            enable(source_button);
            enable(result_button);
            // disable(hide_button);
            if (!am_read_only) {
                enable(remove_button);
            }

            //editor_row.hide();
            if (current_mode === "result") {
                r_result_div.slideUp(150); // hide();
            } else {
                outer_ace_div.slideUp(150); // hide();
            }
        },
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
        },
        reformat: function() {
            if(current_mode === "source") {
                // resize once to get right height, then set height,
                // then resize again to get ace scrollbars right (?)
                widget.resize();
                set_widget_height();
                widget.resize();
            }
        },
        check_buttons: function() {
            if(!cell_model.parent_model.prior_cell(cell_model))
                join_button.hide();
            else if(!am_read_only)
                join_button.show();
        }
    };

    result.show_result();
    return result;
};}

Notebook.Cell.create_html_view = function(cell_model)
{
    return create_markdown_cell_html_view(cell_model.language())(cell_model);
};

})();
