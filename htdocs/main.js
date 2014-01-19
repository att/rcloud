function resize_side_panel() {
    var non_notebook_panel_height = 246;
    $('.notebook-tree').css('height', (window.innerHeight - non_notebook_panel_height)+'px');
}

function init_fork_revert_button() {
    $("#fork-revert-notebook").click(function() {
        shell.fork_or_revert_button();
    });
}

function init_github_buttons() {
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
}

function init_upload_pane() {
    $("#upload-submit").click(function() {
        var to_notebook = ($('#upload-to-notebook').is(':checked'));
        var success = function(path, file, notebook) {
            $("#file-upload-div").append(
                bootstrap_utils.alert({
                    "class": 'alert-info',
                    text: (to_notebook ? "Asset " : "File ") + file.name + " uploaded."
                })
            );
            if(to_notebook)
                editor.update_notebook_file_list(notebook.files);
        };
        var upload_function = to_notebook
            ? rcloud.upload_to_notebook
            : rcloud.upload_file;

        upload_function(false, success, function() {
            var overwrite_click = function() {
                rcloud.upload_file(true, success, function(exception_value) {
                    var msg = exception_value;
                    $("#file-upload-div").append(
                        bootstrap_utils.alert({
                            "class": 'alert-danger',
                            text: msg
                        })
                    );
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
        });
    });
}

function init_save_button() {
    var saveb = $("#save-notebook");
    saveb.click(function() {
        shell.save_notebook();
    });
    shell.notebook.controller.save_button(saveb);
}

function init_port_file_buttons() {
    $('#export-notebook-file').click(function() {
        shell.export_notebook_file();
    });
    $('#import-notebook-file').click(function() {
        shell.import_notebook_file();
    });
}

function init_navbar_buttons() {
    init_fork_revert_button();
    init_github_buttons();
    init_save_button();
    init_port_file_buttons();
    init_upload_pane();
}

var oob_handlers = {
    "browsePath": function(v) {
        var x=" "+ window.location.protocol + "//" + window.location.host + v+" ";
        var width=600;
        var height=500;
        var left=screen.width-width;
        window.open(x,'RCloudHelp','width='+width+',height='+height+',scrollbars=yes,resizable=yes,left='+left);
    }
};

function main_init() {
    resize_side_panel();
    init_navbar_buttons();

    $("#comment-submit").click(function() {
        editor.post_comment($("#comment-entry-body").val());
        return false;
    });
    rclient = RClient.create({
        debug: false,
        host: (location.protocol == "https:") ? ("wss://"+location.hostname+":8083/") : ("ws://"+location.hostname+":8081/"),
        on_connect: function(ocaps) {
            rcloud = RCloud.create(ocaps.rcloud);
            if (!rcloud.authenticated) {
                rclient.post_error(rclient.disconnection_error("Please login first!"));
                rclient.close();
                return;
            }
            rcloud.session_init(rcloud.username(), rcloud.github_token(), function(hello) {
                rclient.post_response(hello);
            });
            rcloud.display.set_device_pixel_ratio();

            $("#new-md-cell-button").click(function() {
                shell.new_markdown_cell("", "markdown");
                var vs = shell.notebook.view.sub_views;
                vs[vs.length-1].show_source();
            });
            $("#rcloud-logout").click(function() {
		// let the server-side script handle this so it can
		// also revoke all tokens
                window.location.href = '/logout.R';
            });
            $(".collapse").collapse();
            rcloud.init_client_side_data();

            shell.init();
            var notebook = null, version = null;
            if (location.search.length > 0) {
                function getURLParameter(name) {
                    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
                }
                notebook = getURLParameter("notebook");
                version = getURLParameter("version");
            }
            editor.init(notebook, version);
            $("#tabs").tabs("select", "#tabs-2");
        },
        on_data: function(v) {
            v = v.value.json();
            oob_handlers[v[0]] && oob_handlers[v[0]](v.slice(1));
        }
    });
}

window.onload = main_init;
