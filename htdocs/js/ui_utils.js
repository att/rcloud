var ui_utils = {};

ui_utils.fa_button = function(which, title, classname, style)
{
    var icon = $.el.i({'class': which});
    var span = $.el.span({'class': 'fontawesome-button ' + (classname || '')},
                         icon);
    if(style) {
        for (var k in style)
            icon.style[k] = style[k];
    }
    // $(icon).css(style);
    return $(span).tooltip({
        title: title,
        delay: { show: 250, hide: 0 }
    });
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
    var rows = Math.max(min_rows, Math.min(max_rows, widget.getSession().getLength()));
    var newHeight = lineHeight*rows + widget.renderer.scrollBar.getWidth();
    return Math.max(75, newHeight);
    /*
     // patch to remove tooltip when button clicked
     // (not needed anymore with later jquery?)
    var old_click = span.click;
    span.click = function() {
        $(this).tooltip('hide');
        old_click.apply(this, arguments);
    };
     */
};

ui_utils.ace_set_pos = function(widget, row, column) {
    var sel = widget.getSelection();
    var range = sel.getRange();
    range.setStart(row, column);
    range.setEnd(row, column);
    sel.setSelectionRange(range);
};

ui_utils.install_common_ace_key_bindings = function(widget) {
    var Autocomplete = require("ace/autocomplete").Autocomplete;
    var session = widget.getSession();

    widget.commands.addCommands([
        {
            name: 'another autocomplete key',
            bindKey: 'Ctrl-.',
            exec: Autocomplete.startCommand.exec
        },
        {
            name: 'disable gotoline',
            bindKey: {
                win: "Ctrl-L",
                mac: "Command-L"
            },
            exec: function() { return false; }
        }, {
            name: 'execute-selection-or-line',
            bindKey: {
                win: 'Alt-Return',
                mac: 'Alt-Return',
                sender: 'editor'
            },
            exec: function(widget, args, request) {
                var code = session.getTextRange(widget.getSelectionRange());
                if(code.length==0) {
                    var pos = widget.getCursorPosition();
                    var Range = require('ace/range').Range;
                    var range = new Range(pos.row, 0, pos.row+1, 0);
                    code = session.getTextRange(range);
                }
                shell.new_interactive_cell(code, true);
            }
        }
    ]);
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
        var res = widget.setValue(value);
        listen = true;
        return res;
    };
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
        $("#publish-notebook").parent().toggleClass('disabled', !val);
        base_enable(val);
    };
    return ret;
};

// this is a hack, but it'll help giving people the right impression.
// I'm happy to replace it witht the Right Way to do it when we learn
// how to do it.
ui_utils.make_prompt_chevron_gutter = function(widget)
{
    var dom = require("ace/lib/dom");
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
        var lastLineNumber = 0;
        html.push(
            "<div class='ace_gutter-cell ",
            "' style='height:", this.session.getRowLength(0) * config.lineHeight, "px;'>",
            "&gt;", "</div>"
        );

        this.element = dom.setInnerHtml(this.element, html.join(""));
        this.element.style.height = config.minHeight + "px";

        if (this.session.$useWrapMode)
            lastLineNumber = this.session.getLength();

        var gutterWidth = ("" + lastLineNumber).length * config.characterWidth;
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
    function options() {
        return elem$.data('__editable');
    }

    var old_opts = options(),
        new_opts = old_opts;
    if(_.isObject(command)) {
        var defaults = {on_change: function() { return true; },
                        allow_edit: true,
                        inactive_text: elem$.text(),
                        active_text: elem$.text(),
                        select: function(el) {
                            var range = document.createRange();
                            range.selectNodeContents(el);
                            return range;
                        }
                       };
        new_opts = $.extend(old_opts || defaults, command);
        elem$.data('__editable', new_opts);
    }
    else {
        if(command !== 'destroy' && !old_opts)
            throw new Error('expected already editable for command ' + command);
        function set_option(key, value) {
            old_opts = $.extend({}, old_opts);
            new_opts[key] = value;
        }
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
        elem$.text(options().__active ? new_opts.active_text : new_opts.inactive_text);

    switch(action) {
    case 'freeze':
        elem$.attr('contenteditable', 'false');
        elem$.off('keydown');
        elem$.off('focus');
        elem$.off('blur');
        break;
    case 'melt':
        elem$.attr('contenteditable', 'true');
        elem$.focus(function() {
            if(!options().__active) {
                options().__active = true;
                elem$.text(options().active_text);
                window.setTimeout(function() {
                    selectRange(options().select(elem$[0]));
                    elem$.off('blur');
                    elem$.blur(function() {
                        elem$.text(options().inactive_text);
                        options().__active = false;
                    }); // click-off cancels
                }, 10);
            }
        });
        elem$.keydown(function(e) {
            if(e.keyCode === 13) {
                var result = elem$.text();
                if(options().validate(result)) {
                    options().__active = false;
                    elem$.off('blur'); // don't cancel!
                    elem$.blur();
                    options().change(result);
                }
                else return false; // don't let CR through!
            }
            else if(e.keyCode === 27)
                elem$.blur(); // and cancel
            return true;
        });
        break;
    }
};

ui_utils.on_next_tick = function(f) {
    window.setTimeout(f, 0);
};
