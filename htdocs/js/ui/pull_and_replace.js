RCloud.UI.pull_and_replace = (function() {
	
	var dialog_ = $('#pull-changes-dialog'),
		select_by_ = $('#pull-changes-by'),
		btn_cancel_ = dialog_.find('.btn-cancel'),
		btn_close_ = dialog_.find('.close'),
		btn_pull_ = dialog_.find('.btn-primary'),
		method_,
		show_dialog = function() {
			rcloud.get_notebook_property(shell.gistname(), 'pull-changes-by').then(function(val) {
				if(val) {
					update_pulled_by(val);
				}

				dialog_.modal({
	                keyboard: false
	            });
			});
		},
		update_pulled_by = function(pulled_method) {
			method_ = pulled_method ? pulled_method : 'id';
			$(dialog_).find('div[data-by]').hide();
			$(dialog_).find('div[data-by="' + pulled_method + '"]').show();
		},
		do_pull = function() {
			console.log('Notebook pulled');
			rcloud.set_notebook_property(shell.gistname(), 'pull-changes-by', method_);
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

			btn_cancel_.click(function() { dialog_.modal('hide'); });
			btn_close_.click(function() { dialog_.modal('hide'); });

			select_by_.change(function() {
				update_pulled_by($(this).val());
			});

			btn_pull_.click(do_pull);

            return this;
        }
	};
})();