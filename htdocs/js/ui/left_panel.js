RCloud.UI.left_panel = (function() {
    var collapsed_ = false;

    var result = RCloud.UI.column("#left-column, #fake-left-column", 3);
    _.extend(result, {
        hide: function() {
            result.colwidth(1);
            $("#new-notebook").hide();
            $("#left-pane-collapser i").removeClass("icon-minus").addClass("icon-plus");
            RCloud.UI.middle_column.update();
            collapsed_ = true;
        },
        show: function() {
            result.colwidth(3);
            $("#new-notebook").show();
            $("#left-pane-collapser i").removeClass("icon-plus").addClass("icon-minus");
            RCloud.UI.middle_column.update();
            collapsed_ = false;
        },
        init: function() {
            var that = this;
            $("#accordion").on("show.bs.collapse", function() {
                if (collapsed_) {
                    that.show();
                    RCloud.UI.middle_column.update();
                }
            });
            $("#accordion").on("shown.bs.collapse", function() {
                $(".left-panel-shadow").each(function(v) {
                    var h = $(this).parent().height();
                    if (h === 0)
                        h = "100%";
                    $(this).attr("height", h);
                });
            });
            $("#left-pane-collapser").click(function() {
                if (collapsed_) {
                    that.show();
                } else {
                    // the following actually makes sense to me. oh no what has my life become
                    $("#accordion > .panel > div.panel-collapse:not(.collapse):not(.out)").collapse('hide');
                    that.hide();
                }
                RCloud.UI.middle_column.update();
            });
        }
    });
    return result;
}());

