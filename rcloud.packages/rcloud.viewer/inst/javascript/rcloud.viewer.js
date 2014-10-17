((function() {
    var ocaps_;

    var viewer_panel = {
        body: function() {
            return $.el.div({id: "viewer-body-wrapper", 'class': 'panel-body'},
                           $.el.div({id: "viewer-scroller", style: "width: 100%; height: 100%; overflow-x: auto"},
                                    $.el.div({id:"viewer-body", 'class': 'widget-vsize'})));
        }
    };
return {
    init: function(k) {
        RCloud.UI.panel_loader.add({
            Viewer: {
                side: 'right',
                name: 'data-viewer',
                title: 'Viewer',
                icon_class: 'icon-table',
                colwidth: 3,
                sort: 3500,
                panel: viewer_panel
            }
        });
        k();
    },
    view: function(data, title, k) {
        $('#viewer-body > table').remove();
        var columns = _.without(data.r_attributes.names, 'r_attributes', 'r_type');
        if(columns.length<1)
            k();
        var nrows = data[columns[0]].length;
        if(nrows>1000) nrows = 1000;
        // styling the table would go better with CSS but we can only
        // install CSS by URL right now(?)
        var header_style = 'border-style: solid; border-width: 1; border-color: #666666; background-color: #dedede; font-family: sans-serif; font-size: 13px';
        var datum_style = 'border-style: solid; border-width: 1; border-color: #666666';
        var header = $.el.tr({}, [$.el.th({style: 'border: none'})].concat(columns.map(function(x) {
            return $.el.th({scope:'col', style: header_style}, x);
        })));
        var rows = [header];
        for(var i = 0; i<nrows; ++i) {
            function fetch(col) {
                return $.el.td({style: datum_style}, data[col][i]);
            }
            var items = [$.el.th({scope: 'row', style: header_style}, i)].concat(columns.map(fetch));;
            rows.push($.el.tr({}, items));
        }
        $('#viewer-body').append($.el.table({style: "border-collapse: collapse;"}, rows));
        RCloud.UI.right_panel.collapse($("#collapse-data-viewer"), false, false);
        k();
    }
};
})()) /*jshint -W033 */ // no semi; this is an expression not a statement
