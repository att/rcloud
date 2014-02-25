RCloud.UI.right_panel = {
    collapsed: false,
    hide: function() {
        this.collapsed = true;
        $("#right-column").removeClass("col-md-4 col-sm-4").addClass("col-md-1 col-sm-1");
        $("#fake-right-column").removeClass("col-md-4 col-sm-4").addClass("col-md-1 col-sm-1");
        $("#right-pane-collapser i").addClass("icon-plus").removeClass("icon-minus");
    },
    show: function() {
        $("#right-column").removeClass("col-md-1 col-sm-1").addClass("col-md-4 col-sm-4");
        $("#fake-right-column").removeClass("col-md-1 col-sm-1").addClass("col-md-4 col-sm-4");
        $("#right-pane-collapser i").removeClass("icon-plus").addClass("icon-minus");
        this.collapsed = false;
    },
    init: function() {
        var that = this;
        $("#accordion-right").on("show.bs.collapse", function() {
            if (that.collapsed) {
                that.show();
                that.collapsed = false;
                RCloud.UI.middle_column.update();
            }
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
            if (that.collapsed) {
                that.show();
            } else {
                // the following actually makes sense to me. oh no what has my life become
                $("#accordion-right > .panel > div.panel-collapse:not(.collapse):not(.out)").collapse('hide');
                that.hide();
            }
            RCloud.UI.middle_column.update();
        });
    }
};
