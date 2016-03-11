/*
 * Adjusts the UI depending on whether notebook is read-only
 */
RCloud.UI.configure_readonly = function() {
    var readonly_notebook = $("#readonly-notebook");
    var revertb = RCloud.UI.navbar.control('revert_notebook'),
        saveb = RCloud.UI.navbar.control('save_notebook');
    if(shell.notebook.controller.is_mine()) {
        if(shell.notebook.model.read_only()) {
            revertb && revertb.show();
            saveb && saveb.hide();
        }
        else {
            revertb && revertb.hide();
            saveb && saveb.show();
        }
    }
    else {
        revertb && revertb.hide();
        saveb && saveb.hide();
    }
    if(shell.notebook.model.read_only()) {
        RCloud.UI.command_prompt.readonly(true);
        RCloud.UI.selection_bar.hide();
        readonly_notebook.show();
        $('#output').sortable('disable');
        $('#upload-to-notebook')
            .prop('checked', false)
            .attr("disabled", true);
        RCloud.UI.scratchpad.set_readonly(true);
    }
    else {
        RCloud.UI.command_prompt.readonly(false);
        RCloud.UI.selection_bar.show();
        readonly_notebook.hide();
        $('#output').sortable('enable');
        $('#upload-to-notebook')
            .prop('checked', false)
            .removeAttr("disabled");
        RCloud.UI.scratchpad.set_readonly(false);
    }
};
