RCloud.UI.thumb_dialog = (function() {

    var $dialog_ = $('#thumb-dialog'),
        $drop_zone_ = $('#thumb-drop-overlay'),
        $instruction_ = $drop_zone_.find('.inner'),
        $footer_ = $dialog_.find('.modal-footer'),
        $drop_zone_remove_ = $('#thumb-remove'),
        $thumb_upload_ = $('#thumb-upload'),
        $selected_file_ = $('#selected-file'),
        $upload_success_ = $('#upload-success'),
        added_file_ = null,
        thumb_filename_ = 'thumb.png';

    var utils = {
        is_visible: function() {
            return $dialog_.is(':visible');
        },
        add_image: function(selector, img_src) {
            if(selector.find('img').length === 0) {
                selector.append($('<img/>'));
            }

            selector.find('img').attr({
                'src' : img_src
            });

            return selector;
        },
        reset: function() {
            // remove selected thumb
            $drop_zone_.removeClass('active dropped');
            $drop_zone_.find('img').remove();
            added_file_ = null;

            // reset size of drop zone:
            $drop_zone_.css('height', $drop_zone_.data('height') + 'px');
        },
        verify: function(selected_file) {
            var valid = selected_file.length === 1 && selected_file[0].type === 'image/png';

            if(!valid) {
                $instruction_.effect('shake');
            }

            return valid;
        },
        upload: function(file) {
            // process:
            added_file_ = file;
            var that = this;

            var reader = new FileReader();
            reader.onload = function(e) {
                $drop_zone_.addClass('dropped');
                that.add_image($drop_zone_, e.target.result);

                // show the complete:
                $upload_success_.show();

                setTimeout(function() {

                    $upload_success_.animate({
                        'margin-top': '0px', 'opacity' : '0'
                        }, {
                            duration: 'fast',
                            complete: function() {
                                $upload_success_.css({ 'opacity' :  '1.0', 'margin-top' : '35px' }).hide();
                        }
                    });

                }, 1500);
            };

            reader.readAsDataURL(added_file_);
        },
        setup_paste: function() {

            var that = this;

            $(document).on('paste', function(event){

                if(!that.is_visible())
                    return;

                var items = (event.clipboardData || event.originalEvent.clipboardData).items;

                var thumb = _.find(items, function(item) {
                    return item.kind === 'file';
                });

                if(thumb && that.verify([thumb])) {
                    that.upload(thumb.getAsFile());
                }
            });
        },
        setup_asset_drop: function() {

            var showOverlay_, that = this;

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

                    if(that.verify(files)) {
                        that.upload(files[0]);
                    }
                },
                "dragenter dragover": function(e) {
                    var dt = e.originalEvent.dataTransfer;
                    if(!shell.notebook.model.read_only())
                        dt.dropEffect = 'copy';
                }
            });
        },
        init: function() {

            var that = this;

            $dialog_.on('hidden.bs.modal', function() {
                that.reset();
            });

            $footer_.find('.btn-cancel').on('click', function() {
                $dialog_.modal('hide');
                that.reset();
            });

            $footer_.find('.btn-primary').on('click', function() {
                $dialog_.modal('hide');

                if(added_file_) {
                    //added_file_.name = 'thumb.png';
                    RCloud.UI.upload_with_alerts(true, {
                        files: [added_file_],
                        filenames: [thumb_filename_]
                    }).catch(function() {}); // we have special handling for upload errors
                }

                that.reset();
            });

            $drop_zone_remove_.click(function() {
                that.reset();
            });

            $thumb_upload_.click(function() {
                $selected_file_.click();
            });

            $selected_file_.change(function(evt) {
                if(that.verify(evt.target.files)) {
                    that.upload(evt.target.files[0]);
                    // reset so identical file next time would trigger a change:
                    $selected_file_.val('');
                }
            });

            this.setup_asset_drop();
            this.setup_paste();
        },
        show: function() {

            $drop_zone_.removeClass('active');

            $dialog_.modal({
                keyboard: true
            });
        }
    };

    return {
        init: function() {
            utils.init();
        },
        show: function() {
            utils.show();
        },
        is_visible: function() {
            return utils.is_visible();
        }
    };
})();
