var ui_utils = {};

ui_utils.make_url = function(page, opts) {
    opts = opts || {};
    var url = window.location.protocol + '//' + window.location.host + '/' + page;
    if(opts.do_path) {
        if(opts.notebook) {
            url += '/' + opts.notebook;
            // tags currently not supported for notebook.R & the like
            if(opts.version)
                url += '/' + opts.version;
        }
    }
    else {
        if(opts.notebook) {
            url += '?notebook=' + opts.notebook;
            if(opts.source)
                url += '&source=' + opts.source;
            if(opts.tag)
                url += '&tag=' + opts.tag;
            else if(opts.version)
                url += '&version=' + opts.version;
        }
        else if(opts.new_notebook)
            url += '?new_notebook=true';
    }
    return url;
};

ui_utils.relogin_uri = function() {
    return window.location.protocol +
        '//' + window.location.host +
        '/login.R?redirect=' +
        encodeURIComponent(window.location.pathname + window.location.search);
};

ui_utils.disconnection_error = function(msg, label) {
    var result = $("<div class='alert alert-danger'></div>");
    result.append($("<span></span>").text(msg));
    label = label || "Reconnect";
    var button = $("<button type='button' class='close'>" + label + "</button>");
    result.append(button);
    button.click(function() {
        window.location = ui_utils.relogin_uri();
    });
    return result;
};

ui_utils.string_error = function(msg) {
    var button = $("<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>");
    var result = $("<div class='alert alert-danger alert-dismissable'></div>");
    // var text = $("<span></span>");

    result.append(button);
    var text = _.map(msg.split("\n"), function(str) {
        // poor-man replacing 4 spaces with indent
        var el = $("<div></div>").text(str), match;
        if ((match = str.match(/^( {4})+/))) {
            var indent = match[0].length / 4;
            el.css("left", indent +"em");
            el.css("position", "relative");
        }
        return el;
    });
    result.append(text);
    return result;
};

/*
 * if container_is_self is true, then the html container of the tooltip is the element
 * itself (which is the default for bootstrap but doesn't work very well for us
 * because of z-index issues).
 *
 * On the other hand, if *all* containers are the html body, then this happens:
 *
 * https://github.com/att/rcloud/issues/525
 */
ui_utils.fa_button = function(which, title, classname, style, container_is_self)
{
    var icon = $.el.i({'class': which});
    var span = $.el.span({'class': 'fontawesome-button ' + (classname || '')},
                        icon);
    if(style) {
        for (var k in style)
            icon.style[k] = style[k];
    }
    // $(icon).css(style);
    var opts = {
        title: title,
        delay: { show: 250, hide: 0 }
    };
    if (!container_is_self) {
        opts.container = 'body';
    }
    return $(span).tooltip(opts);
};

ui_utils.enable_fa_button = function(el) {
    el.removeClass("button-disabled");
};

ui_utils.disable_fa_button = function(el) {
    el.addClass("button-disabled");
};

ui_utils.enable_bs_button = function(el) {
    el.removeClass("disabled");
};

ui_utils.disable_bs_button = function(el) {
    el.addClass("disabled");
};


ui_utils.ace_editor_height = function(widget, min_rows, max_rows)
{
    min_rows = _.isUndefined(min_rows) ? 0  : min_rows;
    max_rows = _.isUndefined(max_rows) ? 30 : max_rows;
    var lineHeight = widget.renderer.lineHeight;
    //var rows = Math.max(min_rows, Math.min(max_rows, widget.getSession().getScreenLength()));
    var rows = Math.max(min_rows, widget.getSession().getScreenLength());
    var newHeight = lineHeight*rows + widget.renderer.scrollBar.getWidth();
    return newHeight;
};

ui_utils.ace_get_last = function(widget) {
    var session =  widget.getSession(),
        row = session.getLength() - 1,
        column = session.getLine(row).length;

    return {
        row: row,
        column: column
    };
}

ui_utils.ace_set_pos = function(widget, row, column) {
    var sel = widget.getSelection();
    var range = sel.getRange();
    range.setStart(row, column);
    range.setEnd(row, column);
    sel.setSelectionRange(range);
};

