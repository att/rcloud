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

        $("#collapse-search").data("panel-sizer", function(el) {
            var padding = RCloud.UI.collapsible_column.default_padder(el);
            var height = 24 + $('#search-summary').height() + $('#search-results').height();
            height += 30; // there is only so deep you can dig
            return {height: height, padding: padding};
        });

        $("#collapse-help").data("panel-sizer", function(el) {
            if($('#help-body').css('display') === 'none')
                return RCloud.UI.collapsible_column.default_sizer(el);
            else return {
                padding: RCloud.UI.collapsible_column.default_padder(el),
                height: 9000
            };
        });

        $("#collapse-assets").data("panel-sizer", function(el) {
            return {
                padding: RCloud.UI.collapsible_column.default_padder(el),
                height: 9000
            };
        });

        $("#collapse-file-upload").data("panel-sizer", function(el) {
            var padding = RCloud.UI.collapsible_column.default_padder(el);
            var height = 24 + $('#file-upload-controls').height() + $('#file-upload-results').height();
            //height += 30; // there is only so deep you can dig
            return {height: height, padding: padding};
        });

        $(".panel-collapse").collapse({toggle: false});

        return Promise.all([RCloud.UI.left_panel.load_options(),
                           RCloud.UI.right_panel.load_options()]);
    }).then(function() {
    });
};
