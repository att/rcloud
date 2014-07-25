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
        RCloud.UI.upload_files(to_notebook);
    });
    var showOverlay_;
    //prevent drag in rest of the page except asset pane and enable overlay on asset pane
    $(document).on('dragstart dragenter dragover', function (e) {
        var dt = e.originalEvent.dataTransfer;
        if(!dt)
            return;
        if(dt.items.length > 1) {
            e.stopPropagation();
            e.preventDefault();
        } else if (dt.types !== null &&
                   (dt.types.indexOf ?
                    dt.types.indexOf('Files') != -1 :
                    dt.types.contains('application/x-moz-file'))) {
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
    $(document).on('drop dragleave', function (e) {
        e.stopPropagation();
        e.preventDefault();
        showOverlay_ = false;
        setTimeout(function() {
            if(!showOverlay_) {
                $('#asset-drop-overlay').css({'display': 'none'});
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
            if(!shell.notebook.model.read_only())
                RCloud.UI.upload_files(true, {files: files});
            $('#asset-drop-overlay').css({'display': 'none'});
        },
        "dragenter dragover": function(e) {
            var dt = e.originalEvent.dataTransfer;
            if(dt.items.length === 1 && !shell.notebook.model.read_only())
                dt.dropEffect = 'copy';
        }
    });


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
            editor.post_comment($("#comment-entry-body").val());
        }
        return false;
    });

    $("#comment-entry-body").keydown(function (e) {
        if ((e.keyCode == 10 || e.keyCode == 13 || e.keyCode == 115 || e.keyCode == 19) &&
            (e.ctrlKey || e.metaKey)) {
            if(!Notebook.empty_for_github($("#comment-entry-body").val())) {
                editor.post_comment($("#comment-entry-body").val());
            }
            return false;
        }
        return undefined;
    });

    $("#run-notebook").click(shell.run_notebook);

    RCloud.UI.scratchpad.init();
    RCloud.UI.command_prompt.init();
    RCloud.UI.help_frame.init();

    //////////////////////////////////////////////////////////////////////////
    // allow reordering cells by dragging them
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
    // resizeable panels
    var wid_over_12 = window.innerWidth/12; // not responsive
    $('.notebook-sizer').draggable({
        axis: 'x',
        opacity: 0.75,
        zindex: 10000,
        revert: true,
        revertDuration: 0,
        grid: [wid_over_12, 0],
        start: function(event, ui) {
            $(".bar", this).show();
        },
        stop: function(event, ui) {
            // position is relative to parent, the notebook
            var diff, size;
            if($(this).hasClass('left')) {
                diff = Math.round(ui.position.left/wid_over_12);
                size = Math.max(1,
                                Math.min(+RCloud.UI.left_panel.colwidth() + diff,
                                         11 - RCloud.UI.right_panel.colwidth()));
                RCloud.UI.left_panel.colwidth(size);
                RCloud.UI.middle_column.update();
            }
            else if($(this).hasClass('right')) {
                diff = Math.round(ui.position.left/wid_over_12) - RCloud.UI.middle_column.colwidth();
                size = Math.max(1,
                                Math.min(+RCloud.UI.right_panel.colwidth() - diff,
                                         11 - RCloud.UI.left_panel.colwidth()));
                RCloud.UI.right_panel.colwidth(size);
                RCloud.UI.middle_column.update();
            }
            else throw new Error('unexpected shadow drag with classes ' + $(this).attr('class'));
            // revert to absolute position
            $(this).css({left: "", top: ""});
            $(".bar", this).hide();
        }
    });

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

    // prevent unwanted document scrolling e.g. by dragging
    $(document).on('scroll', function() {
        $(this).scrollLeft(0);
        $(this).scrollTop(0);
    });

    // prevent left-right scrolling of notebook area
    $('#rcloud-cellarea').on('scroll', function() {
        $(this).scrollLeft(0);
    });
};
