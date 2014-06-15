/*
 * Adjusts the UI depending on whether notebook is read-only
 */
RCloud.UI.configure_readonly = function() {
    var fork_revert = $('#fork-revert-notebook');
    var readonly_notebook = $("#readonly-notebook");
    var notebook_author = $("#notebook-author");
    if(shell.notebook.model.read_only()) {
        $('#prompt-div').hide();
        fork_revert.text(shell.notebook.controller.is_mine() ? 'Revert' : 'Fork');
        fork_revert.show();
        notebook_author.text(shell.notebook.model.user());
        notebook_author.show();
        readonly_notebook.html("(read-only)");
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
        notebook_author.text(shell.notebook.model.user());
        $('#save-notebook').show();
        $('#output').sortable('enable');
        $('#upload-to-notebook')
            .prop('checked', false)
            .removeAttr("disabled");
    }
};
