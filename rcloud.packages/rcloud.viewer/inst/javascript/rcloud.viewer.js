((function() {

    var viewer_panel = {
        body: function() {
            return $.el.div({id: "viewer-body-wrapper", 'class': 'panel-body tight'});
        },
        panel_sizer: function(el) {
            return RCloud.UI.collapsible_column.default_sizer(el);
/*
            if(!$('#viewer-body-wrapper').children().length) {
                return RCloud.UI.collapsible_column.default_sizer(el);
            } else {
                console.log('expanding viewer to max...');
                return {
                    padding: RCloud.UI.collapsible_column.default_padder(el),
                    height: 9000
                };
            }
*/
        },
    };
    function clear_display() {
        $('#viewer-body > div').remove();
    }
return {
    init: function(ocaps, k) {
        ocaps = RCloud.promisify_paths(ocaps, [["view_dataframe_page"]], true);
        
        clear_display();
                            
        RCloud.UI.viewer = {
              view_dataframe_page : ocaps.view_dataframe_page,
              dataFrameCallback : function(variable, data, callback, settings) {
                  var page = window.parent.RCloud.UI.viewer.view_dataframe_page(variable, data)
                        .then(function (response) {
                            var dataObject = {};
                            var tableData = JSON.parse(response.data);
                            dataObject.data = tableData;
                            dataObject.recordsTotal = response.recordsTotal;
                            dataObject.recordsFiltered = response.recordsTotal;
                            dataObject.draw = response.draw;
                            callback(dataObject);
                  }); 
              },
              initialiseTable: function() {
                $('#viewer-body-wrapper').find('iframe').contents().find('head').append('<link rel="stylesheet" type="text/css" href="/css/rcloud.css"><link rel="stylesheet" type="text/css" href="/css/rcloud-viewer.css">');
              },
              updateDataSettings: function(page_size) {
                var existing_page_size = $('#viewer-body-wrapper').data('pagesize');

                if(existing_page_size && page_size != existing_page_size) {
                    rcloud.config.set_user_option("dataframe-page-size", page_size);
                }

                // update
                $('#viewer-body-wrapper').data('pagesize', page_size);
              }
        };
        
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

        // $('#example').on( 'length.dt', function ( e, settings, len ) {
        //     console.log( 'New page length: '+len );
        // } );

        k();
    },
    view: function(data, title, k) {
        $('#viewer-body-wrapper > div:not(.panel-fixed-header)').remove();
        $('#collapse-data-viewer').data('panel-sizer', function(panel) {
          var widgetDiv = $(panel).find('.rcloud-htmlwidget-content');
          /*
          var height = widgetDiv.data('panel-initial-height'); 
          var padding = RCloud.UI.collapsible_column.default_padder(panel);
          return {height: height, padding: padding};
          */
          return {
              height: 9000,
              padding: RCloud.UI.collapsible_column.default_padder(panel)
          }
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
