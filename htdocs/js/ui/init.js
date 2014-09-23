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

    $("#run-notebook").click(shell.run_notebook);

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
    $('.notebook-sizer').draggable({
        axis: 'x',
        opacity: 0.75,
        zindex: 10000,
        revert: true,
        revertDuration: 0,
        grid: [window.innerWidth/12, 0],
        stop: function(event, ui) {
            var wid_over_12 = window.innerWidth/12;
            // position is relative to parent, the notebook
            var diff, size;
            if($(this).hasClass('left')) {
                diff = Math.round(ui.position.left/wid_over_12);
                size = Math.max(1,
                                Math.min(+RCloud.UI.left_panel.colwidth() + diff,
                                         11 - RCloud.UI.right_panel.colwidth()));
                if(size===1)
                    RCloud.UI.left_panel.hide(true, true);
                else
                    RCloud.UI.left_panel.show(true, true);
                RCloud.UI.left_panel.colwidth(size);
                RCloud.UI.middle_column.update();
            }
            else if($(this).hasClass('right')) {
                diff = Math.round(ui.position.left/wid_over_12) - RCloud.UI.middle_column.colwidth();
                size = Math.max(1,
                                Math.min(+RCloud.UI.right_panel.colwidth() - diff,
                                         11 - RCloud.UI.left_panel.colwidth()));
                if(size===1)
                    RCloud.UI.right_panel.hide(true, true);
                else
                    RCloud.UI.right_panel.show(true, true);
                RCloud.UI.right_panel.colwidth(size);
                RCloud.UI.middle_column.update();
            }
            else throw new Error('unexpected shadow drag with classes ' + $(this).attr('class'));
            // revert to absolute position
            $(this).css({left: "", top: ""});
        }
    });

    // make grid responsive to window resize
    $(window).resize(function() {
        var wid_over_12 = window.innerWidth/12;
        $('.notebook-sizer').draggable('option', 'grid', [wid_over_12, 0]);
    });

    //////////////////////////////////////////////////////////////////////////
    // autosave when exiting. better default than dropping data, less annoying
    // than prompting
    $(window).bind("unload", function() {
        shell.save_notebook();
        return true;
    });

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
