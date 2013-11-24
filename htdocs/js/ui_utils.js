var ui_utils = {};

$.fn.font_awesome_checkbox = function(opts) {
    opts = opts || {};
    if (opts.checked) {
        this.addClass('icon-check');
        this.removeClass('icon-check-empty');
    } else {
        this.addClass('icon-check-empty');
        this.removeClass('icon-check');
    }
    this.off("click");
    this.on("click", function() {
        var this_class = $(this).attr("class");
        if (this_class === 'icon-check') {
            $(this).addClass('icon-check-empty');
            $(this).removeClass('icon-check');
            opts.click && opts.click(this);
            opts.uncheck && opts.uncheck(this);
        } else {
            $(this).addClass('icon-check');
            $(this).removeClass('icon-check-empty');
            opts.click && opts.click(this);
            opts.check && opts.check(this);
        }
    });
};

ui_utils.fa_button = function(which, title, classname, style)
{
    var span = $('<span/>', {class: 'fontawesome-button ' + (classname || '')});
    var icon = $('<i/>', {class: which});
    if(style)
        icon.css(style);
    span.append(icon)
        .tooltip({
            title: title,
            delay: { show: 250, hide: 0 }
        });
    return span;
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


ui_utils.ace_editor_height = function(widget)
{
    var lineHeight = widget.renderer.lineHeight;
    var rows = Math.min(30, widget.getSession().getLength());
    var newHeight = lineHeight*rows + widget.renderer.scrollBar.getWidth();
    return Math.max(75, newHeight);
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
    item.click(function() {
        var state = !this.checked;
        set_state(state);
        if(state)
            on_activate();
        else
            on_deactivate();
    });
    return set_state;
};

// not that i'm at all happy with the look
ui_utils.checkbox_menu_item = function(item, on_check, on_uncheck) {
    return ui_utils.twostate_icon(item, on_check, on_uncheck,
                                  'icon-check', 'icon-check-empty');
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
