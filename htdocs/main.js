function init_shareable_link_box() {
    $("#share-notebook").each(function() {
        var t = $(this), n = t.next(".embed-box"), f = function() {
            t.toggle();
            n.toggle();
            if (n.is(":visible")) {
                n.get(0).value = window.location.protocol + '//' + window.location.host + '/view.html?notebook=' + shell.gistname();
                var v = shell.version();
                if(v)
                    n.get(0).value = n.get(0).value + '&version='+v;
                n.get(0).select();
            }
            return false;
        };
        t.click(f); n.blur(f);
    });
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
    init_shareable_link_box();
    init_fork_revert_button();
    init_github_buttons();
    footer.init();
    
    $("#show-source").font_awesome_checkbox({
        checked: false,
        check: function() {
            shell.notebook.controller.show_r_source();
        }, uncheck: function() {
            shell.notebook.controller.hide_r_source();
        }
    });

    $("#comment-submit").click(function() {
        editor.post_comment($("#comment-entry-body").val());
        return false;
    });
    rclient = RClient.create({
        debug: false,
        host: (location.protocol == "https:") ? ("wss://"+location.hostname+":8083/") : ("ws://"+location.hostname+":8081/"),
        on_connect: function(ocaps) {
            rcloud = RCloud.create(ocaps.rcloud);
            rcloud.session_init(rcloud.username(), rcloud.github_token(), function(hello) {
                rclient.post_response(hello);
            });

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
            $("#upload-submit").click(function() {
                var success = function(path, file) {
                    $("#file-upload-div").append(
                        bootstrap_utils.alert({
                            "class": 'alert-info',
                            text: "File " + file.name + " uploaded."
                        })
                    );
                };
                rcloud.upload_file(false, success, function() {
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
            rcloud.init_client_side_data();

            editor.init();
            shell.init();

            if (location.search.length > 0) {
                function getURLParameter(name) {
                    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
                }
                editor.load_notebook(getURLParameter("notebook"), getURLParameter("version"));
                $("#tabs").tabs("select", "#tabs-2");
            }
        },
        on_data: function(v) {
            v = v.value.json();
            oob_handlers[v[0]] && oob_handlers[v[0]](v.slice(1));
        }
    });
}

window.onload = main_init;
