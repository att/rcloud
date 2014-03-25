RCloud.UI.right_panel = (function() {
    var collapsed_ = false;

    function hide() {
        result.colwidth(1);
        // all panels on this side, their collapsible sub-panels that are not "out"
        // and not already collapsed, collapse them
        $("#accordion-right > .panel > div.panel-collapse:not(.collapse):not(.out)").collapse('hide');
        $("#right-pane-collapser i").addClass("icon-plus").removeClass("icon-minus");
        RCloud.UI.middle_column.update();
        collapsed_ = true;
    }
    function show() {
        result.colwidth(4);
        $("#right-pane-collapser i").removeClass("icon-plus").addClass("icon-minus");
        RCloud.UI.middle_column.update();
        collapsed_ = false;
    }

    var result = RCloud.UI.column("#right-column, #fake-right-column", 4);
    _.extend(result, {
        hide: function() {
            hide();
            rcloud.config.set_user_option("collapse_right", true);
        },
        show: function() {
            show();
            rcloud.config.set_user_option("collapse_right", false);
        },
        init: function() {
            var that = this;
            $("#accordion-right").on("show.bs.collapse", function() {
                if (collapsed_)
                    that.show();
            });
            $("#accordion-right").on("shown.bs.collapse", function() {
                $(".right-panel-shadow").each(function(v) {
                    var h = $(this).parent().height();
                    if (h === 0)
                        h = "100%";
                    $(this).attr("height", h);
                });
            });
            $("#right-pane-collapser").click(function() {
                if (collapsed_)
                    that.show();
                else
                    that.hide();
            });
        },
        load: function() {
            rcloud.config.get_user_option("collapse_right").then(function(val) {
                if(val)
                    hide();
                // else show();
            });
        }
    });
    return result;
}());
