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
		show_dialog = function() {
			rcloud.get_notebook_property(shell.gistname(), 'pull-changes-by').then(function(val) {
				if(val && val.indexOf(':') !== -1) {

					// split and set:
					var separatorIndex = val.indexOf(':');
					var type = val.substring(0, separatorIndex);
					var value = val.substring(separatorIndex + 1);

					// they'll need to upload again if it's a file:
					get_input().val(type === 'file' ? '' : value);
					update_pulled_by(type);

				} else {
					// default to id:
					update_pulled_by('url');
				}

				dialog_.modal({
	                keyboard: false
	            });
			});
		},
		close_dialog = function() {

			// reset pulling state:
			reset_pulling_state();

			dialog_.modal('hide');
		},
		update_pulled_by = function(pulled_method) {
			clear_error();
			select_by_.val(pulled_method);
			$(dialog_).find('div[data-by]').hide();
			$(dialog_).find('div[data-by="' + pulled_method + '"]').show();
			update_pull_button_state();
		},
		upload_file = function(file) {
			Notebook.read_from_file(file, {
                on_load_end: function() {
                    // TODO
                },
                on_error: function(message) {
                    show_error(message);
                },
                on_notebook_parsed: function(read_notebook) {
                    notebook_from_file_ = read_notebook;
                    update_pull_button_state();
                }
            });
		},
		do_pull = function() {

			update_when_pulling();

			var method = get_method(),
				value = get_input().val();
			
			var get_notebook_func, notebook;

			if(method === 'id') {
				get_notebook_func = function() { return rcloud.get_notebook(value); }
			} else if(method === 'file') {
				get_notebook_func = function() { return Promise.resolve(notebook_from_file_); }
 			} else if(method === 'url') {
 				get_notebook_func = function() { 
 					var id = RCloud.utils.get_notebook_from_url(value);
 					if(!id) {
 						return Promise.reject(new Error('Invalid URL'));	
 					} else if(id === shell.gistname()) {
 						return Promise.reject(new Error(same_notebook_error_));
 					}else {
 						return rcloud.get_notebook(id);
 					}
 				}
 			}

			get_notebook_func().then(function(notebook) {
				rcloud.set_notebook_property(shell.gistname(), 'pull-changes-by', method + ':' + value);
				shell.pull_and_replace_notebook(notebook).then(function() {
					close_dialog();
				});
			}).catch(function(e) {
				reset_pulling_state();
				show_error(e.message);
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

			update_pull_button_state();
		},
		update_when_pulling = function() {
			btn_pull_.text('Pulling');
			dialog_.addClass('pulling');
		},
		reset_pulling_state = function() {
			btn_pull_.text('Pull');
			dialog_.removeClass('pulling');
		},
		update_pull_button_state = function() {
			var enable = false;

			if((get_method() === 'id' && get_input().val() != shell.gistname() && get_input().val()) ||
				(get_method() !== 'id' && get_input().val()) && !$(error_selector_).is(':visible')) {
				enable = true;
			}

			ui_utils[(enable ? 'enable' : 'disable') + '_bs_button'](btn_pull_);
		};

	return {
		init: function() {
			RCloud.UI.advanced_menu.add({
 				pull_and_replace_notebook: {
                    sort: 3000,
                    text: "Pull and replace from notebook",
                    modes: ['edit'],
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

			// inputs:
			inputs_.forEach(function(input) {
				input.bind(input.data('pull'), function() { 
					setTimeout(function() {

						if(get_method() === 'id' && get_input().val() === shell.gistname()) {
							show_error(same_notebook_error_);
						} else {
							clear_error();
						}

						update_pull_button_state();
					}, 0); 
				});
			});

			pull_notebook_file_.click(function() {
				clear_error();
				pull_notebook_file_.val(null);
				update_pull_button_state();
			}).change(function() {
				upload_file(pull_notebook_file_[0].files[0]); 
			});

			[pull_notebook_url_, pull_notebook_id_].forEach(function(control) {
				control.keydown(function(e) {
					if(e.keyCode === $.ui.keyCode.ENTER && !btn_pull_.hasClass('disabled')) {
						do_pull();
					}
				});
			});

			btn_pull_.click(do_pull);

            return this;
        }
	};
})();
