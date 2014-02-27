Notebook.Asset.create_controller = function(asset_model)
{
    var result = {
        select: function() {
            // a little ugly here...
            if (RCloud.UI.scratchpad.current_model) {
                RCloud.UI.scratchpad.current_model.controller.deselect();
            }
            asset_model.active(true);
            RCloud.UI.scratchpad.set_model(asset_model);
        },
        deselect: function() {
            asset_model.active(false);
        }
    };
    return result;
};
