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
        },
        remove: function(force) {
            var msg = "Are you sure you want to remove the asset from the notebook?";
            if (force || confirm(msg)) {
                asset_model.parent_model.controller.remove_asset(asset_model);
                var assets = asset_model.parent_model.assets;
                if (assets.length)
                    assets[0].controller.select();
                else {
                    RCloud.UI.scratchpad.set_model(null);
                }
            }
        }
    };
    return result;
};
