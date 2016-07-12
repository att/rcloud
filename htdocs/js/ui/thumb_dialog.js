RCloud.UI.thumb_dialog = (function() {

    var $dialog_ = $('#thumb-dialog'),
        $drop_zone_ = $('#thumb-drop-overlay'),
        $drop_zone_message_ = $drop_zone_.find('h1');

    var result = {
        init: function() {
            $dialog_.find('.btn-cancel').on('click', function() { 
                $dialog_.modal('hide'); 
            });

            $dialog_.find('.btn-primary').on('click', function() { 
                $dialog_.modal('hide'); 

                // todo: update the thumb.png asset:
            });

            this.setup_asset_drop();
        },
        show: function() {

            $drop_zone_.removeClass('active');

            $dialog_.modal({
                keyboard: true
            });
        },
        is_visible: function() {
            return $dialog_.is(':visible');
        },
        setup_asset_drop: function() {

            var that = this,
                showOverlay_;

            //prevent drag in rest of the page except asset pane and enable overlay on asset pane
            $(document).on('dragstart dragenter dragover', function (e) {

                if(!that.is_visible())
                    return;

                var dt = e.originalEvent.dataTransfer;

                if(!dt)
                    return;

                if (dt.types !== null && (dt.types.indexOf ?
                     (dt.types.indexOf('Files') != -1 && dt.types.indexOf('text/html') == -1) :
                     dt.types.contains('application/x-moz-file'))) {
                    if (!shell.notebook.model.read_only()) {
                        e.stopPropagation();
                        e.preventDefault();
                        $drop_zone_.addClass('active');
                        showOverlay_ = true;
                    } else {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }
            });

            $(document).on('drop dragleave', function (e) {

                if(!that.is_visible())
                    return;

                e.stopPropagation();
                e.preventDefault();
                showOverlay_ = false;
                setTimeout(function() {
                    if(!showOverlay_) {
                        $drop_zone_.removeClass('active');
                    }
                }, 100);
            });

            //allow asset drag from local to asset pane and highlight overlay for drop area in asset pane
            $drop_zone_.bind({
                drop: function (e) {

                    e = e.originalEvent || e;
                    var files = (e.files || e.dataTransfer.files);
                    var dt = e.dataTransfer;

                    if(files.length === 1 && files[0].type === 'image/png') {
                        // process:
                        console.log(files[0]);
                    }
                },
                "dragenter dragover": function(e) {
                    var dt = e.originalEvent.dataTransfer;
                    if(!shell.notebook.model.read_only())
                        dt.dropEffect = 'copy';
                }
            });
        }
    };

    return result;

})();
