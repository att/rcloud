RCloud.UI.init = function() {

    RCloud.UI.run_button.init();

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
            handle: " .cell-status",
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

    RCloud.UI.menus.init();
    RCloud.UI.advanced_menu.init();
    RCloud.UI.navbar.init();

    //////////////////////////////////////////////////////////////////////////
    // edit mode things - move more of them here
    RCloud.UI.find_replace.init();

    // these inits do default setup.  then add-ons modify that setup.
    // then, somewhere, load gets called and they actually fire up
    // (that last step is not so well defined so far)
    RCloud.UI.share_button.init();
    RCloud.UI.notebook_commands.init();
    RCloud.UI.cell_commands.init();
    RCloud.UI.panel_loader.init();

    // adds to advanced menu
    RCloud.UI.import_export.init();

    //////////////////////////////////////////////////////////////////////////
    // view mode things
    $("#edit-notebook").click(function() {
        window.location = "edit.html?notebook=" + shell.gistname();
    });

    ui_utils.prevent_backspace($(document));

    $(document).on('copy', function(e) {
        // only capture for cells and not ace elements
        if($(arguments[0].target).hasClass('ace_text-input') ||
           !$(arguments[0].target).closest($("#output")).size())
            return;
        var sel = window.getSelection();
        var offscreen = $('<pre class="offscreen"></pre>');
        $('body').append(offscreen);
        for(var i=0; i < sel.rangeCount; ++i) {
            var range = sel.getRangeAt(i);
            offscreen.append(range.cloneContents());
        }
        offscreen.find('.nonselectable').remove();
        sel.selectAllChildren(offscreen[0]);
        window.setTimeout(function() {
            offscreen.remove();
        }, 1000);
    });

    // prevent unwanted document scrolling e.g. by dragging
    if(!shell.is_view_mode()) {
        $(document).on('scroll', function() {
            $(this).scrollLeft(0);
            $(this).scrollTop(0);
        });
    };

    // prevent left-right scrolling of notebook area
    $('#rcloud-cellarea').on('scroll', function() {
        $(this).scrollLeft(0);
    });

    // re-truncate notebook title on window resize
    $(window).resize(function(e) {
        shell.refresh_notebook_title();
    });

    // key handlers
    document.addEventListener("keydown", function(e) {
        // usually we get away with handling ctrl- and cmd- the same
        // occasionally we have to special-case the mac and windows/linux keys
        var isCmdOrCtrlAndKeyCode = function(keycode) {
            return e.keyCode === keycode && (e.ctrlKey || e.metaKey);
        };

        // if we have a save button (e.g. not view mode), prevent browser's default
        // ctrl/cmd+s and save notebook
        if(RCloud.UI.navbar.get('save_notebook') && isCmdOrCtrlAndKeyCode(83)) { // ctrl/cmd-S
            e.preventDefault();
            shell.save_notebook();
        }
        // select all ctrl/cmd-a
        if(isCmdOrCtrlAndKeyCode(65)) {
            e.preventDefault();
            var selection = window.getSelection();
            selection.removeAllRanges();
            var range = new Range();
            range.selectNode(document.getElementById('output'));
            range.setStartAfter($('.response')[0]);
            selection.addRange(range);
        }
        // undo
        if(isCmdOrCtrlAndKeyCode(90) && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            editor.step_history_undo();
        }
        // redo
        if((!ui_utils.is_a_mac() && isCmdOrCtrlAndKeyCode(89)) || (ui_utils.is_a_mac() && e.keyCode == 90 && e.metaKey && e.shiftKey)) {
            e.preventDefault();
            editor.step_history_redo();
        }
    });
};
