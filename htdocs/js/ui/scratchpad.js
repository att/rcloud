RCloud.UI.scratchpad = {
    session: null,
    widget: null,
    exists: false,
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
            var RMode = ace.require("ace/mode/r").Mode;
            var session = widget.getSession();
            that.session = session;
            that.widget = widget;
            var doc = session.doc;
            session.on('change', function() {
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
            that.change_content = ui_utils.ignore_programmatic_changes(
                that.widget, function() {
                    if (that.current_model)
                        that.current_model.parent_model.on_dirty();
                });
            ui_utils.install_common_ace_key_bindings(widget, function() {
                return that.current_model.language();
            });
            $("#collapse-assets").on("shown.bs.collapse panel-resize", function() {
                widget.resize();
            });
        }
        var scratchpad_editor = $("#scratchpad-editor");
        if (scratchpad_editor.length) {
            this.exists = true;
            setup_scratchpad(scratchpad_editor);
        }
        $("#new-asset > a").click(function() {
            // FIXME prompt, yuck. I know, I know.
            var filename = prompt("Choose a filename for your asset");
            if (!filename)
                return;
            if (Notebook.is_part_name(filename)) {
                alert("Asset names cannot start with 'part[0-9]', sorry!");
                return;
            }
            var found = shell.notebook.model.has_asset(filename);
            if(found)
                found.controller.select();
            else {
                // very silly i know
                var comment_text = function(text, ext) {
                    switch(ext) {
                    case 'css': return '/* ' + text + ' */\n';
                    case 'js': return '// ' + text + '\n';
                    case 'html': return '<!-- ' + text + ' -->\n';
                    default: return '# ' + text + '\n';
                    }
                };
                shell.notebook.controller
                    .append_asset(comment_text("New file " + filename, filename.match(/\.(.*)/)[1]), filename)
                    .then(function(controller) {
                        controller.select();
                    })
                    .then(function() {
                        ui_utils.ace_set_pos(RCloud.UI.scratchpad.widget, 2, 1);
                    });
            }
        });
    },
    // FIXME this is completely backwards
    set_model: function(asset_model) {
        var that = this;
        if(!this.exists)
            return;
        if (this.current_model) {
            this.current_model.cursor_position(this.widget.getCursorPosition());
            // if this isn't a code smell I don't know what is.
            if (this.current_model.content(this.widget.getValue())) {
                this.current_model.parent_model.controller.update_asset(this.current_model);
            }
        }
        this.current_model = asset_model;
        if (!this.current_model) {
            that.change_content("");
            that.widget.resize();
            that.widget.setReadOnly(true);
            $('#scratchpad-editor > *').hide();
            $('#asset-link').hide();
            return;
        }
        that.widget.setReadOnly(false);
        $('#scratchpad-editor > *').show();
        this.change_content(this.current_model.content());
        this.update_asset_url();
        $('#asset-link').show();
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
        that.language_updated();
        that.widget.resize();
        that.widget.focus();
    },
    // this behaves like cell_view's update_model
    update_model: function() {
        return this.current_model ?
            this.current_model.content(this.widget.getSession().getValue()) :
            null;
    }, content_updated: function() {
        var range = this.widget.getSelection().getRange();
        var changed = this.current_model.content();
        this.change_content(changed);
        this.widget.getSelection().setSelectionRange(range);
        return changed;
    }, language_updated: function() {
        // github gist detected languages
        var modes = {
            R: "ace/mode/r",
            Python: "ace/mode/python",
            Markdown: "ace/mode/rmarkdown",
            CSS: "ace/mode/css",
            JavaScript: "ace/mode/javascript",
            Text: "ace/mode/text"
        };
        var lang = this.current_model.language();
        var mode = ace.require(modes[lang] || modes.Text).Mode;
        this.session.setMode(new mode(false, this.session.doc, this.session));
    }, set_readonly: function(readonly) {
        if(!shell.is_view_mode()) {
            ui_utils.set_ace_readonly(this.widget, readonly);
            if(readonly)
                $('#new-asset').hide();
            else
                $('#new-asset').show();
        }
    }, update_asset_url: function() {
        // this function probably belongs elsewhere
        function make_asset_url(model) {
            return window.location.protocol + '//' + window.location.host + '/notebook.R/' +
                    model.parent_model.controller.current_gist().id + '/' + model.filename();
        }
        if(this.current_model)
            $('#asset-link').attr('href', make_asset_url(this.current_model));
    }, clear: function() {
        if(!this.exists)
            return;
        this.change_content("");
        this.session.getUndoManager().reset();
        this.widget.resize();
    }
};
