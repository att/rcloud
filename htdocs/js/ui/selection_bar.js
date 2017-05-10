RCloud.UI.selection_bar = (function() {

    var $partial_indicator,
        $selection_checkbox,
        $dropdown_toggle,
        $delete_button,
        $crop_button,
        $hide_results_button,
        $show_results_button,
        $cell_selection,
        $selected_details,
        $selected_count,
        $cell_count;

    var reset = function() {
        $selection_checkbox.prop('checked', false);
        $partial_indicator.hide();
    };

    var result = {
        init: function() {

            var $selection_bar = $(RCloud.UI.panel_loader.load_snippet('selection-bar-snippet'));
            $partial_indicator = $selection_bar.find('.cell-selection span');
            $selection_checkbox = $selection_bar.find('.cell-selection input[type="checkbox"]');
            $dropdown_toggle = $selection_bar.find('.dropdown-toggle');
            $delete_button = $selection_bar.find('#selection-bar-delete');
            $crop_button = $selection_bar.find('#selection-bar-crop');
            $hide_results_button = $selection_bar.find('#selection-bar-hide-results');
            $show_results_button = $selection_bar.find('#selection-bar-show-results');
            $cell_selection = $selection_bar.find('.cell-selection');
            $selected_details = $delete_button.find('span');
            $selected_count = $selection_bar.find('#selected-count');
            $cell_count = $selection_bar.find('#cell-count');

            $selection_bar
                .find('.btn-default input[type="checkbox"]').click(function(e) {
                    e.stopPropagation();

                    if(!shell.notebook.controller.cell_count()) {
                        e.preventDefault();
                        return;
                    }

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
                .find('#selection-bar-crop').click(function() {
                    shell.notebook.controller.crop_cells();
                })
                .end()
                .find('#selection-bar-hide-results').click(function() {
                    shell.notebook.controller.hide_cells_results();
                })
                .end()
                .find('#selection-bar-show-results').click(function() {
                    shell.notebook.controller.show_cells_results();
                })
                .end();

            $selection_bar.find('div[type="button"].cell-selection').click(function(e) {
                $(this).find('input').trigger('click');
            });
            
            $('#' + $selection_bar.attr('id')).replaceWith($selection_bar);
        },  
        update: function(cells) {

            var cell_count = cells.length,
                selected_count = shell.notebook.controller.selected_count();

            $selection_checkbox.prop({
                'checked' : selected_count === cell_count && cell_count != 0,
                'disabled' : cell_count === 0
            });

            // checkbox/dropdown enabled status based on cell count:
            _.each([$dropdown_toggle, $cell_selection], function(el) { 
                el[cell_count ? 'removeClass' : 'addClass']('disabled');  
            });

            $partial_indicator[selected_count !== cell_count && selected_count !== 0 ? 'show' : 'hide']();   

            // delete/crop buttons' enabled status based on selection count:
            $delete_button[selected_count ? 'removeClass' : 'addClass']('disabled');
            $crop_button[shell.notebook.controller.can_crop_cells() ? 'removeClass' : 'addClass']('disabled');
            $hide_results_button[selected_count ? 'removeClass' : 'addClass']('disabled');
            $show_results_button[selected_count ? 'removeClass' : 'addClass']('disabled');

            // delete details:
            $selected_count.text(selected_count);
            $cell_count.text(cell_count);
            $selected_details[selected_count !== 0 ? 'show' : 'hide']();
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
