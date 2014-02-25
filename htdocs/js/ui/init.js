RCloud.UI.init = function() {
    $("#fork-revert-notebook").click(function() {
        shell.fork_or_revert_button();
    });
    $("#open-in-github").click(function() {
        shell.open_in_github();
    });
    $("#open-from-github").click(function() {
        var result = prompt("Enter notebook ID or github URL:");
        if(result !== null)
            shell.open_from_github(result);
    });
    $("#import-notebooks").click(function() {
        shell.import_notebooks();
    });
    var saveb = $("#save-notebook");
    saveb.click(function() {
        shell.save_notebook();
    });
    shell.notebook.controller.save_button(saveb);
    $('#export-notebook-file').click(function() {
        shell.export_notebook_file();
    });
    $('#export-notebook-as-r').click(function() {
        shell.export_notebook_as_r_file();
    });
    $('#import-notebook-file').click(function() {
        shell.import_notebook_file();
    });
    $("#upload-submit").click(function() {
        var to_notebook = ($('#upload-to-notebook').is(':checked'));
        function success(lst) {
            var path = lst[0], file = lst[1], notebook = lst[2];
            $("#file-upload-div").append(
                bootstrap_utils.alert({
                    "class": 'alert-info',
                    text: (to_notebook ? "Asset " : "File ") + file.name + " uploaded.",
                    on_close: function() {
                        $(".progress").hide();
                    }
                })
            );
            if(to_notebook)
                editor.update_notebook_file_list(notebook.files);
        };

        // FIXME check for more failures besides file exists
        function failure() {
            var overwrite_click = function() {
                rcloud.upload_file(true, function(err, value) {
                    if (err) {
                        var msg = exception_value;
                        $("#file-upload-div").append(
                            bootstrap_utils.alert({
                                "class": 'alert-danger',
                                text: msg
                            })
                        );
                    } else {
                        success(value);
                    }
                });
            };
            var alert_element = $("<div></div>");
            var p = $("<p>File exists. </p>");
            alert_element.append(p);
            var overwrite = bootstrap_utils
                .button({"class": 'btn-danger'})
                .click(overwrite_click)
                .text("Overwrite");
            p.append(overwrite);
            $("#file-upload-div").append(bootstrap_utils.alert({'class': 'alert-danger', html: alert_element}));
        }

        var upload_function = to_notebook
            ? rcloud.upload_to_notebook
            : rcloud.upload_file;

        upload_function(false, function(err, value) {
            if (err) 
                failure(err);
            else
                success(value);
        });
    });

    RCloud.UI.left_panel.init();
    RCloud.UI.right_panel.init();

    var non_notebook_panel_height = 246;
    $('.notebook-tree').css('height', (window.innerHeight - non_notebook_panel_height)+'px');
    $("#new-md-cell-button").click(function() {
        shell.new_markdown_cell("");
        var vs = shell.notebook.view.sub_views;
        vs[vs.length-1].show_source();
    });
    $("#new-r-cell-button").click(function() {
        shell.new_interactive_cell("", false);
        var vs = shell.notebook.view.sub_views;
        vs[vs.length-1].show_source();
    });
    $("#rcloud-logout").click(function() {
	// let the server-side script handle this so it can
	// also revoke all tokens
        window.location.href = '/logout.R';
    });

    $("#comment-submit").click(function() {
        editor.post_comment($("#comment-entry-body").val());
        return false;
    });
};
