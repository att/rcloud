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
        $('#collapse-data-viewer').data('panel-sizer', function(panel) {
          var widgetDiv = $(panel).find('.rcloud-htmlwidget-content');
          var height = widgetDiv.data('panel-initial-height'); 
          var padding = RCloud.UI.collapsible_column.default_padder(panel);
          return {height: height, padding: padding};
        });
        var widgetDiv = $(data);
        widgetDiv.height('100%');
        var iframe = widgetDiv.find('iframe');
        if(iframe.length > 0) {
          // override whatever fixed value is set on iframe, so it can be resized by column.js
          widgetDiv.data('panel-initial-height', iframe.get(0).height);
          iframe.get(0).height = '100%';
        }
        $('#viewer-body-wrapper').append(widgetDiv);
        RCloud.UI.right_panel.collapse($("#collapse-data-viewer"), false, false);
        k();
    }
};
})()) /*jshint -W033 */
