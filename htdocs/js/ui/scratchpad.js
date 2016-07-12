RCloud.UI.scratchpad = (function() {
    var binary_mode_; // not editing
    return {
        session: null,
        widget: null,
        exists: false,
        current_model: null,
        change_content: null,
        body: function() {
            return RCloud.UI.panel_loader.load_snippet('assets-snippet');
        },
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
                var LangMode = ace.require("ace/mode/r").Mode;
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
                session.setMode(new LangMode(false, doc, session));
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

                RCloud.UI.thumb_dialog.init();

                $('#update-thumb').click(function() {
                    RCloud.UI.thumb_dialog.show();
                });
            }
            function setup_asset_drop() {
                var showOverlay_;
                //prevent drag in rest of the page except asset pane and enable overlay on asset pane
                $(document).on('dragstart dragenter dragover', function (e) {

                    if(RCloud.UI.thumb_dialog.is_visible()) 
                        return;

                    var dt = e.originalEvent.dataTransfer;
                    if(!dt)
                        return;
                    if (dt.types !== null &&
                        (dt.types.indexOf ?
                         (dt.types.indexOf('Files') != -1 && dt.types.indexOf('text/html') == -1):
                         dt.types.contains('application/x-moz-file'))) {
                        if (!shell.notebook.model.read_only()) {
                            e.stopPropagation();
                            e.preventDefault();
                            $('#asset-drop-overlay').css({'display': 'block'});
                            showOverlay_ = true;
                        }
                        else {
                            e.stopPropagation();
                            e.preventDefault();
                        }
                    }
                });
                $(document).on('drop dragleave', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    showOverlay_ = false;
                    setTimeout(function() {
                        if(!showOverlay_) {
                            $('#asset-drop-overlay').css({'display': 'none'});
                        }
                    }, 100);
                });
                //allow asset drag from local to asset pane and highlight overlay for drop area in asset pane
                $('#scratchpad-wrapper').bind({
                    drop: function (e) {
                        e = e.originalEvent || e;
                        var files = (e.files || e.dataTransfer.files);
                        var dt = e.dataTransfer;
                        if(!shell.notebook.model.read_only()) {
                            RCloud.UI.upload_with_alerts(true, {files: files})
                                .catch(function() {}); // we have special handling for upload errors
                        }
                        $('#asset-drop-overlay').css({'display': 'none'});
                    },
                    "dragenter dragover": function(e) {
                        var dt = e.originalEvent.dataTransfer;
                        if(!shell.notebook.model.read_only())
                            dt.dropEffect = 'copy';
                    }
                });
            }
            var scratchpad_editor = $("#scratchpad-editor");
            if (scratchpad_editor.length) {
                this.exists = true;
                setup_scratchpad(scratchpad_editor);
                setup_asset_drop();
            }
            $("#new-asset > a").click(function() {
                // FIXME prompt, yuck. I know, I know.
                var filename = prompt("Choose a filename for your asset");
                if (!filename)
                    return;

                filename = filename.trim();

                if (!filename)
                    return;
                if (Notebook.is_part_name(filename)) {
                    alert("Asset names cannot start with 'part[0-9]', sorry!");
                    return;
                }
                var found = shell.notebook.model.get_asset(filename);
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
                    var ext = (filename.indexOf('.')!=-1?filename.match(/\.(.*)/)[1]:"");
                    shell.notebook.controller
                        .append_asset(comment_text("New file " + filename, ext), filename)
                        .spread(function(_, controller) {
                            controller.select();
                            ui_utils.ace_set_pos(RCloud.UI.scratchpad.widget, 2, 1);
                        });
                }
            });
        },
        panel_sizer: function(el) {
            return {
                padding: RCloud.UI.collapsible_column.default_padder(el),
                height: 9000
            };
        },
        // FIXME this is completely backwards
        set_model: function(asset_model) {
            var that = this;
            if(!this.exists)
                return;
            if (this.current_model && !binary_mode_) {
                this.current_model.cursor_position(this.widget.getCursorPosition());
                // if this isn't a code smell I don't know what is.
                if (this.current_model.content(this.widget.getValue())) {
                    this.current_model.parent_model.controller.update_asset(this.current_model);
                }
            }
            this.current_model = asset_model;
            if (!this.current_model) {
                $('#scratchpad-binary').hide();
                $('#scratchpad-editor').show();
                that.change_content("");
                that.widget.resize();
                that.widget.setReadOnly(true);
                $('#scratchpad-editor > *').hide();
                $('#asset-link').hide();
                return;
            }
            this.update_asset_url();
            $('#asset-link').show();
            var content = this.current_model.content();
            if (Notebook.is_binary_content(content)) {
                binary_mode_ = true;
                // ArrayBuffer, binary content: display object
                $('#scratchpad-editor').hide();
                // PDF seems not to be supported properly by browsers
                var sbin = $('#scratchpad-binary');
                if(/\.pdf$/i.test(this.current_model.filename()))
                    sbin.html('<p>PDF preview not supported</p>');
                else
                    sbin.html('<object data="' + this.current_model.asset_url(true) + '"></object>');
                sbin.show();
            }
            else {
                // text content: show editor
                binary_mode_ = false;
                that.widget.setReadOnly(shell.notebook.model.read_only());
                $('#scratchpad-binary').hide();
                $('#scratchpad-editor').show();
                $('#scratchpad-editor > *').show();
                this.change_content(content);
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
            }
        },
        // this behaves like cell_view's update_model
        update_model: function() {
            return (this.current_model && !binary_mode_) ?
                this.current_model.content(this.widget.getSession().getValue()) :
                null;
        }, content_updated: function() {
            var changed = false;
            changed = this.current_model.content();
            binary_mode_ = Notebook.is_binary_content(changed);
            if(changed && !binary_mode_) {
                var range = this.widget.getSelection().getRange();
                this.change_content(changed);
                this.widget.getSelection().setSelectionRange(range);
            }
            return changed;
        }, language_updated: function() {
            if(!binary_mode_) {
                var lang = this.current_model.language();
                var LangMode = ace.require(RCloud.language.ace_mode(lang)).Mode;
                this.session.setMode(new LangMode(false, this.session.doc, this.session));
            }
        }, set_readonly: function(readonly) {
            if(!shell.is_view_mode()) {
                if(this.widget && !binary_mode_)
                    ui_utils.set_ace_readonly(this.widget, readonly);
                if(readonly)
                    $('#new-asset').hide();
                else
                    $('#new-asset').show();
            }
        }, update_asset_url: function() {
            if(this.current_model)
                $('#asset-link').attr('href', this.current_model.asset_url());
        }, clear: function() {
            if(!this.exists)
                return;
            this.change_content("");
            this.session.getUndoManager().reset();
            this.widget.resize();
        }
    };
})();
