Promise.longStackTraces();

var left_panel = {
    collapsed: false,
    hide: function() {
        this.collapsed = true;
        $("#left-column").removeClass("col-md-3 col-sm-3").addClass("col-md-1 col-sm-1");
        $("#fake-left-column").removeClass("col-md-3 col-sm-3").addClass("col-md-1 col-sm-1");
        $("#new-notebook").hide();
        $("#left-pane-collapser i").removeClass("icon-minus").addClass("icon-plus");
        middle_column.update();
    },
    show: function() {
        $("#left-column").removeClass("col-md-1 col-sm-1").addClass("col-md-3 col-sm-3");
        $("#fake-left-column").removeClass("col-md-1 col-sm-1").addClass("col-md-3 col-sm-3");
        $("#new-notebook").show();
        $("#left-pane-collapser i").removeClass("icon-plus").addClass("icon-minus");
        this.collapsed = false;
        middle_column.update();
    },
    init: function() {
        var that = this;
        $("#accordion").on("show.bs.collapse", function() {
            if (that.collapsed) {
                that.show();
                that.collapsed = false;
                middle_column.update();
            }
        });

        $("#accordion").on("shown.bs.collapse", function() {
            $(".left-panel-shadow").each(function(v) { 
                var h = $(this).parent().height();
                if (h === 0)
                    h = "100%";
                $(this).attr("height", h);
            });
        });
        $("#left-pane-collapser").click(function() {
            if (that.collapsed) {
                that.show();
            } else {
                // the following actually makes sense to me. oh no what has my life become
                $("#accordion > .panel > div.panel-collapse:not(.collapse):not(.out)").collapse('hide');
                that.hide();
            }
            middle_column.update();
        });
    }
};

var right_panel = {
    collapsed: false,
    hide: function() {
        this.collapsed = true;
        $("#right-column").removeClass("col-md-4 col-sm-4").addClass("col-md-1 col-sm-1");
        $("#fake-right-column").removeClass("col-md-4 col-sm-4").addClass("col-md-1 col-sm-1");
        $("#right-pane-collapser i").addClass("icon-plus").removeClass("icon-minus");
    },
    show: function() {
        $("#right-column").removeClass("col-md-1 col-sm-1").addClass("col-md-4 col-sm-4");
        $("#fake-right-column").removeClass("col-md-1 col-sm-1").addClass("col-md-4 col-sm-4");
        $("#right-pane-collapser i").removeClass("icon-plus").addClass("icon-minus");
        this.collapsed = false;
    },
    init: function() {
        var that = this;
        $("#accordion-right").on("show.bs.collapse", function() {
            if (that.collapsed) {
                that.show();
                that.collapsed = false;
                middle_column.update();
            }
        });
        $("#accordion-right").on("shown.bs.collapse", function() {
            $(".right-panel-shadow").each(function(v) { 
                var h = $(this).parent().height();
                if (h === 0)
                    h = "100%";
                $(this).attr("height", h);
            });
        });
        $("#right-pane-collapser").click(function() {
            if (that.collapsed) {
                that.show();
            } else {
                // the following actually makes sense to me. oh no what has my life become
                $("#accordion-right > .panel > div.panel-collapse:not(.collapse):not(.out)").collapse('hide');
                that.hide();
            }
            middle_column.update();
        });
    }
};

var middle_column = {
    middle_panel_size: 5,
    update: function() {
        var size = 12;
        if (right_panel.collapsed) {
            size -= 1;
        } else {
            size -= 4;
        }
        if (left_panel.collapsed) {
            size -= 1;
        } else {
            size -= 3;
        }

        var previous_classes = "col-sm-" + middle_panel_size + " col-md-" + middle_panel_size;
        var new_classes = "col-sm-" + size + " col-md-" + size;
        $("#middle-column").removeClass(previous_classes).addClass(new_classes);
        $("#prompt-div").removeClass(previous_classes).addClass(new_classes);
        middle_panel_size = size;
    }
};

var right_panel_collapsed = false;
var left_panel_collapsed = false;
var middle_panel_size = 5;
function init_side_panel_collapsers()
{
    left_panel.init();
    right_panel.init();
}

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
    $('#export-notebook-as-r').click(function() {
        shell.export_notebook_as_r_file();
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
    init_side_panel_collapsers();
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

    function getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    $("#comment-submit").click(function() {
        editor.post_comment($("#comment-entry-body").val());
        return false;
    });

    rclient = RClient.create({
        debug: false,
        host:  location.href.replace(/^http/,"ws").replace(/#.*$/,""),
        on_connect: function(ocaps) {
            rcloud = RCloud.create(ocaps.rcloud);
            if (!rcloud.authenticated) {
                rclient.post_error(rclient.disconnection_error("Please login first!"));
                rclient.close();
                return;
            }
            rcloud.session_init(rcloud.username(), rcloud.github_token()).then(function(hello) {
                rclient.post_response(hello);
            });
            rcloud.display.set_device_pixel_ratio();

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
            $(".collapse").collapse();
            rcloud.init_client_side_data();

            shell.init();
            var notebook = null, version = null;
            if (location.search.length > 0) {
                notebook = getURLParameter("notebook");
                version = getURLParameter("version");
            }
            editor.init(notebook, version);
            /*
             // disabling navigation for now - concurrency issues
            window.addEventListener("popstate", function(e) {
                if(e.state === "rcloud.notebook") {
                    var notebook2 = getURLParameter("notebook");
                    var version2 = getURLParameter("version");
                    editor.load_notebook(notebook2, version2, true, false);
                }
            });
             */

            ////////////////////////////////////////////////////////////////////////////////
            // autosave when exiting. better default than dropping data, less annoying
            // than prompting
            $(window).bind("unload", function() {
                shell.save_notebook();
                return true;
            });
        },
        on_data: function(v) {
            v = v.value.json();
            oob_handlers[v[0]] && oob_handlers[v[0]](v.slice(1));
        }
    });
}

window.onload = main_init;
// Promise.onPossiblyUnhandledRejection(function(error){
//     throw error;
// });
