((function() {
    var ocaps_;

    function nix_r(list) {
        return (_.isArray(list) ? _.without : _.omit)(list, 'r_attributes', 'r_type');
    }

    var enviewer_panel = {
        body: function() {
            return $.el.div({id: "enviewer-body-wrapper", 'class': 'panel-body', style: 'padding: 0px 5px'},
                           $.el.div({id: "enviewer-scroller", style: "width: 100%; height: 100%; overflow-x: auto"},
                                    $.el.div({id:"enviewer-body", 'class': 'widget-vsize'})));
        }
    };

    function add_section(title, section, rows) {
        // styling the table will go better with CSS
        var header_style = 'border-style: solid; border-width: 1; border-color: #666666; background-color: #dedede; font-family: sans-serif; font-size: 13px';
        var datum_style = 'border-style: solid; border-width: 1; border-color: #666666';
        var header = $.el.tr($.el.th({colspan: 2, scope: 'col', style: header_style}, title));
        rows.push(header);
        for(var key in section) {
            function td(s) {
                return $.el.td({style: datum_style}, s);
            }
            var items = [td(key), td(section[key])];
            rows.push($.el.tr({}, items));
        }
    }
return {
    init: function(k) {
        RCloud.UI.panel_loader.add({
            Environment: {
                side: 'right',
                name: 'environment-viewer',
                title: 'Environment',
                icon_class: 'icon-table',
                colwidth: 3,
                sort: 2500,
                panel: enviewer_panel
            }
        });
        k();
    },
    on_change: function(data, k) {
        $('#enviewer-body > table').remove();
        var rows = [];
        _.each(nix_r(data), function(value, key) {
            var title = key.charAt(0).toUpperCase() + key.substring(1); // capitalize
            var section = nix_r(value);
            if(_.size(section))
                add_section(title, section, rows);
        });
        $('#enviewer-body').append($.el.table({style: "border-collapse: collapse; width: 100%"}, rows));
        RCloud.UI.right_panel.collapse($("#collapse-environment-viewer"), false, false);
        k();
    }
};
})()) /*jshint -W033 */ // no semi; this is an expression not a statement
