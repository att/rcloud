/*
 * Adjusts the UI depending on whether notebook is read-only
 */
RCloud.UI.configure_readonly = function() {
    var fork_revert = $('#fork-revert-notebook');
	var readonly_notebook = $("#readonly-notebook");
    if(shell.notebook.model.read_only()) {
        $('#prompt-div').hide();
        fork_revert.text(shell.notebook.controller.is_mine() ? 'Revert' : 'Fork');
        fork_revert.show();
		readonly_notebook.html("<span style=\"color:#fff;\">Authored By <b>"+shell.notebook.model.user()+"</b> <small><i>*This Notebook is read-only</i></small></span>");
		readonly_notebook.show();
        $('#save-notebook').hide();
        $('#output').sortable('disable');
        $('#upload-to-notebook')
            .prop('checked', false)
            .attr("disabled", true);
    }
    else {
        $('#prompt-div').show();
        fork_revert.hide();
		readonly_notebook.hide();
        $('#save-notebook').show();
        $('#output').sortable('enable');
        $('#upload-to-notebook')
            .prop('checked', false)
            .removeAttr("disabled");
    }
};
