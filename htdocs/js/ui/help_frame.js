RCloud.UI.help_frame = {
    body: function() {
        return RCloud.UI.panel_loader.load_snippet('help-snippet');
    },
    init: function() {
        // i can't be bothered to figure out why the iframe causes onload to be triggered early
        // if this code is directly in edit.html
        $("#help-body").append('<iframe id="help-frame" frameborder="0" />');
        $('#help-form').submit(function(e) {
            e.preventDefault();
            e.stopPropagation();
            var topic = $('#input-text-help').val();
            $('#input-text-help').blur();
            rcloud.help(topic);
            return false;
        });
    },
    panel_sizer: function(el) {
        if($('#help-body').css('display') === 'none')
            return RCloud.UI.collapsible_column.default_sizer(el);
        else return {
            padding: RCloud.UI.collapsible_column.default_padder(el),
            height: 9000
        };
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
