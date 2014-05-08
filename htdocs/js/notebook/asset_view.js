Notebook.Asset.create_html_view = function(asset_model)
{
    var filename_div = $("<li></li>");
    var anchor = $("<a href='#'>" + asset_model.filename() + "</a>");
    var remove = ui_utils.fa_button("icon-remove", "remove", '',
                                    { 'position': 'relative',
                                      'left': '2px',
                                      'opacity': '0.75'
                                    }, true);
    filename_div.append(anchor);
    anchor.append(remove);
    anchor.click(function() {
        asset_model.controller.select();
    });
    remove.click(function() {
        asset_model.controller.remove();
    });
    var result = {
        div: filename_div,
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
            if (asset_model.active())
                filename_div.addClass("active");
            else
                filename_div.removeClass("active");
        },
        self_removed: function() {
            filename_div.remove();
        },
        set_readonly: function(readonly) {
            if(asset_model.active())
                RCloud.UI.scratchpad.set_readonly(readonly);
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
