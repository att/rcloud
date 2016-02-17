RCloud.UI.selection_bar = (function() {
    var result = {
        init: function() {

            var $selection_bar = $(RCloud.UI.panel_loader.load_snippet('selection-bar-snippet'))
                .find('.btn-default input[type="checkbox"]').click(function() {
                    if($(this).is(':checked')) {
                        shell.notebook.controller.select_all_cells();
                    } else {
                        shell.notebook.controller.clear_all_selection();
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
        }
    };
    return result;
})();