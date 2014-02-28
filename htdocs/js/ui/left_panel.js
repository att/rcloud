RCloud.UI.left_panel = {
    collapsed: false,
    hide: function() {
        this.collapsed = true;
        $("#left-column").removeClass("col-md-3 col-sm-3").addClass("col-md-1 col-sm-1");
        $("#fake-left-column").removeClass("col-md-3 col-sm-3").addClass("col-md-1 col-sm-1");
        $("#new-notebook").hide();
        $("#left-pane-collapser i").removeClass("icon-minus").addClass("icon-plus");
        RCloud.UI.middle_column.update();
    },
    show: function() {
        $("#left-column").removeClass("col-md-1 col-sm-1").addClass("col-md-3 col-sm-3");
        $("#fake-left-column").removeClass("col-md-1 col-sm-1").addClass("col-md-3 col-sm-3");
        $("#new-notebook").show();
        $("#left-pane-collapser i").removeClass("icon-plus").addClass("icon-minus");
        this.collapsed = false;
        RCloud.UI.middle_column.update();
    },
    init: function() {
        var that = this;
        $("#accordion").on("show.bs.collapse", function() {
            if (that.collapsed) {
                that.show();
                that.collapsed = false;
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
            if (that.collapsed) {
                that.show();
            } else {
                // the following actually makes sense to me. oh no what has my life become
                $("#accordion > .panel > div.panel-collapse:not(.collapse):not(.out)").collapse('hide');
                that.hide();
            }
            RCloud.UI.middle_column.update();
        });
    }
};
