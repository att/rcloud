RCloud.UI.scratchpad = {
    session: null,
    widget: null,
    current_model: null,
    change_content: null,
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
                div.css({'height': ui_utils.ace_editor_height(widget, 30) + "px"});
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
                div.css({'height': ui_utils.ace_editor_height(widget, 30) + "px"});
                widget.resize();
            });
            that.change_content = ui_utils.ignore_programmatic_changes(
                that.widget, function() {
                    if (that.current_model)
                        that.current_model.parent_model.on_dirty();
                });
            ui_utils.install_common_ace_key_bindings(widget);
        }
        var scratchpad_editor = $("#scratchpad-editor");
        if (scratchpad_editor.length) {
            setup_scratchpad(scratchpad_editor);
        }
        $("#new-asset > a").click(function() {
            // FIXME prompt, yuck. I know, I know.
            var filename = prompt("Choose a filename for your asset");
            if (!filename)
                return;
            if (filename.toLocaleLowerCase().substring(0,4) === "part") {
                alert("Asset names cannot start with 'part', sorry!");
                return;
            }
            shell.notebook.controller.append_asset(
                "# New file " + filename, filename).select();
        });
    },
    // FIXME this is completely backwards
    set_model: function(asset_model) {
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
            // if this isn't a code smell I don't know what is.
            if (this.current_model.content(this.widget.getValue())) {
                this.current_model.parent_model.controller.update_asset(this.current_model);
            }
        }
        this.current_model = asset_model;
        if (!this.current_model) {
            that.session.setValue("");
            that.widget.resize();
            return;
        }
        this.change_content(this.current_model.content());
        // restore cursor
        var model_cursor = asset_model.cursor_position();
        if (model_cursor) {
            ui_utils.ace_set_pos(this.widget, model_cursor);
        } else {
            ui_utils.ace_set_pos(this.widget, 0, 0);
        }
        ui_utils.on_next_tick(function() {
            that.session.getUndoManager().reset();
        });
        var lang = asset_model.language().toLocaleLowerCase();
        var mode = require(modes[lang] || modes.txt).Mode;
        that.session.setMode(new mode(false, that.session.doc, that.session));
        that.widget.resize();
        that.widget.focus();
    },
    // this behaves like cell_view's update_model
    update_model: function() {
        return this.current_model.content(this.widget.getSession().getValue());
    }, clear: function() {
        var that = this;
        that.session.setValue("");
        that.session.getUndoManager().reset();
        that.widget.resize();
    }
};
