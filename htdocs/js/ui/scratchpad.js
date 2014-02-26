RCloud.UI.scratchpad = {
    session: null,
    widget: null,
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
        function set_mode() {
            debugger;
            var lang = asset_model.language().toLocaleLowerCase();
            var mode = require(modes[lang] || modes.txt).Mode;
            that.session.setMode(new mode(false, that.session.doc, that.session));
        }
        this.widget.setValue(asset_model.content());
        ui_utils.on_next_tick(function() {
            that.session.getUndoManager().reset();
            set_mode();
            that.widget.resize();
        });
    }
};
