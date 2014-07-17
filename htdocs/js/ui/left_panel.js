RCloud.UI.left_panel = (function() {
    var result = RCloud.UI.collapsible_column("#left-column",
                                              "#accordion-left", "#left-pane-collapser");
    var base_hide = result.hide.bind(result),
        base_show = result.show.bind(result);

    _.extend(result, {
        hide: function(persist) {
            $("#new-notebook").hide();
            base_hide(persist);
        },
        show: function(persist) {
            $("#new-notebook").show();
            base_show(persist);
        }
    });
    return result;
}());

