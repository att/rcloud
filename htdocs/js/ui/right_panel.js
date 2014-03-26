RCloud.UI.right_panel = (function() {
    var result = RCloud.UI.collapsible_column("#right-column,#fake-right-column",
                                              "#accordion-right", "#right-pane-collapser", 4);
    var base_hide = result.hide.bind(result),
        base_show = result.show.bind(result);

    _.extend(result, {
        hide: function() {
            base_hide();
            rcloud.config.set_user_option("ui/collapse_right", true);
        },
        show: function() {
            base_show();
            rcloud.config.set_user_option("ui/collapse_right", false);
        },
        load: function() {
            rcloud.config.get_user_option("ui/collapse_right").then(function(val) {
                if(val)
                    base_hide();
                // else show();
            });
        }
    });
    return result;
}());
