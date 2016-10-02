RCloud.UI.pull_and_replace = (function() {
	
	var dialog_ = $('#pull-changes-dialog'),
		select_by_ = $('#pull-changes-by'),
		btn_cancel_ = dialog_.find('.btn-cancel'),
		btn_close_ = dialog_.find('.close'),
		btn_pull_ = dialog_.find('.btn-primary'),
		show = function() {
			dialog_.modal({
                keyboard: false
            });
		},
		update_change_by = function() {
			var by_method = select_by_.val();
			$(dialog_).find('div[data-by]').hide();
			$(dialog_).find('div[data-by="' + by_method + '"]').show();
		},
		do_pull = function() {
			console.log('Notebook pulled');
		};

	return {
		init: function() {
			RCloud.UI.advanced_menu.add({
 				pull_and_replace_notebook: {
                    sort: 3000,
                    text: "Pull and replace from notebook",
                    modes: ['edit'],
					action: function() {

						// initialise dialog UI state:
						update_change_by();
						dialog_.modal({ keyboard: true });
                    }
                }
            });

			btn_cancel_.click(function() { dialog_.modal('hide'); });
			btn_close_.click(function() { dialog_.modal('hide'); });

			select_by_.change(update_change_by);
			btn_pull_.click(do_pull);

            return this;
        }
	};
})();