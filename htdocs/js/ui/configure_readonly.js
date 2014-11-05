/*
 * Adjusts the UI depending on whether notebook is read-only
 */
RCloud.UI.configure_readonly = function() {
    var readonly_notebook = $("#readonly-notebook");
    if(shell.notebook.controller.is_mine()) {
        if(shell.notebook.model.read_only()) {
            $('#revert-notebook').show();
            $('#save-notebook').hide();
        }
        else {
            $('#revert-notebook').hide();
            $('#save-notebook').show();
        }
    }
    else {
        $('#revert-notebook,#save-notebook').hide();
    }
    if(shell.notebook.model.read_only()) {
        RCloud.UI.command_prompt.readonly(true);
        readonly_notebook.show();
        $('#save-notebook').hide();
        $('#output').sortable('disable');
        $('#upload-to-notebook')
            .prop('checked', false)
            .attr("disabled", true);
        RCloud.UI.scratchpad.set_readonly(true);
    }
    else {
        RCloud.UI.command_prompt.readonly(false);
        readonly_notebook.hide();
        $('#save-notebook').show();
        $('#output').sortable('enable');
        $('#upload-to-notebook')
            .prop('checked', false)
            .removeAttr("disabled");
        RCloud.UI.scratchpad.set_readonly(false);
    }
};
