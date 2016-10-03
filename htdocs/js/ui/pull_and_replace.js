RCloud.UI.pull_and_replace = (function() {
	
	var dialog_ = $('#pull-changes-dialog'),
		select_by_ = $('#pull-changes-by'),
		pull_notebook_file_ = $('#pull-notebook-file'),
		pull_notebook_url_ = $('#pull-notebook-url'),
		pull_notebook_id_ = $('#pull-notebook-id'),
		btn_cancel_ = dialog_.find('.btn-cancel'),
		btn_close_ = dialog_.find('.close'),
		btn_pull_ = dialog_.find('.btn-primary'),
		inputs_ = [pull_notebook_file_, pull_notebook_url_, pull_notebook_id_],
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
					update_pulled_by('id');
				}

				dialog_.modal({
	                keyboard: false
	            });
			});
		},
		update_pulled_by = function(pulled_method) {
			select_by_.val(pulled_method);
			$(dialog_).find('div[data-by]').hide();
			$(dialog_).find('div[data-by="' + pulled_method + '"]').show();
			update_pull_button_state();
		},
		do_pull = function() {
			console.log('Notebook pulled');
			// ['file', 'url', 'id'].forEach(function(type) {
			// 	$('pull-notebook-' + type).val('');
			// });
			rcloud.set_notebook_property(shell.gistname(), 'pull-changes-by', get_method() + ':' + get_input().val());
		},
		get_method = function() {
			return select_by_.val();
		},
		get_input = function() {
			return $('#pull-notebook-' + get_method());
		},
		update_pull_button_state = function() {
			ui_utils[(get_input().val() ? 'enable' : 'disable') + '_bs_button'](btn_pull_);
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
				button.click(function() { dialog_.modal('hide'); });
			});

			select_by_.change(function() {
				update_pulled_by($(this).val());
			});

			// inputs:
			inputs_.forEach(function(input) {
				input.bind(input.data('pull'), function() { setTimeout(update_pull_button_state, 0); });
			});

			btn_pull_.click(do_pull);

            return this;
        }
	};
})();