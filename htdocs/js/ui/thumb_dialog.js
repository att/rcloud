RCloud.UI.thumb_dialog = (function() {

    var $dialog_ = $('#thumb-dialog'),
        $drop_zone_ = $('#thumb-drop-overlay'),
        $drop_zone_remove = $drop_zone_.find('.icon-remove'),
        $current_thumb_ = $('#current-thumb'),
        dropped_file_ = null,
        thumb_filename_ = 'thumb.png';

    var add_image = function(selector, img_src) {
        if(selector.find('img').length === 0) {
            selector.append($('<img/>'));
        }

        selector.find('img').attr({
            'src' : img_src
        });

        return selector;
    };

    var reset = function() {
        // remove selected thumb
        $drop_zone_.removeClass('active dropped');
        $drop_zone_.find('img').remove();
    };

    var set_no_current_thumb = function() {
        $current_thumb_.children().remove().end().hide();
    };

    var result = {
        init: function() {
            $dialog_.find('.btn-cancel').on('click', function() { 
                $dialog_.modal('hide'); 
                reset();
            });

            $dialog_.find('.btn-primary').on('click', function() { 
                $dialog_.modal('hide'); 

                if(dropped_file_) {
                    //dropped_file_.name = 'thumb.png';
                    RCloud.UI.upload_with_alerts(true, {files: [dropped_file_] })
                        .catch(function() {}); // we have special handling for upload errors
                }

                reset();
            });

            $drop_zone_remove.click(function() {
                $drop_zone_.removeClass('dropped');
                $drop_zone_.find('img').remove();
                dropped_file_ = null;
            });

            this.setup_asset_drop();
        },
        show: function() {

            // if there is already a thumb asset:
            if(!_.isUndefined(shell.notebook.model.get_asset(thumb_filename_))) {
                add_image($current_thumb_, ['notebook.R', shell.gistname(), thumb_filename_].join('/'))
                    .show();
            } else {
                set_no_current_thumb();
            }

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

            $drop_zone_.bind({
                drop: function (e) {

                    e = e.originalEvent || e;
                    var files = (e.files || e.dataTransfer.files);

                    if(files.length === 1 && files[0].type === 'image/png') {
                        // process:
                        dropped_file_ = files[0];

                        var reader = new FileReader();
                        reader.onload = function(e) {
                            $drop_zone_.addClass('dropped');
                            add_image($drop_zone_, e.target.result);
                        }

                        reader.readAsDataURL(dropped_file_);
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
