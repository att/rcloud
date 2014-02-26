Notebook.Asset.create_html_view = function(asset_model)
{
    var filename_div = $("<li></li>");
    var anchor = $("<a href='#'>" + asset_model.filename() + "</a>");
    filename_div.append(anchor);
    anchor.click(function() {
        $(filename_div).parent().find("li").removeClass("active");
        filename_div.addClass("active");
        RCloud.UI.scratchpad.update_to_model(asset_model);
    });
    var result = {
        content_updated: function() {
        },
        self_removed: function() {
            filename_div.remove();
        },
        set_readonly: function(readonly) {
            // FIXME
        }, 
        div: function() {
            return filename_div;
        }
    };
    return result;
};
