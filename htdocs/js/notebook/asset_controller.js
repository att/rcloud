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
        is_hidden: function() {
            return asset_model.filename()[0] === '.';
        },
        remove: function(force) {
            var asset_name = asset_model.filename();
            var msg = "Do you want to remove the asset '" +asset_name+ "' from the notebook?";
            if (force || confirm(msg)) {
                asset_model.parent_model.controller.remove_asset(asset_model);
                if(asset_model === RCloud.UI.scratchpad.current_model) {
                    var assets = asset_model.parent_model.assets;
                    if (assets.length)
                        assets[0].controller.select();
                    else {
                        RCloud.UI.scratchpad.set_model(null);
                    }
                }
            }
        }
    };
    return result;
};
