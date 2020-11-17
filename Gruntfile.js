module.exports = function (grunt) {
    'use strict';

    var sass = require('node-sass');
    require('load-grunt-tasks')(grunt, {
        pattern: 'grunt-*'
    });

    var config = {
        src: 'src',
        version: grunt.file.read('VERSION').split('\n')[0],
        pkg: require('./package.json'),
        bundleFiles: [
            "src/js/rcloud.js",
            "src/js/rclient.js",
            "src/js/url_utils.js",
            "src/js/ui_utils.js",
            "src/js/utils.js",
            "src/js/extension.js",
            "src/js/bootstrap_utils.js",
            "src/js/notebook/_notebook_begin.js",
            "src/js/notebook/_buffer_begin.js",
            "src/js/notebook/_cell_begin.js",
            "src/js/notebook/_asset_begin.js",
            "src/js/notebook/buffer_model.js",
            "src/js/notebook/asset_view.js",
            "src/js/notebook/asset_model.js",
            "src/js/notebook/asset_controller.js",
            "src/js/notebook/cell_view.js",
            "src/js/notebook/cell_model.js",
            "src/js/notebook/cell_controller.js",
            "src/js/notebook/cell_processors.js",
            "src/js/notebook/notebook_view.js",
            "src/js/notebook/notebook_model.js",
            "src/js/notebook/notebook_controller.js",
            "src/js/notebook/util.js",
            "src/js/discovery_model.js",
            "src/js/notebook.js",
            "src/js/session.js",
            "src/js/language.js",
            "src/js/upload_utils.js",
            "src/js/ui/_begin.js",
            "src/js/event.js",
            "src/js/ui/advanced_menu.js",
            "src/js/ui/cell_commands.js",
            "src/js/ui/column.js",
            "src/js/ui/column_sizer.js",
            "src/js/ui/command_prompt.js",
            "src/js/ui/comments_frame.js",
            "src/js/ui/configure_readonly.js",
            "src/js/ui/fatal_dialog.js",
            "src/js/ui/find_replace.js",
            "src/js/ui/shortcut_manager.js",
            "src/js/ui/shortcut_dialog.js",
            "src/js/ui/ace_shortcuts.js",
            "src/js/ui/help_frame.js",
            "src/js/ui/image_manager.js",
            "src/js/ui/import_export.js",
            "src/js/ui/pull_and_replace.js",
            "src/js/ui/init.js",
            "src/js/ui/left_panel.js",
            "src/js/ui/load_options.js",
            "src/js/ui/menus.js",
            "src/js/ui/message_dialog.js",
            "src/js/ui/middle_column.js",
            "src/js/ui/navbar.js",
            "src/js/ui/notebook_commands.js",
            "src/js/ui/selection_bar.js",
            "src/js/ui/notebook_title.js",
            "src/js/ui/notebooks_frame.js",
            "src/js/ui/output_context.js",
            "src/js/ui/panel_loader.js",
            "src/js/ui/progress.js",
            "src/js/ui/prompt_history.js",
            "src/js/ui/right_panel.js",
            "src/js/ui/processing_queue.js",
            "src/js/ui/run_button.js",
            "src/js/ui/stop_button.js",
            "src/js/ui/scratchpad.js",
            "src/js/ui/search.js",
            "src/js/ui/session_pane.js",
            "src/js/ui/settings_frame.js",
            "src/js/ui/share_button.js",
            "src/js/ui/upload.js",
            "src/js/ui/upload_frame.js",
            "src/js/ui/thumb_dialog.js",
            "src/js/ui/notebook_protection_logger.js",
            "src/js/ui/notebook_protection.js",
            "src/js/ui/discovery_page.js",
            "src/js/tree/notebook_tree_search_service.js",
            "src/js/ui/incremental_search.js",
            "src/js/tree/date_filter.js",
            "src/js/tree/notebook_tree_model.js",
            "src/js/tree/notebook_tree_view.js",
            "src/js/tree/notebook_tree_controller.js"
        ],
        aceFiles: [
            "lib/js/ace/_begin.js",
            "lib/js/ace/ace.js",
            "lib/js/ace/theme-chrome.js",
            "lib/js/ace/mode-r.js",
            "lib/js/ace/rmarkdown_highlight_rules.js",
            "lib/js/ace/rmarkdown.js",
            "lib/js/ace/auto_brace_insert.js",
            "lib/js/ace/r_highlight_rules.js",
            "lib/js/ace/r_matching_brace_outdent.js",
            "lib/js/ace/r_code_model.js",
            "lib/js/ace/r_scope_tree.js",
            "lib/js/ace/jupyter_completions.js",
            "lib/js/ace/tex_highlight_rules.js",
            "lib/js/ace/mode-markdown.js",
            "lib/js/ace/sweave_background_highlighter.js",
            "lib/js/ace/ext-language_tools.js",
            "lib/js/ace/ext-searchbox.js",
            "lib/js/ace/mode-javascript-jup.js",
            "lib/js/ace/mode-python.js",
            "lib/js/ace/mode-perl.js",
            "lib/js/ace/mode-julia.js",
            "lib/js/ace/mode-java.js",
            "lib/js/ace/mode-golang.js",
            "lib/js/ace/mode-scala.js",
            "lib/js/ace/mode-sh.js",
            "lib/js/ace/_end.js"
        ],
        mergerFiles: [
            "src/js/ui/notebook_merger/notebook_merge.js",
            "src/js/ui/notebook_merger/diff_engine.js",
            "src/js/ui/notebook_merger/merger_model.js",
            "src/js/ui/notebook_merger/merger_view.js",
            "src/js/ui/notebook_merger/merger_controller.js"
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
                    cwd: './src/sass',
                    src: '*.scss',
                    dest: './dist/rcloud/htdocs/css',
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
                dest: 'dist/rcloud/htdocs/js/rcloud_bundle.js'
            },
            ace: {
                src: '<%= conf.aceFiles %>',
                dest: 'dist/rcloud/htdocs/lib/ace_bundle.js'
            },
            merger: {
                src: '<%= conf.mergerFiles %>',
                dest: 'dist/rcloud/htdocs/js/merger_bundle.js'
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
                src: 'dist/rcloud/htdocs/js/rcloud_bundle.js',
                dest: 'dist/rcloud/htdocs/js/rcloud_bundle.min.js'
            },
            ace: {
                src: 'dist/rcloud/htdocs/lib/ace_bundle.js',
                dest: 'dist/rcloud/htdocs/lib/ace_bundle.min.js'
            },
            merger: {
                src: 'dist/rcloud/htdocs/js/merger_bundle.js',
                dest: 'dist/rcloud/htdocs/js/merger_bundle.min.js'
            }
        },
        compress: {
            bundle: {
                src: 'dist/rcloud/htdocs/js/rcloud_bundle.js',
                dest: 'dist/rcloud/htdocs/js/rcloud_bundle.js.gz'
            },
            ace: {
                src: 'dist/rcloud/htdocs/lib/ace_bundle.js',
                dest: 'dist/rcloud/htdocs/lib/ace_bundle.js.gz'
            },
            merger: {
                src: 'dist/rcloud/htdocs/js/merger_bundle.js',
                dest: 'dist/rcloud/htdocs/js/merger_bundle.js.gz'
            },
            bundle_min: {
                src: 'dist/rcloud/htdocs/js/rcloud_bundle.min.js',
                dest: 'dist/rcloud/htdocs/js/rcloud_bundle.min.js.gz'
            },
            ace_min: {
                src: 'dist/rcloud/htdocs/lib/ace_bundle.min.js',
                dest: 'dist/rcloud/htdocs/lib/ace_bundle.min.js.gz'
            },
            merger_min: {
                src: 'dist/rcloud/htdocs/js/merger_bundle.min.js',
                dest: 'dist/rcloud/htdocs/js/merger_bundle.min.js.gz'
            }
        }
    });

    // task aliases
    grunt.registerTask('build', ['sass', 'concat', 'uglify', 'compress']);
    grunt.registerTask('default', ['build']);
};