ui_utils.install_common_ace_key_bindings = function(widget, get_language) {
    var Autocomplete = ace.require("ace/autocomplete").Autocomplete;
    var session = widget.getSession();
    var tab_handler = widget.commands.commandKeyBinding[0].tab;

    widget.commands.addCommands([
        {
            name: 'another autocomplete key',
            bindKey: 'Ctrl-.',
            exec: Autocomplete.startCommand.exec
        },
        {
            name: 'the autocomplete key people want',
            bindKey: 'Tab',
            exec: function(widget, args, request) {
                //determine if there is anything but whitespace on line
                var range = widget.getSelection().getRange();
                var line = widget.getSession().getLine(range.start.row);
                var before = line.substring(0, range.start.column);
                if(before.match(/\S/))
                    Autocomplete.startCommand.exec(widget, args, request);
                else tab_handler.exec(widget, args, request);
            }
        },
        {
            name: 'disable gotoline',
            bindKey: {
                win: "Ctrl-L",
                mac: "Command-L"
            },
            exec: function() { return false; }
        },
        {
            name: 'execute-selection-or-line',
            bindKey: {
                win: 'Ctrl-Return',
                mac: 'Command-Return',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                if (widget.getOption("readOnly"))
                    return;
                var code = session.getTextRange(widget.getSelectionRange());
                if(code.length===0) {
                    var pos = widget.getCursorPosition();
                    var Range = ace.require('ace/range').Range;
                    var range = new Range(pos.row, 0, pos.row+1, 0);
                    code = session.getTextRange(range);
                    widget.navigateDown(1);
                    widget.navigateLineEnd();
                }
                RCloud.UI.command_prompt.history().add_entry(code);
                shell.new_cell(code, get_language())
                    .spread(function(_, controller) {
                        controller.enqueue_execution_snapshot();
                        shell.scroll_to_end();
                    });
            }
        },

        {
            name: 'cursor at beginning of line',
            ctrlACount : 0,
            lastRow: -1,
            bindKey: {
                mac: 'Ctrl-A',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                if (widget.getOption("readOnly"))
                    return;
                //row of the cursor on current line
                var row = widget.getCursorPosition().row;
                //if on a new line
                if( this.lastRow !== row) {
                    this.ctrlACount = 1;
                    widget.navigateLineStart();
                    this.lastRow = row;
                }
                else {
                    if(this.ctrlACount === 0) {
                        //make sure it appears at beginning of text
                        widget.navigateLineStart();
                        this.ctrlACount ++;
                    }
                    else if(this.ctrlACount === 1 ) {
                        //move to the beginning of that line
                        widget.navigateTo(row, 0);
                        this.ctrlACount = 0;
                    }
                    this.lastRow = row;
                }
            }
        } ,
        {
            name: 'cursor at end of line',
            bindKey: {
                mac: 'Ctrl-E',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                //row of the cursor on current line
                var row = widget.getCursorPosition().row;
                //last column of the cursor on current line
                var lastCol = ui_utils.last_col(widget, row);
                //move to the end of that line
                widget.navigateTo(row, lastCol);
            }
        }
    ]);
};


ui_utils.last_col = function(widget, row) {
    var doc = widget.getSession().getDocument();
    return doc.getLine(row).length;
};

ui_utils.character_offset_of_pos = function(widget, pos) {
    // surprising this is not built-in.  this adapted from
    // https://groups.google.com/forum/#!msg/ace-discuss/-RVHHWZGkk8/blFQz0TcPf8J
    var session = widget.getSession(), doc = session.getDocument();
    var nlLength = doc.getNewLineCharacter().length;
    var text = doc.getAllLines();
    if(pos.row>text.length)
        throw new Error("getting position off end of editor");
    var ret = 0, i;
    for(i=0; i<pos.row; i++)
        ret += text[i].length + nlLength;
    ret += pos.column;
    return ret;
};

ui_utils.position_of_character_offset = function(widget, offset) {
    // based on the above; the wontfix ace issue is
    // https://github.com/ajaxorg/ace/issues/226
    var session = widget.getSession(), doc = session.getDocument();
    var nlLength = doc.getNewLineCharacter().length;
    var text = doc.getAllLines();
    var i;
    for(i=0; i<text.length; i++) {
        if(offset <= text[i].length)
            break;
        offset -= text[i].length + nlLength;
    }
    if(i===text.length)
        throw new Error("character offset off end of editor");
    return {row: i, column: offset};
};

ui_utils.ace_range_of_character_range = function(widget, cbegin, cend) {
    var Range = ace.require('ace/range').Range;
    var begin = ui_utils.position_of_character_offset(widget, cbegin),
        end = ui_utils.position_of_character_offset(widget, cend);
    return new Range(begin.row, begin.column, end.row, end.column);
};

// bind an ace editor to a listener and return a function to change the
// editor content without triggering that listener
ui_utils.ignore_programmatic_changes = function(widget, listener) {
    var listen = true;
    widget.on('change', function() {
        if(listen)
            listener(widget.getValue());
    });
    return function(value) {
        listen = false;
        var oldValue = widget.getValue();
        var res = (value !== oldValue) ? widget.setValue(value) : null;
        listen = true;
        return res;
    };
};

