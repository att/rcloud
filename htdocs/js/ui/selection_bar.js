RCloud.UI.selection_bar = (function() {

    var $partial_indicator;
    var $selection_checkbox;

    var reset = function() {
        $selection_checkbox.prop('checked', false);
        $partial_indicator.hide();
    };

    var result = {
        init: function() {

            var $selection_bar = $(RCloud.UI.panel_loader.load_snippet('selection-bar-snippet'));
            $partial_indicator = $selection_bar.find('.cell-selection span');
            $selection_checkbox = $selection_bar.find('.cell-selection input[type="checkbox"]');

            $selection_bar
                .find('.btn-default input[type="checkbox"]').click(function() {
                    if($(this).is(':checked')) {
                        shell.notebook.controller.select_all_cells();
                    } else {
                        shell.notebook.controller.clear_all_selected_cells();
                    }
                })
                .end()
                .find('a[data-action]').click(function() {
                    shell.notebook.controller[$(this).attr('data-action')]();
                })
                .end()
                .find('#selection-bar-delete').click(function() {
                    shell.notebook.controller.remove_selected_cells();
                })
                .end()
                .show();

            $('#' + $selection_bar.attr('id')).replaceWith($selection_bar);
        },  
        update: function(cells) {

            var cell_count = cells.length,
                selected_count = _.filter(cells, function(cell) { return cell.is_selected(); }).length;

                $selection_checkbox.prop('checked', selected_count === cell_count);
                $partial_indicator[selected_count !== cell_count && selected_count !== 0 ? 'show' : 'hide']();                
          
        },
        hide: function() {
            $('#selection-bar').hide();
            reset();
        },
        show: function() {
            $('#selection-bar').show();
            reset();
        }
    };
    return result;
})();