RCloud.UI.load_options = function() {
    RCloud.UI.panel_loader.init();
    return RCloud.UI.panel_loader.load().then(function() {
        RCloud.UI.left_panel.init();
        RCloud.UI.middle_column.init();
        RCloud.UI.right_panel.init();

        RCloud.UI.command_prompt.init();

        $(".panel-collapse").collapse({toggle: false});

        return Promise.all([RCloud.UI.left_panel.load_options(),
                           RCloud.UI.right_panel.load_options()]);
    });
};