ui_utils.set_ace_readonly = function(widget, readonly) {
    // a better way to set non-interactive readonly
    // https://github.com/ajaxorg/ace/issues/266
    widget.setOptions({
        readOnly: readonly,
        highlightActiveLine: !readonly,
        highlightGutterLine: !readonly
    });
    widget.renderer.$cursorLayer.element.style.opacity = readonly?0:1;
    widget.textInput.getElement().disabled = readonly;
};

ui_utils.twostate_icon = function(item, on_activate, on_deactivate,
                                    active_icon, inactive_icon) {
    function set_state(state) {
        item[0].checked = state;
        var icon = item.find('i');
        if(state) {
            icon.removeClass(inactive_icon);
            icon.addClass(active_icon);
        }
        else {
            icon.removeClass(active_icon);
            icon.addClass(inactive_icon);
        }
    }
    function on_click() {
        var state = !this.checked;
        set_state(state);
        if(state)
            on_activate();
        else
            on_deactivate();
    }
    function enable(val) {
        item.off('click');
        if(val)
            item.click(on_click);
    }
    enable(true);
    return {set_state: set_state, enable: enable};
};

// not that i'm at all happy with the look
ui_utils.checkbox_menu_item = function(item, on_check, on_uncheck) {
    var ret = ui_utils.twostate_icon(item, on_check, on_uncheck,
                                    'icon-check', 'icon-check-empty');
    var base_enable = ret.enable;
    ret.enable = function(val) {
        // bootstrap menu items go in in an <li /> that takes the disabled class
        item.parent().toggleClass('disabled', !val);
        base_enable(val);
    };
    return ret;
};

// this is a hack, but it'll help giving people the right impression.
// I'm happy to replace it with the Right Way to do it when we learn
// how to do it.
// still a hack, generalizing it a little bit.

ui_utils.customize_ace_gutter = function(widget, line_text_function)
{
    var dom = ace.require("ace/lib/dom");
    widget.renderer.$gutterLayer.update = function(config) {
        var emptyAnno = {className: ""};
        var html = [];
        var i = config.firstRow;
        var lastRow = config.lastRow;
        var fold = this.session.getNextFoldLine(i);
        var foldStart = fold ? fold.start.row : Infinity;
        var foldWidgets = this.$showFoldWidgets && this.session.foldWidgets;
        var breakpoints = this.session.$breakpoints;
        var decorations = this.session.$decorations;
        var firstLineNumber = this.session.$firstLineNumber;
        var maxLineLength = 0;
        for(; i <= lastRow; ++i) {
            var line = line_text_function(i);
            html.push(
                "<div class='ace_gutter-cell ",
                "' style='height:", this.session.getRowLength(0) * config.lineHeight, "px;'>",
                line,
                "</div>"
            );
            maxLineLength = Math.max(maxLineLength, line.length);
        }

        this.element = dom.setInnerHtml(this.element, html.join(""));
        this.element.style.height = config.minHeight + "px";

        var gutterWidth = maxLineLength * config.characterWidth;
        var padding = this.$padding || this.$computePadding();
        gutterWidth += padding.left + padding.right;
        if (gutterWidth !== this.gutterWidth && !isNaN(gutterWidth)) {
            this.gutterWidth = gutterWidth;
            this.element.style.width = Math.ceil(this.gutterWidth) + "px";
            this._emit("changeGutterWidth", gutterWidth);
        }
    };
};

