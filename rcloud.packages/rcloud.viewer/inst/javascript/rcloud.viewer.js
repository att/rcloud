((function() {
    var ocaps_;

    var viewer_panel = {
        body: function() {
            return $.el.div({id: "viewer-body-wrapper", 'class': 'panel-body tight'},
                           $.el.div({id: "viewer-scroller", style: "width: 100%; height: 100%; overflow-x: auto"},
                                    $.el.div({id:"viewer-body", 'class': 'widget-vsize'})));
        }
    };
    function clear_display() {
        $('#viewer-body > table').remove();
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
        $('#viewer-body > table').remove();
        var columns = data.r_attributes.names;
        if(typeof columns === 'string')
            columns = [columns];
        columns = _.without(columns, 'r_attributes', 'r_type');
        if(columns.length<1)
            k();
        var nrows = data[columns[0]].length;
        if(nrows>1000) nrows = 1000;
        // styling the table would go better with CSS but we can only
        // install CSS by URL right now(?)
        var header_style = 'border: 0; background-color: #dedede; font-family: sans-serif; font-size: 12px; text-align: right; white-space: nowrap';
        var datum_style = 'border-style: solid; border-width: thin 0; border-color: #aaa; text-align: right; padding-left: 10px; white-space: nowrap';
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
        $('#viewer-body').append($.el.table({style: "border-collapse: collapse; max-width: none"}, rows));
        $('#viewer-body tr:first-child + tr td').css({'border-top': 0});
        $('#viewer-body tr:first-child th').css({'padding-left': '10px'});
        RCloud.UI.right_panel.collapse($("#collapse-data-viewer"), false, false);
        k();
    }
};
})()) /*jshint -W033 */
