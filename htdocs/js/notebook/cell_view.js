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
var scrollable_area = $('#rcloud-cellarea');

function create_cell_html_view(language, cell_model) {
    var ace_widget_;
    var ace_session_;
    var ace_document_;
    var am_read_only_ = "unknown";
    var source_div_;
    var code_div_;
    var result_div_, has_result_;
    var current_result_; // text is aggregated
    var current_error_; // text is aggregated
    var change_content_;
    var cell_status_;
    var above_controls_, cell_controls_, left_controls_;
    var edit_mode_; // note: starts neither true nor false
    var highlights_;
    var code_preprocessors_ = []; // will be an extension point, someday
    var running_state_;  // running state

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
    function set_widget_height(widget_height) {
        outer_ace_div.css('height', widget_height ?
            widget_height : (ui_utils.ace_editor_height(ace_widget_, MIN_LINES) +  EXTRA_HEIGHT_SOURCE) + "px");
    }

    cell_status_ = $("<div class='cell-status nonselectable'></div>");

    var cell_status_left = $("<div class='cell-status-left'></div>");
    cell_status_.append(cell_status_left);
    left_controls_ = RCloud.UI.cell_commands.decorate('left', cell_status_left, cell_model, result);

    if(!shell.is_view_mode()) {
        var cell_control_bar = $("<div class='cell-control-bar'></div>");
        cell_status_.append(cell_control_bar);
        // disable sort action on the control bar area
        cell_control_bar.mousedown(function(e) {
            e.stopPropagation();
        });
        cell_controls_ = RCloud.UI.cell_commands.decorate('cell', cell_control_bar, cell_model, result);

        var cell_commands_above = $("<div class='cell-controls-above nonselectable'></div>");
        above_controls_ = RCloud.UI.cell_commands.decorate('above', cell_commands_above, cell_model, result);
        notebook_cell_div.append(cell_commands_above);

        cell_status_.click(function(e) {

            var cell_model = $(this).closest('.notebook-cell').data('rcloud.model');

            if(e.ctrlKey || e.metaKey || e.shiftKey) {
                e.preventDefault();
            }
            cell_model.parent_model.controller.select_cell(cell_model, {
                is_toggle: (ui_utils.is_a_mac() && e.metaKey) || (!ui_utils.is_a_mac() && e.ctrlKey),
                is_range : e.shiftKey,
                is_exclusive: !e.ctrlKey && !e.shiftKey
            });

            $(':focus').blur();

        }).children().click(function(e) {
            var target = $(e.target);
            if(!target.hasClass('cell-number')) {
                e.stopPropagation();
            }
        });
    }
    notebook_cell_div.append(cell_status_);

    var edit_colors_ = {
        markdown: "#F7EEE4",
        code: "#E8F1FA"
    };

    function set_background_class(div) {
        var md = RCloud.language.is_a_markdown(language);
        div.toggleClass(md ? 'edit-markdown' : 'edit-code', true);
        div.toggleClass(md ? 'edit-code' : 'edit-markdown', false);
    }

    function update_language() {
        language = cell_model.language();
        if(!RCloud.language.is_a_markdown(language))
            result.hide_source && result.hide_source(false);
        if(cell_controls_)
            cell_controls_.controls['language_cell'].set(language);
        set_background_class(code_div_.find('pre'));
        if(ace_widget_) {
            ace_div.toggleClass('active', true);
            set_background_class(ace_div);
            var LangMode = ace.require(RCloud.language.ace_mode(language)).Mode;
            ace_session_.setMode(new LangMode(false, ace_document_, ace_session_));
        }
    }

    function update_selected() {
        if(cell_model.is_selected()) {
            notebook_cell_div.addClass("selected");
        } else {
            notebook_cell_div.removeClass("selected");
        }

        notebook_cell_div.find('.cell-control input[type="checkbox"]').prop('checked', cell_model.is_selected());
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
    set_background_class(ace_div);

    update_div_id();

    outer_ace_div.append(ace_div);
    source_div_.append(outer_ace_div);
    inner_div.append(source_div_);

    function click_to_edit(div, whether) {

        if(whether) {
            set_background_class(code_div_.find('pre'));
            if(am_read_only_===false)
                div.toggleClass('inactive', true);
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
                            if(am_read_only_)
                                result.hide_source(false);
                            else
                                result.edit_source(true, e);
                            div.mouseleave();
                        }
                    }
                }
/*
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
*/
            });
        }
        else div.off('mousedown.rcloud-cell mouseup.rcloud-cell');
    }

    // postprocessing the dom is slow, so only do this when we have a break
    var result_updated = _.debounce(function() {
        Notebook.Cell.postprocessors.entries('all').forEach(function(post) {
            post.process(result_div_, result);
        });
    }, 100);

    function clear_result() {
        result_div_.empty();
        has_result_ = false;
        if(cell_controls_)
            results_button_border(false);
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

        widget.gotoPageUp = function() {
            widget.renderer.layerConfig.height = $('#rcloud-cellarea').height();
            widget.$moveByPage(-1, false);
        };

        widget.gotoPageDown = function() {
            widget.renderer.layerConfig.height = $('#rcloud-cellarea').height();
            widget.$moveByPage(1, false);
        };

        widget.setAutoScrollEditorIntoView = function(enable) {
            if (!enable)
                return;
            var rect;
            var self = widget;
            var shouldScroll = false;
            if (!widget.$scrollAnchor) {
                widget.$scrollAnchor = window.document.createElement("div");
            }
            var scrollAnchor = widget.$scrollAnchor;
            scrollAnchor.style.cssText = "position:absolute;";

            $('#rcloud-cellarea').prepend(scrollAnchor);

            var onChangeSelection = widget.on("changeSelection", function() {
                shouldScroll = true;
            });
            var onBeforeRender = widget.renderer.on("beforeRender", function() {
                if (shouldScroll)
                    rect = self.renderer.container.getBoundingClientRect();
            });
            var onAfterRender = widget.renderer.on("afterRender", function() {
                if (shouldScroll && rect && self.isFocused()) {
                    var renderer = self.renderer;
                    var pos = renderer.$cursorLayer.$pixelPos;
                    var config = renderer.layerConfig;
                    var top = pos.top - config.offset;

                    // shouldScoll  = true  = ^
                    // shouldScroll = false = v
                    if (pos.top >= 0 && top + rect.top < $('#rcloud-cellarea').offset().top) {
                        shouldScroll = true;
                    } else if (pos.top < config.height &&
                        pos.top + rect.top + config.lineHeight > window.innerHeight) {
                        shouldScroll = false;
                    } else {
                        shouldScroll = null;
                    }

                    if (shouldScroll != null) {
                        var ace_div = $(renderer.$cursorLayer.element).closest('.outer-ace-div');
                        var scroll_top = (ace_div.offset().top + $('#rcloud-cellarea').scrollTop()) - $('#rcloud-cellarea').offset().top;
                        scroll_top += pos.top;

                        if(shouldScroll) {
                            $('#rcloud-cellarea').scrollTop(scroll_top);
                        } else {
                            $('#rcloud-cellarea').scrollTop(scroll_top - $('#rcloud-cellarea').height() + config.lineHeight);
                        }
                    }
                    shouldScroll = rect = null;
                }
            });
            widget.setAutoScrollEditorIntoView = function(enable) {
                if (enable)
                    return;
                delete widget.setAutoScrollEditorIntoView;
                widget.removeEventListener("changeSelection", onChangeSelection);
                widget.renderer.removeEventListener("afterRender", onAfterRender);
                widget.renderer.removeEventListener("beforeRender", onBeforeRender);
            };
        };

        widget.setOptions({
            enableBasicAutocompletion: true,
            autoScrollEditorIntoView: true
        });

        widget.setTheme("ace/theme/chrome");
        session.setUseWrapMode(true);
        return {
            widget: widget,
            session: session,
            document: document
        };
    }

    function cell_changed() {
        var new_state;
        switch(running_state_) {
        case 'waiting':
        case 'unknown':
            new_state = 'unknown';
            break;
        case 'running':
        case 'unknown-running':
            new_state = 'unknown-running';
            break;
        default:
            new_state = 'ready';
        }
        result.state_changed(new_state);
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
            exec: function() {
                result.execute_cell();
            }
        }, {
            name: 'executeCellsFromHere',
            bindKey: {
                win: 'Shift-Alt-Return',
                mac: 'Shift-Alt-Return',
                sender: 'editor'
            },
            exec: function() {
                shell.run_notebook_from(cell_model.id());
            }
        }, {
            name: 'navigateToPreviousCell',
            bindKey: {
                win: 'Ctrl-Shift-,',
                mac: 'Ctrl-Shift-,',
                sender: 'editor'
            },
            exec: function() {
                var prior_cell = cell_model.parent_model.prior_cell(cell_model);

                if(prior_cell) {
                    prior_cell.set_focus();
                }
            }
        }, {
            name: 'navigateToNextCell',
            bindKey: {
                win: 'Ctrl-Shift-.',
                mac: 'Ctrl-Shift-.',
                sender: 'editor'
            },
            exec: function() {
                var subsequent_cell = cell_model.parent_model.subsequent_cell(cell_model);

                if(subsequent_cell) {
                    subsequent_cell.set_focus();
                }
            }
        }, {
            name: 'insertCellBefore',
            bindKey: {
                win: 'Ctrl-[',
                mac: 'Cmd-[',
                sender: 'editor'
            },
            exec: function() {
                shell.insert_cell_before("", cell_model.language(), cell_model.id())
                    .spread(function(_, controller) {
                        controller.edit_source(true);
                    });
            }
        }, {
            name: 'insertCellAfter',
            bindKey: {
                win: 'Ctrl-]',
                mac: 'Cmd-]',
                sender: 'editor'
            },
            exec: function() {
                shell.insert_cell_after("", cell_model.language(), cell_model.id())
                    .spread(function(_, controller) {
                        controller.edit_source(true);
                    });
            }
        }, {
            name: 'blurCell',
            bindKey: {
                win: 'Escape',
                mac: 'Escape',
                sender: 'editor'
            },
            exec: function() {
                ace_widget_.blur();
            }
        }, {
            name: 'executeAll',
            bindKey: {
                win: 'Ctrl-Shift-Enter',
                mac: 'Ctrl-Shift-Enter',
                sender: 'editor'
            },
            exec: function() {
                RCloud.UI.run_button.run();
            }
        }]);
        ace_widget_.commands.removeCommands(['find', 'replace']);
        change_content_ = ui_utils.ignore_programmatic_changes(ace_widget_, function() {
            cell_changed();
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
                result.add_result('code', _.unescape(prompt_text_) + input + '\n');
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
    function highlight_classes(kind) {
        return 'find-highlight' + ' ' + kind;
    }
    function edit_button_border(whether) {
        if(cell_controls_)
            cell_controls_.controls['edit'].control.find('i').toggleClass('icon-border', whether);
    }
    function results_button_border(whether) {
        if(cell_controls_)
            cell_controls_.controls['results'].control.find('i').toggleClass('icon-border', whether);
    }

    // should be a code preprocessor extension, but i've run out of time
    code_preprocessors_.push(
        function(code) {
            var yuk = _.escape;
            // add search highlights
            var last = 0, text = [];
            if(highlights_)
                highlights_.forEach(function(range) {
                    text.push(yuk(code.substring(last, range.begin)));
                    text.push('<span class="', highlight_classes(range.kind), '">',
                              yuk(code.substring(range.begin, range.end)), '</span>');
                    last = range.end;
                });
            text.push(yuk(code.substring(last)));
            return text.join('');
        },
        function(code) {
            // add abso-relative line number spans at the beginning of each line
            var line = 1;
            code = code.split('\n').map(function(s) {
                return ['<span class="rcloud-line-number-position nonselectable">',
                        '&#x200b;',
                        '<span class="rcloud-line-number">',
                        line++,
                        '</span></span>',s].join('');
            }).join('\n');

            code += '&nbsp;'; // make sure last line is shown even if it is just a tag
            return code;
        },
        function(code) {
            // match the number of lines ace.js is going to show
            // 1. html would skip final blank line
            if(code[code.length-1] === '\n')
                code += '\n';

            // 2. we have ace configured to show a minimum of MIN_LINES lines
            var lines = (code.match(/\n/g)||[]).length;
            if(lines<MIN_LINES)
                code += new Array(MIN_LINES+1-lines).join('\n');
            return code;
        });

    function assign_code(code) {
        code = code || cell_model.content();

        code = code_preprocessors_.reduce(function(code, f) {
            return f(code);
        }, code);

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
            click_to_edit(code_div_.find('pre'), true);
        set_background_class(code_div_.find('pre'));
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
                var st = ace_session_.getScrollTop();
                var range = ace_widget_.getSelection().getRange();
                var changed = change_content_(cell_model.content());
                ace_widget_.getSelection().setSelectionRange(range);
                ace_session_.setScrollTop(st);
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
        language_updated: function() {
            update_language();
            cell_changed();
        },
        selected_updated: function() {
            update_selected();
        },
        state_changed: function(state) {
            var control = left_controls_.controls['run_state'];
            if(running_state_==="unknown" && state==="running")
                state = "unknown-running";
            switch(state) {
            case 'ready':
                control.icon('icon-circle-blank').color('#777').title('content has not been run');
                break;
            case 'waiting':
                control.icon('icon-arrow-right').color('blue').title('cell is enqueued and waiting to run');
                break;
            case 'cancelled':
                control.icon('icon-asterisk').color('#e06a06').title('execution was cancelled before this cell could run');
                break;
            case 'unknown-running':
                control.icon('icon-question icon-spin').color('blue').title('cell is currently running');
                has_result_ = false;
                break;
            case 'running':
                control.icon('icon-spinner icon-spin').color('blue').title('cell is currently running');
                has_result_ = false;
                break;
            case 'complete':
                control.icon('icon-circle').color('#72B668').title('cell successfully ran');
                break;
            case 'error':
                control.icon('icon-exclamation').color('crimson').title('cell ran but had an error');
                break;
            case 'unknown':
                control.icon('icon-question').color('purple').title('output may or may not reflect current content');
                break;
            }
            running_state_ = state;
            return this;
        },
        add_result: function(type, r) {
            if(!has_result_) {
                result_div_.empty(); // clear previous output
                if(RCloud.language.is_a_markdown(language))
                    result.hide_source(true);
                has_result_ = true;
            }
            this.toggle_results(true); // always show when updating
            switch(type) {
            case 'selection':
            case 'deferred_result':
                break;
            default:
                Notebook.Cell.preprocessors.entries('all').forEach(function(pre) {
                    r = pre.process(r);
                });
            }

            if(type!='code')
                current_result_ = null;
            if(type!='error')
                current_error_ = null;
            var pre;
            switch(type) {
            case 'code':
                if(!current_result_) {
                    pre = $('<pre></pre>');
                    current_result_ = $('<code></code>');
                    pre.append(current_result_);
                    result_div_.append(pre);
                }
                current_result_.append(_.escape(r));
                break;
            case 'error':
                // sorry about this!
                if(!current_error_) {
                    pre = $('<pre></pre>');
                    current_error_ = $('<code style="color: crimson"></code>');
                    pre.append(current_error_);
                    result_div_.append(pre);
                }
                current_error_.append(_.escape(r));
                break;
            case 'selection':
            case 'html':
                result_div_.append(r);
                break;
            case 'deferred_result':
                result_div_.append('<span class="deferred-result">' + r + '</span>');
                break;
            default:
                throw new Error('unknown result type ' + type);
            }
            result_updated();
        },
        end_output: function(error) {
            if(!has_result_) {
                // the no-output case
                result_div_.empty();
                has_result_ = true;
            }
            this.state_changed(error ? 'error' : running_state_==='unknown-running' ? 'ready' : 'complete');
            current_result_ = current_error_ = null;
        },
        clear_result: clear_result,
        set_readonly: function(readonly) {
            am_read_only_ = readonly;
            if(ace_widget_)
                ui_utils.set_ace_readonly(ace_widget_, readonly );
            [cell_controls_, above_controls_, left_controls_].forEach(function(controls) {
                if(controls)
                    controls.set_flag('modify', !readonly);
            });
            click_to_edit(code_div_.find('pre'), !readonly);
            cell_status_.toggleClass('readonly', readonly);
            if(readonly)
                edit_button_border($(source_div_).is(":visible"));
        },
        set_show_cell_numbers: function(whether) {
            left_controls_.set_flag('cell-numbers', whether);
        },
        click_to_edit: click_to_edit,

        //////////////////////////////////////////////////////////////////////

        execute_cell: function() {
            return cell_model.parent_model.controller.save()
                .then(function() {
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

                var offset = scrollable_area.scrollTop();

                if(cell_controls_)
                    edit_button_border(true);
                if(RCloud.language.is_a_markdown(language))
                    this.hide_source(false);
                var editor_height = code_div_.height();
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
                set_widget_height(editor_height);
                ace_widget_.resize(true);
                if(cell_controls_)
                    cell_controls_.set_flag('edit', true);
                outer_ace_div.show();
                ace_widget_.resize(); // again?!?
                ace_widget_.focus();
                if(event) {

                    scrollable_area.scrollTop(offset);

                    var scrollTopOffset = ace_widget_.getSession().getScrollTop();
                    var screenPos = ace_widget_.renderer.pixelToScreenCoordinates(event.pageX, event.pageY - scrollTopOffset);
                    var docPos = ace_session_.screenToDocumentPosition(Math.abs(screenPos.row), Math.abs(screenPos.column));

                    var Range = ace.require('ace/range').Range;
                    var row = Math.abs(docPos.row), column = Math.abs(docPos.column);
                    var range = new Range(row, column, row, column);
                    ace_widget_.getSelection().setSelectionRange(range);
                }
            }
            else {
                if(cell_controls_)
                    edit_button_border(false);
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
        scroll_into_view: function() {
            var renderer = ace_widget_.renderer;
            var rect = renderer.container.getBoundingClientRect();
            var pos = renderer.$cursorLayer.$pixelPos;
            var config = renderer.layerConfig;
            var top = pos.top - config.offset;

            // shouldScoll  = true  = ^
            // shouldScroll = false = v
            if (pos.top >= 0 && top + rect.top < $('#rcloud-cellarea').offset().top) {
                shouldScroll = true;
            } else if (pos.top < config.height &&
                pos.top + rect.top + config.lineHeight > window.innerHeight) {
                shouldScroll = false;
            } else {
                shouldScroll = null;
            }

            if (shouldScroll != null) {
                var ace_div = $(renderer.$cursorLayer.element).closest('.outer-ace-div');
                var scroll_top = (ace_div.offset().top + $('#rcloud-cellarea').scrollTop()) - $('#rcloud-cellarea').offset().top;
                scroll_top += pos.top;

                if(shouldScroll) {
                    $('#rcloud-cellarea').scrollTop(scroll_top);
                } else {
                    $('#rcloud-cellarea').scrollTop(scroll_top - $('#rcloud-cellarea').height() + config.lineHeight);
                }
            }
        },
        toggle_source: function() {
            this.hide_source($(source_div_).is(":visible"));
        },
        hide_source: function(whether) {
            if(whether) {
                source_div_.hide();
                edit_button_border(false);
            }
            else {
                source_div_.show();
                edit_button_border(true);
            }
        },
        toggle_results: function(val) {
            if(val===undefined)
                val = result_div_.is(':hidden');
            if(cell_controls_)
                results_button_border(val);
            if(val) result_div_.show();
            else result_div_.hide();
        },
        get_input: function(type, prompt, k) {
            if(!has_result_) {
                result_div_.empty();
                has_result_ = true;
            }
            prompt_text_ = _.escape(prompt).replace(/\n/g,'');
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
            var dir = false;
            var switch_color = function() {
                input_div_.animate({borderColor: dir ? '#ffac88' : '#E34234'},
                                   {duration: 1000,
                                    easing: 'easeInOutCubic',
                                    queue: false});
                dir = !dir;
            };
            switch_color();
            input_anim_ = window.setInterval(switch_color, 1000);
            ui_utils.scroll_into_view($('#rcloud-cellarea'), 100, 100, notebook_cell_div, input_div_);
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
            return this;
        },
        get_content: function() { // for debug
            return cell_model.content();
        },
        get_selection: function() {
            return this.ace_widget().getSession().doc.getTextRange(this.ace_widget().selection.getRange());
        },
        reformat: function() {
            if(edit_mode_) {
                // resize once to get right height, then set height,
                // then resize again to get ace scrollbars right (?)
                ace_widget_.resize();
                set_widget_height();
                ace_widget_.resize();
            }
            return this;
        },
        check_buttons: function() {
            if(above_controls_)
                above_controls_.set_flag('first', !cell_model.parent_model.prior_cell(cell_model));
            return this;
        },
        change_highlights: function(ranges) {
            highlights_ = ranges;
            if(edit_mode_) {
                var markers = ace_session_.getMarkers();
                for(var marker in markers) {
                    if(markers[marker].type === 'rcloud-select')
                        ace_session_.removeMarker(marker);
                }
                if(ranges)
                    ranges.forEach(function(range) {
                        var ace_range = ui_utils.ace_range_of_character_range(ace_widget_, range.begin, range.end);
                        ace_session_.addMarker(ace_range, highlight_classes(range.kind), 'rcloud-select');
                        if(/active/.test(range.kind)) {
                            ace_widget_.scrollToLine(ace_range.start.row);
                            window.setTimeout(function() {
                                var hl = ace_div.find('.find-highlight.' + range.kind);
                                if(hl.size())
                                    ui_utils.scroll_into_view($('#rcloud-cellarea'), 100, 100, notebook_cell_div, ace_div, hl);
                            }, 0);
                        }
                    });
            }
            else {
                assign_code();
                var $active = code_div_.find('.find-highlight.active, .find-highlight.activereplaced');
                if($active.size())
                    ui_utils.scroll_into_view($('#rcloud-cellarea'), 100, 100, notebook_cell_div, code_div_, $active);

            }
            return this;
        }
    });

    result.edit_source(false);
    return result;
}

Notebook.Cell.create_html_view = function(cell_model)
{
    return create_cell_html_view(cell_model.language(), cell_model);
};
})();
