((function() {
    var ocaps_;

    var enviewer_panel = {
        body: function() {
            return $.el.div({id: "enviewer-body-wrapper", 'class': 'panel-body'},
                           $.el.div({id: "enviewer-scroller", style: "width: 100%; height: 100%; overflow-x: auto"},
                                    $.el.div({id:"enviewer-body", 'class': 'widget-vsize'})));
        }
    };
return {
    init: function(k) {
        RCloud.UI.panel_loader.add({
            Environment: {
                side: 'right',
                name: 'environment-viewer',
                title: 'Environment',
                icon_class: 'icon-table',
                colwidth: 3,
                sort: 3600,
                panel: enviewer_panel
            }
        });
        k();
    },
    on_change: function(data, k) {
        $('#enviewer-body > table').remove();
        var sections = _.without(data.r_attributes.names, 'r_attributes', 'r_type');
        if(sections.length<1)
            k();
        // styling the table would go better with CSS but we can only
        // install CSS by URL right now(?)
        var header_style = 'border-style: solid; border-width: 1; border-color: #666666; background-color: #dedede; font-family: sans-serif; font-size: 13px';
        var datum_style = 'border-style: solid; border-width: 1; border-color: #666666';
        var header = $.el.tr($.el.th({colspan: 2, scope: 'col', style: header_style}, "Valuess"));
        var rows = [header];
        for(var key in data['values']) {
            function td(s) {
                return $.el.td({style: datum_style}, s);
            }
            var items = [td(key), td(data['data'][key])];
            rows.push($.el.tr({}, items));
        }
        $('#enviewer-body').append($.el.table({style: "border-collapse: collapse;"}, rows));
        RCloud.UI.right_panel.collapse($("#collapse-environment-viewer"), false, false);
        k();
    }
};
})()) /*jshint -W033 */ // no semi; this is an expression not a statement
