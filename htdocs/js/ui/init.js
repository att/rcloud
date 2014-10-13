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

    RCloud.UI.column_sizer.init();

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

    // if we have a save button (e.g. not view mode), prevent browser's default
    // ctrl/cmd+s and save notebook
    if(saveb.size()) {
        document.addEventListener("keydown", function(e) {
            if (e.keyCode == 83 && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                shell.save_notebook();
            }
        });
    }
};