// the existing jQuery editable libraries don't seem to do what we need, with
// different active and inactive text, and customized selection.
// this is a vague imitation of what a jquery.ui library might look like
// except without putting it into $ namespace
ui_utils.editable = function(elem$, command) {
    function selectRange(range) {
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
    function setCaretPosition(position) {
        var range = document.createRange();
        var text_node = elem$.get(0).firstChild;
        range.setStart(text_node, position);
        range.setEnd(text_node, position);
        selectRange(range);
    };
    function getCaretPosition() {
        return window.getSelection().getRangeAt(0);
    };
    function options() {
        return elem$.data('__editable');
    }
    function encode(s) {
        if(command.allow_multiline) {
            s = s.replace(/\n/g, "<br/>");
        }
        return s.replace(/  /g, ' \xa0'); // replace every space with nbsp
    }
    function decode(s) {
        if(command.allow_multiline) {
            s = s.replace(/<br>/g, "\n");
        }
        return s.replace(/\xa0/g,' '); // replace nbsp's with spaces
    }
    function set_content_type(is_multiline,content) {
        if(is_multiline) {
            elem$.html(content);
        } else {
            elem$.text(content);
        }
    }
    var old_opts = options(),
        new_opts = old_opts;
    if(_.isObject(command)) {
        var defaults;
        if(old_opts)
            defaults = $.extend({}, old_opts);
        else
            defaults = {
                on_change: function() { return true; },
                allow_edit: true,
                inactive_text: elem$.text(),
                active_text: elem$.text(),
                allow_multiline: false,
                select: function(el) {
                    var range = document.createRange();
                    range.selectNodeContents(el);
                    return range;
                }
            };
        new_opts = $.extend(defaults, command);
        elem$.data('__editable', new_opts);
    }
    else {
        if(command !== 'destroy' && !old_opts)
            throw new Error('expected already editable for command ' + command);
        var set_option = function(key, value) {
            old_opts = $.extend({}, old_opts);
            new_opts[key] = value;
        };
        switch(command) {
        case 'destroy':
            elem$.data('__editable', null);
            new_opts = null;
            break;
        case 'option':
            if(!arguments[2])
                return old_opts;
            else if(!arguments[3])
                return old_opts[arguments[2]];
            else {
                set_option(arguments[2], arguments[3]);
            }
            break;
        case 'disable':
            set_option('allow_edit', false);
            break;
        case 'enable':
            set_option('allow_edit', true);
            break;
        }
    }
    var action = null;
    if((!old_opts || !old_opts.allow_edit) && (new_opts && new_opts.allow_edit))
        action = 'melt';
    else if((old_opts && old_opts.allow_edit) && (!new_opts || !new_opts.allow_edit))
        action = 'freeze';

    if(new_opts)
        set_content_type(command.allow_multiline,encode(options().__active ? new_opts.active_text : new_opts.inactive_text));

    switch(action) {
    case 'freeze':
        elem$.removeAttr('contenteditable');
        elem$.off('keydown.editable');
        elem$.off('focus.editable');
        elem$.off('click.editable');
        elem$.off('blur.editable');
        break;
    case 'melt':
        elem$.attr('contenteditable', 'true');
        elem$.on({
            'focus.editable': function() {
                if(!options().__active) {
                    options().__active = true;
                    set_content_type(command.allow_multiline,encode(options().active_text));
                    window.setTimeout(function() {
                        selectRange(options().select(elem$[0]));
                        elem$.off('blur.editable');
                        elem$.on('blur.editable', function() {
                            set_content_type(command.allow_multiline,encode(options().inactive_text));
                            options().__active = false;
                        }); // click-off cancels
                    }, 10);
                }
            },
            'click.editable': function(e) {
                e.stopPropagation();
                // allow default action but don't bubble (causing erroneous reselection in notebook tree)
            },
            'keydown.editable': function(e) {
                if(e.keyCode === $.ui.keyCode.ENTER) {
                    var txt = decode(elem$.text());
                    function execute_if_valid_else_ignore(f) {
                        if(options().validate(txt)) {
                            options().__active = false;
                            elem$.off('blur.editable'); // don't cancel!
                            elem$.blur();
                            f(txt, txt!=options().active_text);
                            return true;
                        } else {
                            return false; // don't let CR through!
                        }
                    }
                    if (options().ctrl_cmd && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        return execute_if_valid_else_ignore(options().ctrl_cmd);
                    }
                    else if(!command.allow_multiline || (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        return execute_if_valid_else_ignore(options().change);
                    }
                } else if(e.keyCode === $.ui.keyCode.ESCAPE) {
                    elem$.blur(); // and cancel
                    window.getSelection().removeAllRanges();
                } else if(e.keyCode === $.ui.keyCode.HOME) {
                    setCaretPosition(0);
                } else if(e.keyCode === $.ui.keyCode.END) {
                    setCaretPosition(decode(elem$.text()).length);
                } else if(e.keyCode === $.ui.keyCode.RIGHT) {
                    if(getCaretPosition().startOffset === decode(elem$.text()).length - 1 ||
                        (getCaretPosition().startOffset === 0 && getCaretPosition().endOffset === elem$.text().length)) {
                        setCaretPosition(decode(elem$.text()).length);
                    }
                }
                return true;
            },
            'input.editable': function(e) {
                if(elem$.text().length===0)
                    elem$.css('padding-right', '1px');
                else
                    elem$.css('padding-right', '');
            }
        });
        break;
    }
    return elem$;
};

// hack to fake a hover over a jqTree node (or the next one if it's deleted)
// because jqTree rebuilds DOM elements and events get lost
ui_utils.fake_hover = function fake_hover(node) {
    var parent = node.parent;
    var index = $('.notebook-commands.appear', node.element).css('display') !== 'none' ?
            parent.children.indexOf(node) : undefined;
    ui_utils.on_next_tick(function() {
        if(index>=0 && index < parent.children.length) {
            var next = parent.children[index];
                $(next.element).mouseover();
        }
    });
};


ui_utils.on_next_tick = function(f) {
    window.setTimeout(f, 0);
};

ui_utils.scroll_to_after = function($sel, duration) {
    // no idea why the plugin doesn't take current scroll into account when using
    // the element parameter version
    if ($sel.length === 0)
        return;
    var opts;
    if(duration !== undefined)
        opts = {animation: {duration: duration}};
    var $parent = $sel.parent();
    var y = $parent.scrollTop() + $sel.position().top +  $sel.outerHeight();
    $parent.scrollTo(null, y, opts);
};

ui_utils.scroll_into_view = function($scroller, top_buffer, bottom_buffer, on_complete /* , $elem-offset, $elem-offset ... */) {
    if(arguments.length < 5) {
        console.warn('scroll_into_view needs offset elements');
        return;
    }
    var height = +$scroller.css("height").replace("px","");
    var scrolltop = $scroller.scrollTop(),
        elemtop = 0,
        options = on_complete ? { animation: { complete : on_complete }} : {};

    for(var i = 4; i < arguments.length; ++i)
        elemtop += arguments[i].position().top;

    if(elemtop > height)
        $scroller.scrollTo(null, scrolltop + elemtop - height + top_buffer, options);
    else if(elemtop < 0)
        $scroller.scrollTo(null, scrolltop + elemtop - bottom_buffer, options);
    else {
        // no scrolling, so automatically call on_complete if it's defined:
        if(on_complete) {
            on_complete();
        }
    }
};

ui_utils.prevent_backspace = function($doc) {
    // Prevent the backspace key from navigating back.
    // from http://stackoverflow.com/a/2768256/676195
    $doc.unbind('keydown').bind('keydown', function (event) {
        var doPrevent = false;
        if (event.keyCode === $.ui.keyCode.BACKSPACE) {
            var d = event.srcElement || event.target;
            if((d.tagName.toUpperCase() === 'INPUT' &&
                (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' ||
                 d.type.toUpperCase() === 'FILE' || d.type.toUpperCase() === 'EMAIL' )) ||
               d.tagName.toUpperCase() === 'TEXTAREA' ||
               d.isContentEditable) {
                doPrevent = d.readOnly || d.disabled;
            }
            else {
                doPrevent = true;
            }
        }

        if(doPrevent)
            event.preventDefault();
    });
};


ui_utils.is_a_mac = function() {
    // http://stackoverflow.com/questions/7044944/jquery-javascript-to-detect-os-without-a-plugin
    var PLAT = navigator.platform.toUpperCase();
    return function() {
        var isMac = PLAT.indexOf('MAC')!==-1;
        // var isWindows = PLAT.indexOf('WIN')!==-1;
        // var isLinux = PLAT.indexOf('LINUX')!==-1;
        return isMac;
    };
}();


// loosely based on https://codepen.io/gapcode/pen/vEJNZN
ui_utils.is_ie = function() {
    var ua = window.navigator.userAgent;

    return(ua.indexOf('MSIE ') > 0 ||
           ua.indexOf('Trident/') > 0 ||
           ua.indexOf('Edge/') > 0);
}


ui_utils.kill_popovers = function() {
    if(window.allPopovers) {
        $(window.allPopovers).each(function(i, e) {
            $(this).popover('destroy');
        });
        window.allPopovers.length = 0;
    }
};

ui_utils.hide_selectize_dropdown = function() {
    $('.selectize-dropdown').hide();
    $('.selectize-input').removeClass('focus input-active dropdown-active');

    //$('div.selectize-input > input').blur();
};


// copy elements from the notebook, but skip anything .nonselectable
// we have to do this by copying them to an offscreen "buffer" in the DOM
// in order to remove the .nonselectables
ui_utils.select_allowed_elements = function(callback) {
    var sel = window.getSelection();
    var offscreen = $('<pre class="offscreen"></pre>');

    $('body').append(offscreen);

    for(var i=0; i < sel.rangeCount; ++i) {
        var range = sel.getRangeAt(i);
        offscreen.append(range.cloneContents());
    }

    offscreen.find('.nonselectable').remove();
    // Firefox throws an exception if you try to select children and there are none(!)
    if(offscreen.is(':empty'))
        sel.removeAllRanges();
    else
        sel.selectAllChildren(offscreen[0]);

    window.setTimeout(function() {
        offscreen.remove();
    }, 1000);
};
