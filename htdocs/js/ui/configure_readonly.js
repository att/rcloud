/*
 * Adjusts the UI depending on whether notebook is read-only
 */
RCloud.UI.configure_readonly = function() {
    var fork_revert = $('#fork-revert-notebook');
    if(shell.notebook.model.read_only()) {
        $('#prompt-div').hide();
        fork_revert.text(shell.notebook.controller.is_mine() ? 'Revert' : 'Fork');
        fork_revert.show();
        $('#save-notebook').hide();
        $('#output').sortable('disable');
    }
    else {
        $('#prompt-div').show();
        fork_revert.hide();
        $('#save-notebook').show();
        $('#output').sortable('enable');
    }
};
