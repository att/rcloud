RCloud.UI.left_panel = (function() {
    var result = RCloud.UI.collapsible_column("#left-column,#fake-left-column",
                                              "#accordion-left", "#left-pane-collapser", 3);
    var base_hide = result.hide.bind(result),
        base_show = result.show.bind(result);

    function hide() {
        $("#new-notebook").hide();
        base_hide();
    }
    function show() {
        $("#new-notebook").show();
        base_show();
    }

    _.extend(result, {
        hide: function() {
            hide();
            rcloud.config.set_user_option("ui/collapse_left", true);
        },
        show: function() {
            show();
            rcloud.config.set_user_option("ui/collapse_left", false);
        },
        load: function() {
            rcloud.config.get_user_option("ui/collapse_left").then(function(val) {
                if(val)
                    hide();
                // else show();
            });
        }
    });
    return result;
}());

