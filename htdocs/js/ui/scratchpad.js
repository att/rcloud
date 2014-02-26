RCloud.UI.scratchpad = {
    session: null,
    widget: null,
    current_model: null,
    init: function() {
        var that = this;
        function setup_scratchpad(div) {
            var inner_div = $("<div></div>");
            var clear_div = $("<div style='clear:both;'></div>");
            div.append(inner_div);
            div.append(clear_div);
            var ace_div = $('<div style="width:100%; height:100%"></div>');
            ace_div.css({'background-color': "#f1f1f1"});
            inner_div.append(ace_div);
            ace.require("ace/ext/language_tools");
            var widget = ace.edit(ace_div[0]);
            var RMode = require("ace/mode/r").Mode;
            var session = widget.getSession();
            that.session = session;
            that.widget = widget;
            var doc = session.doc;
            session.on('change', function() {
                div.css({'height': ui_utils.ace_editor_height(widget) + "px"});
                widget.resize();
            });
            
            widget.setOptions({
                enableBasicAutocompletion: true
            });
            session.setMode(new RMode(false, doc, session));
            session.setUseWrapMode(true);
            widget.resize();
            ui_utils.on_next_tick(function() {
                session.getUndoManager().reset();
                div.css({'height': ui_utils.ace_editor_height(widget) + "px"});
                widget.resize();
            });
        }
        var scratchpad_editor = $("#scratchpad-editor");
        if (scratchpad_editor.length) {
            setup_scratchpad(scratchpad_editor);
        }
    },
    update_to_model: function(asset_model) {
        var that = this;
        var modes = {
            r: "ace/mode/r",
            py: "ace/mode/python",
            md: "ace/mode/rmarkdown",
            css: "ace/mode/css",
            txt: "ace/mode/text"
        };
        if (this.current_model) {
            this.current_model.cursor_position(this.widget.getCursorPosition());
            this.current_model.content(this.widget.getValue());
        }
        this.widget.setValue(asset_model.content());
        var model_cursor = asset_model.cursor_position();
        if (model_cursor) {
            ui_utils.ace_set_pos(this.widget, model_cursor); // setValue selects all
        } else {
            ui_utils.ace_set_pos(this.widget, 0, 0); // setValue selects all
        }
        ui_utils.on_next_tick(function() {
            that.session.getUndoManager().reset();
        });
        var lang = asset_model.language().toLocaleLowerCase();
        var mode = require(modes[lang] || modes.txt).Mode;
        that.session.setMode(new mode(false, that.session.doc, that.session));
        that.widget.resize();
        that.widget.focus();
        this.current_model = asset_model;
    }
};
