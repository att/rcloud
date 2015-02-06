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
var EXTRA_HEIGHT_SOURCE = 2, EXTRA_HEIGHT_INPUT = 10;

function create_cell_html_view(language, cell_model) {
    var ace_widget_;
    var ace_session_;
    var ace_document_;
    var am_read_only_ = "unknown";
    var source_div_;
    var code_div_;
    var result_div_, has_result_;
    var current_result_; // text is aggregated
    var change_content_;
    var cell_status_;
    var above_between_controls_, cell_controls_, left_controls_;
    var edit_mode_; // note: starts neither true nor false
    var highlights_;

    // input1
    var prompt_text_;
    var input_div_, input_ace_div_, input_widget_, input_kont_, input_anim_;

    var result = {}; // "this"

    var notebook_cell_div  = $("<div class='notebook-cell'></div>");
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
        if(left_controls_)
            left_controls_.controls['cell_number'].set(cell_model.id());
    }
    function set_widget_height() {
        source_div_.css('height', (ui_utils.ace_editor_height(ace_widget_, MIN_LINES) +
                                   EXTRA_HEIGHT_SOURCE) + "px");
    }

    cell_status_ = $("<div class='cell-status nonselectable'></div>");

    var cell_status_left = $("<div class='cell-status-left'></div>");
    cell_status_.append(cell_status_left);
    left_controls_ = RCloud.UI.cell_commands.decorate('left', cell_status_left, cell_model, result);

    var cell_control_bar = $("<div class='cell-control-bar'></div>");
    var cell_commands_above = $("<div class='cell-controls-above nonselectable'></div>");

    if(!shell.is_view_mode()) {
        cell_status_.append(cell_control_bar);
        // disable sort action on the control bar area
        cell_control_bar.mousedown(function(e) {
            e.stopPropagation();
        });
        cell_controls_ = RCloud.UI.cell_commands.decorate('cell', cell_control_bar, cell_model, result);

        above_between_controls_ = RCloud.UI.cell_commands.decorate('above_between', cell_commands_above, cell_model, result);
        notebook_cell_div.append(cell_commands_above);
    }
    notebook_cell_div.append(cell_status_);

    var edit_colors_ = {
        markdown: "#F7EEE4",
        code: "#E8F1FA"
    };

    function set_background_color(language) {
        var edit_color = RCloud.language.is_a_markdown(language) ? edit_colors_.markdown  : edit_colors_.code;
        ace_div.css({ 'background-color': edit_color });
    }

    function update_language() {
        language = cell_model.language();
        if(cell_controls_)
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

    update_div_id();

    outer_ace_div.append(ace_div);
    source_div_.append(outer_ace_div);
    inner_div.append(source_div_);

    function click_to_edit(div, whether) {
        if(whether) {
            // distinguish between a click and a drag
            // http://stackoverflow.com/questions/4127118/can-you-detect-dragging-in-jquery
            div.on({
                'mousedown.rcloud-cell': function(e) {
                    $(this).data('p0', { x: e.pageX, y: e.pageY });
                },
                'mouseup.rcloud-cell': function(e) {
                    var p0 = $(this).data('p0');
                    if(p0) {
                        var p1 = { x: e.pageX, y: e.pageY },
                            d = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
                        if (d < 4) {
                            result.edit_source(true, e);
                            div.mouseleave();
                        }
                    }
                },
                'mouseenter.rcloud-cell': function() {
                    if(edit_mode_) // don't highlight if it won't do anything
                        return;
                    var edit_color = RCloud.language.is_a_markdown(language) ? edit_colors_.markdown  : edit_colors_.code;
                    var avg_color = d3.interpolateHsl('#f5f5f5', edit_color)(0.75);
                    $(this).css('background-color', avg_color);
                },
                'mouseleave.rcloud-cell': function() {
                    $(this).css('background-color', '');
                }
            });
        }
        else div.off('mousedown.rcloud-cell mouseup.rcloud-cell mouseenter.rcloud-cell mouseleave.rcloud-cell');
    }

    function display_status(status) {
        result_div_.html('<div class="non-result">' + status + '</div>');
        has_result_ = false;
    };

    // postprocessing the dom is slow, so only do this when we have a break
    var result_updated = _.debounce(function() {
        Notebook.Cell.postprocessors.entries('all').forEach(function(post) {
            post.process(result_div_, result);
        });
    }, 100);

    function clear_result() {
        result_div_.empty();
        has_result_ = false;
    }

    // start trying to refactor out this repetitive nonsense
    function ace_stuff(div, content) {
        ace.require("ace/ext/language_tools");
        var widget = ace.edit(div[0]);
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

        var aaa = ace_stuff(ace_div, cell_model.content());
        ace_widget_ = aaa.widget;
        ace_session_ = aaa.session;
        ace_document_ = aaa.document;

        ace_session_.on('change', function() {
            set_widget_height();
            ace_widget_.resize();
        });

        ace_widget_.resize();

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
        ace_widget_.commands.removeCommands(['find', 'replace']);
        change_content_ = ui_utils.ignore_programmatic_changes(ace_widget_, function() {
            cell_model.parent_model.on_dirty();
        });
        update_language();
    }
    function create_input_widget() {
        if(input_widget_) return;

        var aaa = ace_stuff(input_ace_div_, '');
        input_widget_ = aaa.widget;

        ui_utils.customize_ace_gutter(input_widget_, function(i) {
            return i===0 ? prompt_text_ : '';
        });
        input_widget_.commands.addCommands([{
            name: 'enter',
            bindKey: 'Return',
            exec: function(ace_widget, args, request) {
                var input = ace_widget.getValue();
                result.add_result('code', prompt_text_ + input + '\n');
                if(input_kont_)
                    input_kont_(null, input);
                input_div_.hide();
                window.clearInterval(input_anim_);
                input_anim_ = null;
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
    function assign_code(code) {
        code = code || cell_model.content();

        // add abso-relative line number spans at the beginning of each line
        var line = 1;
        code = code.replace(/^/gm, function() {
            return '<span class="rcloud-line-number-position"><span class="rcloud-line-number">' + line++ + '</span></span>';
        });
        code += '&nbsp;'; // make sure last line is shown even if it is just a tag

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
        var gutter = $('<div class="rcloud-gutter"></div>');

        var hljs_class = RCloud.language.hljs_class(cell_model.language());
        if(hljs_class)
            elem.addClass(hljs_class);
        code_div_.append(gutter, $('<pre></pre>').append(elem));
        highlight_code();
        // yuk
        code_div_.find('.rcloud-line-number .hljs-number').css('color', 'black');
        if(am_read_only_ !== 'unknown')
            click_to_edit(code_div_.find('pre'), !am_read_only_);
    }
    assign_code();

    result_div_ = $('<div class="r-result-div"></div>');
    clear_result();
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
        start_output: function() {
        },
        add_result: function(type, r) {
            if(!has_result_) {
                result_div_.empty(); // clear status
                if(RCloud.language.is_a_markdown(language))
                    result.hide_source(true);
                has_result_ = true;
            }
            if(type!='selection') {
                Notebook.Cell.preprocessors.entries('all').forEach(function(pre) {
                    r = pre.process(r);
                });
            }

            if(type!='code')
                current_result_ = null;
            switch(type) {
            case 'code':
                if(!current_result_) {
                    var pre = $('<pre></pre>');
                    current_result_ = $('<code></code>');
                    pre.append(current_result_);
                    result_div_.append(pre);
                }
                current_result_.append(r);
                break;
            case 'selection':
            case 'html':
                result_div_.append(r);
                break;
            default:
                throw new Error('unknown result type ' + type);
            }
            result_updated();
        },
        end_output: function() {
            if(!has_result_) {
                // the no-output case
                result_div_.empty();
                has_result_ = true;
            }
            current_result_ = null;
        },
        clear_result: clear_result,
        set_readonly: function(readonly) {
            am_read_only_ = readonly;
            if(ace_widget_)
                ui_utils.set_ace_readonly(ace_widget_, readonly );
            [cell_controls_, above_between_controls_, left_controls_].forEach(function(controls) {
                if(controls)
                    controls.set_flag('modify', !readonly);
            });
            click_to_edit(code_div_.find('pre'), !readonly);
            cell_status_.toggleClass('readonly', readonly);
        },
        click_to_edit: click_to_edit,

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
            var new_content = update_model();
            var promise;
            if(new_content!==null) // if any change (including removing the content)
                promise = cell_model.parent_model.controller.update_cell(cell_model);
            else
                promise = Promise.resolve(undefined);
            promise.then(function() {
                cell_model.controller.enqueue_execution_snapshot();
            });
        },
        toggle_edit: function() {
            return this.edit_source(!edit_mode_);
        },
        edit_source: function(edit_mode, event) {
            if(edit_mode === edit_mode_) {
                if(edit_mode)
                    ace_widget_.focus();
                return;
            }
            if(edit_mode) {
                if(RCloud.language.is_a_markdown(language))
                    this.hide_source(false);
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
                if(cell_controls_)
                    cell_controls_.set_flag('edit', true);
                outer_ace_div.show();
                ace_widget_.resize(); // again?!?
                ace_widget_.focus();
                if(event) {
                    var screenPos = ace_widget_.renderer.pixelToScreenCoordinates(event.pageX, event.pageY);
                    var docPos = ace_session_.screenToDocumentPosition(Math.abs(screenPos.row), Math.abs(screenPos.column));


                    var Range = ace.require('ace/range').Range;
                    var row = Math.abs(docPos.row), column = Math.abs(docPos.column);
                    var range = new Range(row, column, row, column);
                    ace_widget_.getSelection().setSelectionRange(range);
                }
            }
            else {
                var new_content = update_model();
                if(new_content!==null) // if any change (including removing the content)
                    cell_model.parent_model.controller.update_cell(cell_model);
                source_div_.css({'height': ''});
                if(cell_controls_)
                    cell_controls_.set_flag('edit', false);
                code_div_.show();
                outer_ace_div.hide();
            }
            edit_mode_ = edit_mode;
            this.change_highlights(highlights_); // restore highlights
        },
        hide_source: function(whether) {
            if(whether)
                source_div_.hide();
            else
                source_div_.show();
        },
        get_input: function(type, prompt, k) {
            if(!has_result_) {
                result_div_.empty();
                has_result_ = true;
            }
            prompt_text_ = prompt;
            create_input_widget();
            input_widget_.setValue('');
            input_div_.show();
            input_div_.css('height', "36px"); // can't get ui_utils.ace_editor_height to work
            // recalculate gutter width:
            input_widget_.renderer.$gutterLayer.gutterWidth = 0;
            input_widget_.renderer.$changes |= input_widget_.renderer.__proto__.CHANGE_FULL;
            input_widget_.resize(true);
            input_widget_.focus();
            input_div_.css('border-color', '#eeeeee');
            var dir = true;
            var switch_color = function() {
                input_div_.animate({borderColor: dir ? '#ff8c00' : '#E34234'},
                                   {duration: 2000,
                                    easing: 'easeInOutCubic',
                                    queue: false});
                dir = !dir;
            };
            switch_color();
            input_anim_ = window.setInterval(switch_color, 2000);
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
            if(above_between_controls_)
                above_between_controls_.betweenness(!!cell_model.parent_model.prior_cell(cell_model));
        },
        change_highlights: function(ranges) {
            if(edit_mode_) {
                var markers = ace_session_.getMarkers();
                for(var marker in markers) {
                    if(markers[marker].type === 'rcloud-select')
                        ace_session_.removeMarker(marker);
                }
                var Range = ace.require('ace/range').Range;
                if(ranges)
                    ranges.forEach(function(range) {
                        var begin = ui_utils.position_of_character_offset(ace_widget_, range.begin),
                            end = ui_utils.position_of_character_offset(ace_widget_, range.end);
                        var ace_range = new Range(begin.row, begin.column, end.row, end.column);
                        ace_session_.addMarker(ace_range, 'find-highlight', 'rcloud-select');
                    });
            }
            else {
                var content = cell_model.content();
                var last = 0, text = '';
                if(ranges)
                    ranges.forEach(function(range) {
                        text += content.substring(last, range.begin);
                        text += '<span class="find-highlight">' + content.substring(range.begin, range.end) + '</span>';
                        last = range.end;
                    });
                text += content.substring(last);
                assign_code(text);
            }
            highlights_ = ranges;
        },
        change_active_highlight: function(range) {
            if(!range)
                code_div_.find('.find-highlight.active').toggleClass('active', false);
            else {
                // http://stackoverflow.com/questions/7969031/indexof-element-in-js-array-using-a-truth-function-using-underscore-or-jquery
                function find(collection, filter) {
                    for (var i = 0; i < collection.length; i++) {
                        if(filter(collection[i], i, collection)) return i;
                    }
                    return -1;
                }
                var i = find(highlights_, function(r) { return r.begin === range.begin && r.end === range.end; });
                if(i<0)
                    throw new Error('unknown find result ' + JSON.stringify(range));
                code_div_.find('.find-highlight').eq(i).toggleClass('active', true);
            }
        }
    });

    result.edit_source(false);
    return result;
};

Notebook.Cell.create_html_view = function(cell_model)
{
    return create_cell_html_view(cell_model.language(), cell_model);
};
})();
