(function() {

function ensure_image_has_hash(img)
{
    if (img.dataset.sha256)
        return img.dataset.sha256;
    var hasher = new sha256(img.getAttribute("src"), "TEXT");
    img.dataset.sha256 = hasher.getHash("SHA-256", "HEX");
    return img.dataset.sha256;
}

var MIN_LINES = 2;
var EXTRA_HEIGHT_SOURCE = 2, EXTRA_HEIGHT_INPUT = 20; // fudge to prevent unnecessary scrolling

function create_cell_html_view(language, cell_model) {
    var ace_widget_;
    var ace_session_;
    var ace_document_;
    var am_read_only_ = "unknown";
    var source_div_;
    var code_div_;
    var result_text_;
    var result_div_;
    var change_content_;
    var above_between_controls_, cell_controls_;
    var edit_mode_; // note: starts neither true nor false
    var input_div_, input_ace_div_, input_widget_, input_kont_;
    var result = {}; // "this"

    var notebook_cell_div  = $("<div class='notebook-cell'></div>");
    update_div_id();
    notebook_cell_div.data('rcloud.model', cell_model);

    //////////////////////////////////////////////////////////////////////////
    // button bar

    function update_model() {
        if(!ace_session_)
            return null;
        return cell_model.content(ace_session_.getValue());
    }
    function update_div_id() {
        notebook_cell_div.attr('id', Notebook.part_name(cell_model.id(), cell_model.language()));
    }
    function set_widget_height() {
        source_div_.css('height', (ui_utils.ace_editor_height(ace_widget_, MIN_LINES) +
                                   EXTRA_HEIGHT_SOURCE) + "px");
    }

    var cell_status = $("<div class='cell-status'></div>");
    var cell_control_bar = $("<div class='cell-control-bar'></div>");
    cell_status.append(cell_control_bar);
    cell_status.append($("<div style='clear:both;'></div>"));

    cell_controls_ = RCloud.UI.cell_commands.decorate_cell(cell_control_bar, cell_model, result);

    notebook_cell_div.append(cell_status);

    var cell_commands_above = $("<div class='cell-controls-above'></div>");
    above_between_controls_ = RCloud.UI.cell_commands.decorate_above_between(cell_commands_above, cell_model, result);
    notebook_cell_div.append(cell_commands_above);

    function set_background_color(language) {
        var bg_color = language === 'Markdown' ? "#F7EEE4" : "#E8F1FA";
        ace_div.css({ 'background-color': bg_color });
    }

    function update_language() {
        language = cell_model.language();
        cell_controls_.controls['language_cell'].set(language);
        if(ace_widget_) {
            set_background_color(language);
            var LangMode = ace.require(RCloud.language.ace_mode(language)).Mode;
            ace_session_.setMode(new LangMode(false, ace_document_, ace_session_));
        }
    }

    //////////////////////////////////////////////////////////////////////////

    var inner_div = $("<div></div>");
    var clear_div = $("<div style='clear:both;'></div>");
    notebook_cell_div.append(inner_div);
    notebook_cell_div.append(clear_div);

    source_div_ = $('<div class="source-div"></div>');
    code_div_ = $('<div class="code-div"></div>');
    source_div_.append(code_div_);

    var outer_ace_div = $('<div class="outer-ace-div"></div>');
    var ace_div = $('<div style="width:100%; height:100%;"></div>');
    set_background_color(language);

    outer_ace_div.append(ace_div);
    source_div_.append(outer_ace_div);
    inner_div.append(source_div_);

    function click_to_edit(whether) {
        if(whether) {
            // distinguish between a click and a drag
            // http://stackoverflow.com/questions/4127118/can-you-detect-dragging-in-jquery
            code_div_.on('mousedown', function(e) {
                $(this).data('p0', { x: e.pageX, y: e.pageY });
            }).on('mouseup', function(e) {
                var p0 = $(this).data('p0');
                if(p0) {
                    var p1 = { x: e.pageX, y: e.pageY },
                        d = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
                    if (d < 4) {
                        result.edit_source(true);
                    }
                }
            });
        }
        else code_div_.off('mousedown').off('mouseup');
    }

    function display_status(status) {
        result_div_.html('<div class="non-result">' + status + '</div>');
    };

    function clear_result() {
        display_status("(uncomputed)");
        result_text_ = "";
    }

    // start trying to refactor out this repetitive nonsense
    function ace_stuff(div, content) {
        ace.require("ace/ext/language_tools");
        var widget = ace.edit(div);
        var session = widget.getSession();
        widget.setValue(content);
        ui_utils.ace_set_pos(widget, 0, 0); // setValue selects all
        // erase undo state so that undo doesn't erase all
        ui_utils.on_next_tick(function() {
            session.getUndoManager().reset();
        });
        var document = session.getDocument();
        widget.setOptions({
            enableBasicAutocompletion: true
        });
        widget.setTheme("ace/theme/chrome");
        session.setUseWrapMode(true);
        return {
            widget: widget,
            session: session,
            document: document
        };
    }

    function create_edit_widget() {
        if(ace_widget_) return;

        var aaa = ace_stuff(ace_div[0], cell_model.content());
        ace_widget_ = aaa.widget;
        ace_session_ = aaa.session;
        ace_document_ = aaa.document;

        ace_session_.on('change', function() {
            set_widget_height();
            ace_widget_.resize();
        });

        ace_widget_.resize();

        ui_utils.add_ace_grab_affordance(ace_widget_.container);

        ui_utils.install_common_ace_key_bindings(ace_widget_, function() {
            return language;
        });
        ace_widget_.commands.addCommands([{
            name: 'executeCell',
            bindKey: {
                win: 'Alt-Return',
                mac: 'Alt-Return',
                sender: 'editor'
            },
            exec: function(ace_widget_, args, request) {
                result.execute_cell();
            }
        }]);
        change_content_ = ui_utils.ignore_programmatic_changes(ace_widget_, function() {
            cell_model.parent_model.on_dirty();
        });
        update_language();
    }
    function create_input_widget() {
        if(input_widget_) return;

        var aaa = ace_stuff(input_ace_div_[0], '');
        input_widget_ = aaa.widget;

        input_widget_.commands.addCommands([{
            name: 'enter',
            bindKey: 'Return',
            exec: function(ace_widget, args, request) {
                if(input_kont_)
                    input_kont_(null, ace_widget.getValue());
                input_div_.hide();
            }
        }]);
        RCloud.UI.prevent_progress_modal();
    }
    function find_code_elems(parent) {
        return parent
            .find("pre code")
            .filter(function(i, e) {
                // things which have defined classes coming from knitr and markdown
                // we might look in RCloud.language here?
                return e.classList.length > 0;
            });
    }
    function highlight_code() {
        find_code_elems(code_div_).each(function(i, e) {
            hljs.highlightBlock(e);
        });
    }
    function assign_code() {
        var code = cell_model.content();
        // match the number of lines ace.js is going to show
        // 1. html would skip final blank line
        if(code[code.length-1] === '\n')
            code += '\n';
        // 2. we have ace configured to show a minimum of MIN_LINES lines
        var lines = (code.match(/\n/g)||[]).length;
        if(lines<MIN_LINES)
            code += new Array(MIN_LINES+1-lines).join('\n');

        code_div_.empty();
        var elem = $('<code></code>').append(code);
        var hljs_class = RCloud.language.hljs_class(cell_model.language());
        if(hljs_class)
            elem.addClass(hljs_class);
        code_div_.append($('<pre></pre>').append(elem));
        highlight_code();
    }
    assign_code();

    result_div_ = $('<div class="r-result-div"></div>');    clear_result();
    inner_div.append(result_div_);
    input_div_ = $('<div class="input-div"></div>');
    input_ace_div_ = $('<div style="height: 100%"></div>');
    input_div_.hide().append(input_ace_div_);
    inner_div.append(input_div_);

    update_language();

    _.extend(result, {

        //////////////////////////////////////////////////////////////////////
        // pubsub event handlers

        content_updated: function() {
            assign_code();
            if(ace_widget_) {
                var range = ace_widget_.getSelection().getRange();
                var changed = change_content_(cell_model.content());
                ace_widget_.getSelection().setSelectionRange(range);
            }
            return changed;
        },
        self_removed: function() {
            notebook_cell_div.remove();
        },
        ace_widget: function() {
            return ace_widget_;
        },
        id_updated: update_div_id,
        language_updated: update_language,
        status_updated: function(status) {
            display_status(status);
        },
        result_updated: function(r) {
            Notebook.Cell.preprocessors.entries('all').forEach(function(pre) {
                r = pre.process(r);
            });
            has_result = true;
            result_div_.html(r);
            result_text_ = r;

            Notebook.Cell.postprocessors.entries('all').forEach(function(post) {
                post.process(result_div_);
            });

            this.edit_source(false);
        },
        add_result: function(type, r) {
            switch(type) {
            case 'code':
                r = '<pre><code>' + r + '</code></pre>';
                break;
            case 'html':
                break;
            default:
                throw new Error('unknown result type ' + type);
            }
            this.result_updated(result_text_+ r);
        },
        clear_result: clear_result,
        set_readonly: function(readonly) {
            am_read_only_ = readonly;
            if(ace_widget_)
                ui_utils.set_ace_readonly(ace_widget_, readonly );
            cell_controls_.set_flag('modify', !readonly);
            above_between_controls_.set_flag('modify', !readonly);
            click_to_edit(!readonly);
            if (readonly) {
                if(ace_widget_)
                    $(ace_widget_.container).find(".grab-affordance").hide();
            } else {
                if(ace_widget_)
                    $(ace_widget_.container).find(".grab-affordance").show();
            }
        },

        //////////////////////////////////////////////////////////////////////

        hide_buttons: function() {
            cell_control_bar.css("display", "none");
            cell_commands_above.hide();
        },
        show_buttons: function() {
            cell_control_bar.css("display", null);
            cell_commands_above.show();
        },
        execute_cell: function() {
            display_status("Computing...");
            result.edit_source(false);

            RCloud.UI.with_progress(function() {
                return cell_model.controller.execute();
            });
        },
        toggle_edit: function() {
            return this.edit_source(!edit_mode_);
        },
        edit_source: function(edit_mode) {
            if(edit_mode === edit_mode_)
                return;
            if(edit_mode) {
                code_div_.hide();
                create_edit_widget();
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
                ace_widget_.resize(true);
                set_widget_height();
                ace_widget_.resize(true);
                cell_controls_.set_flag('edit', true);
                outer_ace_div.show();
                ace_widget_.resize(); // again?!?
                ace_widget_.focus();
            }
            else {
                var new_content = update_model();
                if(new_content!==null) // if any change (including removing the content)
                    cell_model.parent_model.controller.update_cell(cell_model);
                source_div_.css({'height': ''});
                cell_controls_.set_flag('edit', false);
                code_div_.show();
                outer_ace_div.hide();
            }
            edit_mode_ = edit_mode;
        },
        get_input: function(type, prompt, k) {
            create_input_widget();
            input_widget_.setValue('');
            //for(var i =0; i<3; ++i) {
                input_div_.show();
                input_div_.css('height', (ui_utils.ace_editor_height(input_widget_, 1) + EXTRA_HEIGHT_INPUT) + "px");
                input_widget_.resize(true);
            //}
            input_widget_.focus();
            input_kont_ = k;
        },
        div: function() {
            return notebook_cell_div;
        },
        update_model: function() {
            return update_model();
        },
        focus: function() {
            ace_widget_.focus();
        },
        get_content: function() { // for debug
            return cell_model.content();
        },
        reformat: function() {
            if(edit_mode_) {
                // resize once to get right height, then set height,
                // then resize again to get ace scrollbars right (?)
                ace_widget_.resize();
                set_widget_height();
                ace_widget_.resize();
            }
        },
        check_buttons: function() {
            above_between_controls_.betweenness(!!cell_model.parent_model.prior_cell(cell_model));
        }
    });

    result.edit_source(false);
    return result;
};

Notebook.Cell.create_html_view = function(cell_model)
{
    return create_cell_html_view(cell_model.language(), cell_model);
};

Notebook.Cell.preprocessors = RCloud.extension.create();
Notebook.Cell.postprocessors = RCloud.extension.create();

Notebook.Cell.postprocessors.add({
    device_pixel_ratio: {
        sort: 1000,
        process: function(div) {
            // we use the cached version of DPR instead of getting window.devicePixelRatio
            // because it might have changed (by moving the user agent window across monitors)
            // this might cause images that are higher-res than necessary or blurry.
            // Since using window.devicePixelRatio might cause images
            // that are too large or too small, the tradeoff is worth it.
            var dpr = rcloud.display.get_device_pixel_ratio();
            // fix image width so that retina displays are set correctly
            div.find("img")
                .each(function(i, img) {
                    function update() { img.style.width = img.width / dpr; }
                    if (img.width === 0) {
                        $(img).on("load", update);
                    } else {
                        update();
                    }
                });
        }
    },
    deferred_results: {
        sort: 2000,
        process: function(div) {
            var uuid = rcloud.deferred_knitr_uuid;
            div.find("span.deferred-result")
                .each(function() {
                    var that = this;
                    var uuids = this.textContent.split("|");
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
                });
        }
    },
    mathjax: {
        sort: 3000,
        process: function(div) {
            // typeset the math

            // why does passing the div as last arg not work, as documented here?
            // http://docs.mathjax.org/en/latest/typeset.html
            if (!_.isUndefined(MathJax))
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
        }
    },
    hide_source: {
        sort: 4000,
        process: function(div) {
            // this is kinda bad
            if (!shell.notebook.controller._r_source_visible) {
                Notebook.hide_r_source(div);
            }
        }
    }
});

Notebook.Cell.preprocessors.add({
    quote_deferred_results: {
        sort: 1000,
        process: function(r) {
            var deferred_result_uuid_, deferred_regexp_, deferred_replacement_;
            if(!deferred_regexp_) {
                deferred_result_uuid_ = rcloud.deferred_knitr_uuid;
                deferred_regexp_ = new RegExp(deferred_result_uuid_ + '\\|[@a-zA-Z_0-9.]*', 'g');
                deferred_replacement_ = '<span class="deferred-result">$&</span>';
            }
            return r.replace(deferred_regexp_, deferred_replacement_);
        }
    }
});

})();
