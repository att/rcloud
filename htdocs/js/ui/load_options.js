RCloud.UI.load_options = function() {
    return RCloud.UI.load_panels().then(function() {
        RCloud.UI.left_panel.init();
        RCloud.UI.middle_column.init();
        RCloud.UI.right_panel.init();

        RCloud.UI.session_pane.init();
        RCloud.UI.scratchpad.init();
        RCloud.UI.command_prompt.init();
        RCloud.UI.help_frame.init();

        RCloud.UI.comment_frame.init();
        RCloud.UI.search.init();
        RCloud.UI.upload_frame.init();

        $("#collapse-search").data("panel-sizer", RCloud.UI.search.panel_sizer);
        $("#collapse-help").data("panel-sizer", RCloud.UI.help_frame.panel_sizer);
        $("#collapse-assets").data("panel-sizer", RCloud.UI.scratchpad.panel_sizer);
        $("#collapse-file-upload").data("panel-sizer", RCloud.UI.upload_frame.panel_sizer);

        $(".panel-collapse").collapse({toggle: false});

        return Promise.all([RCloud.UI.left_panel.load_options(),
                           RCloud.UI.right_panel.load_options()]);
    }).then(function() {
    });
};
