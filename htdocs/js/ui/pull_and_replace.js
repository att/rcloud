RCloud.UI.pull_and_replace = (function() {

    var dialog_ = $('#pull-changes-dialog'),
        select_by_ = $('#pull-changes-by'),
        pull_notebook_file_ = $('#pull-notebook-file'),
        pull_notebook_url_ = $('#pull-notebook-url'),
        pull_notebook_id_ = $('#pull-notebook-id'),
        btn_cancel_ = dialog_.find('.btn-cancel'),
        btn_close_ = dialog_.find('.close'),
        error_selector_ = '#pull-error',
        btn_pull_ = dialog_.find('.btn-primary'),
        inputs_ = [pull_notebook_file_, pull_notebook_url_, pull_notebook_id_],
        notebook_from_file_,
        same_notebook_error_ = 'You cannot pull from your current notebook; the source must be a different notebook.',
        invalid_notebook_id_error_ = 'Invalid notebook ID.',
        not_found_notebook_error_ = 'The notebook could not be found.',
        show_dialog = function() {
            rcloud.get_notebook_property(shell.gistname(), 'pull-changes-by').then(function(val) {
                if(val && val.indexOf(':') !== -1) {

                    // split and set:
                    var separatorIndex = val.indexOf(':');
                    var type = val.substring(0, separatorIndex);
                    var value = val.substring(separatorIndex + 1);

                    // update pulled by method:
                    update_pulled_by(type, value);
                }
                else {
                    update_pulled_by('url');
                }

                dialog_.modal({
                    keyboard: true
                });
            });
        },
        close_dialog = function() {

            // reset pulling state:
            reset_pulling_state();

            //
            inputs_.forEach(function(input) {
                input.val('');
            });

            notebook_from_file_ = undefined;

            // default to URL for the next time:
            update_pulled_by('url');

            dialog_.modal('hide');
        },
        update_pulled_by = function(pulled_method, value) {
            clear_error();
            select_by_.val(pulled_method);
            $(dialog_).find('div[data-by]').hide();
            $(dialog_).find('div[data-by="' + pulled_method + '"]').show();

            if(!_.isUndefined(value)) {
                // and set the value coming in:
                get_input().val(pulled_method === 'file' ? '' : value);
            }
        },
        upload_file = function(file) {
            Notebook.read_from_file(file, {
                on_load_end: function() {
                    // TODO
                },
                on_error: function(message) {
                    notebook_from_file_ = undefined;
                    show_error(message);
                },
                on_notebook_parsed: function(read_notebook) {
                    notebook_from_file_ = read_notebook;
                }
            });
        },
        do_pull = function() {
            function get_notebook_by_id(id) {
                if(!id.match(new RegExp('^[0-9a-f]+$'))) {
                    return Promise.reject(new Error(invalid_notebook_id_error_));
                } else if(id.toLowerCase() === shell.gistname().toLowerCase()) {
                    return Promise.reject(new Error(same_notebook_error_));
                }
                return rcloud.get_notebook(id);
            };

            var method = get_method();

            var get_notebook_func, notebook;

            update_when_pulling();

            if(method === 'id') {
                get_notebook_func = get_notebook_by_id;
            } else if(method === 'file') {
                get_notebook_func = function() {
                    if(notebook_from_file_) {
                        return Promise.resolve(notebook_from_file_);
                    } else {
                        return Promise.reject(new Error('No file to upload'));
                    }
                };
            } else if(method === 'url') {
                get_notebook_func = function(url) {
                    var id = RCloud.utils.get_notebook_from_url(url);
                    if(!id) {
                        return Promise.reject(new Error('Invalid URL'));
                    } else return get_notebook_by_id(id);
                };
            }

            var value = get_input().val();
            get_notebook_func(value).then(function(notebook) {
                return Promise.all([
                    rcloud.set_notebook_property(shell.gistname(), 'pull-changes-by', method + ':' + value),
                    editor.pull_and_replace_notebook(notebook).then(function() {
                        close_dialog();
                    })
                ]);
            }).catch(function(e) {
                reset_pulling_state();

                if(e.message.indexOf('Not Found (404)') !== -1) {
                    show_error(not_found_notebook_error_);
                } else {
                    show_error(e.message);
                }
            });

        },
        get_method = function() {
            return select_by_.val();
        },
        get_input = function() {
            return $('#pull-notebook-' + get_method());
        },
        clear_error = function() {
            $(error_selector_).remove();
        },
        show_error = function(errorText) {
            clear_error();

            $('<div />', {
                id: error_selector_.substring(1),
                text: errorText
            }).appendTo($(dialog_).find('div[data-by="' + get_method() + '"]'));

        },
        has_error = function() {
            return $(error_selector_).length;
        },
        update_when_pulling = function() {
            btn_pull_.text('Pulling');
            dialog_.addClass('pulling');
        },
        reset_pulling_state = function() {
            btn_pull_.text('Pull');
            dialog_.removeClass('pulling');
        };

    return {
        init: function() {
            RCloud.UI.advanced_menu.add({
                 pull_and_replace_notebook: {
                    sort: 3000,
                    text: "Pull and Replace Notebook",
                    modes: ['edit'],
                    disabled_reason: "You can't pull and replace into a read only notebook",
                    action: function() {
                        show_dialog();
                    }
                }
            });

            [btn_cancel_, btn_close_].forEach(function(button) {
                button.click(close_dialog);
            });

            select_by_.change(function() {
                pull_notebook_file_.val(null);
                update_pulled_by($(this).val());
            });

            pull_notebook_file_.click(function() {
                clear_error();
                pull_notebook_file_.val(null);
                notebook_from_file_ = undefined;
            }).change(function() {
                upload_file(pull_notebook_file_[0].files[0]);
            });

            [pull_notebook_url_, pull_notebook_id_].forEach(function(control) {
                control.keydown(function(e) {
                    if(e.keyCode === $.ui.keyCode.ENTER) {
                        do_pull();
                        e.preventDefault();
                    }
                });
            });

            btn_pull_.click(do_pull);

            return this;
        }
    };
})();
