RCloud.UI.middle_column = {
    middle_panel_size: 5,
    update: function() {
        var size = 12;
        if (RCloud.UI.right_panel.collapsed) {
            size -= 1;
        } else {
            size -= 4;
        }
        if (RCloud.UI.left_panel.collapsed) {
            size -= 1;
        } else {
            size -= 3;
        }
        var previous_classes = "col-sm-" + this.middle_panel_size + " col-md-" + this.middle_panel_size;
        var new_classes = "col-sm-" + size + " col-md-" + size;
        $("#middle-column").removeClass(previous_classes).addClass(new_classes);
        $("#prompt-div").removeClass(previous_classes).addClass(new_classes);
        this.middle_panel_size = size;
    }
};
