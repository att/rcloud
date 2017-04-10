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
            helper: 'clone',
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

    // shortcuts:
    RCloud.UI.shortcut_manager.init();
    RCloud.UI.ace_shortcuts.init();

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
    RCloud.UI.pull_and_replace.init();

    //////////////////////////////////////////////////////////////////////////
    // view mode things
    ui_utils.prevent_backspace($(document));

    $(document).on('copy', function(e) {
        // only capture for cells and not ace elements
        if($(arguments[0].target).hasClass('ace_text-input') ||
           !$(arguments[0].target).closest($("#output")).size())
            return;

        ui_utils.select_allowed_elements();
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
        description: 'Save the current notebook',
        keys: {
            mac: [ 
                ['command', 's']
            ],
            win: [
                ['ctrl', 's']
            ]
        },
        modes: ['writeable'],
        action: function() { if(RCloud.UI.navbar.get('save_notebook')) { shell.save_notebook(); } }
    }, {
        category: 'Notebook Management',
        id: 'select_all',
        description: 'Select all',
        keys: {
            mac: [
                ['command', 'a']
            ],
            win: [
                ['ctrl', 'a']
            ]
        },
        modes: ['writeable'],
        action: function(e) {

            if(!$(e.target).parents('#find-form').length) {
                var selection = window.getSelection();
                selection.removeAllRanges();
                var range = new Range();
                range.selectNode(document.getElementById('output'));
                range.setStartAfter($('.response')[0]);
                selection.addRange(range);
            } else {
                $(e.target).select();
            }

        }
    }, {
        category: 'Notebook Management',
        id: 'history_undo',
        description: 'Step back through the notebook\'s history',
        keys: {
            mac: [
                ['command', 'alt', 'z']
            ],
            win: [
                ['ctrl', 'alt', 'z']
            ]
        },
        on_page: ['edit'],
        action: function() { editor.step_history_undo(); }
    }, {
        category: 'Notebook Management',
        id: 'history_redo',
        description: 'Step forwards through the notebook\'s history',
        keys: {
            mac: [
                ['command', 'shift', 'z']
            ],
            win: [
                ['ctrl', 'y']
            ]
        },
        on_page: ['edit'],
        action: function() { editor.step_history_redo(); }
    }, {
        category: 'Notebook Management',
        id: 'history_revert',
        description: 'Revert a notebook',
        keys: {
            mac: [
                ['command', 'e']
            ],
            win: [
                ['ctrl', 'e']
            ]
        },
        on_page: ['edit'],
        is_active: function() {
            return shell.notebook.controller.is_mine() && shell.notebook.model.read_only();
        },
        action: function() {
            if(this.is_active()) {
                editor.revert_notebook(shell.notebook.controller.is_mine(), shell.gistname(), shell.version());
            }
        }
    }, {
        id: 'notebook_run_all',
        description: 'Run all',
        keys: {
            win_mac: [
                ['ctrl', 'shift', 'enter']
            ]
        },
        action: function() { RCloud.UI.run_button.run(); }
    }]);

    // cell management:
    RCloud.UI.shortcut_manager.add([{
        category: 'Cell Management',
        id: 'remove_cells',
        description: 'Remove selected cells',
        keys: {
            mac: [
                ['command', 'backspace']
            ],
            win: [
                ['ctrl', 'del'],
                ['ctrl', 'backspace']
            ]
        },
        modes: ['writeable'],
        action: function() { shell.notebook.controller.remove_selected_cells(); }
    }, {
        category: 'Cell Management',
        id: 'invert_cells',
        description: 'Invert selected cells',
        keys: {
            mac: [
                ['command', 'shift', 'i']
            ],
            win: [
                ['ctrl', 'shift', 'i']
            ]
        },
        modes: ['writeable'],
        action: function() {
            shell.notebook.controller.invert_selected_cells();
            $(':focus').blur();
        }
    }, {
        category: 'Cell Management',
        id: 'crop_cells',
        description: 'Crop cells',
        keys: {
            mac: [
                ['command', 'k']
            ],
            win: [
                ['ctrl', 'k']
            ]
        },
        modes: ['writeable'],
        action: function() { shell.notebook.controller.crop_cells(); }
    }, {
        category: 'Cell Management',
        id: 'arrow_next_cell_down',
        description: 'Enter next cell (from last line of current)',
        keys: {
            win_mac: [
                ['down']
            ]
        },
        modes: ['writeable']
    }, {
        category: 'Cell Management',
        id: 'arrow_previous_cell_up',
        description: 'Enter previous cell (from first line of current)',
        keys: {
            win_mac: [
                ['up']
            ]
        },
        modes: ['writeable']
    }, {
        category: 'Cell Management',
        id: 'goto_previous_cell',
        description: 'Go to previous cell',
        keys: {
            win_mac: [
                ['ctrl', 'shift', '<']
            ]
        },
        modes: ['writeable']
    }, {
        category: 'Cell Management',
        id: 'goto_next_cell',
        description: 'Go to next cell',
        keys: {
            win_mac: [
                ['ctrl', 'shift', '>']
            ]
        },
        modes: ['writeable']
    }, {
        category: 'Cell Management',
        id: 'insert_cell_before',
        description: 'Insert cell before current',
        keys: {
            win: [
                ['ctrl', '[']
            ],
            mac: [
                ['command', '[']
            ]
        },
        modes: ['writeable'],
        action: function() { }
    }, {
        category: 'Cell Management',
        id: 'insert_cell_after',
        description: 'Insert cell after current',
        keys: {
            win: [
                ['ctrl', ']']
            ],
            mac: [
                ['command', ']']
            ]
        },
        modes: ['writeable'],
        action: function() { }
    }, {
        category: 'Cell Management',
        id: 'cell_run_from_here',
        description: 'Run from this cell on',
        keys: {
            win_mac: [
                ['shift', 'alt', 'enter']
            ]
        },
        click_keys: {
            target: 'Play button',
            win_mac: [
                ['shift']
            ]
        },
        modes: ['writeable']
    }, {
        category: 'Cell Management',
        id: 'blur_cell',
            description: 'Blur Cell/Command Prompt',
        keys: {
            win_mac: [
                ['esc']
            ]
        },
        modes: ['writeable']
    }, {
        category: 'Cell Management',
        id: 'select_cell',
        description: 'Select individual cell',
        click_keys: {
            target: 'Cell title'
        }
    }, {
        category: 'Cell Management',
        id: 'toggle_select_cell',
        description: 'Toggle cell selection',
        click_keys: {
            target: 'Cell title',
            win: ['ctrl'],
            mac: ['command']
        }
    }, {
        category: 'Cell Management',
        id: 'select_cell_range',
        description: 'Select range of cells',
        click_keys: {
            target: 'Cell title',
            win_mac: ['shift']
        }
    }]);

    // general:
    RCloud.UI.shortcut_manager.add([{
        category: 'General',
        id: 'show_help',
        description: 'Show shortcuts help',
        keys: {
            win_mac: [
                ['?']
            ]
        },
        modes: ['writeable', 'readonly'],
        action: function(e) {
            RCloud.UI.shortcut_dialog.show();
        }
    }, {
        category: 'General',
        id: 'close_modal',
        description: 'Close dialog',
        keys: {
            win_mac: [
                ['esc']
            ]
        },
        ignore_clash: true,
        enable_in_dialogs: true,
        global: true,
        action: function() { $('.modal').modal('hide'); }
    }]);

};
