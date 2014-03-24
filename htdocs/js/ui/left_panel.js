RCloud.UI.left_panel = (function() {
    var collapsed_ = false;

    function hide() {
        result.colwidth(1);
        $("#new-notebook").hide();
        // all panels on this side, their collapsible sub-panels that are not "out"
        // and not already collapsed, collapse them
        $("#accordion-left > .panel > div.panel-collapse:not(.collapse):not(.out)").collapse('hide');
        $("#left-pane-collapser i").removeClass("icon-minus").addClass("icon-plus");
        RCloud.UI.middle_column.update();
        collapsed_ = true;
    }
    function show() {
        result.colwidth(3);
        $("#new-notebook").show();
        $("#left-pane-collapser i").removeClass("icon-plus").addClass("icon-minus");
        RCloud.UI.middle_column.update();
        collapsed_ = false;
    }

    var result = RCloud.UI.column("#left-column, #fake-left-column", 3);
    _.extend(result, {
        hide: function() {
            hide();
            rcloud.config.set_user_option("collapse_left", true);
        },
        show: function() {
            show();
            rcloud.config.set_user_option("collapse_left", false);
        },
        init: function() {
            var that = this;
            $("#accordion-left").on("show.bs.collapse", function() {
                if (collapsed_)
                    that.show();
            });
            $("#accordion-left").on("shown.bs.collapse", function() {
                $(".left-panel-shadow").each(function(v) {
                    var h = $(this).parent().height();
                    if (h === 0)
                        h = "100%";
                    $(this).attr("height", h);
                });
            });
            $("#left-pane-collapser").click(function() {
                if (collapsed_)
                    that.show();
                else
                    that.hide();
            });
        },
        load: function() {
            rcloud.config.get_user_option("collapse_left").then(function(val) {
                if(val)
                    hide();
                // else show();
            });
        }
    });
    return result;
}());

