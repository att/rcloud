((function() {
    var ocaps_, data_;

    function nix_r(list) {
        return (_.isArray(list) ? _.without : _.omit)(list, 'r_attributes', 'r_type');
    }

    var enviewer_panel = {
        body: function() {
            return $.el.div({id: "enviewer-body-wrapper", 'class': 'panel-body tight', style: 'padding: 5px 5px'},
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
        var header = $.el.tr($.el.th({colspan: 3, scope: 'col', style: header_style}, title));
        rows.push(header);
        _.keys(section).sort().forEach(function(key) {
            function td(content, style) {
                return $.el.td({style: style ? datum_style + ';' + style : datum_style}, content);
            }
            var items = [td(key)];
            var content;
            if(_.isString(section[key]) || _.isNumber(section[key]))
                items.push(td(section[key]));
            else if(_.isObject(section[key])) {
                if('command' in section[key])
                    switch(section[key].command) {
                    case 'view':
                        items.push(td(dataframe_link(key)));
                        break;
                    default:
                        throw new Error('unknown rcloud.enviewer command ' + key);
                    }
                else if('type' in section[key])
                    items.push(td(section[key].type, 'white-space: nowrap'), td(section[key].value));
            }
            rows.push($.el.tr({}, items));
        });
    }
    function is_open() {
        return !$('#collapse-environment-viewer').hasClass('collapse');
    }
    function clear_display() {
        $('#enviewer-body > table').remove();
    }
    function refresh_display() {
        clear_display();
        var rows = [];
        _.each(nix_r(data_), function(value, key) {
            var title = key.charAt(0).toUpperCase() + key.substring(1); // capitalize
            var section = nix_r(value);
            if(_.size(section))
                add_section(title, section, rows);
        });
        $('#enviewer-body').append($.el.table({style: "border-collapse: collapse; border: 0px; width: 100%"}, rows));

        $('#enviewer-body tr:last-child td').css({'border-bottom': 0});
        $('#enviewer-body tr th').parent().next('tr').find('td').css({'border-top': 0});
        $('#enviewer-body tr th').parent().prev('tr').find('td').css({'border-bottom': 0, 'padding-bottom': '5px'});
        if(is_open())
             RCloud.UI.right_panel.collapse($("#collapse-environment-viewer"), false, false);
    }
return {
    init: function(ocaps, k) {
        ocaps_ = RCloud.promisify_paths(ocaps, [["refresh"], ["view_dataframe"]], true);
        if(window.shell) { // are we running in RCloud UI?
            // note this wretched destruction of all previous watchers
            // it is because we do not yet have a detach message
            shell.notebook.model.execution_watchers = [{
                run_cell: function() {
                    ocaps_.refresh();
                }
            }];
            clear_display(); // also would be part of detach
            RCloud.UI.panel_loader.add({
                Workspace: {
                    side: 'right',
                    name: 'environment-viewer',
                    title: 'Workspace',
                    icon_class: 'icon-sun',
                    colwidth: 3,
                    sort: 2500,
                    panel: enviewer_panel
                }
            });
        }
        k();
    },
    display: function(data, k) {
        data_ = data;
        refresh_display();
        k();
    }
};
})()) /*jshint -W033 */ // no semi; this is an expression not a statement
