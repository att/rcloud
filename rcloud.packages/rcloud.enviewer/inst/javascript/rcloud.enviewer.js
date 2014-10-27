((function() {
    var ocaps_;

    function nix_r(list) {
        return (_.isArray(list) ? _.without : _.omit)(list, 'r_attributes', 'r_type');
    }

    var enviewer_panel = {
        body: function() {
            return $.el.div({id: "enviewer-body-wrapper", 'class': 'panel-body', style: 'padding: 5px 5px'},
                           $.el.div({id: "enviewer-scroller", style: "width: 100%; height: 100%; overflow-x: auto"},
                                    $.el.div({id:"enviewer-body", 'class': 'widget-vsize'})));
        }
    };

    function dataframe_link(key) {
        return $('<a/>', {href: '#'}).text('dataframe')
            .click(function() {
                ocaps_.view_dataframe(key);
            })[0];
    }

    function add_section(title, section, rows) {
        // styling the table will go better with CSS
        var header_style = 'border: 0; background-color: #dedede; font-family: sans-serif; font-size: 13px';
        var datum_style = 'border-style: solid; border-width: thin 0; border-color: #ccc';
        var header = $.el.tr($.el.th({colspan: 2, scope: 'col', style: header_style}, title));
        rows.push(header);
        _.keys(section).sort().forEach(function(key) {
            function td(content) {
                return $.el.td({style: datum_style}, content);
            }
            var content;
            if(_.isString(section[key]) || _.isNumber(section[key]))
                content = section[key];
            else if(_.isObject(section[key]))
                switch(section[key].command) {
                case 'view':
                    content = dataframe_link(key);
                    break;
                default:
                    throw new Error('unknown rcloud.enviewer command ' + key);
                }
            var items = [td(key), td(content)];
            rows.push($.el.tr({}, items));
        });
    }
return {
    init: function(ocaps, k) {
        ocaps_ = RCloud.promisify_paths(ocaps, [["refresh"], ["view_dataframe"]], true);
        shell.notebook.model.execution_watchers.push({
            run_cell: function() {
                ocaps_.refresh();
            }
        });
        RCloud.UI.panel_loader.add({
            Environment: {
                side: 'right',
                name: 'environment-viewer',
                title: 'Environment',
                icon_class: 'icon-sun',
                colwidth: 3,
                sort: 2500,
                panel: enviewer_panel
            }
        });
        k();
    },
    display: function(data, k) {
        $('#enviewer-body > table').remove();
        var rows = [];
        _.each(nix_r(data), function(value, key) {
            var title = key.charAt(0).toUpperCase() + key.substring(1); // capitalize
            var section = nix_r(value);
            if(_.size(section))
                add_section(title, section, rows);
        });
        $('#enviewer-body').append($.el.table({style: "border-collapse: collapse; border: 0px; width: 100%"}, rows));

        $('#enviewer-body tr:last-child td').css({'border-bottom': 0});
        $('#enviewer-body tr th').parent().next('tr').find('td').css({'border-top': 0});
        $('#enviewer-body tr th').parent().prev('tr').find('td').css({'border-bottom': 0, 'padding-bottom': '5px'});
        RCloud.UI.right_panel.collapse($("#collapse-environment-viewer"), false, false);
        k();
    }
};
})()) /*jshint -W033 */ // no semi; this is an expression not a statement
