RCloud.UI.init = function() {
    $("#fork-notebook").click(function() {
        var is_mine = shell.notebook.controller.is_mine();
        var gistname = shell.gistname();
        var version = shell.version();
        editor.fork_notebook(is_mine, gistname, version);
    });
    $("#revert-notebook").click(function() {
        var is_mine = shell.notebook.controller.is_mine();
        var gistname = shell.gistname();
        var version = shell.version();
        editor.revert_notebook(is_mine, gistname, version);
    });
    $("#open-in-github").click(function() {
        window.open(shell.github_url(), "_blank");
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
    $("#file").change(function() {
        $("#progress-bar").css("width", "0%");
    });
    $("#upload-submit").click(function() {
        if($("#file")[0].files.length===0)
            return;
        var to_notebook = ($('#upload-to-notebook').is(':checked'));
        upload_asset(to_notebook);
    });
    var showOverlay_;
    //prevent drag in rest of the page except asset pane and enable overlay on asset pane
    $(document).on('dragstart dragenter dragover', function (e) {
        var dt = e.originalEvent.dataTransfer;
        if(dt.items.length > 1) {
            e.stopPropagation();
            e.preventDefault();
        }else
        if (dt.types != null && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('application/x-moz-file'))) {
            if (!shell.notebook.model.read_only()) {
                e.stopPropagation();
                e.preventDefault();
                $('#asset-drop-overlay').css({'display': 'block'});
                showOverlay_ = true;
            }
            else {
                e.stopPropagation();
                e.preventDefault();
            }
        }
    });
    $(document).on('drop dragleave', function (e)  {
        e.stopPropagation();
        e.preventDefault();
        showOverlay_ = false;
        setTimeout(function() {
            if(!showOverlay_) {
                $('#asset-drop-overlay').css({'display': 'none'});
                console.log("hello");
            }
        }, 100);
    });
    //allow asset drag from local to asset pane and highlight overlay for drop area in asset pane
    $('#scratchpad-wrapper').bind({
        drop: function (e) {
            e = e.originalEvent || e;
            var files = (e.files || e.dataTransfer.files);
            var dt = e.dataTransfer;
            if(dt.items.length>1) {
                e.stopPropagation();
                e.preventDefault();
            } else
            if(!shell.notebook.model.read_only()) {
              //To be uncommented and comment the next line when we enable multiple asset drag after implementing multiple file upload.
              //for (var i = 0; i < files.length; i++) {
              for (var i = 0; i < 1; i++) {
                $('#file').val("");
                $("#file")[0].files[0]=files[i];
                upload_asset(true);
              }
            }
          $('#asset-drop-overlay').css({'display': 'none'});
        },
        "dragenter dragover": function(e) {
            var dt = e.originalEvent.dataTransfer;
            if(dt.items.length === 1 && !shell.notebook.model.read_only())
                dt.dropEffect = 'copy';
        }
    });
    function upload_asset(to_notebook) {
        RCloud.UI.right_panel.collapse($("#collapse-file-upload"), false);
        var replacing = false;
        if(to_notebook) {
            replacing = shell.notebook.model.has_asset($("#file")[0].files[0].name);
        }
        function results_append($div) {
            $("#file-upload-results").append($div);
            $("#collapse-file-upload").trigger("size-changed");
            ui_utils.on_next_tick(function() {
                ui_utils.scroll_to_after($("#file-upload-results"));
            });
        }

        function success(lst) {
            var path = lst[0], file = lst[1], notebook = lst[2];
            results_append(
                bootstrap_utils.alert({
                    "class": 'alert-info',
                    text: (to_notebook ? "Asset " : "File ") + file.name + (replacing ? " replaced." : " uploaded."),
                    on_close: function() {
                        $(".progress").hide();
                        $("#collapse-file-upload").trigger("size-changed");
                    }
                })
            );
            if(to_notebook) {
                var content = notebook.files[file.name].content;
                var promise_controller;
                if(replacing) {
                    replacing.content(content);
                    promise_controller = shell.notebook.controller.update_asset(replacing)
                        .return(replacing.controller);
                }
                else {
                    promise_controller = shell.notebook.controller.append_asset(content, file.name);
                }
                promise_controller.then(function(controller) {
                    controller.select();
                });
            }
        }

        function failure(what) {
            var overwrite_click = function() {
                rcloud.upload_file(true, function(err, value) {
                    if (err) {
                        results_append(
                            bootstrap_utils.alert({
                                "class": 'alert-danger',
                                text: err
                            })
                        );
                    } else {
                        success(value);
                    }
                });
            };
            var alert_element = $("<div></div>");
            var p;
            if(/exists/.test(what)) {
                p = $("<p>File exists. </p>");
                var overwrite = bootstrap_utils
                        .button({"class": 'btn-danger'})
                        .click(overwrite_click)
                        .text("Overwrite");
                p.append(overwrite);
            }
            else if(what==="empty") {
                p = $("<p>File is empty.</p>");
            }
            else if(what==="badname") {
                p = $("<p>Filename not allowed.</p>");
            }
            else {
                p = $("<p>(unexpected) " + what + "</p>");
            }
            alert_element.append(p);
            results_append(bootstrap_utils.alert({'class': 'alert-danger', html: alert_element}));
        }

        var upload_function = to_notebook ?
                rcloud.upload_to_notebook :
                rcloud.upload_file;

        upload_function(false, function(err, value) {
            if (err)
                failure(err);
            else
                success(value);
        });
    }

    RCloud.UI.left_panel.init();
    RCloud.UI.middle_column.init();
    RCloud.UI.right_panel.init();
    RCloud.UI.session_pane.init();

    var non_notebook_panel_height = 246;
    $('.notebook-tree').css('height', (window.innerHeight - non_notebook_panel_height)+'px');

    $("#search-form").submit(function(e) {
        e.preventDefault();
        e.stopPropagation();
        var qry = $('#input-text-search').val();
        $('#input-text-search').blur();
        RCloud.UI.search.exec(qry);
        return false;
    });
    $('#help-form').submit(function(e) {
        e.preventDefault();
        e.stopPropagation();
        var topic = $('#input-text-help').val();
        $('#input-text-help').blur();
        rcloud.help(topic);
        return false;
    });

    $("#collapse-search").data("panel-sizer", function(el) {
        var padding = RCloud.UI.collapsible_column.default_padder(el);
        var height = 24 + $('#search-summary').height() + $('#search-results').height();
        height += 30; // there is only so deep you can dig
        return {height: height, padding: padding};
    });

    // hmm maybe greedy isn't greedy enough
    $("#collapse-help").data("panel-sizer", function(el) {
        if($('#help-body').css('display') === 'none')
            return RCloud.UI.collapsible_column.default_sizer(el);
        else return {
            padding: RCloud.UI.collapsible_column.default_padder(el),
            height: 9000
        };
    });

    $("#collapse-assets").data("panel-sizer", function(el) {
        return {
            padding: RCloud.UI.collapsible_column.default_padder(el),
            height: 9000
        };
    });

    $("#collapse-file-upload").data("panel-sizer", function(el) {
        var padding = RCloud.UI.collapsible_column.default_padder(el);
        var height = 24 + $('#file-upload-controls').height() + $('#file-upload-results').height();
        //height += 30; // there is only so deep you can dig
        return {height: height, padding: padding};
    });

    $("#insert-new-cell").click(function() {
        var language = $("#insert-cell-language option:selected").text();
        shell.new_cell("", language, false);
        var vs = shell.notebook.view.sub_views;
        vs[vs.length-1].show_source();
    });

    $("#rcloud-logout").click(function() {
        // let the server-side script handle this so it can
        // also revoke all tokens
        window.location.href = '/logout.R';
    });

    $("#comment-submit").click(function() {
        if(!Notebook.empty_for_github($("#comment-entry-body").val())) {
            editor.post_comment($("#comment-entry-body").val(). replace(/\n/g, "<br/>"));
        }
        return false;
    });

    $("#comment-entry-body").keydown(function (e) {
        if ((e.keyCode == 10 || e.keyCode == 13 || e.keyCode == 115 || e.keyCode == 19) &&
            (e.ctrlKey || e.metaKey)) {
            if(!Notebook.empty_for_github($("#comment-entry-body").val())) {
                editor.post_comment($("#comment-entry-body").val(). replace(/\n/g, "<br/>"));
            }
            return false;
        }
        return undefined;
    });

    $("#run-notebook").click(shell.run_notebook);

    RCloud.UI.scratchpad.init();
    RCloud.UI.command_prompt.init();
    RCloud.UI.help_frame.init();

    function make_cells_sortable() {
        var cells = $('#output');
        cells.sortable({
            items: "> .notebook-cell",
            start: function(e, info) {
                $(e.toElement).addClass("grabbing");
                // http://stackoverflow.com/questions/6140680/jquery-sortable-placeholder-height-problem
                info.placeholder.height(info.item.height());
            },
            stop: function(e, info) {
                $(e.toElement).removeClass("grabbing");
            },
            update: function(e, info) {
                var ray = cells.sortable('toArray');
                var model = info.item.data('rcloud.model'),
                    next = info.item.next().data('rcloud.model');
                shell.notebook.controller.move_cell(model, next);
            },
            handle: " .ace_gutter-layer",
            scroll: true,
            scrollSensitivity: 40,
            forcePlaceholderSize: true
        });
    }
    make_cells_sortable();

    //////////////////////////////////////////////////////////////////////////
    // autosave when exiting. better default than dropping data, less annoying
    // than prompting
    $(window).bind("unload", function() {
        shell.save_notebook();
        return true;
    });

    $(".panel-collapse").collapse({toggle: false});

    //////////////////////////////////////////////////////////////////////////
    // view mode things
    $("#edit-notebook").click(function() {
        window.location = "edit.html?notebook=" + shell.gistname();
    });

    ui_utils.prevent_backspace($(document));
};
