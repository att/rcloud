RCloud.UI.load_options = function() {
    return rcloud.get_conf_value('smtp.server').then(function(has_mail) {
        // this extra round trip is not ideal.  the load order still needs
        // refinement.
        if(has_mail)
            RCloud.UI.settings_frame.add({
                'subscribe-to-comments': RCloud.UI.settings_frame.checkbox({
                    sort: 3000,
                    default_value: false,
                    label: "Subscribe To Comments",
                    condition: function() {
                    }
                })
            });
        return RCloud.UI.panel_loader.load().then(function() {
            RCloud.UI.left_panel.init();
            RCloud.UI.middle_column.init();
            RCloud.UI.right_panel.init();

            RCloud.UI.command_prompt.init();

            $(".panel-collapse").collapse({toggle: false});

            return Promise.all([RCloud.UI.navbar.load(),
                                RCloud.UI.advanced_menu.load(),
                                RCloud.UI.share_button.load(),
                                RCloud.UI.left_panel.load_options(),
                                RCloud.UI.right_panel.load_options()]);
        });
    });
};
