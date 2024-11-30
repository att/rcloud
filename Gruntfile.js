module.exports = function (grunt) {
    'use strict';

    var sass = require('sass');
    require('load-grunt-tasks')(grunt, {
        pattern: 'grunt-*'
    });

    var config = {
        src: 'src',
        version: grunt.file.read('VERSION').split('\n')[0],
        pkg: require('./package.json'),
        bundleFiles: [
            "htdocs/js/rcloud.js",
            "htdocs/js/rclient.js",
            "htdocs/js/url_utils.js",
            "htdocs/js/ui_utils.js",
            "htdocs/js/utils.js",
            "htdocs/js/extension.js",
            "htdocs/js/bootstrap_utils.js",
            "htdocs/js/notebook/_notebook_begin.js",
            "htdocs/js/notebook/_buffer_begin.js",
            "htdocs/js/notebook/_cell_begin.js",
            "htdocs/js/notebook/_asset_begin.js",
            "htdocs/js/notebook/buffer_model.js",
            "htdocs/js/notebook/asset_view.js",
            "htdocs/js/notebook/asset_model.js",
            "htdocs/js/notebook/asset_controller.js",
            "htdocs/js/notebook/cell_view.js",
            "htdocs/js/notebook/cell_model.js",
            "htdocs/js/notebook/cell_controller.js",
            "htdocs/js/notebook/cell_processors.js",
            "htdocs/js/notebook/notebook_view.js",
            "htdocs/js/notebook/notebook_model.js",
            "htdocs/js/notebook/notebook_controller.js",
            "htdocs/js/notebook/util.js",
            "htdocs/js/discovery_model.js",
            "htdocs/js/notebook.js",
            "htdocs/js/session.js",
            "htdocs/js/language.js",
            "htdocs/js/upload_utils.js",
            "htdocs/js/ui/_begin.js",
            "htdocs/js/event.js",
            "htdocs/js/ui/advanced_menu.js",
            "htdocs/js/ui/cell_commands.js",
            "htdocs/js/ui/column.js",
            "htdocs/js/ui/column_sizer.js",
            "htdocs/js/ui/command_prompt.js",
            "htdocs/js/ui/comments_frame.js",
            "htdocs/js/ui/configure_readonly.js",
            "htdocs/js/ui/fatal_dialog.js",
            "htdocs/js/ui/find_replace.js",
            "htdocs/js/ui/shortcut_manager.js",
            "htdocs/js/ui/shortcut_dialog.js",
            "htdocs/js/ui/ace_shortcuts.js",
            "htdocs/js/ui/help_frame.js",
            "htdocs/js/ui/image_manager.js",
            "htdocs/js/ui/import_export.js",
            "htdocs/js/ui/pull_and_replace.js",
            "htdocs/js/ui/init.js",
            "htdocs/js/ui/left_panel.js",
            "htdocs/js/ui/load_options.js",
            "htdocs/js/ui/menus.js",
            "htdocs/js/ui/message_dialog.js",
            "htdocs/js/ui/middle_column.js",
            "htdocs/js/ui/navbar.js",
            "htdocs/js/ui/notebook_commands.js",
            "htdocs/js/ui/selection_bar.js",
            "htdocs/js/ui/notebook_title.js",
            "htdocs/js/ui/notebooks_frame.js",
            "htdocs/js/ui/output_context.js",
            "htdocs/js/ui/panel_loader.js",
            "htdocs/js/ui/progress.js",
            "htdocs/js/ui/prompt_history.js",
            "htdocs/js/ui/right_panel.js",
            "htdocs/js/ui/processing_queue.js",
            "htdocs/js/ui/run_button.js",
            "htdocs/js/ui/stop_button.js",
            "htdocs/js/ui/scratchpad.js",
            "htdocs/js/ui/search.js",
            "htdocs/js/ui/session_pane.js",
            "htdocs/js/ui/settings_frame.js",
            "htdocs/js/ui/share_button.js",
            "htdocs/js/ui/upload.js",
            "htdocs/js/ui/upload_frame.js",
            "htdocs/js/ui/thumb_dialog.js",
            "htdocs/js/ui/notebook_protection_logger.js",
            "htdocs/js/ui/notebook_protection.js",
            "htdocs/js/ui/discovery_page.js",
            "htdocs/js/tree/notebook_tree_search_service.js",
            "htdocs/js/ui/incremental_search.js",
            "htdocs/js/tree/date_filter.js",
            "htdocs/js/tree/notebook_tree_model.js",
            "htdocs/js/tree/notebook_tree_view.js",
            "htdocs/js/tree/notebook_tree_controller.js"
        ],
        aceFiles: [
            "htdocs/lib/js/ace/_begin.js",
            "htdocs/lib/js/ace/ace.js",
            "htdocs/lib/js/ace/theme-chrome.js",
            "htdocs/lib/js/ace/mode-r.js",
            "htdocs/lib/js/ace/rmarkdown_highlight_rules.js",
            "htdocs/lib/js/ace/rmarkdown.js",
            "htdocs/lib/js/ace/auto_brace_insert.js",
            "htdocs/lib/js/ace/r_highlight_rules.js",
            "htdocs/lib/js/ace/r_matching_brace_outdent.js",
            "htdocs/lib/js/ace/r_code_model.js",
            "htdocs/lib/js/ace/r_scope_tree.js",
            "htdocs/lib/js/ace/jupyter_completions.js",
            "htdocs/lib/js/ace/tex_highlight_rules.js",
            "htdocs/lib/js/ace/mode-markdown.js",
            "htdocs/lib/js/ace/sweave_background_highlighter.js",
            "htdocs/lib/js/ace/ext-language_tools.js",
            "htdocs/lib/js/ace/ext-searchbox.js",
            "htdocs/lib/js/ace/mode-javascript-jup.js",
            "htdocs/lib/js/ace/mode-python.js",
            "htdocs/lib/js/ace/mode-perl.js",
            "htdocs/lib/js/ace/mode-julia.js",
            "htdocs/lib/js/ace/mode-java.js",
            "htdocs/lib/js/ace/mode-golang.js",
            "htdocs/lib/js/ace/mode-scala.js",
            "htdocs/lib/js/ace/mode-sh.js",
            "htdocs/lib/js/ace/_end.js"
        ],
        mergerFiles: [
            "htdocs/js/ui/notebook_merger/notebook_merge.js",
            "htdocs/js/ui/notebook_merger/diff_engine.js",
            "htdocs/js/ui/notebook_merger/merger_model.js",
            "htdocs/js/ui/notebook_merger/merger_view.js",
            "htdocs/js/ui/notebook_merger/merger_controller.js"
        ]
    };

    grunt.initConfig({
        conf: config,
        sass: {
            all: {
                options: {
        implementation: sass,
                    style: 'compressed',
                    sourceMap: true
                },
                files: [{
                    expand: true,
                    cwd: './htdocs/sass',
                    src: '*.scss',
                    dest: './htdocs/css',
                    ext: '.css'
                }],
                trace: true
            }
        },
        concat: {
            options: {
                process: true,
                sourceMap: true
            },
            bundle: {
                src: '<%= conf.bundleFiles %>',
                dest: 'htdocs/js/rcloud_bundle.js'
            },
            ace: {
                src: '<%= conf.aceFiles %>',
                dest: 'htdocs/lib/ace_bundle.js'
            },
            merger: {
                src: '<%= conf.mergerFiles %>',
                dest: 'htdocs/js/merger_bundle.js'
            }
        },
        uglify: {
            options: {
                mangle: true,
                compress: true,
                sourceMap: true,
                banner: '<%= conf.banner %>'
            },
            bundle: {
                src: 'htdocs/js/rcloud_bundle.js',
                dest: 'htdocs/js/rcloud_bundle.min.js'
            },
            ace: {
                src: 'htdocs/lib/ace_bundle.js',
                dest: 'htdocs/lib/ace_bundle.min.js'
            },
            merger: {
                src: 'htdocs/js/merger_bundle.js',
                dest: 'htdocs/js/merger_bundle.min.js'
            }
        },
        compress: {
            bundle: {
                src: 'htdocs/js/rcloud_bundle.js',
                dest: 'htdocs/js/rcloud_bundle.js.gz'
            },
            ace: {
                src: 'htdocs/lib/ace_bundle.js',
                dest: 'htdocs/lib/ace_bundle.js.gz'
            },
            merger: {
                src: 'htdocs/js/merger_bundle.js',
                dest: 'htdocs/js/merger_bundle.js.gz'
            },
            bundle_min: {
                src: 'htdocs/js/rcloud_bundle.min.js',
                dest: 'htdocs/js/rcloud_bundle.min.js.gz'
            },
            ace_min: {
                src: 'htdocs/lib/ace_bundle.min.js',
                dest: 'htdocs/lib/ace_bundle.min.js.gz'
            },
            merger_min: {
                src: 'htdocs/js/merger_bundle.min.js',
                dest: 'htdocs/js/merger_bundle.min.js.gz'
            }
        }
    });

    // task aliases
    grunt.registerTask('build', ['sass', 'concat', 'uglify', 'compress']);
    grunt.registerTask('default', ['build']);
};
