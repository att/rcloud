/*
 * Adjusts the UI depending on whether notebook is read-only
 */
RCloud.UI.configure_readonly = function() {
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
        $('#prompt-div').hide();
        $('#save-notebook').hide();
        $('#output').sortable('disable');
        $('#upload-to-notebook')
            .prop('checked', false)
            .attr("disabled", true);
    }
    else {
        $('#prompt-div').show();
        $('#save-notebook').show();
        $('#output').sortable('enable');
        $('#upload-to-notebook')
            .prop('checked', false)
            .removeAttr("disabled");
    }
};
