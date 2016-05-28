Notebook.Asset.create_html_view = function(asset_model)
{
    var filename_div = $("<li></li>");
    var anchor = $("<a href='#'></a>");
    var filename_span = $("<span  style='cursor:pointer'>" + asset_model.filename() + "</span>");
    var remove = ui_utils.fa_button("icon-remove", "remove", '',
                                    { 'position': 'relative',
                                        'left': '2px',
                                        'opacity': '0.75'
                                    }, true);
    anchor.append(filename_span);
    filename_div.append(anchor);
    anchor.append(remove);
    var asset_old_name = filename_span.text();
    var rename_file = function(v) {
        // this is massively inefficient - actually three round-trips to the server when
        // we could have one!  save, create new asset, delete old one
        shell.notebook.controller.save().then(function() {
            var new_asset_name = filename_span.text().trim();
            new_asset_name = new_asset_name.replace(/\s/g, " ");
            var old_asset_content = asset_model.content();
            if (Notebook.is_part_name(new_asset_name)) {
                alert("Asset names cannot start with 'part[0-9]', sorry!");
                filename_span.text(asset_old_name);
                return;
            }
            var found = shell.notebook.model.get_asset(new_asset_name);
            if (found) {
                alert('An asset with the name "' + new_asset_name + '" already exists. Please choose a different name.');
                filename_span.text(asset_old_name);
            }
            else {
                shell.notebook.controller
                    .append_asset(old_asset_content, new_asset_name)
                    .spread(function(_, new_controller) {
                        new_controller.select();
                        asset_model.controller.remove(true);
                    });
            }
        });
    };
    function select(el) {
        if(el.childNodes.length !== 1 || el.firstChild.nodeType != el.TEXT_NODE)
            throw new Error('expecting simple element with child text');
        var text = el.firstChild.textContent;
        var range = document.createRange();
        range.setStart(el.firstChild, 0);
        range.setEnd(el.firstChild, (text.lastIndexOf('.')>0?text.lastIndexOf('.'):text.length));
        return range;
    }
    var editable_opts = {
        change: rename_file,
        select: select,
        validate: function(name) { return editor.validate_name(name); }
    };
    filename_span.click(function() {
        if(!asset_model.active())
            asset_model.controller.select();
        //ugly fix, but desperate times call for desperate measures.
        $('#scratchpad-binary object').css('position', 'static')
                .css('position', 'absolute');
    });
    remove.click(function() {
        asset_model.controller.remove();
    });
    var result = {
        filename_updated: function() {
            anchor.text(asset_model.filename());
        },
        content_updated: function() {
            if(asset_model.active())
                RCloud.UI.scratchpad.content_updated();
        },
        language_updated: function() {
            if(asset_model.active())
                RCloud.UI.scratchpad.language_updated();
        },
        active_updated: function() {
            if (asset_model.active()) {
                if(!shell.notebook.model.read_only())
                    ui_utils.editable(filename_span, $.extend({allow_edit: true,inactive_text: filename_span.text(),active_text: filename_span.text()},editable_opts));
                filename_div.addClass("active");
            }
            else {
                ui_utils.editable(filename_span, "destroy");
                filename_div.removeClass("active");
            }
        },
        self_removed: function() {
            filename_div.remove();
        },
        set_readonly: function(readonly) {
            if(readonly)
                remove.hide();
            else
                remove.show();
        },
        div: function() {
            return filename_div;
        }
    };
    return result;
};
