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
    RCloud.UI.selection_bar.init();

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

    // keyboard shortcuts:
    RCloud.UI.shortcut_manager.init();

    //////////////////////////////////////////////////////////////////////////
    // view mode things
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

    // notebook management:
    RCloud.UI.shortcut_manager.add([{
        category: 'Notebook Management',
        id: 'notebook_cell',
        description: 'Saves the current notebook',
        keys: [
            ['command', 's'],
            ['ctrl', 's']
        ],
        action: function() { if(RCloud.UI.navbar.get('save_notebook')) { shell.save_notebook(); } }
    }, {
        category: 'Notebook Management',
        id: 'select_all',
        description: 'Select all',
        keys: [
            ['command', 'a'],
            ['ctrl', 'a']
        ],
        action: function() {
            var selection = window.getSelection();
            selection.removeAllRanges();
            var range = new Range();
            range.selectNode(document.getElementById('output'));
            range.setStartAfter($('.response')[0]);
            selection.addRange(range);
        }
    }, {
        category: 'Notebook Management',
        id: 'history_undo',
        description: 'Steps back through the notebook\'s history',
        keys: [
            ['command', 'z'],
            ['ctrl', 'z']
        ],
        action: function() { editor.step_history_undo(); }
    }, {
        category: 'Notebook Management',
        id: 'history_redo',
        description: 'Steps forwards through the notebook\'s history',
        keys: [
            ['ctrl', 'y'],
            ['command', 'shift', 'z']
        ],
        action: function() { editor.step_history_redo(); }
    }]);

    // cell management:
    RCloud.UI.shortcut_manager.add([{
        category: 'Cell Management',
        id: 'remove_cells',
        description: 'Removes selected cells',
        keys: [
            ['del']
        ],
        action: function() { shell.notebook.controller.remove_selected_cells(); }
    }, {
        category: 'Cell Management',
        id: 'invert_cells',
        description: 'Invert selected cells',
        keys: [
            ['ctrl', 'shift', 'i'],
            ['command', 'shift', 'i']
        ],
        action: function() { shell.notebook.controller.invert_selected_cells(); }
    }, {
        category: 'Cell Management',
        id: 'crop_cells',
        description: 'Crop cells',
        keys: [
            ['ctrl', 'k'],
            ['command', 'k']
        ],
        action: function() { shell.notebook.controller.crop_cells(); }
    }]);

    // general:
    RCloud.UI.shortcut_manager.add([{
        category: 'General',
        id: 'show_help',
        description: 'Show shortcuts help',
        keys: [
            ['?']
        ],
        action: function() { RCloud.UI.shortcut_dialog.show(); }
    }]);

};
