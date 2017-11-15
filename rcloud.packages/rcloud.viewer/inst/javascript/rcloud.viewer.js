((function() {
    var ocaps_;

    var viewer_panel = {
        body: function() {
            return $.el.div({id: "viewer-body-wrapper", 'class': 'panel-body tight'});
        }
    };
    function clear_display() {
        $('#viewer-body > div').remove();
    }
return {
    init: function(k) {
        clear_display();
        RCloud.UI.panel_loader.add({
            Dataframe: {
                side: 'right',
                name: 'data-viewer',
                title: 'Dataframe',
                icon_class: 'icon-table',
                colwidth: 3,
                sort: 2600,
                panel: viewer_panel
            }
        });
        k();
    },
    view: function(data, title, k) {
        $('#viewer-body-wrapper > div').remove();
        $('#viewer-body-wrapper').append($(data));
        RCloud.UI.right_panel.collapse($("#collapse-data-viewer"), false, false);
        k();
    }
};
})()) /*jshint -W033 */
