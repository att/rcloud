RCloud.UI.help_frame = {
    init: function() {
        // i can't be bothered to figure out why the iframe causes onload to be triggered early
        // if this code is directly in edit.html
        $("#help-body").append('<iframe id="help-frame" frameborder="0" />');
    },
    show: function() {
        $("#help-body").css('display', 'table-row');
        $("#help-body").attr('data-widgetheight', "greedy");
        $("#collapse-help").trigger('size-changed');
        RCloud.UI.left_panel.collapse($("#collapse-help"), false);
        ui_utils.prevent_backspace($("#help-frame").contents());
    },
    display_content: function(content) {
        $("#help-frame").contents().find('body').html(content);
        this.show();
    },
    display_href: function(href) {
        $("#help-frame").attr("src", href);
        this.show();
    }
};
